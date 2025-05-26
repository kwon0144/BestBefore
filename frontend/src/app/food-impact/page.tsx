'use client'

import { useRef, useState, useEffect } from "react";
import { faAppleWhole, faMoneyBill, faLeaf, faEarthAmericas, faBookOpen } from '@fortawesome/free-solid-svg-icons';

// Import visualization components
import ProgressNav from "./ProgressNav";
import AustraliaWaste from "./AustraliaWaste";
import SupplyChain from "./SupplyChain";
import EconomicLoss from "./EconomicLoss";
import CostOfFoodWaste from "./CostOfFoodWaste";
import EconomicWasteViz from "./EconomicWasteViz";
import EnvironmentalImpact from "./EnvironmentalImpact";
import EmissionsChart from "./EmissionsChart";
import GlobalImpact from "./GlobalImpact";
import Slogan from "./Slogan";
import Sources from "./Sources";
import { useInView } from "framer-motion";


/**
 * Food Impact Page Component
 * 
 * This is the main entry point for the food waste impact visualization page.
 * It orchestrates multiple visualization components and manages the navigation
 * between different sections using a persistent progress nav.
 */
export default function FoodImpact() {
    // Refs for main navigation sections (these match the nav items)
    const australiaWasteRef = useRef<HTMLDivElement>(null);
    const economicLossRef = useRef<HTMLDivElement>(null);
    const environmentalImpactRef = useRef<HTMLDivElement>(null);
    const aroundWorldRef = useRef<HTMLDivElement>(null);
    const sourcesRef = useRef<HTMLDivElement>(null);
    
    // Refs for components that don't have direct nav links
    const supplyChainRef = useRef<HTMLDivElement>(null);
    const costOfFoodWasteRef = useRef<HTMLDivElement>(null);
    const metricCardsRef = useRef<HTMLDivElement>(null);
    const sloganRef = useRef<HTMLDivElement>(null);
    const emissionsChartRef = useRef<HTMLDivElement>(null);
    
    
    // Track current active section for the navigation highlighting
    const [activeSection, setActiveSection] = useState<string>('australia-waste');
    
    // Use Framer Motion's useInView to detect when sections are visible
    const isAustraliaWasteInView = useInView(australiaWasteRef, { amount: 0.3 });
    const isEconomicLossInViewNav = useInView(economicLossRef, { amount: 0.3 });
    const isEnvironmentalImpactInView = useInView(environmentalImpactRef, { amount: 0.3 });
    const isAroundWorldInView = useInView(aroundWorldRef, { amount: 0.3 });
    const isSourcesInView = useInView(sourcesRef, { amount: 0.3 });
    
    /**
     * Update the active section based on which section is currently in view
     * This controls which nav item is highlighted in the progress nav
     */
    useEffect(() => {
        if (isAustraliaWasteInView) {
            setActiveSection('australia-waste');
        } else if (isEconomicLossInViewNav) {
            setActiveSection('economic-loss');
        } else if (isEnvironmentalImpactInView) {
            setActiveSection('environmental-impact');
        } else if (isAroundWorldInView) {
            setActiveSection('around-world');
        } else if (isSourcesInView) {
            setActiveSection('sources');
        }
    }, [
        isAustraliaWasteInView, 
        isEconomicLossInViewNav, 
        isEnvironmentalImpactInView, 
        isAroundWorldInView, 
        isSourcesInView
    ]);
    
    /**
     * Smooth scroll to a specific section when a nav item is clicked
     * @param sectionId - ID of the section to scroll to
     */
    const scrollToSection = (sectionId: string) => {
        let targetRef;
        
        switch(sectionId) {
            case 'australia-waste':
                targetRef = australiaWasteRef;
                break;
            case 'economic-loss':
                targetRef = economicLossRef;
                break;
            case 'environmental-impact':
                targetRef = environmentalImpactRef;
                break;
            case 'around-world':
                targetRef = aroundWorldRef;
                break;
            case 'sources':
                targetRef = sourcesRef;
                break;
            default:
                return;
        }
        
        if (targetRef.current) {
            targetRef.current.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
            setActiveSection(sectionId);
        }
    };

    // Define navigation items with their icons and labels
    const navItems = [
        { id: 'australia-waste', icon: faAppleWhole, label: 'Australia Waste' },
        { id: 'economic-loss', icon: faMoneyBill, label: 'Economic Loss' },
        { id: 'environmental-impact', icon: faLeaf, label: 'Environmental Impact' },
        { id: 'around-world', icon: faEarthAmericas, label: 'Around the World' },
        { id: 'sources', icon: faBookOpen, label: 'Sources' }
    ];
    
    return (
        <div>
            {/* Vertical Navigation Progress Bar */}
            <ProgressNav 
                activeSection={activeSection} 
                scrollToSection={scrollToSection}
                navItems={navItems}
            />

            {/* Section 1: Australia's Food Waste Overview */}
            <AustraliaWaste setRef={(node) => {
                australiaWasteRef.current = node;
            }} />

            {/* Section 1.5: Supply Chain Visualization */}
            <SupplyChain setRef={(node) => {
                supplyChainRef.current = node;
            }} />

            {/* Section 2: Economic Impact Header */}
            <EconomicLoss setRef={(node) => {
                economicLossRef.current = node;
            }} />

            {/* Section 2.1: Cost Breakdown of Food Waste */}
            <CostOfFoodWaste setRef={(node) => {
                costOfFoodWasteRef.current = node;
            }} />

            {/* Section 2.2: Economic Metrics & Statistics */}
            <EconomicWasteViz setMetricCardsRef={(node) => {
                metricCardsRef.current = node;
            }} />

            {/* Section 3: Environmental Impact Overview */}
            <EnvironmentalImpact setRef={(node) => {
                environmentalImpactRef.current = node;
            }} />

            {/* Section 3.1: Carbon Emissions Data Visualization */}
            <EmissionsChart setRef={(node) => {
                emissionsChartRef.current = node;
            }} />

            {/* Section 4: Global Impact Comparison */}
            <GlobalImpact setRef={(node) => {
                aroundWorldRef.current = node;
            }} />

            {/* Call to Action */}
            <Slogan setSloganRef={(node) => {
                sloganRef.current = node;
            }} />

            {/* Section 5: Citation Sources & References */}
            <Sources setRef={(node) => {
                sourcesRef.current = node;
            }} />
        </div>
    )
}