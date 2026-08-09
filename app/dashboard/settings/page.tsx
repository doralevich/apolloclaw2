import { SettingsView } from "@/components/SettingsView";

// General is the WORKSPACE page now, nothing else. The name-and-picture block that used to sit
// above it - unlabeled, and about a different owner entirely - moved to Settings > My Account
// in the settings rework: a page must be able to answer "whose setting is this?" in one glance,
// and this one could not while it opened with you and continued with the workspace.
export default function Page() {
  return (
    <div className="max-w-xl">
      <SettingsView />
    </div>
  );
}
