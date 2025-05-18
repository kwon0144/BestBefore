'use client'

import { useRef, useState, useEffect } from "react";
import { faAppleWhole, faMoneyBill, faLeaf, faEarthAmericas, faBookOpen } from '@fortawesome/free-solid-svg-icons';

// Import components
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

export default function FoodImpact() {
    // Refs for sections
    const australiaWasteRef = useRef<HTMLDivElement>(null);
    const economicLossRef = useRef<HTMLDivElement>(null);
    const environmentalImpactRef = useRef<HTMLDivElement>(null);
    const aroundWorldRef = useRef<HTMLDivElement>(null);
    const sourcesRef = useRef<HTMLDivElement>(null);
    
    // Additional refs for components
    const supplyChainRef = useRef<HTMLDivElement>(null);
    const costOfFoodWasteRef = useRef<HTMLDivElement>(null);
    const metricCardsRef = useRef<HTMLDivElement>(null);
    const sloganRef = useRef<HTMLDivElement>(null);
    
    // Track current active section for the navigation bar
    const [activeSection, setActiveSection] = useState<string>('australia-waste');
    
    // Track section visibility for progress bar
    const isAustraliaWasteInView = useInView(australiaWasteRef, { amount: 0.3 });
    const isEconomicLossInViewNav = useInView(economicLossRef, { amount: 0.3 });
    const isEnvironmentalImpactInView = useInView(environmentalImpactRef, { amount: 0.3 });
    const isAroundWorldInView = useInView(aroundWorldRef, { amount: 0.3 });
    const isSourcesInView = useInView(sourcesRef, { amount: 0.3 });
    
    // Update active section based on scroll position
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
    
    // Function to scroll to a section when navbar item is clicked
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

    // Navigation items for the progress bar
    const navItems = [
        { id: 'australia-waste', icon: faAppleWhole, label: 'Australia Waste' },
        { id: 'economic-loss', icon: faMoneyBill, label: 'Economic Loss' },
        { id: 'environmental-impact', icon: faLeaf, label: 'Environmental Impact' },
        { id: 'around-world', icon: faEarthAmericas, label: 'Around the World' },
        { id: 'sources', icon: faBookOpen, label: 'Sources' }
    ];
    
    return (
        <div>
            {/* Vertical Progress Bar */}
            <ProgressNav 
                activeSection={activeSection} 
                scrollToSection={scrollToSection}
                navItems={navItems}
            />

            {/* Australia's Food Waste Section */}
            <AustraliaWaste setRef={(node) => {
                australiaWasteRef.current = node;
            }} />

            {/* Supply Chain Visualization */}
            <SupplyChain setRef={(node) => {
                supplyChainRef.current = node;
            }} />

            {/* Economic Loss Title */}
            <EconomicLoss setRef={(node) => {
                economicLossRef.current = node;
            }} />

            {/* Cost of Food Waste */}
            <CostOfFoodWaste setRef={(node) => {
                costOfFoodWasteRef.current = node;
            }} />

            {/* Economic Waste Visualization */}
            <EconomicWasteViz setMetricCardsRef={(node) => {
                metricCardsRef.current = node;
            }} />

            {/* Environmental Impact with Scrolling Effect */}
            <EnvironmentalImpact setRef={(node) => {
                environmentalImpactRef.current = node;
            }} />

            {/* Emissions Chart */}
            <EmissionsChart setRef={(node) => {
                environmentalImpactRef.current = node;
            }} />

            {/* Around the World */}
            <GlobalImpact setRef={(node) => {
                aroundWorldRef.current = node;
            }} />

            {/* Slogan Section */}
            <Slogan setSloganRef={(node) => {
                sloganRef.current = node;
            }} />

            {/* Sources */}
            <Sources setRef={(node) => {
                sourcesRef.current = node;
            }} />
        </div>
    )
}