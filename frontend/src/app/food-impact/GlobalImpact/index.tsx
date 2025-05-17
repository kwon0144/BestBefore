import React, { useEffect, useRef, useState } from 'react';
import { motion } from "framer-motion";
import * as d3 from 'd3';
import { geoOrthographic, geoPath, GeoPermissibleObjects } from 'd3-geo';
import { feature } from 'topojson-client';
import axios from 'axios';
import { config } from '@/config';
import { Slider } from "@heroui/react";

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

interface YearlyCountryData {
  [country: string]: {
    [year: number]: {
      total_waste: number;
      total_economic_loss: number;
      household_waste_percentage: number;
    }
  }
}

interface CountryYearlyData {
  year: number;
  country: string;
  total_waste: number;
  economic_loss: number;
  household_waste_percentage: number;
}

interface ApiYearlyResponse {
  count: number;
  data: CountryYearlyData[];
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

const INDICATORS = [
  { id: 'total_waste', name: 'Total Waste (tonnes)', colorScale: d3.scaleSequential(d3.interpolateGreens) },
  { id: 'total_economic_loss', name: 'Economic Loss ($M)', colorScale: d3.scaleSequential(d3.interpolateYlOrBr) },
  { id: 'household_waste_percentage', name: 'Household Waste (%)', colorScale: d3.scaleSequential(d3.interpolatePurples) }
];

// Coordinates for China to center the map
const CHINA_COORDINATES = { lat: 35, lon: 105 };

// Coordinates for Australia
const AUSTRALIA_COORDINATES = { lat: -25, lon: 135 };

// Midpoint between China and Australia
const MIDPOINT_COORDINATES = { 
  lat: (CHINA_COORDINATES.lat + AUSTRALIA_COORDINATES.lat) / 2, 
  lon: (CHINA_COORDINATES.lon + AUSTRALIA_COORDINATES.lon) / 2 
};

// Add mock food waste type distribution data for countries
interface FoodWasteTypeDistribution {
  [category: string]: { value: number; color: string; };
}

interface CountryFoodWasteDistribution {
  [country: string]: FoodWasteTypeDistribution;
}

// Mock data for food waste composition by category for each country
const mockFoodWasteDistribution: CountryFoodWasteDistribution = {
  'Australia': {
    'Fruits & Vegetables': { value: 35, color: '#22c55e' },
    'Meat & Dairy': { value: 28, color: '#ef4444' },
    'Bakery': { value: 19, color: '#eab308' },
    'Prepared Foods': { value: 12, color: '#3b82f6' },
    'Other': { value: 6, color: '#a855f7' }
  },
  'China': {
    'Fruits & Vegetables': { value: 31, color: '#22c55e' },
    'Meat & Dairy': { value: 23, color: '#ef4444' },
    'Bakery': { value: 17, color: '#eab308' },
    'Prepared Foods': { value: 15, color: '#3b82f6' },
    'Other': { value: 14, color: '#a855f7' }
  },
  'United States': {
    'Fruits & Vegetables': { value: 32, color: '#22c55e' },
    'Meat & Dairy': { value: 30, color: '#ef4444' },
    'Bakery': { value: 18, color: '#eab308' },
    'Prepared Foods': { value: 14, color: '#3b82f6' },
    'Other': { value: 6, color: '#a855f7' }
  },
  'India': {
    'Fruits & Vegetables': { value: 40, color: '#22c55e' },
    'Meat & Dairy': { value: 15, color: '#ef4444' },
    'Bakery': { value: 20, color: '#eab308' },
    'Prepared Foods': { value: 10, color: '#3b82f6' },
    'Other': { value: 15, color: '#a855f7' }
  },
  'Brazil': {
    'Fruits & Vegetables': { value: 37, color: '#22c55e' },
    'Meat & Dairy': { value: 22, color: '#ef4444' },
    'Bakery': { value: 16, color: '#eab308' },
    'Prepared Foods': { value: 15, color: '#3b82f6' },
    'Other': { value: 10, color: '#a855f7' }
  },
  'Default': {
    'Fruits & Vegetables': { value: 35, color: '#22c55e' },
    'Meat & Dairy': { value: 25, color: '#ef4444' },
    'Bakery': { value: 18, color: '#eab308' },
    'Prepared Foods': { value: 12, color: '#3b82f6' },
    'Other': { value: 10, color: '#a855f7' }
  }
};

const GlobalImpact: React.FC<GlobalImpactProps> = ({ setRef }) => {
  const mapRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [wasteData, setWasteData] = useState<GlobalWasteData | null>(null);
  const [selectedIndicator, setSelectedIndicator] = useState<string>(INDICATORS[0].id);
  const [indicatorName, setIndicatorName] = useState<string>(INDICATORS[0].name);
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [trendData, setTrendData] = useState<YearlyCountryData>({});
  const [countryYearlyData, setCountryYearlyData] = useState<CountryYearlyData[]>([]);
  
  // Add state to track selected country
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  
  // Available years for the timeline
  const availableYears = [2018, 2019, 2020, 2021, 2022, 2023, 2024];
  
  // Reference to store world data for re-renders
  const worldDataRef = useRef<any>(null);
  
  // Keep track of current globe rotation - initially centered between China and Australia
  const rotationRef = useRef<[number, number, number]>([-MIDPOINT_COORDINATES.lon, -MIDPOINT_COORDINATES.lat, 0]);

  // Fetch country yearly data from API
  useEffect(() => {
    async function fetchYearlyData() {
      try {
        const response = await axios.get<ApiYearlyResponse>(`${config.apiUrl}/api/country-yearly-waste/`);
        if (response.data && response.data.data) {
          setCountryYearlyData(response.data.data);
          console.log("Yearly data loaded:", response.data.data.length, "records");
          
          // Convert to the YearlyCountryData format for easy access
          const formattedData: YearlyCountryData = {};
          
          response.data.data.forEach((item: CountryYearlyData) => {
            if (!formattedData[item.country]) {
              formattedData[item.country] = {};
            }
            
            formattedData[item.country][item.year] = {
              total_waste: item.total_waste,
              total_economic_loss: item.economic_loss,
              household_waste_percentage: item.household_waste_percentage
            };
          });
          
          // Only update if we have actual API data
          if (Object.keys(formattedData).length > 0) {
            setTrendData(formattedData);
          }
        }
      } catch (error) {
        console.error("Error fetching yearly country data:", error);
        // We'll fall back to the mock data if this API call fails
      }
    }
    
    fetchYearlyData();
  }, []);

  // Fetch world map GeoJSON and waste data for selected year
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch waste data for the selected year using axios with config.apiUrl
        const response = await axios.get<GlobalWasteData>(`${config.apiUrl}/api/economic-impact/`, {
          params: { year: selectedYear }
        });
        
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
        
        // Create mock trend data since the API might not provide historical data
        if (Object.keys(trendData).length === 0) {
          console.log("Generating mock trend data");
          const mockHistoricalData: YearlyCountryData = {};
          
          // If we have current data, use it as a base for our mock historical data
          if (response.data && response.data.countries) {
            response.data.countries.forEach(country => {
              // Initialize country if not exists
              if (!mockHistoricalData[country.country]) {
                mockHistoricalData[country.country] = {};
              }
              
              // Use current values as a base
              const baseWaste = country.total_waste || 0;
              const baseEconomicLoss = country.total_economic_loss;
              const baseHouseholdPercentage = country.household_waste_percentage;
              
              // Generate data for each year with slight variations
              availableYears.forEach((year, index) => {
                // Create realistic trends - values generally increase over time
                const yearFactor = (year - 2018) / 6; // 0 to 1 range
                const randomVariation = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
                
                mockHistoricalData[country.country][year] = {
                  total_waste: Math.round((baseWaste * (0.8 + yearFactor * 0.4) * randomVariation) * 10) / 10,
                  total_economic_loss: Math.round(baseEconomicLoss * (0.8 + yearFactor * 0.4) * randomVariation),
                  household_waste_percentage: Math.round((baseHouseholdPercentage * (0.9 + yearFactor * 0.2) * randomVariation) * 10) / 10
                };
              });
            });
            
            // Handle Taiwan/China merging for mock data
            const taiwanData = response.data.countries.find(c => c.country.toLowerCase() === 'taiwan');
            const chinaData = response.data.countries.find(c => c.country.toLowerCase() === 'china');
            
            if (taiwanData && chinaData && mockHistoricalData['China'] && mockHistoricalData['Taiwan']) {
              availableYears.forEach(year => {
                // For each year, merge Taiwan data into China
                if (mockHistoricalData['China'][year] && mockHistoricalData['Taiwan'][year]) {
                  mockHistoricalData['China'][year] = {
                    total_waste: (mockHistoricalData['China'][year].total_waste || 0) + 
                                (mockHistoricalData['Taiwan'][year].total_waste || 0),
                    total_economic_loss: mockHistoricalData['China'][year].total_economic_loss + 
                                        mockHistoricalData['Taiwan'][year].total_economic_loss,
                    household_waste_percentage: mockHistoricalData['China'][year].household_waste_percentage
                  };
                }
              });
              
              // Remove Taiwan from mock data
              delete mockHistoricalData['Taiwan'];
            }
            
            console.log("Mock trend data generated:", mockHistoricalData);
            // Set the mock historical trend data
            setTrendData(mockHistoricalData);
          }
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
  }, [selectedYear, trendData]);

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
  
  // Get country data with special handling for Taiwan, USA and UK
  const getCountryData = (countryName: string, countries: CountryData[]): CountryData | undefined => {
    // Normalize country names
    let normalizedName = countryName.toLowerCase();
    
    // Handle special cases
    if (normalizedName === 'taiwan') {
      return countries.find(c => c.country.toLowerCase() === 'china');
    } else if (normalizedName === 'united states' || normalizedName === 'united states of america') {
      return countries.find(c => c.country.toLowerCase() === 'usa');
    } else if (normalizedName === 'united kingdom') {
      return countries.find(c => c.country.toLowerCase() === 'uk');
    }
    
    // Handle regular case - try to find an exact match
    let countryData = countries.find(c => c.country.toLowerCase() === normalizedName);
    
    // If no exact match found, try a contains match
    if (!countryData) {
      countryData = countries.find(c => 
        normalizedName.includes(c.country.toLowerCase()) || 
        c.country.toLowerCase().includes(normalizedName)
      );
    }
    
    return countryData;
  };

  // Add function to create a trend chart for a country
  const createTrendChart = (countryName: string, width: number = 250, height: number = 120) => {
    // Get country data from our trend data
    const countryData = trendData[countryName];
    
    if (!countryData || Object.keys(countryData).length === 0) {
      return `<p class="text-sm text-gray-600">No historical data available</p>`;
    }
    
    // Determine which data series to show based on selected indicator
    const dataKey = selectedIndicator === 'total_waste' ? 'total_waste' : 
                  (selectedIndicator === 'total_economic_loss' ? 'total_economic_loss' : 'household_waste_percentage');
    
    // Format years and values
    const years = Object.keys(countryData).map(Number).sort((a, b) => a - b);
    const values = years.map(year => {
      const yearData = countryData[year];
      return yearData && yearData[dataKey] !== undefined 
        ? Number(yearData[dataKey]) 
        : 0;
    });
    
    if (values.every(v => v === 0)) {
      return `<p class="text-sm text-gray-600">No historical ${dataKey.replace('_', ' ')} data available</p>`;
    }
    
    // Set margins
    const margin = { top: 10, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Set scales
    const xScale = d3.scaleLinear()
      .domain([years[0] || 2018, years[years.length - 1] || 2024])
      .range([0, innerWidth]);
      
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    
    // Set y-scale domain with padding (10% below min, 10% above max)
    const yScale = d3.scaleLinear()
      .domain([minValue * 0.9, maxValue * 1.1])
      .range([innerHeight, 0]);
    
    // Create line generator
    const line = d3.line<number>()
      .x((_, i) => xScale(years[i]))
      .y(d => yScale(d))
      .curve(d3.curveMonotoneX); // Smoother curve
    
    // Create SVG
    let svgContent = `<svg width="${width}" height="${height}">`;
    svgContent += `<g transform="translate(${margin.left}, ${margin.top})">`;
    
    // Add x-axis
    svgContent += `<g transform="translate(0, ${innerHeight})" class="x-axis">`;
    years.forEach(year => {
      const xPos = xScale(year);
      svgContent += `
        <g transform="translate(${xPos},0)">
          <line y2="6" stroke="#888" stroke-width="1"></line>
          <text dy="0.71em" y="9" text-anchor="middle" font-size="10" fill="#666">${year}</text>
        </g>
      `;
    });
    svgContent += `</g>`;
    
    // Add y-axis grid lines (subtle)
    const yTicks = yScale.ticks(5);
    svgContent += `<g class="y-grid">`;
    yTicks.forEach(tick => {
      const yPos = yScale(tick);
      svgContent += `
        <line x1="0" y1="${yPos}" x2="${innerWidth}" y2="${yPos}" stroke="#eee" stroke-width="1"></line>
        <text x="-5" y="${yPos}" dy="0.32em" text-anchor="end" font-size="10" fill="#666">
          ${formatYAxisValue(tick, dataKey)}
        </text>
      `;
    });
    svgContent += `</g>`;
    
    // Draw the line with animation
    if (values.length > 1) {
      // Create path data
      const pathData = line(values as any);
      if (pathData) {
        svgContent += `
          <path 
            d="${pathData}" 
            fill="none" 
            stroke="${getColorForIndicator(selectedIndicator)}" 
            stroke-width="3" 
            stroke-dasharray="500 500" 
            stroke-dashoffset="500"
          >
            <animate attributeName="stroke-dashoffset" from="500" to="0" dur="1s" fill="freeze" />
          </path>
        `;
      }
    }
    
    // Add data points with animations
    svgContent += `<g class="data-points">`;
    values.forEach((value, i) => {
      const xPos = xScale(years[i]);
      const yPos = yScale(value);
      const delay = i * 100; // Stagger animation
      
      svgContent += `
        <circle 
          cx="${xPos}" 
          cy="${yPos}" 
          r="0" 
          fill="${getColorForIndicator(selectedIndicator)}" 
          stroke="white" 
          stroke-width="1"
        >
          <animate attributeName="r" from="0" to="5" dur="0.3s" begin="${delay}ms" fill="freeze" />
        </circle>
      `;
    });
    svgContent += `</g>`;
    
    // Close SVG
    svgContent += `</g>`;
    svgContent += `</svg>`;
    
    return svgContent;
  };
  
  // Helper to format y-axis values based on indicator
  const formatYAxisValue = (value: number, dataKey: string): string => {
    if (dataKey === 'total_economic_loss') {
      return `$${value >= 1000 ? (value/1000).toFixed(0) + 'B' : value.toFixed(0) + 'M'}`;
    } else if (dataKey === 'household_waste_percentage') {
      return `${value.toFixed(0)}%`;
    } else {
      // Format large numbers more compactly
      return value >= 1000000 ? `${(value/1000000).toFixed(1)}M` : 
             value >= 1000 ? `${(value/1000).toFixed(0)}K` : value.toFixed(0);
    }
  };
  
  // Get color for trend line based on indicator
  const getColorForIndicator = (indicator: string): string => {
    switch (indicator) {
      case 'total_waste':
        return '#22c55e'; // Green
      case 'total_economic_loss':
        return '#f59e0b'; // Amber
      case 'household_waste_percentage':
        return '#8b5cf6'; // Purple
      default:
        return '#3b82f6'; // Blue
    }
  };

  // Update the pie chart creation to add animations
  const createPieChart = (countryName: string, containerId: string) => {
    console.log("Creating pie chart for:", countryName);
    
    // Get the food waste distribution data for the country
    let distributionData = mockFoodWasteDistribution[countryName];
    
    // If no specific data for this country, use the default
    if (!distributionData) {
      // Try case-insensitive search first
      const countryKey = Object.keys(mockFoodWasteDistribution).find(
        key => key.toLowerCase() === countryName.toLowerCase()
      );
      
      if (countryKey) {
        distributionData = mockFoodWasteDistribution[countryKey];
        console.log("Found distribution data with case-insensitive match:", countryKey);
      } else {
        console.log("Using default distribution data for country:", countryName);
        distributionData = mockFoodWasteDistribution['Default'];
      }
    }
    
    if (!distributionData) {
      console.warn("No distribution data found for country:", countryName);
      return `<p class="text-sm text-gray-600">No waste distribution data available</p>`;
    }
    
    // Set up SVG dimensions with a side-by-side layout for chart and legend
    const width = 250;
    const height = 190;
    const pieWidth = 150; // Width for pie chart section
    const legendWidth = width - pieWidth; // Width for legend section
    const radius = Math.min(pieWidth, height) / 2 * 0.8;
    const pieX = pieWidth / 2;
    const pieY = height / 2;
    
    // Calculate total for percentages
    const total = Object.values(distributionData).reduce((sum, item) => sum + item.value, 0);
    
    // Generate pie chart SVG
    let svgContent = `<svg width="${width}" height="${height}">`;
    
    // Create pie chart on the left side
    svgContent += `<g transform="translate(${pieX}, ${pieY})">`;
    
    // Create pie segments with animation delays
    let currentAngle = 0;
    Object.entries(distributionData).forEach(([category, { value, color }], index) => {
      const percentage = value / total;
      const angleSize = percentage * 2 * Math.PI;
      
      // Calculate arc points
      const startX = radius * Math.sin(currentAngle);
      const startY = -radius * Math.cos(currentAngle);
      
      const endAngle = currentAngle + angleSize;
      const endX = radius * Math.sin(endAngle);
      const endY = -radius * Math.cos(endAngle);
      
      // Determine if this arc is more than half the circle
      const largeArcFlag = angleSize > Math.PI ? 1 : 0;
      
      // Add animation attributes for segments
      const delay = index * 100; // Stagger the animations
      
      // Create SVG path for the segment with animation
      const path = `
        <path 
          d="M 0 0 L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z" 
          fill="${color}" 
          stroke="white" 
          stroke-width="1"
          opacity="0"
          transform="scale(0.8)"
          class="segment-${index}"
        >
          <animate 
            attributeName="opacity" 
            from="0" 
            to="1" 
            dur="0.5s" 
            begin="${delay}ms" 
            fill="freeze" 
          />
          <animate 
            attributeName="transform" 
            from="scale(0.8)" 
            to="scale(1)" 
            dur="0.5s" 
            begin="${delay}ms" 
            fill="freeze" 
          />
        </path>
      `;
      
      svgContent += path;
      currentAngle = endAngle;
    });
    
    svgContent += `</g>`;
    
    // Add legend with animation on the right side
    svgContent += `<g transform="translate(${pieWidth + 5}, 10)">`;
    
    let legendY = 0;
    Object.entries(distributionData).forEach(([category, { value, color }], index) => {
      const percentage = Math.round((value / total) * 100);
      const delay = 500 + (index * 100); // Start legend animations after segments
      const shortCategory = category.length > 14 ? category.substring(0, 14) + '...' : category;
      
      svgContent += `
        <g opacity="0" class="legend-item-${index}" style="cursor: pointer" onmouseover="this.getElementsByTagName('rect')[0].style.opacity='0.8'; this.getElementsByTagName('text')[0].style.fontWeight='bold'" onmouseout="this.getElementsByTagName('rect')[0].style.opacity='1'; this.getElementsByTagName('text')[0].style.fontWeight='normal'">
          <animate 
            attributeName="opacity" 
            from="0" 
            to="1" 
            dur="0.3s" 
            begin="${delay}ms" 
            fill="freeze" 
          />
          <rect x="0" y="${legendY}" width="10" height="10" fill="${color}" />
          <text x="15" y="${legendY + 8}" font-size="9" fill="#333">${shortCategory} (${percentage}%)</text>
        </g>
      `;
      
      legendY += 16; // Reduce spacing between legend items
    });
    
    svgContent += `</g>`;
    svgContent += `</svg>`;
    
    return svgContent;
  };

  // Add function to update the instruction frame with country data
  const updateInstructionFrame = (countryName: string | null, countryData: CountryData | undefined = undefined) => {
    const instructionFrame = document.getElementById('map-instruction-frame');
    if (!instructionFrame) return;
    
    // If no country is selected/hovered, show instructions
    if (!countryName) {
      instructionFrame.innerHTML = `
        <h3 class="text-lg font-medium text-darkgreen mb-2">Map Instructions</h3>
        <p class="text-sm text-gray-600 mb-2">
          Hover over any country to see detailed food waste statistics.
        </p>
        <p class="text-sm text-gray-600 mb-2">
          Click on a country to keep its information visible.
        </p>
        <p class="text-sm text-gray-600">
          Drag the globe to rotate and explore different regions.
        </p>
      `;
      return;
    }
    
    // Create close button HTML if country is clicked (selected)
    const closeButtonHtml = selectedCountry === countryName ? 
      `<button id="close-country-info" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition-colors duration-200 z-10">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
        </svg>
      </button>` : '';
    
    // If country has no data
    if (!countryData) {
      instructionFrame.innerHTML = `
        <div class="relative">
          ${closeButtonHtml}
          <h3 class="text-lg font-medium text-darkgreen mb-2">${countryName}</h3>
          <div class="p-4 bg-gray-50 rounded-md text-center animate-fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-sm text-gray-700">No data available for ${countryName}.</p>
          </div>
        </div>
      `;
    } else {
      // Generate pie chart for country data
      const pieChartHtml = createPieChart(countryName, 'pie-chart-container');
      
      // Generate trend chart for country data
      const trendChartHtml = createTrendChart(countryName);
      
      // Get colors and highlighting classes for indicators
      const wasteColor = '#22c55e'; // Green
      const economicColor = '#f59e0b'; // Amber
      const householdColor = '#8b5cf6'; // Purple
      
      // Create styled indicator data that highlights the selected indicator
      const wasteHighlight = selectedIndicator === 'total_waste';
      const economicHighlight = selectedIndicator === 'total_economic_loss';
      const householdHighlight = selectedIndicator === 'household_waste_percentage';
      
      const wasteData = countryData.total_waste ? countryData.total_waste.toLocaleString() : 'N/A';
      const economicData = `$${countryData.total_economic_loss.toLocaleString()}M`;
      const householdData = `${countryData.household_waste_percentage}%`;
      const costData = `$${countryData.annual_cost_per_household.toFixed(2)}`;
      
      // Show country data with close button if clicked - improved UIUX layout
      instructionFrame.innerHTML = `
        <div class="relative animate-fade-in">
          ${closeButtonHtml}
          <div class="flex items-center mb-2 pr-7"> <!-- Added right padding to prevent overlap with close button -->
            <h3 class="text-lg font-medium text-darkgreen">${countryName}</h3>
            <div class="text-xs text-gray-500 ml-auto">Data for ${selectedYear}</div>
          </div>
          
          <div class="grid grid-cols-2 gap-x-2 gap-y-1 mb-3">
            <div class="col-span-2 ${wasteHighlight ? 'bg-green-50 rounded p-1' : ''}">
              <span class="text-xs uppercase tracking-wide ${wasteHighlight ? 'text-green-800' : 'text-gray-500'}">Total Waste</span>
              <div class="text-sm ${wasteHighlight ? 'font-bold text-green-600' : ''}">${wasteData} tonnes</div>
            </div>
            
            <div class="${economicHighlight ? 'bg-amber-50 rounded p-1' : ''}">
              <span class="text-xs uppercase tracking-wide ${economicHighlight ? 'text-amber-800' : 'text-gray-500'}">Economic Loss</span>
              <div class="text-sm ${economicHighlight ? 'font-bold text-amber-600' : ''}">${economicData}</div>
            </div>
            
            <div class="${householdHighlight ? 'bg-purple-50 rounded p-1' : ''}">
              <span class="text-xs uppercase tracking-wide ${householdHighlight ? 'text-purple-800' : 'text-gray-500'}">Household Waste</span>
              <div class="text-sm ${householdHighlight ? 'font-bold text-purple-600' : ''}">${householdData}</div>
            </div>
            
            <div class="col-span-2">
              <span class="text-xs uppercase tracking-wide text-gray-500">Cost per Household</span>
              <div class="text-sm">${costData}</div>
            </div>
          </div>
          
          <div class="border-t border-gray-100 pt-2 mb-2">
            <div class="text-xs uppercase tracking-wide text-gray-600 mb-1">Historical Trend</div>
            ${trendChartHtml}
          </div>
          
          <div class="border-t border-gray-100 pt-2">
            <div class="text-xs uppercase tracking-wide text-gray-600 mb-1">Waste Composition</div>
            ${pieChartHtml}
          </div>
        </div>
      `;
    }
    
    // Add event listener to close button
    const closeButton = document.getElementById('close-country-info');
    if (closeButton) {
      closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedCountry(null);
        updateInstructionFrame(null);
      });
    }
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
            .text(`Loading data or no data available for ${selectedYear}...`);
      }
      return;
    }

    // Save world data for re-renders
    worldDataRef.current = worldData;

    const width = mapRef.current.clientWidth;
    
    // Keep the large radius for the globe
    const radius = Math.min(width, 650) / 2 * 0.85; // Calculate radius first
    
    // Calculate required height to fit full globe when positioned at top
    // We need at least enough space for the diameter (2*radius) plus some padding
    const height = 2 * radius + 100; // Add padding at bottom
    
    // Setup SVG with calculated height to ensure full globe visibility
    const svg = d3.select(mapRef.current)
      .attr('width', width)
      .attr('height', height);
    
    // Clear existing content
    svg.selectAll('*').remove();
    
    // Keep horizontal center but position the globe so its top aligns with the container top
    const globeX = width / 2;
    // Position globe so its top sits at the top edge of the visible area
    const globeY = radius + 30; // Center is radius distance from top + small padding
    
    console.log("Globe dimensions:", {width, height, radius, globeX, globeY});
    
    // Create a group for the globe
    const globeGroup = svg.append('g')
      .attr('class', 'globe-group')
      .attr('transform', `translate(${globeX}, ${globeY})`);
    
    // Change background to a deeper blue for oceans
    globeGroup.append('circle')
      .attr('class', 'globe-background')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', radius)
      .attr('fill', '#D6EFFF')  // Lighter blue for better contrast
      .attr('stroke', '#ccc')
      .attr('stroke-width', 0.5);

    // Create orthographic projection centered on China
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
      .attr('height', 350) // Increased height to accommodate the trend chart
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
      
    // Add a title for the trend chart
    const trendTitle = infoPanel.append('text')
      .attr('class', 'trend-title')
      .attr('x', 0)
      .attr('y', 210)
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .text('Historical Trend:');
    
    // Add container for the trend chart
    const trendChartGroup = infoPanel.append('g')
      .attr('class', 'trend-chart')
      .attr('transform', 'translate(0, 220)');
    
    // Update the graticule (grid lines) to be more subtle
    const graticule = d3.geoGraticule();
    
    globeGroup.append('path')
      .datum(graticule() as unknown as GeoPermissibleObjects)
      .attr('class', 'graticule')
      .attr('d', pathGenerator as any)
      .attr('fill', 'none')
      .attr('stroke', '#ddd')  // Lighter color for the grid
      .attr('stroke-width', 0.2);  // Thinner lines
    
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
    
    // Update country mouseover handler with animations
    globeGroup.selectAll('.country')
      .data(countries.features)
      .enter()
      .append('path')
      .attr('class', (d: any) => {
        const countryName = d.properties.name;
        return `country ${selectedCountry === countryName ? 'selected-country' : ''}`;
      })
      .attr('d', pathGenerator as any)
      .attr('fill', (d: any) => {
        const countryName = d.properties.name;
        const countryData = getCountryData(countryName, wasteData.countries);
        return countryData ? colorScale(getDataValue(countryData)) : '#ccc';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 0.2)
      .attr('cursor', 'pointer')
      .on('mouseover', function(event: MouseEvent, d: any) {
        const countryName = d.properties.name;
        let displayName = countryName;
        
        // Special case for Taiwan, map to China
        if (countryName.toLowerCase() === 'taiwan') {
          displayName = 'China';
        }
        
        const countryData = getCountryData(countryName, wasteData.countries);
        
        // Highlight the country with smooth animation
        d3.select(this)
          .transition()
          .duration(150)
          .attr('stroke', '#333')
          .attr('stroke-width', 1)
          .style('filter', 'drop-shadow(1px 1px 3px rgba(0,0,0,0.3))');
        
        // Hide the tooltip
        if (tooltipRef.current) {
          d3.select(tooltipRef.current).style('display', 'none');
        }
        
        // Only update instruction frame if no country is selected or if hovering over the selected country
        if (!selectedCountry || selectedCountry === displayName) {
          updateInstructionFrame(displayName, countryData);
        }
      })
      .on('mouseout', function() {
        // Reset country highlight with animation, unless it's the selected country
        const isSelected = d3.select(this).classed('selected-country');
        if (!isSelected) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('stroke', '#4a78a1')
            .attr('stroke-width', 0.2)
            .style('filter', 'none');
        }
        
        // Hide the info panel
        infoPanel.transition()
          .duration(200)
          .style('opacity', 0);
          
        // Only reset instruction frame if no country is selected
        if (!selectedCountry) {
          updateInstructionFrame(null);
        } else {
          // If a country is selected, but we're not hovering over it anymore,
          // make sure the selected country's data is displayed
          const selectedCountryData = wasteData.countries.find(
            c => c.country.toLowerCase() === selectedCountry.toLowerCase() ||
               (selectedCountry.toLowerCase() === 'usa' && c.country.toLowerCase() === 'usa') ||
               (selectedCountry.toLowerCase() === 'uk' && c.country.toLowerCase() === 'uk')
          );
          updateInstructionFrame(selectedCountry, selectedCountryData);
        }
      })
      .on('click', function(event: MouseEvent, d: any) {
        const countryName = d.properties.name;
        let displayName = countryName;
        
        // Special case for Taiwan
        if (countryName.toLowerCase() === 'taiwan') {
          displayName = 'China';
        }
        
        const countryData = getCountryData(countryName, wasteData.countries);
        
        // Reset previous selected country styling
        d3.selectAll('.country')
          .classed('selected-country', false)
          .transition()
          .duration(200)
          .attr('stroke', '#4a78a1')
          .attr('stroke-width', 0.2)
          .style('filter', 'none');
        
        // Toggle selection - if clicking on already selected country, deselect it
        if (selectedCountry === displayName) {
          setSelectedCountry(null);
          updateInstructionFrame(null);
        } else {
          // Mark this as selected and apply styling
          d3.select(this)
            .classed('selected-country', true)
            .transition()
            .duration(200)
            .attr('stroke', '#333')
            .attr('stroke-width', 1.5)
            .style('filter', 'drop-shadow(2px 2px 4px rgba(0,0,0,0.4))');
            
          setSelectedCountry(displayName);
          updateInstructionFrame(displayName, countryData);
        }
        
        // Prevent event propagation
        event.stopPropagation();
      });

    // Add click handler to the globe background to clear selection
    globeGroup.select('.globe-background')
      .on('click', function() {
        setSelectedCountry(null);
        updateInstructionFrame(null);
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

    // Add instructions
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height - 20)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14px')
      .attr('fill', '#666');
  };

  // Update indicator name whenever selection changes
  useEffect(() => {
    const selectedName = INDICATORS.find(ind => ind.id === selectedIndicator)?.name || '';
    setIndicatorName(selectedName);
    
    // If a country is currently selected, refresh its detailed frame to reflect the new indicator
    if (selectedCountry) {
      const countryData = wasteData?.countries.find(
        c => c.country.toLowerCase() === selectedCountry.toLowerCase() ||
           (selectedCountry.toLowerCase() === 'usa' && c.country.toLowerCase() === 'usa') ||
           (selectedCountry.toLowerCase() === 'uk' && c.country.toLowerCase() === 'uk')
      );
      
      if (countryData) {
        updateInstructionFrame(selectedCountry, countryData);
      }
    }
  }, [selectedIndicator, wasteData]);

  // Re-render with rotation when indicator changes
  useEffect(() => {
    if (wasteData && worldDataRef.current && mapRef.current) {
      renderMap(worldDataRef.current, wasteData);
    }
  }, [selectedIndicator, wasteData]);

  // Update effect to re-render when selected country changes
  useEffect(() => {
    if (wasteData && worldDataRef.current && mapRef.current) {
      renderMap(worldDataRef.current, wasteData);
    }
  }, [selectedIndicator, wasteData, selectedCountry]);

  // In useEffect for initial loading, add code to reset selected country when year changes
  useEffect(() => {
    async function fetchData() {
      // ... existing code ...
      
      // Reset selected country when year changes
      setSelectedCountry(null);
      
      // ... rest of existing code ...
    }
    
    fetchData();
  }, [selectedYear]);

  // Update effect for making the real API call for country yearly data
  useEffect(() => {
    async function fetchRealYearlyData() {
      try {
        const response = await axios.get<ApiYearlyResponse>(`${config.apiUrl}/api/country-yearly-waste/`);
        if (response.data && response.data.data) {
          // Convert API data to our YearlyCountryData format
          const apiData: YearlyCountryData = {};
          
          response.data.data.forEach((item: CountryYearlyData) => {
            if (!apiData[item.country]) {
              apiData[item.country] = {};
            }
            
            apiData[item.country][item.year] = {
              total_waste: item.total_waste,
              total_economic_loss: item.economic_loss,
              household_waste_percentage: item.household_waste_percentage
            };
          });
          
          console.log("Real yearly data loaded from API:", response.data.data.length, "records");
          setTrendData(apiData);
        }
      } catch (error) {
        console.error("Error fetching real yearly data:", error);
        console.log("Using fallback mock trend data");
      }
    }
    
    fetchRealYearlyData();
  }, []);

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
      <div className="py-4 md:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-4xl font-bold text-darkgreen mb-2 md:mb-4 text-left">
            Global Food Waste Distribution 2024
          </h2>
          <p className="text-gray-700 mb-4 md:mb-6 text-left">
            Food waste is a global issue with varying impacts across different regions.
          </p>
          
          <div className="mb-2 flex flex-wrap items-center justify-between">
            <div className="text-xl font-semibold text-darkgreen text-left mb-1 md:mb-0">
              Global Food Waste {selectedYear}: {indicatorName}
            </div>
            
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Indicator</label>
              <select
                value={selectedIndicator}
                onChange={(e) => {
                  const newIndicator = e.target.value;
                  setSelectedIndicator(newIndicator);
                  const newName = INDICATORS.find(ind => ind.id === newIndicator)?.name || '';
                  setIndicatorName(newName);
                }}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
              >
                {INDICATORS.map(indicator => (
                  <option key={indicator.id} value={indicator.id}>
                    {indicator.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mb-4 flex justify-end">
            <div className="w-full md:w-1/3">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                <span>2018</span>
                <span>2024</span>
              </div>
              <Slider
                className="w-full cursor-pointer"
                color="primary"
                defaultValue={availableYears.length - 1}
                minValue={0}
                maxValue={availableYears.length - 1}
                step={1}
                onChange={(value: number | number[]) => {
                  const numericValue = Array.isArray(value) ? value[0] : value;
                  const year = availableYears[numericValue];
                  setSelectedYear(year);
                }}
              />
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-2/3 relative">
              <svg ref={mapRef} className="w-full h-[600px] md:h-[750px]" />
              <div 
                ref={tooltipRef} 
                className="absolute hidden bg-white p-2 rounded shadow-lg border border-gray-200 text-sm z-10 pointer-events-none"
              />
            </div>
            
            <div className="w-full md:w-1/3">
              <div className="border border-gray-200 rounded-md p-4 bg-white shadow-sm h-full relative overflow-y-auto md:max-h-[610px]">
                <div id="map-instruction-frame">
                  <h3 className="text-lg font-medium text-darkgreen mb-2">Map Instructions</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Hover over any country to see detailed food waste statistics.
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    Click on a country to keep its information visible.
                  </p>
                  <p className="text-sm text-gray-600">
                    Drag the globe to rotate and explore different regions.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            Note: Data visualization shows the global distribution of food waste based on {selectedYear} data.
            Some countries may have incomplete or estimated data.
          </div>
        </div>
      </div>

      {/* Add global style for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        
        .selected-country {
          filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.4));
        }
      `}</style>
    </>
  );
};

export default GlobalImpact; 