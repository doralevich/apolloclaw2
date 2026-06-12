'use client';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const STANDALONE_ROUTES = ['/pre-call', '/setup', '/onboard'];

export default function RootShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const standalone = STANDALONE_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'));
  if (standalone) {
    return <>{children}</>;
  }
  return (
    <>
      <Navbar />
      <main className="pt-[72px]">{children}</main>
      <Footer />
    </>
  );
}
