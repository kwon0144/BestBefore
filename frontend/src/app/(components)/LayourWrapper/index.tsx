'use client';

import { usePathname } from 'next/navigation';
import Navigationbar from '../Navigationbar';
import Footer from '../Footer';

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
      <main className='bg-background'>{children}</main>
      {!isLoginPage && <Footer />}
    </>
  );
} 