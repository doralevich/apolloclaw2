import { createClient } from "@/lib/supabase/server";
import { SettingsView } from "@/components/SettingsView";
import { ProfileNameCard } from "@/components/ProfileNameCard";

// Server component so the name can be read straight out of auth metadata, which is only
// readable here — the same reason the dashboard layout resolves userFirstName rather than the
// browser doing it.
export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const meta = (data.user?.user_metadata ?? {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v : "");

  return (
    <div className="max-w-xl space-y-8">
      <ProfileNameCard initialFirst={str(meta.first_name)} initialLast={str(meta.last_name)} />
      <div className="border-t pt-8">
        <SettingsView />
      </div>
    </div>
  );
}
