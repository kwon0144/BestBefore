import { Button } from "@heroui/react";
import router from "next/router";

export default function Hero() {
    return (
        <div id="hero-section" className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#F5F5F1]/90 to-transparent z-10"></div>
            <div
                className="h-screen bg-cover bg-center"
                style={{
                backgroundImage: `url('https://public.readdy.ai/ai/img_res/142495065a2d00bebbba9eff65e1f5cb.jpg')`
                }}
            >
        </div>
        <div className="max-w-7xl mx-auto absolute inset-0 flex flex-col justify-center items-start px-8 md:px-16 z-20">
            <div className="max-w-2xl">
                <h1 className="text-4xl md:text-5xl font-bold text-darkgreen mb-6">
                    Together for a zero-waste kitchen
                </h1>
                <p className="text-xl md:text-2xl text-darkgreen mb-8">
                    Save food, money, and our planet with BestBefore
                </p>
                <Button 
                    className="bg-darkgreen text-white px-8 py-7 rounded-lg text-lg font-medium rounded-button"
                    onPress={() => {
                        router.push('/storage-assistant');
                    }}
                >
                    Start Your Zero-Waste Journey
                </Button>
            </div>
        </div>
    </div>
    )
}