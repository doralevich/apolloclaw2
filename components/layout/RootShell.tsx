'use client';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ChatWidget from '@/components/ChatWidget';

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
      <main className="pt-[84px]">{children}</main>
      <Footer />
      <ChatWidget />
    </>
  );
}
