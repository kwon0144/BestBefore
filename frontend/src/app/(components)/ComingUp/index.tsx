/**
 * ComingUp Component
 * 
 * This component displays a promotional or informational banner with:
 * - A main message
 * - Title and description
 * - Call-to-action button
 * - Optional image
 * 
 * It's designed to be responsive and works well on both mobile and desktop views.
 */
import Image from "next/image";
import NoScrollLink from "../NoScrollLink";

/**
 * Props interface for the ComingUp component
 * @interface
 */
interface ComingUpProps {
  /** Main message displayed at the top */
  message: string;
  /** Title of the feature or announcement */
  title: string;
  /** Detailed description of the feature or announcement */
  description: string;
  /** Text for the call-to-action button */
  buttonText: string;
  /** URL for the button link */
  buttonLink: string;
  /** Source URL for the promotional image */
  imageSrc: string;
  /** Alt text for the promotional image */
  imageAlt: string;
}

/**
 * Renders a promotional banner with message, description, and call-to-action
 * 
 * @param {object} props - Component properties
 * @param {string} props.message - Main message to display
 * @param {string} props.title - Title of the feature
 * @param {string} props.description - Detailed description
 * @param {string} props.buttonText - Text for the call-to-action button
 * @param {string} props.buttonLink - URL for the button
 * @param {string} props.imageSrc - Source URL for the image
 * @param {string} props.imageAlt - Alt text for the image
 * @returns {JSX.Element} Rendered promotional banner
 */
const ComingUp: React.FC<ComingUpProps> = ({
  message,
  title,
  description,
  buttonText,
  buttonLink,
  imageSrc,
  imageAlt,
}) => {
  return (
    <div className="max-w-5xl mx-auto bg-amber-50/70 rounded-3xl p-4 md:p-6 shadow-md hover:axi">
      <div className="flex flex-col md:flex-row justify-center items-center">
        <div className="flex flex-col items-center w-full md:w-2/3 px-4 md:px-12 justify-center text-center">
          <p className="text-2xl md:text-2xl lg:text-2xl text-amber-900 font-bold mb-4 md:mb-6 text-center">
            {message}
          </p>
          <h3 className="text-lg md:text-lg lg:text-xl font-semibold text-amber-900 mb-2 text-center">
            {title}
          </h3>
          <p className="text-base md:text-base lg:text-lg text-amber-700 mb-6 md:mb-6 text-center">
            {description}
          </p>
          <NoScrollLink href={buttonLink}>
            <div className="bg-amber-700 text-white py-2 px-6 md:px-8 rounded-lg cursor-pointer hover:bg-amber-700/50 transition-colors duration-300">
              <p className="font-semibold text-white text-sm md:text-sm lg:text-base">{buttonText}</p>
            </div>
          </NoScrollLink>
        </div>
        <div className="flex justify-center items-center w-full hidden md:w-1/3 mt-6 md:mt-0 md:block">
          <Image 
            src={imageSrc} 
            alt={imageAlt} 
            width={400} 
            height={400}
            className="w-full max-w-[300px] md:max-w-[350px] lg:max-w-[400px]"
          />
        </div>
      </div>
    </div>
  );
};

export default ComingUp;
