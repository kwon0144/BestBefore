/**
 * Title Component
 * 
 * This component renders a page title section with:
 * - Animated entrance using Framer Motion
 * - Optional background image with overlay
 * - Heading and description text
 * - Responsive design with centered content
 */
import { motion } from 'framer-motion';

/**
 * Props interface for the Title component
 * @interface
 */
interface TitleProps {
    /** Main heading text */
    heading: string;
    /** Description text displayed below the heading */
    description: string;
    /** Optional background image URL */
    background?: string;
}

/**
 * Renders an animated page title section with optional background
 * 
 * @param {object} props - Component properties
 * @param {string} props.heading - Main heading text
 * @param {string} props.description - Description text
 * @param {string} [props.background] - Optional background image URL
 * @returns {JSX.Element} Rendered title section with animation
 */
export default function Title({heading, description, background}: TitleProps) {
    return <motion.div
    initial={{ y: -50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 1, ease: "easeOut" }}
    style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    }}>
        <div 
            className="max-w-3xl mx-auto flex flex-col justify-center items-center self-center py-24 text-darkgreen"
        >
            <h1 className="text-4xl font-bold mb-4 text-center">{heading}</h1>
            <p className="text-lg font-semibold text-center text-center">{description}</p>
        </div>
    </motion.div>
}