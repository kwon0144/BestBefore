/**
 * ProgressNav Component
 * 
 * A floating navigation component that displays the user's current position
 * in the food impact visualization. Features clickable icons that allow users
 * to jump between different sections of the content.
 * 
 * @component
 */
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ProgressNavItemProps } from '../interfaces/Components';

/**
 * Individual navigation item with icon and hover label
 * 
 * @component
 * @param {ProgressNavItemProps} props - Component props defined in Components interface
 * @returns {JSX.Element} Rendered component
 */
const ProgressNavItem: React.FC<ProgressNavItemProps> = ({ icon, section, isActive, onClick }) => {
  return (
    <div 
      className={`relative z-10 mb-4 md:mb-6 cursor-pointer group`}
      onClick={onClick}
    >
      {/* Circular icon button that shows active state */}
      <div 
        className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300
            ${isActive 
                ? 'bg-green text-white' 
                : 'bg-white text-gray-500 border border-gray-300 hover:bg-gray-100'}`}
      >
        <FontAwesomeIcon icon={icon} className="text-sm md:text-lg" />
      </div>
      
      {/* Tooltip that appears on hover */}
      <div className="absolute right-full mr-2 md:mr-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-green text-white text-xs md:text-sm py-1 px-2 md:px-3 rounded">
        {section}
      </div>
    </div>
  );
};

/**
 * Props for the ProgressNav component
 * 
 * @interface ProgressNavProps
 * @property {string} activeSection - ID of the currently active section
 * @property {function} scrollToSection - Function to call when a section nav item is clicked
 * @property {Array} navItems - Array of navigation items with id, icon, and label
 */
interface ProgressNavProps {
  activeSection: string;
  scrollToSection: (sectionId: string) => void;
  navItems: {
    id: string;
    icon: any;
    label: string;
  }[];
}

/**
 * Vertical progress navigation that stays fixed on the right side of the screen.
 * Shows the user's current position in the content and allows quick navigation
 * between different sections of the food impact visualization.
 * 
 * @param {ProgressNavProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const ProgressNav: React.FC<ProgressNavProps> = ({ activeSection, scrollToSection, navItems }) => {
  return (
    <div className="fixed right-4 md:right-6 top-1/2 transform -translate-y-1/2 z-50">
      <div className="flex flex-col items-center">
        {/* Progress Line */}
        <div className="absolute h-full w-0.5 bg-gray-300 left-1/2 transform -translate-x-1/2 z-0"></div>
        
        {/* Nav Items */}
        {navItems.map((item) => (
          <ProgressNavItem 
            key={item.id}
            icon={item.icon} 
            section={item.label}
            isActive={activeSection === item.id}
            onClick={() => scrollToSection(item.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProgressNav; 