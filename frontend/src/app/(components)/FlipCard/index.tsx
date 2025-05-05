/**
 * FlipCard Component
 * 
 * This component provides a 3D flip card effect with:
 * - Front and back content
 * - Hover-based flip animation
 * - 3D perspective and transform
 * - Smooth transition effects
 * - Preserved 3D space
 */
import React from "react";
import { Card, CardBody } from "@heroui/react";

/**
 * Props interface for the FlipCard component
 */
interface FlipCardProps {
  /** Content to display on the front of the card */
  frontContent: React.ReactNode;
  /** Content to display on the back of the card */
  backContent: React.ReactNode;
}

/**
 * Component that renders a card with 3D flip animation on hover
 * 
 * @param {FlipCardProps} props - Component properties
 * @param {React.ReactNode} props.frontContent - Content for the front of the card
 * @param {React.ReactNode} props.backContent - Content for the back of the card
 * @returns {JSX.Element} Rendered flip card with animation
 */
export const FlipCard = ({ frontContent, backContent }: FlipCardProps) => {
  const [isFlipped, setIsFlipped] = React.useState(false);

  return (
    <div 
      className="relative h-52 perspective:1000px"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div 
        className={`relative w-full transition-transform duration-500 [transform-style:preserve-3d] ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* Front */}
        <Card 
          className="absolute w-full [backface-visibility:hidden]"
          shadow="none"
        >
          <CardBody className="flex items-center justify-center">
            {frontContent}
          </CardBody>
        </Card>

        {/* Back */}
        <Card 
          className="absolute w-full [backface-visibility:hidden] [transform:rotateY(180deg)]"
          shadow="none"
        >
          <CardBody className="flex items-center justify-center">
            {backContent}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};