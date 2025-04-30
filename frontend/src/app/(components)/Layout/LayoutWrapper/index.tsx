'use client';

import { usePathname } from 'next/navigation';
import Navigationbar from '../../Navigationbar';
import Footer from '../../Footer';
import PageTransitionWrapper from '../PageTransitionWrapper';

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