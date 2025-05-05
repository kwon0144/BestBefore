/**
 * NoScrollLink Component
 * 
 * This component is a wrapper around Next.js Link that prevents automatic scrolling
 * to the top of the page when navigating. It's useful for maintaining scroll position
 * during navigation, especially in single-page applications or when using modals.
 */
import React from 'react';
import Link from 'next/link';

/**
 * A Next.js Link wrapper that prevents automatic scrolling on navigation
 * 
 * @param {object} props - Component properties (extends Next.js Link props)
 * @param {React.ReactNode} props.children - Child elements to render
 * @param {React.Ref<HTMLAnchorElement>} ref - Forwarded ref
 * @returns {JSX.Element} Link component with scroll disabled
 */
const NoScrollLink = React.forwardRef<HTMLAnchorElement, React.ComponentPropsWithRef<typeof Link>>(
  ({ children, ...props }, ref) => (
    <Link {...props} scroll={false} ref={ref}>
      {children}
    </Link>
  )
);

NoScrollLink.displayName = 'NoScrollLink';

export default NoScrollLink; 