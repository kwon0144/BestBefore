import React from "react";
import { Card, CardBody } from "@heroui/react";

interface FlipCardProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
}

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