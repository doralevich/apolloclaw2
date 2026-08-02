'use client';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ChatWidget from '@/components/ChatWidget';
import { LogoStrip } from '@/components/home/LogoStrip';

// Marketing pages that render without the marketing nav/footer (but keep chat).
const STANDALONE_ROUTES = ['/pre-call', '/setup', '/onboard'];
// Dashboard surfaces render their own chrome — no marketing nav/footer/chat.
const DASHBOARD_ROUTES = ['/dashboard', '/login', '/auth', '/invite'];

const matches = (pathname: string, routes: string[]) =>
  routes.some((r) => pathname === r || pathname.startsWith(r + '/'));

export default function RootShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Dashboard/login/auth/invite: bare. The dashboard's own layout supplies chrome.
  if (matches(pathname, DASHBOARD_ROUTES)) {
    return <>{children}</>;
  }

  // Marketing standalone routes: no nav/footer, but keep the chat widget.
  if (matches(pathname, STANDALONE_ROUTES)) {
    return (
      <>
        {children}
        <ChatWidget />
      </>
    );
  }

  return (
    <>
      <Navbar />
      {/* Mobile: just the 88px main nav (utility bar is desktop-only). Desktop: utility bar
          (36px) + main nav (88px) = 124px. */}
      <main className="pt-[88px] md:pt-[124px]">{children}</main>
      {/* Sitewide, directly above the Footer's "Weekly Claw" newsletter box (David's call). */}
      <LogoStrip />
      <Footer />
      <ChatWidget />
    </>
  );
}
