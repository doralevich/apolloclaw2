// Where a customer lands once they have a session and no specific destination was
// requested. Chat, David's call (Sept 21 and again Sept 29, 2026): its empty state greets them
// by name with the agent's face, so the old Start Here welcome page is gone and redirects here.
// Kept in one place so the login form, the magic-link callback, and the set-password screen
// can never drift apart.
export const POST_AUTH_LANDING = "/dashboard/chat";

// Where somebody goes the FIRST time, straight off the build screen - not where they land on
// every later login, which is POST_AUTH_LANDING above.
//
// The difference is the whole point. A brand new agent can't read an email, see a calendar or
// open a file, and nothing used to say so: the build screen handed people to Home, where one of
// four tiles said "Connect an app" and led to a catalogue of eighty. So the ordinary outcome was
// an agent that couldn't do anything and an owner with no idea that was why. This route asks the
// one question that fixes it, once, at the only moment somebody is certain to be paying
// attention. It forwards itself on when there is nothing left to connect.
export const POST_BUILD_LANDING = "/dashboard/connect";
