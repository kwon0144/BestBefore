import { FlipCard } from "../../FlipCard";
import Image from 'next/image';

interface SolutionCardProps {
    step: {
        icon: React.ReactNode;
        title: string;
        description: string;
        buttonText: string;
        image: string;
    };
    onClick?: () => void;
}

export default function SolutionCard({ step, onClick }: SolutionCardProps) {
    return (
        <div className="col-span-1 cursor-pointer w-[200px]" onClick={onClick}>
            <FlipCard 
                frontContent={
                    <div className='bg-lightgreen/30 p-2 rounded-lg'>
                        {step.image && (
                            <div className="h-40 overflow-hidden rounded-lg mb-4">
                                <Image 
                                    src={step.image}
                                    alt={step.title}
                                    width={500}
                                    height={200}
                                    className="w-full h-full object-cover object-top transform group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                        )}
                        <h3 className="text-md font-semibold text-darkgreen mb-3">
                            <div className="flex items-center justify-center">
                                {step.title}
                            </div>
                        </h3>
                    </div>
                } 
                backContent={
                    <div className='bg-lightgreen/30 p-2 rounded-lg'>
                        <div className="h-52 overflow-hidden rounded-lg items-center justify-center text-center">
                            <h3 className="mt-14 px-2">
                                <p className="text-darkgreen font-semibold">{step.description}</p>
                            </h3>
                        </div>
                    </div>
                } 
            />
        </div>
    );
} 