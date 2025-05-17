import React, { useEffect, useRef, useState } from 'react';
import { motion } from "framer-motion";
import * as d3 from 'd3';
import { geoOrthographic, geoPath, GeoPermissibleObjects } from 'd3-geo';
import { feature } from 'topojson-client';
import axios from 'axios';
import { config } from '@/config';

interface GlobalImpactProps {
  setRef: (node: HTMLDivElement | null) => void;
}

interface CountryData {
  country: string;
  total_economic_loss: number;
  population: number;
  household_waste_percentage: number;
  annual_cost_per_household: number;
  total_waste?: number;
}

interface GlobalWasteData {
  summary: {
    total_economic_loss: number;
    total_waste: number;
    economic_loss_per_ton?: number;
    avg_household_waste_percentage?: number;
  };
  countries: CountryData[];
  updated_at: string;
}

// Allow any value for data access since the exact structure may vary
type DataAccessor = (d: CountryData) => number;

// Versor dragging utility functions
// These help with smooth rotation of the globe
const versor = (() => {
  // Convert a position to a quaternion
  function versor(x: number, y: number, z?: number) {
    if (z === undefined) z = 0;
    const quarternion = [0, 0, 0, 1]; // r, i, j, k
    const q0 = Math.cos(x / 2);
    const q1 = Math.sin(x / 2);
    const q2 = Math.cos(y / 2);
    const q3 = Math.sin(y / 2);
    const q4 = Math.cos(z / 2);
    const q5 = Math.sin(z / 2);

    quarternion[0] = q0 * q2 * q4 + q1 * q3 * q5;
    quarternion[1] = q1 * q2 * q4 - q0 * q3 * q5;
    quarternion[2] = q0 * q3 * q4 + q1 * q2 * q5;
    quarternion[3] = q0 * q2 * q5 - q1 * q3 * q4;

    return quarternion;
  }

  // Multiply two quaternions
  versor.multiply = function(a: number[], b: number[]) {
    return [
      a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3],
      a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2],
      a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1],
      a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0]
    ];
  };

  // Convert a quaternion to Euler angles
  versor.rotation = function(q: number[]): [number, number, number] {
    return [
      Math.atan2(2 * (q[0] * q[1] + q[2] * q[3]), 1 - 2 * (q[1] * q[1] + q[2] * q[2])) * 180 / Math.PI,
      Math.asin(Math.max(-1, Math.min(1, 2 * (q[0] * q[2] - q[3] * q[1])))) * 180 / Math.PI,
      Math.atan2(2 * (q[0] * q[3] + q[1] * q[2]), 1 - 2 * (q[2] * q[2] + q[3] * q[3])) * 180 / Math.PI
    ];
  };

  return versor;
})();

const YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024];
const INDICATORS = [
  { id: 'total_waste', name: 'Total Waste (tonnes)', colorScale: d3.scaleSequential(d3.interpolateGreens) },
  { id: 'total_economic_loss', name: 'Economic Loss ($M)', colorScale: d3.scaleSequential(d3.interpolateYlOrBr) },
  { id: 'household_waste_percentage', name: 'Household Waste (%)', colorScale: d3.scaleSequential(d3.interpolatePurples) }
];

const GlobalImpact: React.FC<GlobalImpactProps> = ({ setRef }) => {
  const mapRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [wasteData, setWasteData] = useState<GlobalWasteData | null>(null);
  const [currentYear, setCurrentYear] = useState<number>(2018);
  const [selectedIndicator, setSelectedIndicator] = useState<string>(INDICATORS[0].id);
  
  // Reference to store world data for re-renders
  const worldDataRef = useRef<any>(null);
  
  // Keep track of current globe rotation
  const rotationRef = useRef<[number, number, number]>([0, 0, 0]);

  // Fetch world map GeoJSON and waste data
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch waste data using axios with config.apiUrl
        const response = await axios.get<GlobalWasteData>(`${config.apiUrl}/api/economic-impact/`);
        
        // Process data to include Taiwan as part of China
        if (response.data && response.data.countries) {
          const processedData = {...response.data};
          
          // Find Taiwan and China in the data
          const taiwanData = processedData.countries.find(c => c.country.toLowerCase() === 'taiwan');
          const chinaData = processedData.countries.find(c => c.country.toLowerCase() === 'china');
          
          // If both exist, merge Taiwan into China
          if (taiwanData && chinaData) {
            // Add Taiwan's data to China
            chinaData.total_waste = (chinaData.total_waste || 0) + (taiwanData.total_waste || 0);
            chinaData.total_economic_loss += taiwanData.total_economic_loss;
            
            // Remove Taiwan from the list
            processedData.countries = processedData.countries.filter(
              c => c.country.toLowerCase() !== 'taiwan'
            );
          }
          
          // Set the processed data
          setWasteData(processedData);
        } else {
          setWasteData(response.data);
        }
        
        // Fetch world map data
        const worldResponse = await fetch('https://unpkg.com/world-atlas@2.0.2/countries-110m.json');
        const worldData = await worldResponse.json();
        
        if (mapRef.current && response.data) {
          renderMap(worldData, response.data);
        }
      } catch (error) {
        console.error("Error fetching economic impact data:", error);
        
        // Show error message in the UI
        if (mapRef.current) {
          const svg = d3.select(mapRef.current);
          svg.selectAll('*').remove();
          
          svg.append('text')
            .attr('x', mapRef.current.clientWidth / 2)
            .attr('y', 250)
            .attr('text-anchor', 'middle')
            .attr('font-size', '16px')
            .attr('fill', '#666')
            .text('Error loading data. Please check the API connection.');
        }
      }
    }

    fetchData();
  }, []);

  // Re-render map when selected indicator or year changes
  useEffect(() => {
    if (wasteData && mapRef.current) {
      // Re-fetch the data for the current year
      axios.get<GlobalWasteData>(`${config.apiUrl}/api/economic-impact/`, {
        params: { year: currentYear }
      })
        .then(response => {
          const data = response.data;
          // Check if data has countries - if not, it might be empty for this year
          if (data && data.countries && data.countries.length > 0) {
            setWasteData(data);
          } else {
            console.warn(`No data available for year ${currentYear}, using most recent data instead`);
            // Keep using the existing data if no data for this year
          }
        })
        .catch(error => {
          console.error('Error fetching year data:', error);
          // Keep using the existing data if there's an error
        });
    }
  }, [currentYear]);

  useEffect(() => {
    if (wasteData && mapRef.current) {
      d3.select(mapRef.current).selectAll('*').remove();
      fetch('https://unpkg.com/world-atlas@2.0.2/countries-110m.json')
        .then(res => res.json())
        .then(worldData => renderMap(worldData, wasteData))
        .catch(error => console.error('Error fetching world data:', error));
    }
  }, [wasteData, selectedIndicator]);

  // Helper function to safely access data for coloring countries
  const getDataValue = (countryData: CountryData | undefined): number => {
    if (!countryData) return 0;
    
    // Default to 0 if the selected property doesn't exist
    const value = countryData[selectedIndicator as keyof CountryData];
    return typeof value === 'number' ? value : 0;
  };

  // Get country data with special handling for Taiwan
  const getCountryData = (countryName: string, countries: CountryData[]): CountryData | undefined => {
    // If country is Taiwan, return China's data instead
    if (countryName.toLowerCase() === 'taiwan') {
      return countries.find(c => c.country.toLowerCase() === 'china');
    }
    
    // Otherwise, return the country's own data
    return countries.find(c => c.country.toLowerCase() === countryName.toLowerCase());
  };

  const renderMap = (worldData: any, wasteData: GlobalWasteData) => {
    if (!mapRef.current || !wasteData || !wasteData.countries || wasteData.countries.length === 0) {
      // Handle case where waste data isn't available yet
      if (mapRef.current) {
        const svg = d3.select(mapRef.current);
        svg.selectAll('*').remove();
        
        svg.append('text')
          .attr('x', mapRef.current.clientWidth / 2)
          .attr('y', 250)
          .attr('text-anchor', 'middle')
          .attr('font-size', '16px')
          .attr('fill', '#666')
          .text('Loading data or no data available for the selected year...');
      }
      return;
    }

    // Save world data for re-renders
    worldDataRef.current = worldData;

    const width = mapRef.current.clientWidth;
    const height = 600;
    const lambda = d3.scaleLinear().domain([0, width]).range([-180, 180]);
    
    // Setup SVG
    const svg = d3.select(mapRef.current)
      .attr('width', width)
      .attr('height', height);
    
    // Clear existing content
    svg.selectAll('*').remove();
    
    // Calculate the radius and position
    const radius = Math.min(width * 0.25, height * 0.5);
    
    // Position the globe on the left third of the container
    const globeX = width * 0.3;
    const globeY = height / 2;
    
    // Create a group for the globe
    const globeGroup = svg.append('g')
      .attr('class', 'globe-group')
      .attr('transform', `translate(${globeX}, ${globeY})`);
    
    // Add a background circle for the globe
    globeGroup.append('circle')
      .attr('class', 'globe-background')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', radius)
      .attr('fill', '#EEF7FF')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 0.5);

    // Create orthographic projection
    const projection = geoOrthographic()
      .scale(radius)
      .translate([0, 0])
      .rotate(rotationRef.current);
      
    const pathGenerator = geoPath().projection(projection);
    
    // Create countries from topojson
    const countries = feature(worldData, worldData.objects.countries) as any;
    
    // Find indicator settings
    const selectedIndicatorObj = INDICATORS.find(ind => ind.id === selectedIndicator);
    if (!selectedIndicatorObj) return;
    
    // Create color scale
    const colorScale = selectedIndicatorObj.colorScale;
    
    // Get max value for the selected indicator
    const maxValue = d3.max(wasteData.countries, d => getDataValue(d)) || 0;
    
    colorScale.domain([0, maxValue]);
    
    // Create an info panel on the right side
    const infoPanel = svg.append('g')
      .attr('class', 'info-panel')
      .attr('transform', `translate(${width * 0.65}, ${height / 2 - 100})`)
      .style('opacity', 0);
      
    // Add background for the info panel
    infoPanel.append('rect')
      .attr('x', -10)
      .attr('y', -10)
      .attr('width', width * 0.3)
      .attr('height', 220)
      .attr('rx', 8)
      .attr('fill', 'rgba(255, 255, 255, 0.9)')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1);
      
    // Add title to info panel
    const infoTitle = infoPanel.append('text')
      .attr('class', 'info-title')
      .attr('x', 0)
      .attr('y', 15)
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333');
      
    // Add content lines to info panel
    const totalWasteText = infoPanel.append('text')
      .attr('class', 'info-content')
      .attr('x', 0)
      .attr('y', 50)
      .attr('font-size', '14px')
      .attr('fill', '#333');
      
    const economicLossText = infoPanel.append('text')
      .attr('class', 'info-content')
      .attr('x', 0)
      .attr('y', 80)
      .attr('font-size', '14px')
      .attr('fill', '#333');
      
    const householdWasteText = infoPanel.append('text')
      .attr('class', 'info-content')
      .attr('x', 0)
      .attr('y', 110)
      .attr('font-size', '14px')
      .attr('fill', '#333');
      
    const costPerHouseholdText = infoPanel.append('text')
      .attr('class', 'info-content')
      .attr('x', 0)
      .attr('y', 140)
      .attr('font-size', '14px')
      .attr('fill', '#333');
      
    const selectedValueText = infoPanel.append('text')
      .attr('class', 'selected-value')
      .attr('x', 0)
      .attr('y', 180)
      .attr('font-size', '24px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333');
    
    // Draw graticules (coordinate grid lines)
    const graticule = d3.geoGraticule();
    
    globeGroup.append('path')
      .datum(graticule() as unknown as GeoPermissibleObjects)
      .attr('class', 'graticule')
      .attr('d', pathGenerator as any)
      .attr('fill', 'none')
      .attr('stroke', '#eee')
      .attr('stroke-width', 0.3);
    
    // Function to format the value based on selected indicator
    const formatValue = (value: number): string => {
      if (selectedIndicator === 'total_economic_loss') {
        return `$${value.toLocaleString()}M`;
      } else if (selectedIndicator === 'household_waste_percentage') {
        return `${value.toFixed(1)}%`;
      } else {
        return `${value.toLocaleString()} tonnes`;
      }
    };
    
    // Draw countries
    globeGroup.selectAll('.country')
      .data(countries.features)
      .enter()
      .append('path')
      .attr('class', 'country')
      .attr('d', pathGenerator as any)
      .attr('fill', (d: any) => {
        const countryName = d.properties.name;
        let displayName = countryName;
        
        // Special case for Taiwan
        if (countryName.toLowerCase() === 'taiwan') {
          displayName = 'China';
        }
        
        const countryData = getCountryData(countryName, wasteData.countries);
        return countryData ? colorScale(getDataValue(countryData)) : '#ccc';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.2)
      .on('mouseover', function(event: MouseEvent, d: any) {
        const countryName = d.properties.name;
        let displayName = countryName;
        
        // Special case for Taiwan
        if (countryName.toLowerCase() === 'taiwan') {
          displayName = 'China';
        }
        
        const countryData = getCountryData(countryName, wasteData.countries);
        
        // Highlight the country
        d3.select(this)
          .attr('stroke', '#333')
          .attr('stroke-width', 1);
        
        // Hide the tooltip
        if (tooltipRef.current) {
          d3.select(tooltipRef.current).style('display', 'none');
        }
        
        if (countryData) {
          // Update the info panel with country data
          infoTitle.text(displayName);
          
          totalWasteText.text(`Total Waste: ${countryData.total_waste ? countryData.total_waste.toLocaleString() : 'N/A'} tonnes`);
          economicLossText.text(`Economic Loss: $${countryData.total_economic_loss.toLocaleString()}M`);
          householdWasteText.text(`Household Waste: ${countryData.household_waste_percentage}%`);
          costPerHouseholdText.text(`Cost per Household: $${countryData.annual_cost_per_household.toFixed(2)}`);
          
          // Show highlighted value for current indicator
          selectedValueText.text(formatValue(getDataValue(countryData)));
          
          // Show the info panel with animation
          infoPanel.transition()
            .duration(200)
            .style('opacity', 1);
        } else {
          // Update for countries without data
          infoTitle.text(displayName);
          totalWasteText.text('No data available');
          economicLossText.text('');
          householdWasteText.text('');
          costPerHouseholdText.text('');
          selectedValueText.text('');
          
          // Show the info panel with animation
          infoPanel.transition()
            .duration(200)
            .style('opacity', 1);
        }
      })
      .on('mouseout', function() {
        // Reset country highlight
        d3.select(this)
          .attr('stroke', '#fff')
          .attr('stroke-width', 0.2);
        
        // Hide the info panel
        infoPanel.transition()
          .duration(200)
          .style('opacity', 0);
      });

    // Setup dragging behavior with only horizontal rotation
    let v0: [number, number]; // Mouse position on drag start
    let r0: [number, number, number]; // Projection rotation on drag start
    
    const dragBehavior = d3.drag<SVGSVGElement, unknown>()
      .on('start', function(event) {
        v0 = [event.x, event.y];
        r0 = projection.rotate();
      })
      .on('drag', function(event) {
        if (!v0) return;
        
        const v1: [number, number] = [event.x, event.y];
        // Calculate horizontal and vertical movement
        const dx = (v1[0] - v0[0]) / 4;
        const dy = (v1[1] - v0[1]) / 4;
        
        // Update both longitude (horizontal) and latitude (vertical) rotation
        const newRotation: [number, number, number] = [
          r0[0] + dx,  // Longitude
          r0[1] - dy,  // Latitude - reversed direction for more intuitive control
          r0[2]        // Roll - keep the same
        ];
        
        // Limit the latitude rotation to prevent the globe from flipping
        newRotation[1] = Math.max(-90, Math.min(90, newRotation[1]));
        
        rotationRef.current = newRotation;
        projection.rotate(newRotation);
        
        // Redraw the map with the new rotation
        globeGroup.selectAll('path')
          .attr('d', pathGenerator as any);
      });
      
    svg.call(dragBehavior);

    // Add indicator title at the top
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '18px')
      .attr('font-weight', 'bold')
      .text(`Global Food Waste: ${selectedIndicatorObj.name}`);
      
    // Add instructions
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('fill', '#666')
      .text('Hover over countries to see details. Drag to rotate the globe in any direction.');
  };

  // Re-render with rotation when indicator or year changes
  useEffect(() => {
    if (wasteData && worldDataRef.current && mapRef.current) {
      renderMap(worldDataRef.current, wasteData);
    }
  }, [selectedIndicator, wasteData]);

  return (
    <>
      <motion.div 
        ref={setRef}
        id="around-world"
        className="flex flex-col md:flex-row items-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full space-y-2">
          <motion.div 
            className="w-3/5 h-12 md:h-24 bg-darkgreen overflow-hidden"
            initial={{ width: 0 }}
            whileInView={{ 
              width: "60%",
              transition: { duration: 0.8 }
            }}
            viewport={{ once: false, amount: 0.3 }}
          ></motion.div>
          <div className="w-full flex flex-row items-center gap-4 md:gap-12">
            <motion.div 
              className="w-1/5 h-12 md:h-24 bg-darkgreen overflow-hidden"
              initial={{ width: 0 }}
              whileInView={{ 
                width: "20%",
                transition: { duration: 0.8, delay: 0.2 }
              }}
              viewport={{ once: false, amount: 0.3 }}
            ></motion.div>
            <motion.h2 
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-darkgreen tracking-tight"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ 
                opacity: 1,
                x: 0,
                transition: {
                  duration: 0.8,
                  delay: 0.4
                }
              }}
              viewport={{ once: false, amount: 0.3 }}
            >
              Around the World
            </motion.h2> 
          </div>
          <motion.div 
            className="w-3/5 h-12 md:h-24 bg-darkgreen overflow-hidden"
            initial={{ width: 0 }}
            whileInView={{ 
              width: "60%",
              transition: { duration: 0.8, delay: 0.6 }
            }}
            viewport={{ once: false, amount: 0.3 }}
          ></motion.div>  
        </div>
      </motion.div>

      {/* Map Section */}
      <div className="py-8 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-4xl font-bold text-darkgreen mb-4 md:mb-6">
            Global Food Waste Distribution
          </h2>
          <p className="text-gray-700 mb-6 md:mb-10">
            Food waste is a global issue with varying impacts across different regions.
          </p>
          
          {/* Controls */}
          <div className="mb-6 flex flex-wrap gap-4 items-center">
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Indicator</label>
              <select
                value={selectedIndicator}
                onChange={(e) => setSelectedIndicator(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
              >
                {INDICATORS.map(indicator => (
                  <option key={indicator.id} value={indicator.id}>
                    {indicator.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="w-full md:w-2/3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year: {currentYear}
              </label>
              <div className="flex flex-col md:flex-row items-center gap-2">
                <input
                  type="range"
                  min={YEARS[0]}
                  max={YEARS[YEARS.length - 1]}
                  value={currentYear}
                  onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                
                <div className="flex justify-between w-full text-xs text-gray-500 mt-1">
                  {YEARS.map(year => (
                    <button 
                      key={year}
                      onClick={() => setCurrentYear(year)}
                      className={`px-2 py-1 rounded ${currentYear === year ? 'bg-darkgreen text-white' : 'hover:bg-gray-100'}`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Map visualization - increase the height */}
          <div className="relative">
            <svg ref={mapRef} className="w-full h-[400px] md:h-[600px]" />
            <div 
              ref={tooltipRef} 
              className="absolute hidden bg-white p-2 rounded shadow-lg border border-gray-200 text-sm z-10 pointer-events-none"
            />
          </div>
          
          <div className="mt-6 text-sm text-gray-500">
            Note: Data visualization shows the global distribution of food waste based on available data.
            Some countries may have incomplete or estimated data.
          </div>
        </div>
      </div>
    </>
  );
};

export default GlobalImpact; 