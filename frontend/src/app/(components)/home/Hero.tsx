"use client"

import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import GradientText from "../Gradient Text";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

export default function Hero() {
    const router = useRouter();

    const scrollToProblemStatement = () => {
        const element = document.getElementById('problem-statement');
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 60, // Offset by 100px to account for any fixed headers
                behavior: 'smooth'
            });
        }
    };

    return (
        <div id="hero-section" className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#F5F5F1]/90 to-transparent z-10"></div>
            <div
                className="h-screen bg-cover bg-center"
                style={{
                backgroundImage: `url('https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/hero.jpg')`
                }}
            >
            </div>
            <div className="max-w-6xl mx-auto absolute inset-0 flex flex-col justify-center items-start md:px-16 z-20">
                <div className="max-w-3xl pl-10">
                    <GradientText
                        colors={["#1B5E20", "#2D5A4B",  "#2f8f58", "#2D5A4B", "#1B5E20"]}
                        animationSpeed={5}
                        showBorder={false}
                        className="text-4xl md:text-5xl font-bold text-darkgreen mb-6"
                    >
                        Together for a zero-waste kitchen
                    </GradientText>
                    <p className="text-xl md:text-2xl text-darkgreen mb-8 font-semibold">
                        Save food, money, and our planet with BestBefore
                    </p>
                    <Button 
                        className="bg-gradient-to-br from-[#2D5A4B] via-[#1B5E20] to-[#6FCF97] text-white px-8 py-7 rounded-lg text-lg font-medium hover:from-[#4CAF50] hover:via-[#2D5A4B] hover:to-[#1B5E20] transition-all duration-500"
                        onPress={() => {
                            router.push('/storage-assistant');
                        }}
                    >
                        Start Your Zero-Waste Journey
                    </Button>
                </div>
            </div>
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
                <div
                    className="w-15 h-15 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center mr-3 p-4 cursor-pointer transition-all duration-300 hover:-translate-y-1"
                    onClick={scrollToProblemStatement}
                >
                    <FontAwesomeIcon icon={faChevronDown} className="text-2xl text-white" />
                </div>
            </div>
        </div>
    )
}

