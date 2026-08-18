'use client';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { PreFooter } from '@/components/layout/PreFooter';
import ChatWidget from '@/components/ChatWidget';

// Marketing pages that render without the marketing nav/footer (but keep chat).
// /white-glove-onboarding renders the SAME full-screen questionnaire as /onboard, so it gets
// the same bare treatment — no nav, and no pre-footer/footer bands under the form.
const STANDALONE_ROUTES = ['/pre-call', '/setup', '/onboard', '/white-glove-onboarding'];
// Dashboard surfaces render their own chrome — no marketing nav/footer/chat.
const DASHBOARD_ROUTES = ['/dashboard', '/login', '/auth', '/invite', '/admin'];

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
      {/* Clears the fixed header. Measured in the browser rather than added up from the class
          names, because both parts are a pixel taller than they look: the main nav is h-[88px]
          plus a 1px bottom border (89px), and the utility bar is py-[10px] around an 18px line
          (38px). Mobile hides the utility bar, so it clears the nav alone.
          The old values (88 / 124) were under the true height and survived only on the slack
          the shorter utility bar left behind. Raising that bar used the slack up. */}
      <main className="pt-[89px] md:pt-[127px]">{children}</main>
      {/* Standing discovery-call + newsletter bands, identical on every marketing page. */}
      <PreFooter />
      <Footer />
      <ChatWidget />
    </>
  );
}
