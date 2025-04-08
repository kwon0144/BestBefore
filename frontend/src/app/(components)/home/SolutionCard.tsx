import { FlipCard } from '../FlipCard';

export interface SolutionCardProps {
    step: {
        icon: React.ReactNode;
        title: string;
        description: string;
        buttonText: string;
        image: string;
    };
    onClick?: () => void;
}

export function SolutionCard({ step, onClick }: SolutionCardProps) {
    return (
        <div className="col-span-1 cursor-pointer" onClick={onClick}>
            <FlipCard 
                frontContent={
                    <div className='bg-[#E8F3EE] p-2 rounded-lg'>
                        {step.image && (
                            <div className="h-40 overflow-hidden rounded-lg mb-4 hidden xl:block">
                                <img 
                                    src={step.image}
                                    alt={step.title}
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
                    <div className='bg-[#E8F3EE] p-2 rounded-lg'>
                        <div className="flex flex-col h-52 overflow-hidden rounded-lg hidden xl:block items-center justify-center text-center">
                            <h3 className="mt-14 px-2">
                                <p className="text-darkgreen">{step.description}</p>
                            </h3>
                        </div>
                    </div>
                } 
            />
        </div>
    );
} 