import type { MetadataRoute } from "next";

// The web app manifest — what makes the dashboard installable to a phone's home screen.
//
// Chrome and Edge will not offer installation without one, and without the 192 and 512 icons
// specifically. iOS ignores most of this and reads app/apple-icon.png plus the meta tags in
// layout.tsx instead, which is why both exist.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Apollo Claw",
    short_name: "Apollo Claw",
    description: "Your Apollo agent - chat, channels, and connected apps.",

    // The dashboard, deliberately, not the site root. Somebody who installs this wants the
    // agent they pay for; an installed copy of the marketing homepage would be useless, and
    // worse, would make the icon on their home screen a disappointment.
    start_url: "/dashboard",
    scope: "/",

    // Fullscreen, no browser chrome — the whole reason to install rather than bookmark.
    display: "standalone",
    orientation: "portrait",

    // Matches the app shell so the splash screen does not flash white before it loads.
    background_color: "#FAFAF7",
    theme_color: "#0B1729",

    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Android masks icons to the launcher's shape and will crop a non-maskable icon badly.
      // Declaring the 512 as maskable too keeps it from being clipped into a circle mid-logo.
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
