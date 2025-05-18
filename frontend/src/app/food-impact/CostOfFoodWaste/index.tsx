/**
 * CostOfFoodWaste Component
 * 
 * Visualizes the economic impact of food waste on households in Australia.
 * Features interactive gauge charts showing key metrics like waste per capita,
 * economic loss, household waste percentage, and annual cost per household.
 * 
 * @component
 */
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import * as d3 from 'd3';
import { config } from '@/config';

/**
 * Props for the CostOfFoodWaste component
 * 
 * @interface CostOfFoodWasteProps
 * @property {function} [setRef] - Optional function to set the ref of this component for scrolling/visibility tracking
 */
interface CostOfFoodWasteProps {
  setRef?: (node: HTMLDivElement | null) => void;
}

/**
 * Interface representing household food waste impact data from the API
 * 
 * @interface HouseholdImpactData
 */
interface HouseholdImpactData {
  overall: {
    latest_year: number;
    waste_per_capita: number;
    household_waste_percentage: number;
    country: string;
    population: number;
  };
  yearly_data: {
    year: number;
    waste_per_capita: number;
    total_waste: number;
    economic_loss: number;
    population: number;
    household_waste_percentage: number;
    annual_cost_per_household: number;
    household_waste_tons: number;
  }[];
  potential_savings: {
    reduction_50_percent: number;
    reduction_25_percent: number;
  };
  updated_at: string;
}

/**
 * CostOfFoodWaste displays the economic impact of food waste on households
 * using animated gauge charts created with D3.js and textual explanations.
 * 
 * @param {CostOfFoodWasteProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const CostOfFoodWaste: React.FC<CostOfFoodWasteProps> = ({ setRef }) => {
  // Reference for the D3 chart container
  const chartRef = useRef<HTMLDivElement>(null);
  // State for storing the API data
  const [impactData, setImpactData] = useState<HouseholdImpactData | null>(null);
  // Loading state for the API request
  const [loading, setLoading] = useState<boolean>(true);
  // State for the current year's data to display
  const [currentYearData, setCurrentYearData] = useState<any>(null);

  /**
   * Fetch household impact data from the API
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = `${config.apiUrl}/api/household-impact/?country=Australia`;
        const response = await axios.get<HouseholdImpactData>(apiUrl);
        setImpactData(response.data);
        
        // Find 2024 data or latest year data if 2024 isn't available
        const data2024 = response.data.yearly_data.find(d => d.year === 2024) || 
                         response.data.yearly_data.find(d => d.year === response.data.overall.latest_year) || 
                         response.data.yearly_data[response.data.yearly_data.length - 1];
        
        setCurrentYearData(data2024);
      } catch (error) {
        console.error("Error fetching household impact data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /**
   * Create the D3 visualization when data is available
   */
  useEffect(() => {
    if (!chartRef.current || !currentYearData) return;

    createVisualization();
  }, [currentYearData]);

  /**
   * Creates the D3 gauge charts visualization
   * Each gauge represents a different metric related to food waste
   */
  const createVisualization = () => {
    if (!chartRef.current || !currentYearData) return;

    // Clear existing chart
    d3.select(chartRef.current).selectAll("*").remove();

    const width = chartRef.current.clientWidth;
    const height = 380; // Slightly smaller height for tighter layout
    const margin = { top: 30, right: 30, bottom: 30, left: 30 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(chartRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("overflow", "visible");

    // Create a group with margins
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Define metrics to display
    const metrics = [
      { id: "waste_per_capita", label: "Waste Per Capita (kg)", value: currentYearData.waste_per_capita, color: "#22c55e", icon: "W" },
      { id: "economic_loss", label: "Economic Loss (millions $)", value: currentYearData.economic_loss / 1000, color: "#f97316", icon: "$" },
      { id: "household_waste_percentage", label: "Household Waste (%)", value: currentYearData.household_waste_percentage, color: "#3b82f6", icon: "%" },
      { id: "annual_cost_per_household", label: "Annual Cost per Household ($)", value: currentYearData.annual_cost_per_household, color: "#ef4444", icon: "$" }
    ];

    // Calculate positions for the gauge charts
    const gaugeRadius = Math.min(innerWidth, innerHeight) / 4.5;
    const centerX = innerWidth / 2;
    const centerY = innerHeight / 2;
    const gaugeWidth = gaugeRadius * 2.5;
    
    // Change from a single row to 2 rows of 2 metrics each
    const numRows = 2;
    const numCols = Math.ceil(metrics.length / numRows);
    const gaugeSpacingHorizontal = innerWidth / (numCols + 0.5);
    const gaugeSpacingVertical = innerHeight / (numRows + 0.5);

    // Create gauges for each metric
    metrics.forEach((metric, i) => {
      const row = Math.floor(i / numCols);
      const col = i % numCols;
      
      const x = (col * gaugeSpacingHorizontal) + gaugeSpacingHorizontal / 1.5;
      const y = (row * gaugeSpacingVertical) + gaugeRadius + 10;
      
      // Normalize the value for the gauge (0-1)
      const normalizedValue = (() => {
        switch(metric.id) {
          case "waste_per_capita": return Math.min(metric.value / 50, 1); // Assuming 50kg is max
          case "economic_loss": return Math.min(metric.value / 1000, 1); // Assuming 1000M is max
          case "household_waste_percentage": return metric.value / 100; // Already percentage
          case "annual_cost_per_household": return Math.min(metric.value / 20000, 1); // Assuming 20k is max
          default: return 0.5;
        }
      })();

      // Create arc for gauge
      const arc = d3.arc()
        .innerRadius(gaugeRadius - 15)
        .outerRadius(gaugeRadius)
        .startAngle(-Math.PI / 2)
        .endAngle(normalizedValue * Math.PI - Math.PI / 2);

      // Background arc
      const backgroundArc = d3.arc()
        .innerRadius(gaugeRadius - 15)
        .outerRadius(gaugeRadius)
        .startAngle(-Math.PI / 2)
        .endAngle(Math.PI / 2);

      const gaugeGroup = g.append("g")
        .attr("transform", `translate(${x}, ${y})`)
        .attr("class", "gauge-group");

      // Add background arc
      gaugeGroup.append("path")
        .attr("d", backgroundArc as any)
        .attr("fill", "#e5e7eb")
        .attr("opacity", 0.5);

      // Add foreground arc with animation
      const foreground = gaugeGroup.append("path")
        .attr("d", arc as any)
        .attr("fill", metric.color)
        .attr("opacity", 1)
        .attr("filter", "drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.2))");

      // Animate the arc on creation
      if (foreground.node()) {
        const length = (foreground.node() as SVGPathElement).getTotalLength();
        foreground
          .attr("stroke-dasharray", `${length} ${length}`)
          .attr("stroke-dashoffset", length)
          .transition()
          .duration(1000)
          .attr("stroke-dashoffset", 0);
      }

      // Add icon in the middle
      gaugeGroup.append("text")
        .attr("x", 0)
        .attr("y", -8)
        .attr("text-anchor", "middle")
        .attr("font-size", "20px")
        .attr("font-weight", "bold")
        .attr("fill", metric.color)
        .text(metric.icon);

      // Add value below
      gaugeGroup.append("text")
        .attr("x", 0)
        .attr("y", 18)
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .attr("font-weight", "bold")
        .attr("fill", "#2D3748")
        .text(metric.id === "annual_cost_per_household" 
          ? `$${Math.round(metric.value).toLocaleString()}`
          : metric.id === "household_waste_percentage" 
          ? `${metric.value.toFixed(1)}%`
          : metric.id === "economic_loss"
          ? `$${metric.value.toFixed(0)}M`
          : `${metric.value.toFixed(1)}kg`);

      // Add label
      gaugeGroup.append("text")
        .attr("x", 0)
        .attr("y", 38)
        .attr("text-anchor", "middle")
        .attr("font-size", "13px")
        .attr("fill", "#4A5568")
        .text(metric.label);
    });

    // Add year display
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .text(`Food Waste Impact Data (${currentYearData.year})`);
  };

  return (
    <div className="py-20" ref={setRef}>
      <motion.div 
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ 
            opacity: 1,
            transition: { duration: 0.6 }
        }}
        viewport={{ once: false, amount: 0.2 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
            {/* Left column with text content */}
            <div className="px-4">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ 
                        opacity: 1,
                        x: 0,
                        transition: {
                            type: "spring",
                            duration: 0.8,
                            bounce: 0.25
                        }
                    }}
                    viewport={{ once: false, amount: 0.3 }}
                    className="mb-6 text-3xl font-bold leading-tight"
                >
                    <p>
                        <span className="bg-green text-white px-4 py-2 inline-block mr-1">Household food waste</span> 
                        costs up to <span className="bg-green text-white px-4 py-2 inline-block mr-1">${Math.round(currentYearData?.annual_cost_per_household || 12963).toLocaleString()} per household</span> annually.
                    </p>
                </motion.div>

                <motion.p 
                    className="text-lg font-bold leading-snug mt-4"
                    initial={{ opacity: 0 }}
                    whileInView={{ 
                        opacity: 1,
                        transition: {
                        delay: 0.8,
                        duration: 0.8
                        }
                    }}
                    viewport={{ once: false, amount: 0.3 }}
                >
                In 2024, with <span className="text-green font-extrabold">{currentYearData?.waste_per_capita.toFixed(1)} kg</span> of waste per capita and <span className="text-green font-extrabold">{currentYearData?.household_waste_percentage.toFixed(1)}%</span> of waste coming from households, the economic impact reaches <span className="text-green font-extrabold">${Math.round(currentYearData?.economic_loss).toLocaleString()} million</span> annually. Reducing this waste could redirect significant funds toward essentials like groceries, bills, and education.
                </motion.p>
            </div>

            {/* Right column with D3 gauge charts */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ 
                  opacity: 1,
                  scale: 1,
                  transition: {
                      type: "spring",
                      duration: 0.8,
                      bounce: 0.25,
                      delay: 0.4
                  }
              }}
              viewport={{ once: false, amount: 0.3 }}
            >
              {loading ? (
                <div className="flex justify-center items-center h-[400px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green"></div>
                </div>
              ) : currentYearData ? (
                <div className="h-[400px]" ref={chartRef}></div>
              ) : (
                <div className="flex justify-center items-center h-[400px]">
                  <p className="text-gray-600">Error loading data</p>
                </div>
              )}
            </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default CostOfFoodWaste;