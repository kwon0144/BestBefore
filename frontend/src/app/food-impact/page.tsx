'use client'

import Title from "../(components)/Title"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faQuoteLeft, faSeedling, faShoppingCart, faTruck, faAppleAlt, faIndustry, faTrash, faRecycle, faArrowUp, faHome, faArrowDown, faWeightHanging, faDollarSign, faGlobe } from '@fortawesome/free-solid-svg-icons'
import { useRef, useState, useEffect } from "react";
import * as echarts from "echarts";
import { Slider } from "@heroui/react";
import { motion, AnimatePresence, useScroll, useTransform, useAnimation, useInView, Variants } from "framer-motion";

export default function FoodImpact() {
    const chartRef = useRef<HTMLDivElement>(null);
    const earthSectionRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const quoteRef = useRef<HTMLDivElement>(null);
    const foodWasteRef = useRef<HTMLDivElement>(null);
    const economicLossRef = useRef<HTMLDivElement>(null);
    const supplyChainRef = useRef<HTMLDivElement>(null);
    const metricCardsRef = useRef<HTMLDivElement>(null);
    const sloganRef = useRef<HTMLDivElement>(null);
    
    // Track element visibility for animation triggers
    const isQuoteInView = useInView(quoteRef, { once: false, amount: 0.3 });
    const isFoodWasteInView = useInView(foodWasteRef, { once: false, amount: 0.3 });
    const isEconomicLossInView = useInView(economicLossRef, { once: false, amount: 0.3 });
    const isSupplyChainInView = useInView(supplyChainRef, { once: false, amount: 0.3 });
    const isMetricCardsInView = useInView(metricCardsRef, { once: false, amount: 0.3 });
    const isSloganInView = useInView(sloganRef, { once: false, amount: 0.3 });
    
    // Animation controls for manually triggered animations
    const quoteControls = useAnimation();
    const foodWasteControls = useAnimation();
    const economicLossControls = useAnimation();
    const supplyChainControls = useAnimation();
    const metricCardsControls = useAnimation();
    const sloganControls = useAnimation();
    
    // Trigger animations when elements come into view
    useEffect(() => {
        if (isQuoteInView) quoteControls.start("visible");
        if (isFoodWasteInView) foodWasteControls.start("visible");
        if (isEconomicLossInView) economicLossControls.start("visible");
        if (isSupplyChainInView) supplyChainControls.start("visible");
        if (isMetricCardsInView) metricCardsControls.start("visible");
        if (isSloganInView) sloganControls.start("visible");
    }, [
        isQuoteInView, 
        isFoodWasteInView, 
        isEconomicLossInView, 
        isSupplyChainInView,
        isMetricCardsInView,
        isSloganInView,
        quoteControls,
        foodWasteControls,
        economicLossControls,
        supplyChainControls,
        metricCardsControls,
        sloganControls
    ]);
    
    const [activeCardIndex, setActiveCardIndex] = useState<number>(-1);
    
    // Animation variants
    const fadeInUpVariant: Variants = {
        hidden: { opacity: 0, y: 50 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
                type: "spring", 
                duration: 0.8,
                bounce: 0.25
            }
        }
    };
    
    const fadeInVariant: Variants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { 
                duration: 0.6 
            }
        }
    };
    
    const staggerContainerVariant: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    };
    
    const scaleInVariant: Variants = {
        hidden: { 
            opacity: 0, 
            scale: 0.8 
        },
        visible: { 
            opacity: 1, 
            scale: 1,
            transition: { 
                type: "spring", 
                duration: 0.5
            }
        }
    };
    
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
    
    // ECharts setup for pie chart - no animations
    useEffect(() => {
      // Simple chart initialization without animations
      if (chartRef.current) {
        // Dispose any existing chart
        echarts.dispose(chartRef.current);
        
        // Create a new chart
        const chart = echarts.init(chartRef.current);
        
        // Simple configuration without animations
        const option = {
          animation: false,
          backgroundColor: 'transparent',
          tooltip: {
            trigger: "item",
            formatter: "{b}: {c} ({d}%)"
          },
          series: [
            {
              name: "Food Waste Stages",
              type: "pie",
              radius: "65%",
              center: ['50%', '50%'],
              data: [
                { value: 28, name: "Stage 1", itemStyle: { color: "#ff6b6b" } },
                { value: 22, name: "Stage 2", itemStyle: { color: "#ffd166" } },
                { value: 20, name: "Stage 3", itemStyle: { color: "#06d6a0" } },
                { value: 18, name: "Stage 4", itemStyle: { color: "#118ab2" } },
                { value: 12, name: "Stage 5", itemStyle: { color: "#073b4c" } },
              ],
              itemStyle: {
                borderRadius: 4,
                borderColor: '#fff',
                borderWidth: 1
              },
              label: {
                show: true,
                formatter: '{b}: {d}%',
                fontSize: 14
              }
            }
          ]
        };
        
        // Apply the configuration
        chart.setOption(option);
        
        // Handle window resize
        const handleResize = () => {
          chart.resize();
        };
        
        window.addEventListener('resize', handleResize);
        
        // Cleanup
        return () => {
          chart.dispose();
          window.removeEventListener('resize', handleResize);
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
            <motion.div 
                ref={quoteRef}
                initial="hidden"
                whileInView="visible" 
                viewport={{ once: false, amount: 0.3 }}
                variants={staggerContainerVariant}
                className="max-w-7xl mx-auto px-10 mt-8 mb-20"
            >
                <div className="max-w-4xl mx-auto px-6">
                    <motion.div variants={scaleInVariant}>
                        <FontAwesomeIcon icon={faQuoteLeft} className="text-darkgreen text-4xl font-semibold leading-tight mb-8" />
                    </motion.div>
                    <motion.p 
                        variants={fadeInUpVariant}
                        className="text-darkgreen text-4xl font-semibold leading-tight mb-8"
                    >
                        "Food waste is not just about economics and hunger. It's about
                        climate, environment, and sustainability."
                    </motion.p>
                    <motion.div 
                        variants={fadeInVariant}
                        className="flex items-center"
                    >
                        <div className="w-12 h-0.5 bg-darkgreen mr-4"></div>
                        <p className="text-darkgreen text-lg">
                            Tristram Stuart
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            {/* Australia's Food Waste Section */}
            <motion.div 
                ref={foodWasteRef}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }}
                variants={fadeInVariant}
                className="mt-12" 
                style={{ 
                    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url(https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/aus_food_waste.jpg)', 
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center',
                    height: '500px' 
                }}
            >
                <div className="max-w-6xl mx-auto h-full flex flex-col justify-end pb-4">
                    <motion.p 
                        variants={fadeInUpVariant}
                        className="text-darkgreen text-2xl font-bold"
                    >
                        Each year, Australians waste food across the supply chain in a total of
                    </motion.p>
                    <motion.h2 
                        variants={{
                            hidden: { opacity: 0, scale: 0.9 },
                            visible: { 
                                opacity: 1, 
                                scale: 1,
                                transition: {
                                    duration: 0.8,
                                    delay: 0.2,
                                    ease: "easeOut"
                                }
                            }
                        }}
                        className="text-darkgreen text-9xl font-bold leading-tight"
                    >
                        7.6 million tonnes<sup className="text-2xl align-super ml-4">1</sup>
                    </motion.h2>
                </div>
            </motion.div>

            {/* Supply Chain Visualization */}
            <motion.div 
                ref={supplyChainRef}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }}
                variants={staggerContainerVariant}
                className="max-w-6xl mx-auto py-20 px-6"
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Text Section */}
                    <motion.div 
                        variants={fadeInUpVariant}
                        className="flex flex-col justify-center h-full"
                    >
                        <h2 className="text-3xl font-bold text-darkgreen mb-6">
                            What's in Our Food Waste?
                        </h2>
                        <p className="text-gray-700 mb-8">
                            Food waste varies significantly across different stages of the
                            supply chain. Understanding its composition helps target reduction
                            efforts more effectively.
                        </p>
                        <div className="space-y-4">
                            <motion.div 
                                variants={fadeInVariant}
                                transition={{ delay: 0.1 }}
                                className="flex items-center"
                            >
                                <div className="w-4 h-4 rounded-full bg-red-400 mr-3"></div>
                                <span className="text-gray-700">Stage 1</span>
                            </motion.div>
                            <motion.div 
                                variants={fadeInVariant}
                                transition={{ delay: 0.2 }}
                                className="flex items-center"
                            >
                                <div className="w-4 h-4 rounded-full bg-yellow-300 mr-3"></div>
                                <span className="text-gray-700">Stage 2</span>
                            </motion.div>
                            <motion.div 
                                variants={fadeInVariant}
                                transition={{ delay: 0.3 }}
                                className="flex items-center"
                            >
                                <div className="w-4 h-4 rounded-full bg-green-400 mr-3"></div>
                                <span className="text-gray-700">Stage 3</span>
                            </motion.div>
                            <motion.div 
                                variants={fadeInVariant}
                                transition={{ delay: 0.4 }}
                                className="flex items-center"
                            >
                                <div className="w-4 h-4 rounded-full bg-blue-500 mr-3"></div>
                                <span className="text-gray-700">Stage 4</span>
                            </motion.div>
                            <motion.div 
                                variants={fadeInVariant}
                                transition={{ delay: 0.5 }}
                                className="flex items-center"
                            >
                                <div className="w-4 h-4 rounded-full bg-blue-900 mr-3"></div>
                                <span className="text-gray-700">Stage 5</span>
                            </motion.div>
                        </div>
                    </motion.div>
                    {/* Supply Chain */}
                    <motion.div variants={fadeInUpVariant}>
                        {/* Replace animated supply chain with static version */}
                        <div className="flex justify-center items-center space-x-2 mb-12">
                            <div className="flex flex-col items-center">
                                <div className="bg-amber-300 rounded-full p-4 mb-2">
                                    <FontAwesomeIcon icon={faSeedling} className="text-2xl text-gray-800" />
                                </div>
                                <span className="text-xs text-gray-600">PRODUCTION</span>
                            </div>
                            <div>
                                <FontAwesomeIcon icon={faArrowRight} className="text-amber-400" />
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="bg-amber-300 rounded-full p-4 mb-2">
                                    <FontAwesomeIcon icon={faIndustry} className="text-2xl text-gray-800" />
                                </div>
                                <span className="text-xs text-gray-600 text-center">
                                    PROCESSING & MANUFACTURING
                                </span>
                            </div>
                            <div>
                                <FontAwesomeIcon icon={faArrowRight} className="text-amber-400" />
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="bg-amber-300 rounded-full p-4 mb-2">
                                    <FontAwesomeIcon icon={faTruck} className="text-2xl text-gray-800" />
                                </div>
                                <span className="text-xs text-gray-600 text-center">
                                    DISTRIBUTION & LOGISTICS
                                </span>
                            </div>
                            <div>
                                <FontAwesomeIcon icon={faArrowRight} className="text-amber-400" />
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="bg-amber-300 rounded-full p-4 mb-2">
                                    <FontAwesomeIcon icon={faShoppingCart} className="text-2xl text-gray-800" />
                                </div>
                                <span className="text-xs text-gray-600">RETAIL</span>
                            </div>
                            <div>
                                <FontAwesomeIcon icon={faArrowRight} className="text-amber-400" />
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="bg-amber-300 rounded-full p-4 mb-2">
                                    <FontAwesomeIcon icon={faAppleAlt} className="text-2xl text-gray-800" />
                                </div>
                                <span className="text-xs text-gray-600">CONSUMPTION</span>
                            </div>
                        </div>
                        {/* Separate the chart from motion animations */}
                        <div ref={chartRef} className="w-full h-80"></div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Economic Loss Title */}
            <motion.div 
                ref={economicLossRef}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }}
                variants={staggerContainerVariant}
                className="flex flex-col md:flex-row items-center"
            >
                <div className="w-full space-y-2">
                    <motion.div 
                        className="w-3/5 h-24 bg-darkgreen overflow-hidden"
                        variants={{
                            hidden: { width: 0 },
                            visible: { 
                                width: "60%",
                                transition: { duration: 0.8 }
                            }
                        }}
                    ></motion.div>
                    <div className="w-full flex flex-row items-center gap-12">
                        <motion.div 
                            className="w-2/5 h-24 bg-darkgreen overflow-hidden"
                            variants={{
                                hidden: { width: 0 },
                                visible: { 
                                    width: "40%",
                                    transition: { duration: 0.8, delay: 0.2 }
                                }
                            }}
                        ></motion.div>
                        <motion.h2 
                            className="text-9xl font-black text-darkgreen tracking-tight"
                            variants={{
                                hidden: { 
                                    opacity: 0,
                                    x: 50
                                },
                                visible: { 
                                    opacity: 1,
                                    x: 0,
                                    transition: {
                                        duration: 0.8,
                                        delay: 0.4
                                    }
                                }
                            }}
                        >
                            ECONOMIC LOSS
                        </motion.h2> 
                    </div>
                    <motion.div 
                        className="w-3/5 h-24 bg-darkgreen overflow-hidden"
                        variants={{
                            hidden: { width: 0 },
                            visible: { 
                                width: "60%",
                                transition: { duration: 0.8, delay: 0.6 }
                            }
                        }}
                    ></motion.div>  
                </div>
            </motion.div>

            {/* Cost of Food Waste */}
            <div className="py-10 mb-20">
                <motion.div 
                    className="mt-12" 
                    style={{ 
                        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)), url(https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/aus_food_waste.jpg)', 
                        backgroundSize: 'cover', 
                        backgroundPosition: 'center',
                        height: '500px' 
                    }}
                    initial={{ opacity: 0 }}
                    whileInView={{ 
                        opacity: 1,
                        transition: {
                            duration: 0.8
                        }
                    }}
                    viewport={{ once: false, amount: 0.3 }}
                >
                    <div className="max-w-6xl mx-auto h-full flex flex-col justify-end pb-4">
                        <motion.p 
                            className="text-darkgreen text-2xl font-bold"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ 
                                opacity: 1,
                                y: 0,
                                transition: {
                                    duration: 0.5,
                                    delay: 0.2
                                }
                            }}
                            viewport={{ once: false, amount: 0.3 }}
                        >
                            The cost of food waste to Australian economy in a year is
                        </motion.p>
                        <motion.h2 
                            className="text-darkgreen text-9xl font-bold leading-tight"
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ 
                                opacity: 1,
                                scale: 1,
                                transition: {
                                    type: "spring",
                                    bounce: 0.2,
                                    duration: 0.8,
                                    delay: 0.4
                                }
                            }}
                            viewport={{ once: false, amount: 0.3 }}
                        >
                            $36.6 billion<sup className="text-2xl align-super ml-4">2</sup>
                        </motion.h2>
                    </div>
                </motion.div>
            </div>

            {/* Analysis of Food Waste Cost */}
            <div className="py-10 mb-20">
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
                    >
                        <motion.div 
                            className="text-3xl font-bold leading-tight mb-4"
                        >
                            <motion.span 
                                className="bg-green text-white text-3xl font-bold px-4 py-2 inline-block"
                                initial={{ y: 20, opacity: 0 }}
                                whileInView={{ 
                                    y: 0, 
                                    opacity: 1,
                                    transition: {
                                        delay: 0.2,
                                        duration: 0.5
                                    }
                                }}
                                viewport={{ once: false, amount: 0.3 }}
                            >Household food waste amounts</motion.span>
                            
                            <motion.span 
                                className="bg-green text-white text-3xl font-bold px-4 py-2 inline-block"
                                initial={{ y: 20, opacity: 0 }}
                                whileInView={{ 
                                    y: 0, 
                                    opacity: 1,
                                    transition: {
                                        delay: 0.4,
                                        duration: 0.5
                                    }
                                }}
                                viewport={{ once: false, amount: 0.3 }}
                            >to $19.3 billion (52.7%)</motion.span> 
                            
                            <motion.span
                                initial={{ opacity: 0 }}
                                whileInView={{ 
                                    opacity: 1,
                                    transition: {
                                        delay: 0.6,
                                        duration: 0.5
                                    }
                                }}
                                viewport={{ once: false, amount: 0.3 }}
                            >
                                annually,
                            </motion.span>
                            
                            <motion.p
                                initial={{ opacity: 0 }}
                                whileInView={{ 
                                    opacity: 1,
                                    transition: {
                                        delay: 0.7,
                                        duration: 0.5
                                    }
                                }}
                                viewport={{ once: false, amount: 0.3 }}
                            >
                                and costs up to 
                            </motion.p>
                            
                            <motion.span 
                                className="bg-green text-white text-3xl font-bold px-4 py-2 inline-block"
                                initial={{ y: 20, opacity: 0 }}
                                whileInView={{ 
                                    y: 0, 
                                    opacity: 1,
                                    transition: {
                                        delay: 0.8,
                                        duration: 0.5
                                    }
                                }}
                                viewport={{ once: false, amount: 0.3 }}
                            >$2,500 per household.</motion.span>
                        </motion.div>
                        <motion.div 
                            className="text-lg font-bold leading-tight"
                            initial={{ opacity: 0 }}
                            whileInView={{ 
                                opacity: 1,
                                transition: {
                                    delay: 1,
                                    duration: 0.8
                                }
                            }}
                            viewport={{ once: false, amount: 0.3 }}
                        >
                            If we reduced this waste, families could redirect that money toward essentials like groceries, bills, education, or savings, making a meaningful difference in everyday life.
                        </motion.div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
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
                        <div className="relative h-64">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div 
                                    className="w-64 h-64 rounded-full bg-lightgreen relative"
                                    animate={{ 
                                        rotate: [0, 5, 0, -5, 0],
                                    }}
                                    transition={{
                                        duration: 10,
                                        ease: "easeInOut",
                                        repeat: Infinity,
                                    }}
                                >
                                    <motion.div 
                                        className="absolute bottom-0 right-0 w-12 h-12 rounded-full bg-darkgreen flex items-center justify-center text-xs text-white font-bold"
                                        whileHover={{ scale: 1.2 }}
                                    >
                                        $40b
                                    </motion.div>
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center">
                                        <motion.div 
                                            className="text-lg font-bold"
                                            initial={{ opacity: 0 }}
                                            whileInView={{ 
                                                opacity: 1,
                                                transition: {
                                                    delay: 0.6,
                                                    duration: 0.4
                                                }
                                            }}
                                            viewport={{ once: false, amount: 0.3 }}
                                        >
                                            $2.7 trillion
                                        </motion.div>
                                        <motion.div 
                                            className="text-xs"
                                            initial={{ opacity: 0 }}
                                            whileInView={{ 
                                                opacity: 1,
                                                transition: {
                                                    delay: 0.8,
                                                    duration: 0.4
                                                }
                                            }}
                                            viewport={{ once: false, amount: 0.3 }}
                                        >
                                            Global waste management industry income in 2023
                                        </motion.div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>
                </motion.div>
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
                    <motion.div 
                        ref={metricCardsRef}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: false, amount: 0.3 }}
                        variants={staggerContainerVariant}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"
                    >
                        {/* Annual Cost */}
                        <motion.div
                            className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
                            variants={scaleInVariant}
                            whileHover={{ 
                                scale: 1.05,
                                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                                transition: { 
                                    duration: 0.2 
                                }
                            }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="flex items-center justify-start mb-4">
                                <FontAwesomeIcon icon={faDollarSign} className="mr-1 text-teal-500 text-xl" />
                                <h3 className="text-gray-500 font-medium">Annual Cost</h3>
                            </div>
                            <div className="flex items-end justify-start">
                                <span className="text-3xl font-bold text-teal-600">$</span>
                                <motion.span
                                    className="text-4xl font-bold text-teal-600"
                                    initial={{ opacity: 0 }}
                                    whileInView={{
                                        opacity: 1,
                                        transition: {
                                            delay: 0.3,
                                            duration: 0.5
                                        }
                                    }}
                                    viewport={{ once: false, amount: 0.8 }}
                                >
                                    36.6
                                </motion.span>
                                <span className="text-3xl font-bold text-teal-600">B</span>
                            </div>
                            <div className="mt-2 text-sm text-gray-500 text-left">
                                <span className="inline-flex items-center text-green">
                                    <FontAwesomeIcon icon={faArrowDown} className="mr-1 text-green" /> 2.3% from last year
                                </span>
                            </div>
                            <div className="h-1 w-full bg-gray-100 mt-4 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-teal-500 rounded-full"
                                    initial={{ width: 0 }}
                                    whileInView={{ 
                                        width: "70%",
                                        transition: {
                                            duration: 1,
                                            delay: 0.5
                                        }
                                    }}
                                    viewport={{ once: false, amount: 0.8 }}
                                ></motion.div>
                            </div>
                        </motion.div>

                        {/* Tonnes Wasted */}
                        <motion.div
                            className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
                            variants={scaleInVariant}
                            whileHover={{ 
                                scale: 1.05,
                                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                                transition: { 
                                    duration: 0.2 
                                }
                            }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="flex items-center justify-start mb-4">
                                <FontAwesomeIcon icon={faWeightHanging} className="mr-1 text-blue-500 text-xl" />
                                <h3 className="text-gray-500 font-medium">Tonnes Wasted</h3>
                            </div>
                            <div className="flex items-end justify-start">
                                <motion.span
                                    className="text-4xl font-bold text-blue-600"
                                    initial={{ opacity: 0 }}
                                    whileInView={{
                                        opacity: 1,
                                        transition: {
                                            delay: 0.3,
                                            duration: 0.5
                                        }
                                    }}
                                    viewport={{ once: false, amount: 0.8 }}
                                >
                                    7.6
                                </motion.span>
                                <span className="text-3xl font-bold text-blue-600">M</span>
                            </div>
                            <div className="mt-2 text-sm text-gray-500 text-left">
                                <span className="inline-flex items-center text-green">
                                    <FontAwesomeIcon icon={faArrowDown} className="mr-1" /> 1.8% from last year
                                </span>
                            </div>
                            <div className="h-1 w-full bg-gray-100 mt-4 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-blue-500 rounded-full"
                                    initial={{ width: 0 }}
                                    whileInView={{ 
                                        width: "60%",
                                        transition: {
                                            duration: 1,
                                            delay: 0.5
                                        }
                                    }}
                                    viewport={{ once: false, amount: 0.8 }}
                                ></motion.div>
                            </div>
                        </motion.div>

                        {/* Household Waste */}
                        <motion.div
                            className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
                            variants={scaleInVariant}
                            whileHover={{ 
                                scale: 1.05,
                                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                                transition: { 
                                    duration: 0.2 
                                }
                            }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="flex items-center justify-start mb-4">
                                <FontAwesomeIcon icon={faHome} className="mr-1 text-amber-500 text-xl" />
                                <h3 className="text-gray-500 font-medium">Household Waste</h3>
                            </div>
                            <div className="flex items-end justify-start">
                                <motion.span
                                    className="text-4xl font-bold text-amber-600"
                                    initial={{ opacity: 0 }}
                                    whileInView={{
                                        opacity: 1,
                                        transition: {
                                            delay: 0.3,
                                            duration: 0.5
                                        }
                                    }}
                                    viewport={{ once: false, amount: 0.8 }}
                                >
                                    52.7
                                </motion.span>
                                <span className="text-3xl font-bold text-amber-600">%</span>
                            </div>
                            <div className="mt-2 text-sm text-gray-500 text-left">
                                <span className="inline-flex items-center text-red-600">
                                    <FontAwesomeIcon icon={faArrowUp} className="mr-1" /> 0.5% from last year
                                </span>
                            </div>
                            <div className="h-1 w-full bg-gray-100 mt-4 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-amber-500 rounded-full"
                                    initial={{ width: 0 }}
                                    whileInView={{ 
                                        width: "52.7%",
                                        transition: {
                                            duration: 1,
                                            delay: 0.5
                                        }
                                    }}
                                    viewport={{ once: false, amount: 0.8 }}
                                ></motion.div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Environmental Impact Section with Scrolling Effect */}
            <div className="h-[250vh]" ref={scrollContainerRef}>
                {/* Sticky Container */}
                <div className="sticky top-0 left-0 w-full h-screen flex flex-col">
                    {/* Environmental Impact Title */}
                    <div className="py-8">
                        <div className="w-full space-y-2">
                            <motion.div 
                                className="w-3/5 h-24 bg-darkgreen overflow-hidden"
                                initial={{ width: 0 }}
                                whileInView={{ 
                                    width: "60%",
                                    transition: { duration: 0.8 }
                                }}
                                viewport={{ once: false, amount: 0.3 }}
                            ></motion.div>
                            <div className="w-full flex flex-row items-center gap-12">
                                <motion.div 
                                    className="w-1/5 h-24 bg-darkgreen overflow-hidden"
                                    initial={{ width: 0 }}
                                    whileInView={{ 
                                        width: "20%",
                                        transition: { duration: 0.8, delay: 0.2 }
                                    }}
                                    viewport={{ once: false, amount: 0.3 }}
                                ></motion.div>
                                <motion.h2 
                                    className="text-7xl md:text-9xl font-black text-darkgreen tracking-tight"
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
                                    Environmental Impact
                                </motion.h2> 
                            </div>
                            <motion.div 
                                className="w-3/5 h-24 bg-darkgreen overflow-hidden"
                                initial={{ width: 0 }}
                                whileInView={{ 
                                    width: "60%",
                                    transition: { duration: 0.8, delay: 0.6 }
                                }}
                                viewport={{ once: false, amount: 0.3 }}
                            ></motion.div>  
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
                <div className="max-w-6xl mx-auto">
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

            {/* Around the World Title */}
            <motion.div 
                className="flex flex-col md:flex-row items-center"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.5 }}
            >
                <div className="w-full space-y-2">
                    <motion.div 
                        className="w-3/5 h-24 bg-darkgreen overflow-hidden"
                        initial={{ width: 0 }}
                        whileInView={{ 
                            width: "60%",
                            transition: { duration: 0.8 }
                        }}
                        viewport={{ once: false, amount: 0.3 }}
                    ></motion.div>
                    <div className="w-full flex flex-row items-center gap-12">
                        <motion.div 
                            className="w-2/5 h-24 bg-darkgreen overflow-hidden"
                            initial={{ width: 0 }}
                            whileInView={{ 
                                width: "40%",
                                transition: { duration: 0.8, delay: 0.2 }
                            }}
                            viewport={{ once: false, amount: 0.3 }}
                        ></motion.div>
                        <motion.h2 
                            className="text-9xl font-black text-darkgreen tracking-tight"
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
                        className="w-3/5 h-24 bg-darkgreen overflow-hidden"
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
            <div className="py-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-darkgreen mb-6">
                        Global Food Waste Distribution
                    </h2>
                    <p className="text-gray-700 mb-10">
                        Food waste is a global issue with varying impacts across different regions.
                    </p>
                    {/* Map visualization to be added here */}
                    <div className="h-[500px] w-full bg-gray-100 flex items-center justify-center border border-gray-200 rounded-lg">
                        <p className="text-gray-500 text-xl">Interactive map visualization will be added here</p>
                    </div>
                </div>
            </div>

            {/* Slogan Section */}
            <motion.div 
                ref={sloganRef}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.3 }}
                variants={staggerContainerVariant}
                className="max-w-6xl mx-auto flex flex-col md:flex-row items-center mb-16"
            >
                <div className="w-full flex flex-row items-center">
                    <div className="w-1/3">
                        <motion.div 
                            className="w-3/5 h-16 bg-darkgreen overflow-hidden mb-4"
                            variants={{
                                hidden: { width: 0 },
                                visible: { 
                                    width: "60%",
                                    transition: { duration: 0.6, delay: 0.1 }
                                }
                            }}
                        ></motion.div>
                        <motion.div 
                            className="w-2/5 h-16 bg-darkgreen overflow-hidden mb-4"
                            variants={{
                                hidden: { width: 0 },
                                visible: { 
                                    width: "40%",
                                    transition: { duration: 0.6, delay: 0.3 }
                                }
                            }}
                        ></motion.div>
                        <motion.div 
                            className="w-3/5 h-16 bg-darkgreen overflow-hidden mb-4"
                            variants={{
                                hidden: { width: 0 },
                                visible: { 
                                    width: "60%",
                                    transition: { duration: 0.6, delay: 0.5 }
                                }
                            }}
                        ></motion.div>
                    </div>
                    <motion.div 
                        className="w-2/3"
                        variants={fadeInUpVariant}
                    >
                        <h2 className="text-5xl font-black text-darkgreen tracking-tight">
                            Together, we can make a difference to stop food waste.
                        </h2> 
                    </motion.div>
                </div>
            </motion.div>

            {/* Sources */}
            <motion.div 
                className="bg-green-50 py-16"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ 
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.8 }
                }}
                viewport={{ once: false, amount: 0.1 }}
            >
                <div className="max-w-6xl mx-auto pt-4 border-t border-darkgreen sm:px-6 lg:px-8">
                    <motion.h2 
                        className="text-3xl font-bold text-darkgreen mb-8"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ 
                            opacity: 1,
                            x: 0,
                            transition: { 
                                duration: 0.5,
                                delay: 0.2
                            }
                        }}
                        viewport={{ once: false, amount: 0.5 }}
                    >
                        Sources
                    </motion.h2>
                    
                    <motion.div 
                        className="space-y-4 text-gray-700"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: false, amount: 0.3 }}
                        variants={{
                            visible: {
                                transition: {
                                    staggerChildren: 0.1
                                }
                            },
                            hidden: {}
                        }}
                    >
                        {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                            <motion.div 
                                key={num}
                                className="flex items-start"
                                variants={{
                                    visible: { 
                                        opacity: 1, 
                                        x: 0,
                                        transition: { duration: 0.5 }
                                    },
                                    hidden: { 
                                        opacity: 0, 
                                        x: -20
                                    }
                                }}
                            >
                                <span className="font-bold mr-4 text-darkgreen">{num}.</span>
                                {num === 1 && <p>National Food Waste Strategy Feasibility Study (Source: Australian Government)</p>}
                                {num === 2 && <p>Food waste costs Australian economy $36.6 billion annually (Source: Rabobank Food Waste Report 2023)</p>}
                                {num === 3 && <p>Global greenhouse gas emissions from food systems (Source: UN FAO, Climate Watch)</p>}
                                {num === 4 && <p>GHG emissions per kg of different food products (Source: Our World in Data based on Poore & Nemecek 2018)</p>}
                                {num === 5 && <p>Company emissions: Scopes 1 & 2 – operational control, Scope 3 – category 11, upstream production only, 2021 (Source: company reporting)</p>}
                                {num === 6 && <p>2023 Domestic GHG emissions only (Source: EDGAR Community GHG Database)</p>}
                                {num === 7 && <p>Global food waste reduction initiatives and impact measurements (Source: UN Environment Programme)</p>}
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
}