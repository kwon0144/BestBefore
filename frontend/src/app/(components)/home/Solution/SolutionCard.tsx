/**
 * A card component that displays a solution step with a flip animation.
 * The front of the card shows an image and title, while the back shows a description.
 * The card can be clicked to trigger an optional callback function.
 */
import { FlipCard } from "../../FlipCard";
import Image from 'next/image';

/**
 * Props interface for the SolutionCard component
 * @interface SolutionCardProps
 * @property {Object} step - The step information to display
 * @property {React.ReactNode} step.icon - Icon component for the step
 * @property {string} step.title - Title of the step
 * @property {string} step.description - Description of the step
 * @property {string} step.buttonText - Text for the button (if any)
 * @property {string} step.image - URL or path to the step's image
 * @property {Function} [onClick] - Optional callback function when the card is clicked
 */
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

/**
 * SolutionCard component that renders a flip card with step information
 * @param {SolutionCardProps} props - The props for the SolutionCard component
 * @returns {JSX.Element} A flip card component with front and back content
 */
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