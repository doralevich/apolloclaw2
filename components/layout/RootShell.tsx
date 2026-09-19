'use client';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { PreFooter } from '@/components/layout/PreFooter';
import ChatWidget from '@/components/ChatWidget';

// Marketing pages that render without the marketing nav/footer (but keep chat).
// /white-glove-onboarding renders the SAME full-screen questionnaire as /onboard, so it gets
// the same bare treatment — no nav, and no pre-footer/footer bands under the form.
//
// /build/<slug> belongs here for the same reason and was missed when it was added: it is the
// /onboard form pinned to one agent type. It also arrives from that agent's own marketing site,
// so wrapping it in ApolloClaw's nav and footer put a second site's chrome around the checkout
// and offered a dozen ways to wander off the page the visitor came to complete.
const STANDALONE_ROUTES = ['/pre-call', '/setup', '/onboard', '/build', '/white-glove-onboarding', '/cfo-onboarding', '/legal-onboarding'];
// Dashboard surfaces render their own chrome — no marketing nav/footer/chat.
const DASHBOARD_ROUTES = ['/dashboard', '/login', '/auth', '/invite', '/admin'];

// Marketing pages that keep the nav and footer but NOT the floating chat bubble.
//
// One entry, and it is the page that IS the chat: /demo renders Donna full size from the same
// hook the bubble uses, so the bubble there would be a second Donna in the corner, holding a
// second conversation, one message behind the one the visitor is having. The nav and footer stay
// — the visit ends either with her booking the call or with them going to read something.
const NO_CHAT_ROUTES = ['/demo'];

const matches = (pathname: string, routes: string[]) =>
  routes.some((r) => pathname === r || pathname.startsWith(r + '/'));

export default function RootShell({
  children,
  chatToken,
}: {
  children: React.ReactNode;
  // CHAT_API_TOKEN, read in app/layout.tsx. It reaches the browser either way — it is in the
  // page the moment it renders — but it is no longer written into the repository, and the one
  // variable now feeds both the client that sends it and the route that checks it.
  chatToken: string;
}) {
  const pathname = usePathname();
  const showChat = !matches(pathname, NO_CHAT_ROUTES);

  // Dashboard/login/auth/invite: bare. The dashboard's own layout supplies chrome.
  if (matches(pathname, DASHBOARD_ROUTES)) {
    return <>{children}</>;
  }

  // Marketing standalone routes: no nav/footer, but keep the chat widget.
  if (matches(pathname, STANDALONE_ROUTES)) {
    return (
      <>
        {children}
        {showChat && <ChatWidget token={chatToken} />}
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
      {showChat && <ChatWidget token={chatToken} />}
    </>
  );
}
