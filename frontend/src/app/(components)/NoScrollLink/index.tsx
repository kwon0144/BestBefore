/**
 * NoScrollLink Component
 * 
 * This component is a wrapper around Next.js Link that prevents automatic scrolling
 * to the top of the page when navigating. It's useful for maintaining scroll position
 * during navigation, especially in single-page applications or when using modals.
 */
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { stopBackgroundMusic } from '@/app/game/utils/soundEffects';

interface NoScrollLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * Custom Link component that enhances the Next.js Link with:
 * - Prevents automatic scrolling to top on navigation within the same page
 * - Stops background music when navigating away from the game page
 */
const NoScrollLink: React.FC<NoScrollLinkProps> = ({ href, children, className, onClick }) => {
  const pathname = usePathname();
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If we're on the game page, stop background music
    if (pathname === '/game') {
      stopBackgroundMusic();
    }
    
    // Call any additional onClick handler if provided
    if (onClick) {
      onClick();
    }
  };

  return (
    <Link 
      href={href} 
      className={className}
      onClick={handleClick}
      scroll={false} // Prevent automatic scrolling to top
    >
      {children}
    </Link>
  );
};

export default NoScrollLink; 