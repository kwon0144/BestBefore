import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faBoxArchive, 
    faUsers, 
    faRecycle, 
    faGamepad, 
    faChartLine, 
    faShoppingBasket 
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@heroui/react';

export default function Solution() {
    const steps = [
        {
            icon: faBoxArchive,
            title: "Storage Assistant",
            description: "Store food properly and track expiry dates",
            buttonText: "Explore",
            image: "https://public.readdy.ai/ai/img_res/0bd4f0ad6478adc29b07e7e7ddc5c63e.jpg"
        },
        {
            icon: faUsers,
            title: "Food Network",
            description: "Share excess food with your community",
            buttonText: "Join Network",
            image: "https://public.readdy.ai/ai/img_res/0bd4f0ad6478adc29b07e7e7ddc5c63e.jpg"
        },
        {
            icon: faRecycle,
            title: "Second Life",
            description: "Repurpose aging food with creative recipes",
            buttonText: "Get Ideas",
            image: "https://public.readdy.ai/ai/img_res/56e0b21b5fa0a06e75e5cd9102aaed83.jpg"
        },
        {
            icon: faGamepad,
            title: "Waste Game",
            description: "Make sustainability fun with challenges",
            buttonText: "Play Now",
            image: "https://public.readdy.ai/ai/img_res/ada654995b8ad5cbf18bd3be63baa6da.jpg"
        },
        {
            icon: faChartLine,
            title: "Impact",
            description: "Measure your environmental and financial savings",
            buttonText: "Calculate Impact",
            image: "https://public.readdy.ai/ai/img_res/7259c0ce2dfe3fbf6dc85b5c1443809e.jpg"
        },
        {
            icon: faShoppingBasket,
            title: "Eco Grocery",
            description: "Start with smart shopping to buy only what you need",
            buttonText: "Shop Smart",
            image: "https://public.readdy.ai/ai/img_res/cfd8e780f5d6602592cdf696d533c3a2.jpg"
        }
    ];

    return (
        <div className="bg-white py-24 px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-darkgreen text-center mb-12">
                Our Roadmap to Zero Kitchen Waste
            </h2>
            <div className="relative max-w-7xl mx-auto">
                {/* Road Path */}
                <div className="hidden md:block absolute top-1/2 left-0 right-0 h-4 bg-[#A5D6B7] rounded-full transform -translate-y-1/2 z-0"></div>
                {/* Milestone Points */}
                <div className="grid md:grid-cols-6 gap-8 relative z-10">
                    {steps.map((step, index) => (
                        <div key={index} className={`flex flex-col items-center ${index % 2 === 1 ? 'mt-12 md:mt-0' : ''}`}>
                            <div className="w-16 h-16 rounded-full bg-darkgreen text-white flex items-center justify-center mb-4 shadow-lg">
                                <div className="text-white text-2xl">
                                    <FontAwesomeIcon icon={step.icon} className="text-white" />
                                </div>
                            </div>
                            <div className="bg-[#E8F3EE] p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 w-full h-[360px] group hover:scale-105">
                                {step.image && (
                                    <div className="h-40 overflow-hidden rounded-lg mb-4 hidden xl:block">
                                        <img 
                                            src={step.image}
                                            alt={step.title}
                                            className="w-full h-full object-cover object-top transform group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                )}
                                <h3 className="text-xl font-semibold text-darkgreen mb-3 text-center">
                                    {step.title}
                                </h3>
                                <p className="text-gray-700 mb-4 text-center transition-opacity duration-300">
                                    {step.description}
                                </p>
                                <div className="flex justify-center mt-auto">
                                    <Button className="bg-darkgreen text-white px-5 py-2 rounded-lg font-medium">
                                        {step.buttonText}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}