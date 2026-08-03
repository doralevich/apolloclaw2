// Where a customer lands once they have a session and no specific destination was
// requested. Start Here greets them with the agent they just built; the Agents table is
// a management view, not a welcome. Kept in one place so the login form, the magic-link
// callback, and the set-password screen can never drift apart.
export const POST_AUTH_LANDING = "/dashboard/start-here";
