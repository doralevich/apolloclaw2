"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Share, Plus, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// "Add to your phone" — installs the dashboard to a home screen.
//
// The awkward part, and the reason this is not just a button: there is no single way to do it.
//
// Chrome and Edge fire `beforeinstallprompt`, which we catch and replay on a click, so those
// users get a real one-tap install. Safari has never supported it — on iPhone, adding to the
// home screen is a manual gesture buried in the share sheet, and a website cannot trigger it or
// even detect whether the person did. So iOS gets instructions rather than a button.
//
// That is not a fallback bolted on; for most customers it IS the feature. Almost nobody knows
// the gesture exists, so saying it out loud is the whole value.

const DISMISSED_KEY = "apolloclaw:add-to-phone-dismissed";

// Minimal shape of the non-standard Chrome event. Not in TypeScript's DOM lib.
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

// Everything below depends on browser APIs that do not exist while rendering on the server.
// useSyncExternalStore is the sanctioned way to say "this value differs between server and
// client": the server snapshot renders nothing, and React re-renders once hydrated. Detecting
// the platform in an effect and calling setState would work, but it makes the first paint a
// lie and trips react-hooks/set-state-in-effect for saying so.
const subscribeNever = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false
  );

export function AddToPhoneCard() {
  const isClient = useIsClient();
  const [showSteps, setShowSteps] = useState(false);
  const [deferred, setDeferred] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => typeof window !== "undefined" && !!localStorage.getItem(DISMISSED_KEY)
  );

  useEffect(() => {
    // Only subscriptions here. Both handlers set state from a callback, which is the case the
    // lint rule exists to allow — the state is reacting to something that happened, not to
    // the component having mounted.
    const onPrompt = (e: Event) => {
      e.preventDefault(); // stop Chrome's own mini-infobar; we present it in context instead
      setDeferred(e as InstallPromptEvent);
    };
    // Fires when the install completes by any route, including Chrome's own menu.
    const onInstalled = () => setInstalled(true);

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISSED_KEY, "1");
    setDismissed(true);
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    // A deferred prompt is single-use — Chrome will not accept a second call on the same
    // event. Drop it either way; `appinstalled` handles hiding the card if they accepted.
    setDeferred(null);
    if (outcome === "accepted") setInstalled(true);
  }, [deferred]);

  if (!isClient || dismissed) return null;

  // Already installed: standalone is the cross-browser signal, navigator.standalone the
  // iOS-only one. Offering to install an app somebody is currently using inside would read as
  // the page not knowing where it is.
  const alreadyInstalled =
    installed ||
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (alreadyInstalled) return null;

  // iOS covers every browser on iPhone and iPad, not just Safari: they are all WebKit
  // underneath and all install through the same share-sheet gesture. iPadOS 13+ reports itself
  // as a Mac, so the touch check is what separates an iPad from a desktop.
  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);

  // Derived, not stored. Anything that is neither iOS nor offering a prompt — Firefox, desktop
  // Safari — renders nothing rather than instructions for a thing it cannot do.
  const mode = deferred ? "prompt" : isIOS ? "ios" : "hidden";
  if (mode === "hidden") return null;

  return (
    <div className="relative rounded-lg border bg-card p-4">
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="size-4" />
      </button>

      <div className="flex items-start gap-3">
        <Smartphone className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0 pr-6">
          <div className="font-medium">Add this to your phone</div>
          <p className="mt-1 text-sm text-muted-foreground">
            It opens like an app - full screen, one tap from your home screen, no hunting for the
            tab.
          </p>

          {mode === "prompt" && (
            <Button onClick={install} className="mt-3" size="sm">
              Add to home screen
            </Button>
          )}

          {mode === "ios" && !showSteps && (
            <Button onClick={() => setShowSteps(true)} className="mt-3" size="sm" variant="outline">
              Show me how
            </Button>
          )}

          {mode === "ios" && showSteps && (
            // Spelled out rather than linked, because there is nowhere to link to: iOS offers
            // no URL that opens the share sheet. The icons match what they will actually see.
            <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="font-medium text-foreground">1.</span>
                Tap
                <Share className="size-4 shrink-0" />
                at the bottom of the screen
              </li>
              <li className="flex items-center gap-2">
                <span className="font-medium text-foreground">2.</span>
                Scroll and tap
                <Plus className="size-4 shrink-0" />
                <span className="font-medium text-foreground">Add to Home Screen</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-medium text-foreground">3.</span>
                Tap <span className="font-medium text-foreground">Add</span>
              </li>
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
