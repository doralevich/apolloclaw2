import { redirect } from "next/navigation";

// My Agent moved into Settings — David's call: it is where you look at the agent itself, which
// is a settings question rather than a daily one.
//
// This route stays as a redirect rather than being deleted, because "/dashboard" is what every
// "back to the dashboard" link in the product points at, and Start Here is where somebody
// arriving at the root should land anyway. It is the page written for exactly that moment.
export default function Page() {
  redirect("/dashboard/start-here");
}
