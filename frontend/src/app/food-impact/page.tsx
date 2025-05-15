'use client'

import Title from "../(components)/Title"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faQuoteLeft, faSeedling, faShoppingCart, faTruck, faAppleAlt, faIndustry, faTrash, faRecycle, faArrowUp, faHome, faArrowDown, faWeightHanging, faDollarSign, faGlobe } from '@fortawesome/free-solid-svg-icons'
import { useRef, useState, useEffect } from "react";
import * as echarts from "echarts";
import { Slider } from "@heroui/react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

export default function FoodImpact() {
    const chartRef = useRef<HTMLDivElement>(null);
    const earthSectionRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [activeCardIndex, setActiveCardIndex] = useState<number>(-1);
    
    // Scroll progress for the environmental section
    const { scrollYProgress } = useScroll({
      target: scrollContainerRef,
      offset: ["start start", "end start"]
    });
    
    // Calculate which card to show based on scroll progress
    const currentCardIndex = useTransform(
      scrollYProgress,
      [0.1, 0.2, 0.2, 0.4, 0.4, 0.6], // Adjusted thresholds for smoother transitions
      [0, 0, 1, 1, 2, 2]
    );
    
    // Update the active card index when scrolling
    useEffect(() => {
      const unsubscribe = currentCardIndex.onChange((latest) => {
        setActiveCardIndex(Math.round(latest));
      });
      return unsubscribe;
    }, [currentCardIndex]);
    
    // ECharts setup for pie chart
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
    
    // Card animation variants
    const cardVariants = {
      enter: { 
        opacity: 0, 
        y: 50,
      },
      center: { 
        opacity: 1, 
        y: 0,
        transition: {
          duration: 0.5,
          ease: "easeOut"
        }
      },
      exit: { 
        opacity: 0, 
        y: -50,
        transition: {
          duration: 0.5,
          ease: "easeIn"
        }
      }
    };
    
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

            {/* Economic Loss Section */}
            <div className="flex flex-col md:flex-row items-center">
                <div className="w-full space-y-2">
                    <div className="w-3/5 h-24 bg-darkgreen overflow-hidden"></div>
                    <div className="w-full flex flex-row items-center gap-12">
                        <div className="w-2/5 h-24 bg-darkgreen overflow-hidden"></div>
                        <h2 className="text-9xl font-black text-darkgreen tracking-tight">
                            ECONOMIC LOSS
                        </h2> 
                    </div>
                    <div className="w-3/5 h-24 bg-darkgreen overflow-hidden"></div>  
                </div>
            </div>

            {/* Cost of Food Waste */}
            <div className="py-10 mb-20">
                <div className="mt-12" style={{ 
                    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url(https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/aus_food_waste.jpg)', 
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center',
                    height: '500px' 
                }}>
                    <div className="max-w-6xl mx-auto h-full flex flex-col justify-end pb-4">
                        <p className="text-darkgreen text-2xl font-bold">
                            The cost of food waste to Australian economy in a year is
                        </p>
                        <h2 className="text-darkgreen text-9xl font-bold leading-tight">
                            $36.6 billion<sup className="text-2xl align-super ml-4">2</sup>
                        </h2>
                    </div>
                </div>
            </div>

            {/* Analysis of Food Waste Cost */}
            <div className="py-10 mb-20">
                <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
                    <div>
                        <div className="text-3xl font-bold leading-tight mb-4">
                            <span className="bg-green text-white text-3xl font-bold px-4 py-2 inline-block">Household food waste amounts</span>
                            <span className="bg-green text-white text-3xl font-bold px-4 py-2 inline-block">to $19.3 billion (52.7%)</span> 
                            annually,
                            <p>and costs up to </p>
                            <span className="bg-green text-white text-3xl font-bold px-4 py-2 inline-block">$2,500 per household.</span>
                        </div>
                        <div className="text-lg font-bold leading-tight">
                        If we reduced this waste, families could redirect that money toward essentials like groceries, bills, education, or savings, making a meaningful difference in everyday life.
                        </div>
                    </div>
                    <div>
                        <div className="relative h-64">
                            <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-64 h-64 rounded-full bg-lightgreen relative">
                                <div className="absolute bottom-0 right-0 w-12 h-12 rounded-full bg-darkgreen flex items-center justify-center text-xs text-white font-bold">
                                $40b
                                </div>
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center">
                                <div className="text-lg font-bold">$2.7 trillion</div>
                                <div className="text-xs">
                                    Global waste management industry income in 2023
                                </div>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            </div>

            {/* Interactive Food Waste Impact */}
            <div 
                className="py-20 mb-20"
                style={{
                    backgroundImage: `url('https://readdy.ai/api/search-image?query=Stack%20of%20money%20and%20gold%20coins%20showing%20financial%20prosperity%20with%20dramatic%20lighting%20and%20professional%20composition%20against%20dark%20elegant%20background%20with%20green%20accents%20showing%20sustainable%20investment%20concept&width=1440&height=800&seq=9&orientation=landscape')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                }}
                id="impactSection"
            >
                {/* Overlay for the second image with dynamic opacity */}
                <div 
                    id="overlayImage"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `url('https://readdy.ai/api/search-image?query=Burning%20and%20torn%20money%20showing%20financial%20loss%20and%20waste%20with%20dramatic%20lighting%20smoke%20effects%20and%20professional%20composition%20against%20dark%20background%20with%20red%20warning%20tones%20representing%20economic%20crisis&width=1440&height=800&seq=10&orientation=landscape')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 0.5,
                        transition: 'opacity 500ms ease'
                    }}
                />

                {/* Dark overlay to control base image visibility */}
                <div 
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    }}
                />
                
                {/* Interactive Section */}
                <div className="max-w-4xl mx-auto text-center bg-white bg-opacity-60 p-10 rounded-2xl backdrop-blur-sm">
                    <h2 className="bg-green text-white text-3xl font-bold px-4 py-2 inline-block mb-4">
                        Your actions today can create a better tomorrow.
                    </h2>
                    <p className="text-darkgreen font-bold text-lg mb-12 leading-relaxed max-w-3xl mx-auto">
                        By reducing food waste, you're not just saving money - you're contributing to a
                        more sustainable future. Slide to see how your choices can make a
                        difference.
                    </p>
                    {/* Slider */}
                    <div className="flex flex-col items-center">
                    <div className="w-full max-w-2xl mb-10">
                        <div className="flex items-center justify-between gap-4">
                            <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center mx-auto mb-2 shadow-md">
                                <FontAwesomeIcon icon={faRecycle} className="text-white text-xl" />
                            </div>
                            <p className="font-medium text-teal-700">Less Waste</p>
                            </div>
                            
                            <div className="flex-1 mx-4">
                                <Slider
                                    className="w-full"
                                    color="primary"
                                    defaultValue={50}
                                    minValue={0}
                                    maxValue={100}
                                    step={1}
                                    onChange={(value: number | number[]) => {
                                        // Ensure we're dealing with a single number
                                        const numericValue = Array.isArray(value) ? value[0] : value;
                                        const opacity = numericValue / 100;
                                        const overlayElement = document.getElementById("overlayImage");
                                        if (overlayElement) {
                                            overlayElement.style.opacity = opacity.toString();
                                        }
                                        
                                        // Update impact text based on slider value
                                        const impactText = document.getElementById("impactText");
                                        if (impactText) {
                                            if (numericValue < 25) {
                                                impactText.textContent = "Minimal food waste leads to significant economic and environmental benefits";
                                            } else if (numericValue < 50) {
                                                impactText.textContent = "Moderate food waste reduction still provides substantial benefits";
                                            } else if (numericValue < 75) {
                                                impactText.textContent = "Increasing food waste creates economic and environmental costs";
                                            } else {
                                                impactText.textContent = "Heavy food waste creates severe financial and environmental impact";
                                            }
                                        }
                                    }}
                                />
                            </div>
                            
                            <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-2 shadow-md">
                                <FontAwesomeIcon icon={faTrash} className="text-white text-xl" />
                            </div>
                            <p className="font-medium text-red-700">More Waste</p>
                            </div>
                        </div>
                    </div>
                    </div>

                    {/* Metrics Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Annual Cost */}
                        <div
                        className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
                        onMouseEnter={(e) => {
                            const target = e.currentTarget;
                            target.classList.add("transform", "scale-105");
                        }}
                        onMouseLeave={(e) => {
                            const target = e.currentTarget;
                            target.classList.remove("transform", "scale-105");
                        }}
                        >
                        <div className="flex items-center justify-start mb-4">
                            <FontAwesomeIcon icon={faDollarSign} className="mr-1 text-teal-500 text-xl" />
                            <h3 className="text-gray-500 font-medium">Annual Cost</h3>
                        </div>
                        <div className="flex items-end justify-start">
                            <span className="text-3xl font-bold text-teal-600">$</span>
                            <span
                            className="text-4xl font-bold text-teal-600 counter-value"
                            data-target="36.6"
                            >
                            36.6
                            </span>
                            <span className="text-3xl font-bold text-teal-600">B</span>
                        </div>
                        <div className="mt-2 text-sm text-gray-500 text-left">
                            <span className="inline-flex items-center text-green">
                            <FontAwesomeIcon icon={faArrowDown} className="mr-1 text-green" /> 2.3% from last year
                            </span>
                        </div>
                        <div className="h-1 w-full bg-gray-100 mt-4 rounded-full overflow-hidden">
                            <div
                            className="h-full bg-teal-500 rounded-full"
                            style={{ width: "70%" }}
                            ></div>
                        </div>
                        </div>

                        {/* Tonnes Wasted */}
                        <div
                        className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
                        onMouseEnter={(e) => {
                            const target = e.currentTarget;
                            target.classList.add("transform", "scale-105");
                        }}
                        onMouseLeave={(e) => {
                            const target = e.currentTarget;
                            target.classList.remove("transform", "scale-105");
                        }}
                        >
                        <div className="flex items-center justify-start mb-4">
                            <FontAwesomeIcon icon={faWeightHanging} className="mr-1 text-blue-500 text-xl" />
                            <h3 className="text-gray-500 font-medium">Tonnes Wasted</h3>
                        </div>
                        <div className="flex items-end justify-start">
                            <span
                            className="text-4xl font-bold text-blue-600 counter-value"
                            data-target="7.6"
                            >
                            7.6
                            </span>
                            <span className="text-3xl font-bold text-blue-600">M</span>
                        </div>
                        <div className="mt-2 text-sm text-gray-500 text-left">
                            <span className="inline-flex items-center text-green">
                            <FontAwesomeIcon icon={faArrowDown} className="mr-1" /> 1.8% from last year
                            </span>
                        </div>
                        <div className="h-1 w-full bg-gray-100 mt-4 rounded-full overflow-hidden">
                            <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: "60%" }}
                            ></div>
                        </div>
                        </div>

                        {/* Household Waste */}
                        <div
                        className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
                        onMouseEnter={(e) => {
                            const target = e.currentTarget;
                            target.classList.add("transform", "scale-105");
                        }}
                        onMouseLeave={(e) => {
                            const target = e.currentTarget;
                            target.classList.remove("transform", "scale-105");
                        }}
                        >
                        <div className="flex items-center justify-start mb-4">
                            <FontAwesomeIcon icon={faHome} className="mr-1 text-amber-500 text-xl" />
                            <h3 className="text-gray-500 font-medium">Household Waste</h3>
                        </div>
                        <div className="flex items-end justify-start">
                            <span
                            className="text-4xl font-bold text-amber-600 counter-value"
                            data-target="52.7"
                            >
                            52.7
                            </span>
                            <span className="text-3xl font-bold text-amber-600">%</span>
                        </div>
                        <div className="mt-2 text-sm text-gray-500 text-left">
                            <span className="inline-flex items-center text-red-600">
                            <FontAwesomeIcon icon={faArrowUp} className="mr-1" /> 0.5% from last year
                            </span>
                        </div>
                        <div className="h-1 w-full bg-gray-100 mt-4 rounded-full overflow-hidden">
                            <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: "52.7%" }}
                            ></div>
                        </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Environmental Impact Section with Scrolling Effect */}
            <div className="h-[250vh]" ref={scrollContainerRef}>
                {/* Sticky Container */}
                <div className="sticky top-0 left-0 w-full h-screen flex flex-col">
                    {/* Environmental Impact Title */}
                    <div className="py-8">
                        <div className="w-full space-y-2">
                            <div className="w-3/5 h-24 bg-darkgreen overflow-hidden"></div>
                            <div className="w-full flex flex-row items-center gap-12">
                                <div className="w-1/5 h-24 bg-darkgreen overflow-hidden"></div>
                                <h2 className="text-7xl md:text-9xl font-black text-darkgreen tracking-tight">
                                    Environmental Impact
                                </h2> 
                            </div>
                            <div className="w-3/5 h-24 bg-darkgreen overflow-hidden"></div>  
                        </div>
                    </div>
                
                    {/* Impact of Food Emission on Environment */}
                    <div className="flex-grow flex items-center justify-center py-4">
                        <div className="container mx-auto px-8 max-w-6xl">
                            <div className="flex flex-col lg:flex-row gap-10 h-full">
                                {/* Earth Image */}
                                <div className="w-full lg:w-1/2 flex items-center justify-center" ref={earthSectionRef}>
                                    <img
                                        src="https://readdy.ai/api/search-image?query=Planet%20Earth%20from%20space%20showing%20atmospheric%20effects%20and%20climate%20change%20with%20dramatic%20cloud%20formations%20and%20visible%20pollution%20effects%20professional%20space%20photography%20with%20high%20detail%20and%20environmental%20storytelling&width=600&height=600&seq=11&orientation=squarish"
                                        alt="Earth climate impact"
                                        className="w-full h-[400px] object-cover rounded-xl shadow-xl"
                                    />
                                </div>

                                {/* Impact Cards Container */}
                                <div className="w-full lg:w-1/2 flex flex-col justify-center">
                                    <AnimatePresence mode="wait">
                                        {/* Card 1 - CO₂ Generation */}
                                        {activeCardIndex === 0 && (
                                            <motion.div 
                                                key="card1"
                                                className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-red-500 hover:shadow-xl"
                                                initial="enter"
                                                animate="center"
                                                exit="exit"
                                                variants={cardVariants}
                                            >
                                                <div className="flex flex-col items-start">
                                                    <div className="p-4 bg-red-100 rounded-full mb-4">
                                                        <FontAwesomeIcon icon={faIndustry} className="text-red-500 text-2xl" />
                                                    </div>
                                                    <div className="text-start">
                                                        <div className="text-2xl font-semibold leading-tight mb-4">
                                                            <p><span className="bg-red-500 text-white text-2xl font-bold px-4 py-2 inline-block">17.5 million tonnes</span> of CO₂ generated from the production and disposal
                                                            of food that is wasted in Australia (excluding exports).<sup className="text-xs align-super ml-1">1</sup></p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                        
                                        {/* Card 2 - Temperature Impact */}
                                        {activeCardIndex === 1 && (
                                            <motion.div 
                                                key="card2"
                                                className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-amber-500 hover:shadow-xl"
                                                initial="enter"
                                                animate="center"
                                                exit="exit"
                                                variants={cardVariants}
                                            >
                                                <div className="flex flex-col items-start">
                                                    <div className="p-4 bg-amber-100 rounded-full mb-4">
                                                        <FontAwesomeIcon icon={faArrowUp} className="text-amber-500 text-2xl" />
                                                    </div>
                                                    <div className="text-start">
                                                        <div className="text-2xl font-semibold leading-tight mb-4">
                                                            <p>Emissions from food waste alone would push global temperatures beyond <span className="bg-amber-500 text-white text-2xl font-bold px-4 py-2 inline-block">1.5°C or 2°C</span> this century if left unchecked.<sup className="text-xs align-super ml-1">3</sup></p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                        
                                        {/* Card 3 - Global Impact */}
                                        {activeCardIndex === 2 && (
                                            <motion.div 
                                                key="card3"
                                                className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-green hover:shadow-xl"
                                                initial="enter"
                                                animate="center"
                                                exit="exit"
                                                variants={cardVariants}
                                            >
                                                <div className="flex flex-col items-start">
                                                    <div className="p-4 bg-green bg-opacity-20 rounded-full mb-4">
                                                        <FontAwesomeIcon icon={faGlobe} className="text-green text-2xl" />
                                                    </div>
                                                    <div className="text-start">
                                                        <div className="text-2xl font-semibold leading-tight mb-4">
                                                            <p>Around <span className="bg-green text-2xl text-white font-bold px-4 py-2 inline-block">25-30%</span> 
                                                                of global greenhouse gas emissions come from food systems, <span className="bg-green text-2xl text-white font-bold px-4 py-2 inline-block">increasing to one-third</span> when including all agricultural products.<sup className="text-xs align-super ml-1">3</sup></p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Emissions Chart */}
            <div className="bg-green-50 py-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-5xl font-bold text-darkgreen mb-4">
                        Top 5 Greenhouse Gas Emissions Food Items{" "}
                    </h2>
                    <h2 className="text-4xl font-bold text-darkgreen mb-8">
                        per kilogram of food waste <sup className="text-sm align-super ml-1">4</sup>
                    </h2>
                    
                    {/* Chart container with animation */}
                    <motion.div 
                        className="relative pt-4"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: false, amount: 0.3 }}
                        variants={{
                            visible: {
                                transition: { staggerChildren: 0.2 }
                            },
                            hidden: {
                                transition: { staggerChildren: 0.05, staggerDirection: -1 }
                            }
                        }}
                    >
                        {/* Refactored chart using data array and mapping */}
                        {[
                            { country: "Australia", value: 2213.1, percentage: 100, color: "#2D6A4F" },
                            { country: "Indonesia", value: 1200.2, percentage: 55, color: "#40916C" },
                            { country: "Iran", value: 996.8, percentage: 45, color: "#52B788" },
                            { country: "Canada", value: 747.7, percentage: 34, color: "#74C69D" },
                            { country: "Germany", value: 681.8, percentage: 30, color: "#B7E4C7" }
                        ].map((item, index) => (
                            <div className="relative mb-3" key={index}>
                                <motion.div 
                                    className="p-3 h-12" 
                                    style={{ 
                                        backgroundColor: item.color, 
                                        originX: 0
                                    }}
                                    variants={{
                                        visible: { 
                                            width: `${item.percentage}%`,
                                            transition: { 
                                                duration: 0.8,
                                                ease: "easeOut"
                                            }
                                        },
                                        hidden: { 
                                            width: "0%",
                                            transition: {
                                                duration: 0.5,
                                                ease: "easeIn"
                                            }
                                        }
                                    }}
                                ></motion.div>
                                <motion.div 
                                    className="absolute top-0 text-darkgreen flex flex-col pl-2"
                                    variants={{
                                        visible: { 
                                            opacity: 1,
                                            x: 0,
                                            transition: { 
                                                duration: 0.5,
                                                delay: 0.3
                                            }
                                        },
                                        hidden: { 
                                            opacity: 0,
                                            x: -20,
                                            transition: {
                                                duration: 0.3
                                            }
                                        }
                                    }}
                                    style={{ left: `${item.percentage}%` }}
                                >
                                    <span className="mr-2 font-bold">{item.country}</span>
                                    <span>{item.value}</span>
                                </motion.div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>

        </div>
    )
}