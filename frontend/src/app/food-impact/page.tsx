'use client'

import Title from "../(components)/Title"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faQuoteLeft, faSeedling, faShoppingCart, faTruck, faAppleAlt, faIndustry } from '@fortawesome/free-solid-svg-icons'
import { useRef } from "react";
import { useEffect } from "react";
import * as echarts from "echarts";

export default function FoodImpact() {
    const chartRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      if (chartRef.current) {
        const chart = echarts.init(chartRef.current);
        const option = {
          animation: false,
          tooltip: {
            trigger: "item",
          },
          series: [
            {
              name: "Food Waste Stages",
              type: "pie",
              radius: "70%",
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 10,
                borderColor: "#fff",
                borderWidth: 2,
              },
              label: {
                show: true,
                formatter: "{b}: {d}%",
                fontSize: 14,
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: 16,
                  fontWeight: "bold",
                },
              },
              labelLine: {
                show: false,
              },
              data: [
                { value: 28, name: "Stage 1", itemStyle: { color: "#ff6b6b" } },
                { value: 22, name: "Stage 2", itemStyle: { color: "#ffd166" } },
                { value: 20, name: "Stage 3", itemStyle: { color: "#06d6a0" } },
                { value: 18, name: "Stage 4", itemStyle: { color: "#118ab2" } },
                { value: 12, name: "Stage 5", itemStyle: { color: "#073b4c" } },
              ],
            },
          ],
        };
        chart.setOption(option);
        const handleResize = () => {
          chart.resize();
        };
        window.addEventListener("resize", handleResize);
        return () => {
          chart.dispose();
          window.removeEventListener("resize", handleResize);
        };
      }
    }, []);
    return (
        <div>
            {/* Title */}
            <div className="py-12">
                <Title heading="Food Impact" 
                description="Explore the impact of food on the environment and how we can reduce waste and improve sustainability." 
                background="https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/foodimpact-titlebg.jpeg"
                />
            </div>

            {/* Quote Section */} 
            <div className="max-w-7xl mx-auto px-10 mt-8 mb-20">
                <div className="max-w-4xl mx-auto px-6">
                    <FontAwesomeIcon icon={faQuoteLeft} className="text-darkgreen text-4xl font-semibold leading-tight mb-8" />
                    <p className="text-darkgreen text-4xl font-semibold leading-tight mb-8">
                    "Food waste is not just about economics and hunger. It's about
                    climate, environment, and sustainability."
                    </p>
                    <div className="flex items-center">
                        <div className="w-12 h-0.5 bg-darkgreen mr-4"></div>
                        <p className="text-darkgreen  text-lg">
                            Tristram Stuart
                        </p>
                    </div>
                </div>
            </div>

            {/* Australia's Food Waste Section */}
            <div className="mt-12" style={{ 
                backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url(https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/aus_food_waste.jpg)', 
                backgroundSize: 'cover', 
                backgroundPosition: 'center',
                height: '500px' 
            }}>
                <div className="max-w-6xl mx-auto h-full flex flex-col justify-end pb-4">
                    <p className="text-darkgreen text-2xl font-bold">
                        Each year, Australians waste food across the supply chain in a total of
                    </p>
                    <h2 className="text-darkgreen text-9xl font-bold leading-tight">
                        7.6 million tonnes<sup className="text-2xl align-super ml-4">1</sup>
                    </h2>
                </div>
            </div>

        {/* Supply Chain Visualization */}
        <div className="max-w-6xl mx-auto py-20 px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Text Section */}
                <div className="flex flex-col justify-center h-full">
                    <h2 className="text-3xl font-bold text-darkgreen mb-6">
                        What's in Our Food Waste?
                    </h2>
                    <p className="text-gray-700 mb-8">
                        Food waste varies significantly across different stages of the
                        supply chain. Understanding its composition helps target reduction
                        efforts more effectively.
                    </p>
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded-full bg-red-400 mr-3"></div>
                            <span className="text-gray-700">Stage 1</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded-full bg-yellow-300 mr-3"></div>
                            <span className="text-gray-700">Stage 2</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded-full bg-green-400 mr-3"></div>
                            <span className="text-gray-700">Stage 3</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded-full bg-blue-500 mr-3"></div>
                            <span className="text-gray-700">Stage 4</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 rounded-full bg-blue-900 mr-3"></div>
                            <span className="text-gray-700">Stage 5</span>
                        </div>
                    </div>
                </div>
                {/* Supply Chain */}
                <div>
                    <div className="flex justify-center items-center space-x-2 mb-12">
                        <div className="flex flex-col items-center">
                            <div className="bg-amber-300 rounded-full p-4 mb-2">
                                <FontAwesomeIcon icon={faSeedling} className="text-2xl text-gray-800" />
                            </div>
                            <span className="text-xs text-gray-600">PRODUCTION</span>
                        </div>
                    <FontAwesomeIcon icon={faArrowRight} className="text-amber-400" />
                    <div className="flex flex-col items-center">
                        <div className="bg-amber-300 rounded-full p-4 mb-2">
                            <FontAwesomeIcon icon={faIndustry} className="text-2xl text-gray-800" />
                        </div>
                        <span className="text-xs text-gray-600 text-center">
                            PROCESSING & MANUFACTURING
                        </span>
                    </div>
                    <FontAwesomeIcon icon={faArrowRight} className="text-amber-400" />
                    <div className="flex flex-col items-center">
                        <div className="bg-amber-300 rounded-full p-4 mb-2">
                            <FontAwesomeIcon icon={faTruck} className="text-2xl text-gray-800" />
                        </div>
                        <span className="text-xs text-gray-600 text-center">
                            DISTRIBUTION & LOGISTICS
                        </span>
                    </div>
                    <FontAwesomeIcon icon={faArrowRight} className="text-amber-400" />
                    <div className="flex flex-col items-center">
                        <div className="bg-amber-300 rounded-full p-4 mb-2">
                            <FontAwesomeIcon icon={faShoppingCart} className="text-2xl text-gray-800" />
                        </div>
                        <span className="text-xs text-gray-600">RETAIL</span>
                    </div>
                    <FontAwesomeIcon icon={faArrowRight} className="text-amber-400" />
                    <div className="flex flex-col items-center">
                        <div className="bg-amber-300 rounded-full p-4 mb-2">
                            <FontAwesomeIcon icon={faAppleAlt} className="text-2xl text-gray-800" />
                        </div>
                        <span className="text-xs text-gray-600">CONSUMPTION</span>
                        </div>
                    </div>
                    <div ref={chartRef} className="w-full h-80"></div>
                </div>
            </div>
        </div>
    </div>
    )
}