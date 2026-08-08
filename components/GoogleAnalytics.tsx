'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, Suspense } from 'react';

function PageViewTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Skip the first run. gtag('config') already sent a page_view for the landing URL, and
  // firing again here would double-count every entry — which looks like traffic rather than
  // like a bug, so it would have gone unnoticed.
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (typeof window === 'undefined') return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gtagFn = (window as any).gtag as ((...args: unknown[]) => void) | undefined;
    if (typeof gtagFn !== 'function') return;
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    gtagFn('event', 'page_view', {
      page_path: url,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, searchParams]);

  return null;
}

// GA Script tags live in the server layout (layout.tsx) so they are never blocked by a
// client-side Suspense bailout. This component handles SOFT NAVIGATIONS ONLY.
//
// The initial page view belongs to gtag('config'), not here. This effect runs at hydration,
// before an afterInteractive script is guaranteed to have defined window.gtag — and when it had
// not, the guard below returned and nothing ever retried, because pathname and searchParams do
// not change on a cold load. Every visit lost its first page view that way.
export default function PageViewTracker() {
  return (
    <Suspense fallback={null}>
      <PageViewTrackerInner />
    </Suspense>
  );
}
