import React, { useEffect, useRef, useState } from 'react';
import { motion } from "framer-motion";
import * as d3 from 'd3';
import { geoOrthographic, geoPath, GeoPermissibleObjects } from 'd3-geo';
import { feature } from 'topojson-client';
import axios from 'axios';
import { config } from '@/config';
import { Slider, Select, SelectItem } from "@heroui/react";

// Import interfaces and hooks
import { 
  GlobalImpactProps, 
  CountryData, 
  GlobalWasteData, 
  YearlyCountryData, 
  CountryYearlyData,
  ApiYearlyResponse, 
  DataAccessor,
  IndicatorConfig
} from '../interfaces/GlobalImpact';
import { useGlobalImpactData, useCountryYearlyData } from '../hooks';

/**
 * GlobalImpact Component
 * 
 * A dynamic interactive globe visualization that displays food waste data
 * across different countries. Users can select indicators, years, and 
 * interact with countries to view detailed data and trends.
 */

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

/**
 * Available indicators for the globe visualization
 * Each indicator has a unique ID, display name, and color scale
 */
const INDICATORS: IndicatorConfig[] = [
  { id: 'total_waste', name: 'Total Waste (tonnes)', colorScale: d3.scaleSequential(d3.interpolateGreens) },
  { id: 'total_economic_loss', name: 'Economic Loss ($B)', colorScale: d3.scaleSequential(d3.interpolateYlOrBr) },
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
// This interface is no longer used - replaced with FoodWasteItem from API response

// This interface is no longer used - replaced with API data

/**
 * GlobalImpact Component
 * Renders an interactive globe visualization of food waste data worldwide
 */
const GlobalImpact: React.FC<GlobalImpactProps> = ({ setRef }) => {
  // DOM references
  const mapRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const worldDataRef = useRef<any>(null);
  
  // Track selected options
  const [selectedIndicator, setSelectedIndicator] = useState<string>(INDICATORS[0].id);
  const [indicatorName, setIndicatorName] = useState<string>(INDICATORS[0].name);
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  
  // Keep track of current globe rotation - initially centered between China and Australia
  const rotationRef = useRef<[number, number, number]>([-MIDPOINT_COORDINATES.lon, -MIDPOINT_COORDINATES.lat, 0]);
  
  // Available years for the timeline
  const availableYears = [2018, 2019, 2020, 2021, 2022, 2023, 2024];
  
  // Use custom hooks for data fetching
  const { 
    wasteData, 
    loading: wasteDataLoading, 
    error: wasteDataError,
    usingCache,
    cacheTimestamp
  } = useGlobalImpactData(selectedYear);
  
  const {
    trendData,
    loading: trendDataLoading,
    error: trendDataError,
    fetchCountryData
  } = useCountryYearlyData();
  
  // Local state for yearly data tracking
  const [countryYearlyData, setCountryYearlyData] = useState<CountryYearlyData[]>([]);

  /**
   * Fetch country-specific data when a country is selected
   */
  useEffect(() => {
    if (selectedCountry) {
      fetchCountryData(selectedCountry);
    }
  }, [selectedCountry, fetchCountryData]);

  /**
   * Fetch world map data when waste data changes
   */
  useEffect(() => {
    // Reset selected country when indicator changes
    setSelectedCountry(null);
    
    const fetchWorldMap = async () => {
      if (!wasteData || !mapRef.current) return;
      
      try {
        // Clear any existing map
        d3.select(mapRef.current).selectAll('*').remove();
        
        // Fetch world map data
        const worldResponse = await fetch('https://unpkg.com/world-atlas@2.0.2/countries-110m.json');
        const worldData = await worldResponse.json();
        
        // Render the map with the fetched data
        renderMap(worldData, wasteData);
      } catch (error) {
        // Show error message in the map area
        if (mapRef.current) {
          const svg = d3.select(mapRef.current);
          svg.selectAll('*').remove();
          
          svg.append('text')
            .attr('x', mapRef.current.clientWidth / 2)
            .attr('y', 250)
            .attr('text-anchor', 'middle')
            .attr('font-size', '16px')
            .attr('fill', '#666')
            .text('Error loading map data, but country information is available.');
        }
      }
    };

    fetchWorldMap();
  }, [wasteData, selectedIndicator]);

  // This useEffect is now handled by the fetchWorldMap function above

  /**
   * Helper function to safely access data for coloring countries
   * Returns a numeric value for the selected indicator, defaulting to 0 if data is missing
   * 
   * @param countryData - The country data object to extract value from
   * @returns The numeric value for the selected indicator
   */
  const getDataValue = (countryData: CountryData | undefined): number => {
    if (!countryData) return 0;
    
    // Default to 0 if the selected property doesn't exist
    const value = countryData[selectedIndicator as keyof CountryData];
    return typeof value === 'number' ? value : 0;
  };
  
  /**
   * Get country data with special handling for country name variations
   * Performs normalization and lookups for countries with multiple common names
   * 
   * @param countryName - The name of the country to look up
   * @param countries - Array of country data to search in
   * @returns The country data object if found, undefined otherwise
   */
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
    
    // If we don't have data yet and it's the selected country (still loading)
    if ((!countryData || Object.keys(countryData).length === 0) && selectedCountry === countryName) {
      return `<p class="text-sm text-gray-600">Loading historical data...</p>`;
    }
    
    // If no data is available
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
      return `$${value >= 1000 ? (value/1000).toFixed(1) + 'B' : value.toFixed(1) + 'B'}`;
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

  // Update the updateInstructionFrame function to remove pie chart
  const updateInstructionFrame = (countryName: string | null, countryData: CountryData | undefined = undefined) => {
    const instructionFrame = document.getElementById('map-instruction-frame');
    if (!instructionFrame) return;
    
    // If no country is selected/hovered, show instructions
    if (!countryName) {
      instructionFrame.innerHTML = `
         <div>
           <div class="flex items-center mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-darkgreen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
             </svg>
             <h3 class="text-xl font-semibold text-darkgreen">Map Instructions</h3>
           </div>
           
           <div class="space-y-4">
             <div class="flex items-start p-4 rounded-lg bg-green/5">
               <div class="flex-shrink-0 bg-green/10 p-2 rounded-full mr-3">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-darkgreen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                 </svg>
               </div>
               <div>
                 <h4 class="font-medium text-darkgreen">Hover to Explore</h4>
                 <p class="text-sm text-gray-600 mt-1">
                   Move your cursor over any country to instantly reveal detailed food waste statistics.
                 </p>
               </div>
             </div>
             
             <div class="flex items-start p-4 rounded-lg bg-green/5">
               <div class="flex-shrink-0 bg-green/10 p-2 rounded-full mr-3">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-darkgreen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                 </svg>
               </div>
               <div>
                 <h4 class="font-medium text-darkgreen">Click to Focus</h4>
                 <p class="text-sm text-gray-600 mt-1">
                   Click on any country to pin its information and keep it in view while you explore the map.
                 </p>
               </div>
             </div>
             
             <div class="flex items-start p-4 rounded-lg bg-green/5">
               <div class="flex-shrink-0 bg-green/10 p-2 rounded-full mr-3">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-darkgreen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                 </svg>
               </div>
               <div>
                 <h4 class="font-medium text-darkgreen">Drag to Rotate</h4>
                 <p class="text-sm text-gray-600 mt-1">
                   Click and drag anywhere on the globe to rotate and discover food waste data from every region.
                 </p>
               </div>
             </div>
           </div>
         </div>
      `;
      return;
    }
    
    // Create close button HTML if country is clicked (selected)
    const closeButtonHtml = selectedCountry === countryName ? 
      `<button id="close-country-info" aria-label="Close country information" class="absolute top-2 right-2 text-gray-500 hover:text-gray-700 transition-colors duration-200 z-10">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
        </svg>
      </button>` : '';
    
    // If country has no data
    if (!countryData) {
      instructionFrame.innerHTML = `
        <div class="relative">
          ${closeButtonHtml}
          <h3 class="text-xl font-semibold text-darkgreen mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            ${countryName}
          </h3>
          <div class="p-5 bg-white/80 backdrop-blur-sm rounded-xl text-center animate-fade-in shadow-md">
            <div class="bg-gray-50 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p class="text-gray-700 font-medium">No data available for ${countryName}</p>
            <p class="text-sm text-gray-500 mt-2">Try selecting another country or changing the year.</p>
          </div>
        </div>
      `;
    } else {
      // Get colors and highlighting classes for indicators
      const wasteHighlight = selectedCountry === countryName && selectedIndicator === 'total_waste';
      const economicHighlight = selectedCountry === countryName && selectedIndicator === 'total_economic_loss';
      const householdHighlight = selectedCountry === countryName && selectedIndicator === 'household_waste_percentage';
      const wasteData = countryData.total_waste ? countryData.total_waste.toLocaleString() : 'N/A';
      const economicData = `$${(countryData.total_economic_loss/1000).toFixed(2)}B`;
      const householdData = `${countryData.household_waste_percentage}%`;
      const costData = `$${countryData.annual_cost_per_household.toFixed(2)}`;
      

      // If this is a hover (not selected), show only the prompt for trend data
      if (selectedCountry !== countryName) {
        instructionFrame.innerHTML = `
          <div class="relative">
            <div class="flex items-center mb-4 pr-7">
              <h3 class="text-xl font-semibold text-darkgreen">${countryName}</h3>
              <div class="text-xs text-gray-500 ml-auto">Data for ${selectedYear}</div>
            </div>
            <div class="bg-gray-50 rounded-lg p-4 mb-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2 ${wasteHighlight ? 'bg-white rounded-md p-3 shadow-sm' : ''}">
                  <span class="text-xs uppercase tracking-wide ${wasteHighlight ? 'text-green-800 font-medium' : 'text-gray-500'}">Total Waste</span>
                  <div class="text-lg ${wasteHighlight ? 'font-bold text-green-600' : 'text-gray-700'}">${wasteData} tonnes</div>
                </div>
                <div class="${economicHighlight ? 'bg-white rounded-md p-3 shadow-sm' : ''}">
                  <span class="text-xs uppercase tracking-wide ${economicHighlight ? 'text-amber-800 font-medium' : 'text-gray-500'}">Economic Loss</span>
                  <div class="text-lg ${economicHighlight ? 'font-bold text-amber-600' : 'text-gray-700'}">${economicData}</div>
                </div>
                <div class="${householdHighlight ? 'bg-white rounded-md p-3 shadow-sm' : ''}">
                  <span class="text-xs uppercase tracking-wide ${householdHighlight ? 'text-purple-800 font-medium' : 'text-gray-500'}">Household Waste</span>
                  <div class="text-lg ${householdHighlight ? 'font-bold text-purple-600' : 'text-gray-700'}">${householdData}</div>
                </div>
                <div class="col-span-2 mt-2">
                  <span class="text-xs uppercase tracking-wide text-gray-500">Annual Cost per Household</span>
                  <div class="text-lg text-gray-700 font-medium">${costData}</div>

                </div>
              </div>
            </div>
            <div class="bg-white border border-gray-100 rounded-lg p-4">
              <div class="text-sm font-medium text-gray-700 mb-2">Historical Trend</div>
              <div class="text-gray-500 italic">Click to show the trend data</div>
            </div>
          </div>

        `;
      } else {
        // Show country data with trend chart if selected
        const trendChartHtml = createTrendChart(countryName);
        instructionFrame.innerHTML = `
          <div class="relative">
            ${closeButtonHtml}
            <div class="flex items-center mb-4 pr-7">
              <h3 class="text-xl font-semibold text-darkgreen">${countryName}</h3>
              <div class="text-xs text-gray-500 ml-auto">Data for ${selectedYear}</div>
            </div>
            <div class="bg-gray-50 rounded-lg p-4 mb-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="col-span-2 ${wasteHighlight ? 'bg-white rounded-md p-3 shadow-sm' : ''}">
                  <span class="text-xs uppercase tracking-wide ${wasteHighlight ? 'text-green-800 font-medium' : 'text-gray-500'}">Total Waste</span>
                  <div class="text-lg ${wasteHighlight ? 'font-bold text-green-600' : 'text-gray-700'}">${wasteData} tonnes</div>
                </div>
                <div class="${economicHighlight ? 'bg-white rounded-md p-3 shadow-sm' : ''}">
                  <span class="text-xs uppercase tracking-wide ${economicHighlight ? 'text-amber-800 font-medium' : 'text-gray-500'}">Economic Loss</span>
                  <div class="text-lg ${economicHighlight ? 'font-bold text-amber-600' : 'text-gray-700'}">${economicData}</div>
                </div>
                <div class="${householdHighlight ? 'bg-white rounded-md p-3 shadow-sm' : ''}">
                  <span class="text-xs uppercase tracking-wide ${householdHighlight ? 'text-purple-800 font-medium' : 'text-gray-500'}">Household Waste</span>
                  <div class="text-lg ${householdHighlight ? 'font-bold text-purple-600' : 'text-gray-700'}">${householdData}</div>
                </div>
                <div class="col-span-2 mt-2">
                  <span class="text-xs uppercase tracking-wide text-gray-500">Annual Cost per Household</span>
                  <div class="text-lg text-gray-700 font-medium">${costData}</div>
                </div>
              </div>
            </div>
            <div class="bg-white border border-gray-100 rounded-lg p-4">
              <div class="text-sm font-medium text-gray-700 mb-2">Historical Trend</div>

              ${trendChartHtml}
            </div>
          </div>
        `;
      }
    }
    
    // Add event listener to close button
    const closeButton = document.getElementById('close-country-info');
    if (closeButton) {
      closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedCountry(null);
        
        // Directly set the default instructions instead of using updateInstructionFrame(null)
        const instructionFrame = document.getElementById('map-instruction-frame');
        if (instructionFrame) {
          instructionFrame.innerHTML = `
            <div class="bg-white rounded-lg p-6 shadow-sm">
              <div class="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-darkgreen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <h3 class="text-xl font-semibold text-darkgreen">Map Instructions</h3>
              </div>
              
              <div class="space-y-4">
                <div class="flex items-start p-4 rounded-lg bg-green/5">
                  <div class="flex-shrink-0 bg-green/10 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-darkgreen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-medium text-darkgreen">Hover to Explore</h4>
                    <p class="text-sm text-gray-600 mt-1">
                      Move your cursor over any country to instantly reveal detailed food waste statistics.
                    </p>
                  </div>
                </div>
                
                <div class="flex items-start p-4 rounded-lg bg-green/5">
                  <div class="flex-shrink-0 bg-green/10 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-darkgreen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-medium text-darkgreen">Click to Focus</h4>
                    <p class="text-sm text-gray-600 mt-1">
                      Click on any country to pin its information and keep it in view while you explore the map.
                    </p>
                  </div>
                </div>
                
                <div class="flex items-start p-4 rounded-lg bg-green/5">
                  <div class="flex-shrink-0 bg-green/10 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-darkgreen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-medium text-darkgreen">Drag to Rotate</h4>
                    <p class="text-sm text-gray-600 mt-1">
                      Click and drag anywhere on the globe to rotate and discover food waste data from every region.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          `;
        }
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
      
    // Create a glow filter for dragging effect
    const defs = globeGroup.append("defs");
    
    // Define a filter for the glow effect
    const glowFilter = defs.append("filter")
      .attr("id", "glow-effect")
      .attr("width", "300%")
      .attr("height", "300%")
      .attr("x", "-100%")
      .attr("y", "-100%");
      
    // Add a blur to create the glow
    glowFilter.append("feGaussianBlur")
      .attr("stdDeviation", "6")
      .attr("result", "blur");
      
    // Enhance the glow with a bright overlay
    glowFilter.append("feFlood")
      .attr("flood-color", "#4dabf5")
      .attr("result", "color");
    
    glowFilter.append("feComposite")
      .attr("in", "color")
      .attr("in2", "blur")
      .attr("operator", "in")
      .attr("result", "glow");
      
    // Merge the glow with the original
    const feMerge = glowFilter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "glow");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");
    
    // Track zoom level
    let currentScale = radius;
    const defaultScale = radius;
    const zoomedScale = radius * 1.2; // 20% zoom when clicking a country

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
        return `$${(value/1000).toFixed(2)}B`;
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
        
        // Only update instruction frame if no country is selected
        if (!selectedCountry) {
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
          
        // We don't need to reset to selected country on mouseout
        // because we always update on mouseover now
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
          
          // Zoom out animation
          d3.transition()
            .duration(500)
            .tween("scale", function() {
              const i = d3.interpolate(currentScale, defaultScale);
              return function(t: number) {
                currentScale = i(t);
                projection.scale(currentScale);
                
                // Update all path elements
                globeGroup.selectAll('path')
                  .attr('d', pathGenerator as any);
              };
            });
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
          
          // Zoom in animation
          d3.transition()
            .duration(500)
            .tween("scale", function() {
              const i = d3.interpolate(currentScale, zoomedScale);
              return function(t: number) {
                currentScale = i(t);
                projection.scale(currentScale);
                
                // Update all path elements
                globeGroup.selectAll('path')
                  .attr('d', pathGenerator as any);
              };
            });
        }
        
        // Prevent event propagation
        event.stopPropagation();
      });

    // Add click handler to the globe background to clear selection
    globeGroup.select('.globe-background')
      .on('click', function() {
        setSelectedCountry(null);
        
        // Directly set the default instructions instead of using updateInstructionFrame(null)
        const instructionFrame = document.getElementById('map-instruction-frame');
        if (instructionFrame) {
          instructionFrame.innerHTML = `
            <div class="bg-white rounded-lg p-6 shadow-sm">
              <div class="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-darkgreen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <h3 class="text-xl font-semibold text-darkgreen">Map Instructions</h3>
              </div>
              
              <div class="space-y-4">
                <div class="flex items-start p-4 rounded-lg bg-green/5">
                  <div class="flex-shrink-0 bg-green/10 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-darkgreen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-medium text-darkgreen">Hover to Explore</h4>
                    <p class="text-sm text-gray-600 mt-1">
                      Move your cursor over any country to instantly reveal detailed food waste statistics.
                    </p>
                  </div>
                </div>
                
                <div class="flex items-start p-4 rounded-lg bg-green/5">
                  <div class="flex-shrink-0 bg-green/10 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-darkgreen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-medium text-darkgreen">Click to Focus</h4>
                    <p class="text-sm text-gray-600 mt-1">
                      Click on any country to pin its information and keep it in view while you explore the map.
                    </p>
                  </div>
                </div>
                
                <div class="flex items-start p-4 rounded-lg bg-green/5">
                  <div class="flex-shrink-0 bg-green/10 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-darkgreen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-medium text-darkgreen">Drag to Rotate</h4>
                    <p class="text-sm text-gray-600 mt-1">
                      Click and drag anywhere on the globe to rotate and discover food waste data from every region.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          `;
        }
        
        // Zoom out animation
        d3.transition()
          .duration(500)
          .tween("scale", function() {
            const i = d3.interpolate(currentScale, defaultScale);
            return function(t: number) {
              currentScale = i(t);
              projection.scale(currentScale);
              
              // Update all path elements
              globeGroup.selectAll('path')
                .attr('d', pathGenerator as any);
            };
          });
      })
      .on('mouseout', function() {
        // When mouse leaves the globe completely, show the default instructions
        if (!selectedCountry) {
          updateInstructionFrame(null);
        }
      });

    // Setup dragging behavior with only horizontal rotation
    let v0: [number, number]; // Mouse position on drag start
    let r0: [number, number, number]; // Projection rotation on drag start
    
    const dragBehavior = d3.drag<SVGSVGElement, unknown>()
      .on('start', function(event) {
        v0 = [event.x, event.y];
        r0 = projection.rotate();
        
        // Add glow effect when dragging starts
        globeGroup.select('.globe-background')
          .transition()
          .duration(300)
          .style("filter", "url(#glow-effect)");
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
      })
      .on('end', function() {
        // Remove glow effect when dragging ends
        globeGroup.select('.globe-background')
          .transition()
          .duration(500)
          .style("filter", null);
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

  /**
   * Reset selected country when year changes
   */
  useEffect(() => {
    setSelectedCountry(null);
  }, [selectedYear]);

  // Add this useEffect to update the instruction frame when trendData or selectedCountry changes
  useEffect(() => {
    if (selectedCountry) {
      // Find the country data for the selected country
      const countryData = wasteData?.countries.find(
        c => c.country.toLowerCase() === selectedCountry.toLowerCase() ||
          (selectedCountry.toLowerCase() === 'usa' && c.country.toLowerCase() === 'usa') ||
          (selectedCountry.toLowerCase() === 'uk' && c.country.toLowerCase() === 'uk')
      );
      updateInstructionFrame(selectedCountry, countryData);
    }
    // Only run when trendData or selectedCountry changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trendData, selectedCountry]);

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
      <div className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-4xl font-bold text-darkgreen mb-2 md:mb-4 text-left">
            <span className="bg-green text-white px-4 py-2 inline-block mr-1">Australia</span> ranks in the <span className="bg-green text-white px-4 py-2 inline-block mr-1">Top 20 Countries</span> for Food Waste <sup className="text-sm font-bold align-super ml-2">5</sup>
          </h2>
          <p className="text-xl font-bold text-gray-700 mb-4 md:mb-12 text-left">
            Food waste is a global issue with varying impacts across different regions.
          </p>
          
          <div className="bg-green/10 px-10 py-8 rounded-lg">
          <div className="mb-2 flex flex-wrap items-center justify-between">
            <div className="text-xl font-bold text-darkgreen text-left mb-1 md:mb-0 flex items-center">
              Global Food Waste {selectedYear}: {indicatorName}
            </div>
            
            <div className="w-full md:w-1/3">
              <label htmlFor="indicator-select" className="block text-sm font-medium text-gray-700 mb-1">Select Indicator</label>
              <Select
                id="indicator-select"
                aria-labelledby="indicator-select"
                selectedKeys={[selectedIndicator]}
                onSelectionChange={(keys) => {
                  // Get the selected key as string
                  const selected = Array.from(keys)[0] as string;
                  if (selected) {
                    setSelectedIndicator(selected);
                    const newName = INDICATORS.find(ind => ind.id === selected)?.name || '';
                    setIndicatorName(newName);
                  }
                }}
                className="w-full"
                classNames={{
                  trigger: "bg-white min-h-[48px] border-1",
                  value: "text-sm",
                }}
              >
                {INDICATORS.map(indicator => (
                  <SelectItem key={indicator.id}>
                    {indicator.name}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>
          
          <div className="mb-4 flex justify-end">
            <div className="w-full md:w-1/3">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-1 mt-2">
                <span>2018</span>
                <span>2024</span>
              </div>
              <span id="year-slider-label" className="block text-sm font-medium text-gray-700 mb-1">Select Year</span>
              <Slider
                aria-labelledby="year-slider-label"
                className="w-full cursor-pointer"
                color="primary"
                defaultValue={availableYears.length - 1}
                minValue={0}
                maxValue={availableYears.length - 1}
                step={1}
                aria-valuemin={2018}
                aria-valuemax={2024}
                aria-valuenow={selectedYear}
                onChange={(value) => {
                  // Cast to any to avoid TypeScript errors
                  const valueHandler = value as any;
                  // Use the recommended on("change") method if available
                  if (valueHandler && typeof valueHandler.on === 'function') {
                    valueHandler.on("change", (val: number | number[]) => {
                      const numericValue = Array.isArray(val) ? val[0] : val;
                      const year = availableYears[numericValue];
                      setSelectedYear(year);
                    });
                  } else {
                    // Fallback to direct handling
                    const numericValue = Array.isArray(value) ? value[0] : value;
                    const year = availableYears[numericValue];
                    setSelectedYear(year);
                  }
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
              <div className="border-0 rounded-xl p-5 bg-gray-100 shadow-md h-full relative overflow-y-auto md:max-h-[610px] mt-4">
                <div id="map-instruction-frame">
                  <div>
                    <div className="flex items-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-darkgreen" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" role="img">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      <h3 className="text-xl font-semibold text-darkgreen">Map Instructions</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start p-4 rounded-lg bg-green/5">
                        <div className="flex-shrink-0 bg-green/10 p-2 rounded-full mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-darkgreen" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" role="img">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-darkgreen">Hover to Explore</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Move your cursor over any country to instantly reveal detailed food waste statistics.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start p-4 rounded-lg bg-green/5">
                        <div className="flex-shrink-0 bg-green/10 p-2 rounded-full mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-darkgreen" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" role="img">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-darkgreen">Click to Focus</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Click on any country to pin its information and keep it in view while you explore the map.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start p-4 rounded-lg bg-green/5">
                        <div className="flex-shrink-0 bg-green/10 p-2 rounded-full mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-darkgreen" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" role="img">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-medium text-darkgreen">Drag to Rotate</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Click and drag anywhere on the globe to rotate and discover food waste data from every region.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-sm text-gray-500">
            Note: Data visualization shows the global distribution of food waste based on {selectedYear} data.
            Some countries may have incomplete or estimated data.
          </div>
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
        
        /* Smooth transition for card hover effects */
        #map-instruction-frame .flex {
          transition: box-shadow 0.2s ease-in-out;
        }
        
        /* Add subtle pulse animation */
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.8; }
          100% { opacity: 1; }
        }
        
        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default GlobalImpact; 