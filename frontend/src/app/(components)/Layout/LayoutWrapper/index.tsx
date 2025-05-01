/**
 * LayoutWrapper Component
 * 
 * This component provides the main layout structure for the application with:
 * - Conditional rendering of navigation and footer (hidden on login page)
 * - Page transition animations
 * - Consistent background styling
 * - Main content wrapper
 */
'use client';

import { usePathname } from 'next/navigation';
import Navigationbar from '../../Navigationbar';
import Footer from '../../Footer';
import PageTransitionWrapper from '../PageTransitionWrapper';

/**
 * Main layout wrapper that structures the application's UI
 * 
 * @param {object} props - Component properties
 * @param {React.ReactNode} props.children - Child components to be rendered within the layout
 * @returns {JSX.Element} Rendered layout structure with navigation, content, and footer
 */
export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <>
      {!isLoginPage && <Navigationbar />}
        <PageTransitionWrapper>
          <main className='bg-background'>
            {children}
          </main>
        </PageTransitionWrapper>
      {!isLoginPage && <Footer />}
    </>
  );
} 