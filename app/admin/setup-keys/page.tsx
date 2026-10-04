import { Suspense } from "react";
import { SetupKeysView } from "@/components/admin/SetupKeysView";

// Super Admin > Setup keys. Suspense because the view reads ?email= (the setup email links here
// with the client's address filled in).
export default function AdminSetupKeysPage() {
  return (
    <Suspense fallback={null}>
      <SetupKeysView />
    </Suspense>
  );
}
