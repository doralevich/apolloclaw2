// Where a customer lands once they have a session and no specific destination was
// requested. Chat, David's call (Sept 21 and again Sept 29, 2026): its empty state greets them
// by name with the agent's face, so the old Start Here welcome page is gone and redirects here.
// Kept in one place so the login form, the magic-link callback, and the set-password screen
// can never drift apart.
export const POST_AUTH_LANDING = "/dashboard/chat";

// Where somebody goes the FIRST time, straight off the build screen.
//
// The guided connect flow, David's call (Nov 5, 2026): email, then calendar, then where the
// agent should message them, three screens with a skip on each, modelled on the college agent's
// integration onboarding ("This process is excellent"). It was Chat from Sept 29 to Nov 5
// ("Go straight to the chat"), on the argument that asking for email before the owner had said
// a word to their agent was the wrong first impression. The counter-argument won: an agent
// with no inbox and no calendar has nothing to say on that first message, and Chat's own
// shortcut chips were already hiding the asks that need a mailbox (config/chat-opening.ts).
// Every screen says the owner can skip and come back from Connections.
export const POST_BUILD_LANDING = "/dashboard/connect";
