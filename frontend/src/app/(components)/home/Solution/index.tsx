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
import SolutionCard from './SolutionCard';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

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
        link: string;
    }> = [
        {
            icon: 'faBoxArchive',
            title: "Storage Assistant",
            description: "Store food properly and track expiry dates",
            buttonText: "Explore",
            image: "https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/storageassistant.jpeg",
            link: "/storage-assistant"
        },
        {
            icon: 'faShoppingBasket',
            title: "Eco Grocery",
            description: "Start with smart shopping to buy only what you need",
            buttonText: "Shop Smart",
            image: "https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/ecogrocery.jpeg",
            link: "/eco-grocery"
        },
        {
            icon: 'faRecycle',
            title: "Second Life",
            description: "Repurpose aging food with creative recipes",
            buttonText: "Get Ideas",
            image: "https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/secondlife.jpeg",
            link: "/second-life"
        },
        {
            icon: 'faUsers',
            title: "Food Network",
            description: "Share excess food with your community",
            buttonText: "Join Network",
            image: "https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/foodnetwork.jpeg",
            link: "/food-network"
        },
        {
            icon: 'faGamepad',
            title: "Waste Game",
            description: "Make sustainability fun with challenges",
            buttonText: "Play Now",
            image: "https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/wastegame.jpeg",
            link: "/"
        },
        {
            icon: 'faChartLine',
            title: "Impact",
            description: "Measure your environmental and financial savings",
            buttonText: "Calculate Impact",
            image: "https://s3-tp22.s3.ap-southeast-2.amazonaws.com/BestBefore/impact.jpeg",
            link: "/"
        },
    ];

    return (
        <div className="h-full bg-white py-24 px-4">
            <motion.h2 
                className="text-3xl md:text-4xl font-bold text-darkgreen text-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                Your Roadmap to Zero Kitchen Waste
            </motion.h2>
            <div className="max-w-7xl mx-auto mb-4">
                {/* Roadmap container Tablets and Desktop*/}
                <motion.div 
                    className="hidden md:flex flex-col md:justify-center md:items-center"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
                >
                    {/* First row - Top cards */}
                    <div className="grid grid-cols-3 gap-8 mb-12 xl:grid-cols-6">
                        {/* Card 0 */}
                        <SolutionCard step={steps[0]} onClick={() => router.push(steps[0].link)} />
                        <div className="col-span-1 hidden xl:block"></div>
                        {/* Card 2 */}
                        <SolutionCard step={steps[2]} onClick={() => router.push(steps[2].link)} />
                        <div className="col-span-1 hidden xl:block"></div>
                        {/* Card 4 */}
                        <SolutionCard step={steps[4]} onClick={() => router.push(steps[4].link)} />
                        <div className="col-span-1 hidden xl:block"></div>
                    </div>

                    {/* Second row - Icons */}
                    <div className="w-full relative hidden xl:block">
                        <div className="absolute left-0 right-0 h-1 bg-lightgreen top-1/2 transform -translate-y-1/2"></div>
                        <div className="grid grid-cols-6 gap-4">
                            {steps.map((step, index) => (
                                <div key={index} className="col-span-1">
                                <div className="flex justify-center">
                                    <div className="w-16 h-16 rounded-full bg-darkgreen flex items-center justify-center z-10">
                                        <FontAwesomeIcon icon={iconMap[step.icon]} className="text-white text-xl" />
                                    </div>
                                </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Third row - Bottom cards */}
                    <div className="grid grid-cols-3 gap-8 mt-3 mb-8 xl:grid-cols-6">
                        <div className="col-span-1 hidden xl:block"></div>
                        <SolutionCard step={steps[1]} onClick={() => router.push(steps[1].link)}/>
                        <div className="col-span-1 hidden xl:block"></div>
                        {/* Card 3 */}
                        <SolutionCard step={steps[3]} onClick={() => router.push(steps[3].link)}/>
                        <div className="col-span-1 hidden xl:block"></div>
                        {/* Card 5 */}
                        <SolutionCard step={steps[5]} onClick={() => router.push(steps[5].link)}/>
                    </div>
                </motion.div>
                
                {/* Roadmap container Mobile*/}
                <motion.div 
                    className="flex flex-col grid grid-cols-2 gap-8 md:hidden"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
                >
                    {steps.map((step, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ 
                                duration: 0.8,
                                ease: "easeOut",
                                delay: 0.5 + (index * 0.2)
                            }}
                        >
                            <SolutionCard step={step} onClick={() => router.push(step.link)}/>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}