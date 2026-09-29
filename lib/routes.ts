// Where a customer lands once they have a session and no specific destination was
// requested. Chat, David's call (Sept 21 and again Sept 29, 2026): its empty state greets them
// by name with the agent's face, so the old Start Here welcome page is gone and redirects here.
// Kept in one place so the login form, the magic-link callback, and the set-password screen
// can never drift apart.
export const POST_AUTH_LANDING = "/dashboard/chat";

// Where somebody goes the FIRST time, straight off the build screen.
//
// Chat, David's call (Sept 29, 2026): "Go straight to the chat." This used to be
// /dashboard/connect, which asked for email and calendar before the owner had said a word to
// their agent. That flow still exists and is reached from Connections, and Chat's own shortcut
// chips hide the asks that need a mailbox until one is connected (config/chat-opening.ts), so
// nothing promises what the agent cannot yet do.
export const POST_BUILD_LANDING = "/dashboard/chat";
