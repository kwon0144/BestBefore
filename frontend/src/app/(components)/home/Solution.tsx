import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faBoxArchive, 
    faUsers, 
    faRecycle, 
    faGamepad, 
    faChartLine, 
    faShoppingBasket,
    IconDefinition
} from '@fortawesome/free-solid-svg-icons';
import { SolutionCard } from './SolutionCard';
import { useRouter } from 'next/navigation';

type IconName = 'faBoxArchive' | 'faUsers' | 'faRecycle' | 'faGamepad' | 'faChartLine' | 'faShoppingBasket';

const iconMap: Record<IconName, IconDefinition> = {
    faBoxArchive,
    faUsers,
    faRecycle,
    faGamepad,
    faChartLine,
    faShoppingBasket
};

export default function Solution() {
    const router = useRouter();
    
    const steps: Array<{
        icon: IconName;
        title: string;
        description: string;
        buttonText: string;
        image: string;
    }> = [
        {
            icon: 'faBoxArchive',
            title: "Storage Assistant",
            description: "Store food properly and track expiry dates",
            buttonText: "Explore",
            image: "https://public.readdy.ai/ai/img_res/0bd4f0ad6478adc29b07e7e7ddc5c63e.jpg",
        },
        {
            icon: 'faUsers',
            title: "Food Network",
            description: "Share excess food with your community",
            buttonText: "Join Network",
            image: "https://public.readdy.ai/ai/img_res/0bd4f0ad6478adc29b07e7e7ddc5c63e.jpg"
        },
        {
            icon: 'faRecycle',
            title: "Second Life",
            description: "Repurpose aging food with creative recipes",
            buttonText: "Get Ideas",
            image: "https://public.readdy.ai/ai/img_res/56e0b21b5fa0a06e75e5cd9102aaed83.jpg"
        },
        {
            icon: 'faGamepad',
            title: "Waste Game",
            description: "Make sustainability fun with challenges",
            buttonText: "Play Now",
            image: "https://public.readdy.ai/ai/img_res/ada654995b8ad5cbf18bd3be63baa6da.jpg"
        },
        {
            icon: 'faChartLine',
            title: "Impact",
            description: "Measure your environmental and financial savings",
            buttonText: "Calculate Impact",
            image: "https://public.readdy.ai/ai/img_res/7259c0ce2dfe3fbf6dc85b5c1443809e.jpg"
        },
        {
            icon: 'faShoppingBasket',
            title: "Eco Grocery",
            description: "Start with smart shopping to buy only what you need",
            buttonText: "Shop Smart",
            image: "https://public.readdy.ai/ai/img_res/cfd8e780f5d6602592cdf696d533c3a2.jpg"
        }
    ];

    return (
        <div className="h-full bg-white py-24 px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-darkgreen text-center mb-12">
                Your Roadmap to Zero Kitchen Waste
            </h2>
            <div className="max-w-7xl mx-auto">
                {/* Roadmap container */}
                <div className="flex flex-col">
                    {/* First row - Top cards */}
                    <div className="grid grid-cols-6 gap-8 mb-5">
                        {/* Storage Assistant Card */}
                        <SolutionCard step={steps[0]} onClick={() => router.push('/storage-assistant')} />
                        <div className="col-span-1"></div>
                        {/* Second Life Card */}
                        <SolutionCard step={steps[2]} />
                        <div className="col-span-1"></div>
                        {/* Impact Card */}
                        <SolutionCard step={steps[4]} />
                        <div className="col-span-1"></div>
                        <div className="col-span-1"></div>
                    </div>

                    {/* Second row - Icons */}
                    <div className="relative">
                        <div className="absolute left-0 right-0 h-1 bg-[#8fbba9] top-1/2 transform -translate-y-1/2]"></div>
                        <div className="grid grid-cols-6 gap-4">
                            {steps.map((step, index) => (
                                <div key={index} className="col-span-1">
                                <div className="flex justify-center">
                                    <div className="w-16 h-16 rounded-full bg-[#2d4f3c] flex items-center justify-center z-10">
                                        <FontAwesomeIcon icon={iconMap[step.icon]} className="text-white text-xl" />
                                    </div>
                                </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Third row - Bottom cards */}
                    <div className="grid grid-cols-6 gap-8 mt-5 mb-8">
                        <div className="col-span-1">
                        </div>
                        <div className="col-span-1">
                            {/* Food Network Card */}
                            <SolutionCard step={steps[1]} onClick={() => router.push('/food-network')}/>
                        </div>
                        <div className="col-span-1">
                        </div>
                        <div className="col-span-1">
                            {/* Waste Game Card */}
                            <SolutionCard step={steps[3]}/>
                        </div>
                        <div className="col-span-1"></div>
                        <div className="col-span-1">
                            {/* Eco Grocery Card */}
                            <SolutionCard step={steps[5]} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}