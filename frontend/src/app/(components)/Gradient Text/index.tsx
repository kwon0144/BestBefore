/**
 * GradientText Component
 * 
 * This component provides animated gradient text with:
 * - Customizable gradient colors
 * - Adjustable animation speed
 * - Optional border effect
 * - Smooth transitions
 * - Responsive design
 */
import React, { ReactNode } from 'react';

/**
 * Props interface for the GradientText component
 */
interface GradientTextProps {
    /** Text content to display with gradient effect */
    children: ReactNode;
    /** Additional CSS classes to apply */
    className?: string;
    /** Array of colors for the gradient */
    colors?: string[];
    /** Animation speed in seconds */
    animationSpeed?: number;
    /** Whether to show a gradient border */
    showBorder?: boolean;
    /** Font weight for the text */
    fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
    /** Text alignment */
    textAlign?: 'left' | 'center' | 'right' | 'justify';
}

/**
 * Component that renders text with an animated gradient effect
 * 
 * @param {GradientTextProps} props - Component properties
 * @param {ReactNode} props.children - Text content
 * @param {string} [props.className] - Additional CSS classes
 * @param {string[]} [props.colors] - Gradient colors
 * @param {number} [props.animationSpeed] - Animation speed in seconds
 * @param {boolean} [props.showBorder] - Whether to show gradient border
 * @param {string} [props.fontWeight] - Font weight for the text
 * @param {string} [props.textAlign] - Text alignment (left, center, right, justify)
 * @returns {JSX.Element} Rendered gradient text with animation
 */
export default function GradientText({
    children,
    className = "",
    colors = ["#ffaa40", "#9c40ff", "#ffaa40"],
    animationSpeed = 8,
    showBorder = false,
    fontWeight = 'normal',
    textAlign = 'left',
}: GradientTextProps) {
    const gradientStyle = {
        backgroundImage: `linear-gradient(to right, ${colors.join(", ")})`,
        animationDuration: `${animationSpeed}s`,
    };

    // Determine font weight class from prop
    const fontWeightClass = fontWeight !== 'normal' 
        ? `font-${fontWeight}` 
        : '';
    
    // Determine text alignment class
    const textAlignClass = textAlign !== 'left'
        ? `text-${textAlign}`
        : '';

    return (
        <div
            className={`relative flex flex-row items-center transition-shadow duration-500 overflow-hidden ${textAlign === 'center' ? 'justify-center w-full' : ''} ${className}`}
        >
            {showBorder && (
                <div
                    className="absolute inset-0 z-0 pointer-events-none animate-gradient"
                    style={{
                        ...gradientStyle,
                        backgroundSize: "300% 100%",
                    }}
                >
                    <div
                        className="absolute inset-0 rounded-[1.25rem] z-[-1]"
                        style={{
                            width: "calc(100% - 2px)",
                            height: "calc(100% - 2px)",
                            left: "50%",
                            top: "50%",
                            transform: "translate(-50%, -50%)",
                        }}
                    ></div>
                </div>
            )}
            <div
                className={`inline-block relative z-2 text-transparent animate-gradient ${fontWeightClass} ${textAlignClass}`}
                style={{
                    ...gradientStyle,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    backgroundSize: "300% 100%",
                }}
            >
                {children}
            </div>
        </div>
    );
}