import React, { useRef, useEffect, useState } from 'react';
import { motion } from "framer-motion";
import axios from 'axios';
import * as d3 from 'd3';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSeedling, faShoppingCart, faTruck, faAppleAlt, faIndustry, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { fadeInUpVariant, fadeInVariant, staggerContainerVariant } from '../interfaces/AnimationVariants';
import { FoodWasteItem, FoodWasteCompositionResponse } from '../interfaces/FoodWaste';
import { SupplyChainStage } from '../interfaces/Components';
import { config } from '@/config';

interface SupplyChainProps {
  setRef: (node: HTMLDivElement | null) => void;
}

const SupplyChain: React.FC<SupplyChainProps> = ({ setRef }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [wasteData, setWasteData] = useState<FoodWasteItem[]>([]);
  const [totalTonnes, setTotalTonnes] = useState<number>(0);
  const [hoveredValue, setHoveredValue] = useState<string>("");
  const [hoveredName, setHoveredName] = useState<string>("");
  const [hoveredSegment, setHoveredSegment] = useState<string>("");
  const [tooltipPosition, setTooltipPosition] = useState<{x: number, y: number} | null>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = `${config.apiUrl}/api/waste-composition/`;
        const response = await axios.get<FoodWasteCompositionResponse>(apiUrl);
        setWasteData(response.data.data);
        setTotalTonnes(response.data.total_tonnes);
      } catch (error) {
        console.error("Error fetching waste composition data:", error);
      }
    };

    fetchData();
  }, []);

  // D3.js setup for donut chart
  useEffect(() => {
    if (chartRef.current && wasteData.length > 0) {
      // Clear existing SVG
      d3.select(chartRef.current).selectAll("*").remove();
      
      // Chart dimensions
      const width = chartRef.current.clientWidth;
      const height = Math.min(width, 400); // Max height of 400px
      const margin = 10;
      const radius = Math.min(width, height) / 2 - margin;
      const innerRadius = radius * 0.4; // Reduced from 0.6 to 0.4 to make donut wider
      
      // Color scale
      const colorScale = d3.scaleOrdinal<string>()
        .domain(wasteData.map(d => d.name))
        .range([
          '#3D8361', // Consumer - dark green
          '#FFB84C', // Primary - amber
          '#579BB1', // Manufacturing - teal blue
          '#F16767', // Retail - soft red
          '#7F669D'  // Distribution - purple
        ]);
      
      // Create SVG
      const svg = d3.select(chartRef.current)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`);
      
      // Add shadow filter for 3D effect
      const defs = svg.append("defs");
      const filter = defs.append("filter")
        .attr("id", "drop-shadow")
        .attr("height", "130%");
      
      filter.append("feGaussianBlur")
        .attr("in", "SourceAlpha")
        .attr("stdDeviation", 3)
        .attr("result", "blur");
      
      filter.append("feOffset")
        .attr("in", "blur")
        .attr("dx", 2)
        .attr("dy", 2)
        .attr("result", "offsetBlur");
      
      const feComponentTransfer = filter.append("feComponentTransfer")
        .attr("in", "offsetBlur")
        .attr("result", "offsetBlur");
      
      feComponentTransfer.append("feFuncA")
        .attr("type", "linear")
        .attr("slope", 0.5);
      
      const feMerge = filter.append("feMerge");
      feMerge.append("feMergeNode")
        .attr("in", "offsetBlur");
      feMerge.append("feMergeNode")
        .attr("in", "SourceGraphic");

      // Set up pie generator
      const pie = d3.pie<FoodWasteItem>()
        .value(d => d.value)
        .sort(null)
        .padAngle(0.02); // Add padding between segments for a more modern look
      
      // Arc generator
      const arc = d3.arc<d3.PieArcDatum<FoodWasteItem>>()
        .innerRadius(innerRadius)
        .outerRadius(radius)
        .cornerRadius(4); // Rounded corners for a more friendly look
      
      // Create arcs
      const arcs = svg.selectAll('.arc')
        .data(pie(wasteData))
        .enter()
        .append('g')
        .attr('class', 'arc');
      
      // Add path
      arcs.append('path')
        .attr('d', arc)
        .attr('fill', d => colorScale(d.data.name) as string)
        .style('opacity', d => hoveredSegment && hoveredSegment !== d.data.name ? 0.7 : 0.95)
        .style('filter', 'url(#drop-shadow)') // Add shadow for 3D effect
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
          // Highlight segment
          d3.select(this)
            .style('opacity', 1)
            .transition()
            .duration(200)
            .attr('transform', 'translate(' + Math.sin(((d.startAngle + d.endAngle) / 2)) * 10 + ',' + 
                  (-Math.cos(((d.startAngle + d.endAngle) / 2)) * 10) + ')');
          
          // Display value and name in center
          setHoveredValue(`${d.data.value.toLocaleString()}`);
          setHoveredName(getStageName(d.data.name));
          setHoveredSegment(d.data.name);
          
          // Remove tooltip calculation and elements - we'll just highlight the legend instead
          svg.selectAll(".tooltip-text, .tooltip-line").remove();
        })
        .on('mouseout', function() {
          // Restore normal appearance
          d3.select(this)
            .style('opacity', 0.95)
            .transition()
            .duration(200)
            .attr('transform', 'translate(0,0)');
          
          // Clear values to show default
          setHoveredValue("");
          setHoveredName("");
          setHoveredSegment("");
          setTooltipPosition(null);
          
          // Remove tooltips
          svg.selectAll(".tooltip-text, .tooltip-line").remove();
        });

      // Add percentage labels to all segments by default
      arcs.append('text')
        .attr('transform', d => {
          const midAngle = (d.startAngle + d.endAngle) / 2;
          const labelRadius = radius * 0.8; // Position between inner and outer radius
          const x = Math.sin(midAngle) * labelRadius;
          const y = -Math.cos(midAngle) * labelRadius;
          return `translate(${x}, ${y})`;
        })
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', 'white')
        .text(d => `${d.data.percentage}%`);
        
      // Function to show percentage on the segment
      const updatePercentageLabel = (d: d3.PieArcDatum<FoodWasteItem>) => {
        // Remove any existing label
        svg.select('.percentage-label').remove();
      };
      
      // Center text container with a more visually appealing design
      const textGroup = svg.append('g')
        .attr('class', 'center-text');
      
      // Background circle with gradient for better visual appeal
      const gradientId = "centerGradient";
      const gradient = defs.append("radialGradient")
        .attr("id", gradientId)
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "50%");
      
      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "white");
      
      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#f8f8f8");
      
      textGroup.append('circle')
        .attr('r', innerRadius * 0.8) // Smaller inner circle for hover content
        .attr('fill', `url(#${gradientId})`)
        .attr('stroke', '#e0e0e0')
        .attr('stroke-width', 1)
        .style('filter', 'url(#drop-shadow)');
      
      // Value text - slightly smaller font to fit in the reduced inner area
      textGroup.append('text')
        .attr('class', 'value-text')
        .attr('text-anchor', 'middle')
        .attr('dy', '-0.4em') 
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', '#444');
      
      // Category text (under value) - slightly smaller
      textGroup.append('text')
        .attr('class', 'category-text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.8em')
        .attr('font-size', '12px')
        .attr('fill', '#666');
      
      // Label text (for tonnes) - slightly smaller
      textGroup.append('text')
        .attr('class', 'label-text')
        .attr('text-anchor', 'middle')
        .attr('dy', '2em')
        .attr('font-size', '10px')
        .attr('fill', '#888')
        .text('tonnes');
      
      // Update text based on hover status
      if (hoveredValue) {
        svg.select('.value-text')
          .text(hoveredValue);
        svg.select('.category-text')
          .text(hoveredName);
        svg.select('.label-text')
          .text('tonnes');
      } else {
        svg.select('.value-text')
          .text(totalTonnes.toLocaleString());
        svg.select('.category-text')
          .text('Total Food Waste');
        svg.select('.label-text')
          .text('tonnes');
      }
      
      // Handle window resize
      const handleResize = () => {
        // Redraw chart on window resize
        if (chartRef.current) {
          d3.select(chartRef.current).selectAll("*").remove();
          // This will trigger the useEffect again
          setWasteData([...wasteData]);
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [wasteData, hoveredValue, hoveredName, hoveredSegment, tooltipPosition, totalTonnes]);

  // Get stage name based on API data names
  const getStageName = (name: string): string => {
    switch (name) {
      case "Primary": return "Primary";
      case "Manufacturing": return "Manufacturing";
      case "Distribution": return "Distribution";
      case "Retail": return "Retail";
      case "Consumer": return "Consumer";
      default: return name;
    }
  };
  
  // Map API data names to colors
  const getColorClass = (name: string): string => {
    switch (name) {
      case "Consumer": return "bg-red-400";
      case "Primary": return "bg-yellow-300";
      case "Manufacturing": return "bg-green-400";
      case "Retail": return "bg-blue-500";
      case "Distribution": return "bg-blue-900";
      default: return "bg-gray-400";
    }
  };

  return (
    <motion.div 
      ref={setRef}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.3 }}
      variants={staggerContainerVariant}
      className="max-w-6xl mx-auto py-10 md:py-20 px-4 md:px-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        {/* Text Section */}
        <motion.div 
          variants={fadeInUpVariant}
          className="flex flex-col justify-center h-full"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-darkgreen mb-4 md:mb-6">
            What's in Our Food Waste?
          </h2>
          <p className="text-gray-700 mb-6 md:mb-8">
            Food waste varies significantly across different stages of the
            supply chain. Understanding its composition helps target reduction
            efforts more effectively.
          </p>

          {/* Categories with icons - vertical layout (replacing the original legend) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Column 1 */}
            <div className="space-y-4">
              {/* Primary */}
              <div 
                className={`flex items-center transition-all duration-300 ${
                  hoveredSegment === "Primary" 
                    ? "transform scale-110 bg-yellow-50 rounded-lg p-3 -ml-3 shadow-lg border-l-4 border-yellow-400" 
                    : ""
                }`}
              >
                <div 
                  style={{ backgroundColor: '#FFB84C' }} 
                  className={`rounded-full w-12 h-12 mr-3 flex-shrink-0 flex items-center justify-center transition-all duration-300 ${
                    hoveredSegment === "Primary" ? "animate-pulse" : ""
                  }`}
                >
                  <FontAwesomeIcon icon={faSeedling} className="text-white text-lg" />
                </div>
                <div>
                  <span className={`text-sm font-medium ${hoveredSegment === "Primary" ? "text-yellow-700 font-bold" : "text-gray-800"}`}>Primary</span>
                  <p className="text-xs text-gray-600">{wasteData.find(d => d.name === "Primary")?.percentage || 0}% of food waste</p>
                </div>
              </div>
              
              {/* Manufacturing */}
              <div 
                className={`flex items-center transition-all duration-300 ${
                  hoveredSegment === "Manufacturing" 
                    ? "transform scale-110 bg-blue-50 rounded-lg p-3 -ml-3 shadow-lg border-l-4 border-blue-400" 
                    : ""
                }`}
              >
                <div 
                  style={{ backgroundColor: '#579BB1' }} 
                  className={`rounded-full w-12 h-12 mr-3 flex-shrink-0 flex items-center justify-center transition-all duration-300 ${
                    hoveredSegment === "Manufacturing" ? "animate-pulse" : ""
                  }`}
                >
                  <FontAwesomeIcon icon={faIndustry} className="text-white text-lg" />
                </div>
                <div>
                  <span className={`text-sm font-medium ${hoveredSegment === "Manufacturing" ? "text-blue-700 font-bold" : "text-gray-800"}`}>Manufacturing</span>
                  <p className="text-xs text-gray-600">{wasteData.find(d => d.name === "Manufacturing")?.percentage || 0}% of food waste</p>
                </div>
              </div>
              
              {/* Distribution */}
              <div 
                className={`flex items-center transition-all duration-300 ${
                  hoveredSegment === "Distribution" 
                    ? "transform scale-110 bg-purple-50 rounded-lg p-3 -ml-3 shadow-lg border-l-4 border-purple-400" 
                    : ""
                }`}
              >
                <div 
                  style={{ backgroundColor: '#7F669D' }} 
                  className={`rounded-full w-12 h-12 mr-3 flex-shrink-0 flex items-center justify-center transition-all duration-300 ${
                    hoveredSegment === "Distribution" ? "animate-pulse" : ""
                  }`}
                >
                  <FontAwesomeIcon icon={faTruck} className="text-white text-lg" />
                </div>
                <div>
                  <span className={`text-sm font-medium ${hoveredSegment === "Distribution" ? "text-purple-700 font-bold" : "text-gray-800"}`}>Distribution</span>
                  <p className="text-xs text-gray-600">{wasteData.find(d => d.name === "Distribution")?.percentage || 0}% of food waste</p>
                </div>
              </div>
            </div>
            
            {/* Column 2 */}
            <div className="space-y-4">
              {/* Retail */}
              <div 
                className={`flex items-center transition-all duration-300 ${
                  hoveredSegment === "Retail" 
                    ? "transform scale-110 bg-red-50 rounded-lg p-3 -ml-3 shadow-lg border-l-4 border-red-400" 
                    : ""
                }`}
              >
                <div 
                  style={{ backgroundColor: '#F16767' }} 
                  className={`rounded-full w-12 h-12 mr-3 flex-shrink-0 flex items-center justify-center transition-all duration-300 ${
                    hoveredSegment === "Retail" ? "animate-pulse" : ""
                  }`}
                >
                  <FontAwesomeIcon icon={faShoppingCart} className="text-white text-lg" />
                </div>
                <div>
                  <span className={`text-sm font-medium ${hoveredSegment === "Retail" ? "text-red-700 font-bold" : "text-gray-800"}`}>Retail</span>
                  <p className="text-xs text-gray-600">{wasteData.find(d => d.name === "Retail")?.percentage || 0}% of food waste</p>
                </div>
              </div>
              
              {/* Consumer */}
              <div 
                className={`flex items-center transition-all duration-300 ${
                  hoveredSegment === "Consumer" 
                    ? "transform scale-110 bg-green-50 rounded-lg p-3 -ml-3 shadow-lg border-l-4 border-green-400" 
                    : ""
                }`}
              >
                <div 
                  style={{ backgroundColor: '#3D8361' }} 
                  className={`rounded-full w-12 h-12 mr-3 flex-shrink-0 flex items-center justify-center transition-all duration-300 ${
                    hoveredSegment === "Consumer" ? "animate-pulse" : ""
                  }`}
                >
                  <FontAwesomeIcon icon={faAppleAlt} className="text-white text-lg" />
                </div>
                <div>
                  <span className={`text-sm font-medium ${hoveredSegment === "Consumer" ? "text-green-700 font-bold" : "text-gray-800"}`}>Consumer</span>
                  <p className="text-xs text-gray-600">{wasteData.find(d => d.name === "Consumer")?.percentage || 0}% of food waste</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Chart Section */}
        <motion.div variants={fadeInUpVariant}>
          {/* D3.js Chart */}
          <div 
            ref={chartRef} 
            className="w-full h-60 md:h-80"
            aria-label="Food waste composition donut chart"
            role="img"
          ></div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SupplyChain;