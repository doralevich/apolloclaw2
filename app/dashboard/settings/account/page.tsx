import { createClient } from "@/lib/supabase/server";
import { ProfileNameCard } from "@/components/ProfileNameCard";
import { ChangePasswordCard } from "@/components/ChangePasswordCard";
import { SignOutRow } from "@/components/SignOutRow";

// My Account — the page about YOU, as opposed to the workspace or an agent.
//
// Stage one of the settings rework David asked for after reviewing the area: the old General
// page opened with an unlabeled name-and-picture block above the workspace controls, which was
// the "who does this setting belong to" confusion in miniature. Everything personal now lives
// here under its own name: picture, name, the address you sign in with, the password, and the
// way out. Account deletion joins this page when it exists - this is the door it belongs
// behind.
//
// Server component for the same reason the General page is one: auth metadata is only readable
// server-side.
export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const meta = (data.user?.user_metadata ?? {}) as Record<string, unknown>;
  const email = data.user?.email ?? "";
  const str = (v: unknown) => (typeof v === "string" ? v : "");

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">My Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      <ProfileNameCard
        initialFirst={str(meta.first_name)}
        initialLast={str(meta.last_name)}
        initialAvatar={str(meta.avatar_url)}
      />

      <ChangePasswordCard email={email} />

      <SignOutRow />
    </div>
  );
}
