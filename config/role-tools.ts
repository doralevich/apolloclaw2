// Where each role agent's intake asks "what software do you run on", so TOOLS.md can find it.
//
// THE BUG THIS EXISTS TO FIX. buildToolsMd (lib/agent-files.ts) read four keys - crmTools,
// commsTools, pmTools, billingTools - and every one of them is collected on the generic Tech
// Stack page. A role agent's flow DROPS that page (rolePageKeys in OnboardingForm), because its
// own deep-dive asks the same thing in the customer's own vocabulary. So every role agent ever
// provisioned got a TOOLS.md reading "Your owner didn't list the software they use during setup",
// on the same instance whose USER.md said, three sections up, that they run on AppFolio.
//
// Caught by walking a property management agent through /demo and reading the generated file,
// which is exactly what that walkthrough is for.
//
// Keyed by the DETAILS BLOB rather than by agent type id, because that is what buildToolsMd can
// see: it gets the whole answers object and at most one of these blobs is ever present, so it
// does not need to be told which role it is building for. The blob names match `detailsKey` in
// ROLE_INTAKES (components/onboard/OnboardingForm.tsx) - the same hardcoded list
// lib/onboardingSections.ts keeps, for the same reason: that registry lives in a client
// component and this file is read by server-only code.
//
// ADDING A ROLE: add its blob here in the same pass as its ROLE_INTAKES entry. Leaving it out
// does not break anything loudly - it just quietly reintroduces the bug for that one agent.

/** One answer inside a role's deep-dive that names software, and how it should read in TOOLS.md. */
export type RoleToolField = {
  /** The field key inside the role's details blob. */
  key: string;
  /** The bullet label. Written to read like the row above it in a file the agent reads, so
   *  "Accounting system" rather than "accounting_system" and not the question it came from. */
  label: string;
};

export const ROLE_TOOL_FIELDS: Record<string, RoleToolField[]> = {
  cfoDetails: [
    { key: "accounting_system", label: "Accounting system" },
    { key: "finance_stack", label: "Finance tools" },
  ],
  legalDetails: [{ key: "legal_tools", label: "Where documents live" }],
  realEstateDetails: [{ key: "crm", label: "CRM" }],
  ceoDetails: [
    { key: "email_tool", label: "Email and calendar" },
    { key: "ops_stack", label: "Ops stack" },
  ],
  marketingDetails: [{ key: "marketing_tools", label: "Marketing tools" }],
  salesDetails: [{ key: "crm", label: "CRM" }],
  recruitingDetails: [{ key: "ats", label: "ATS and hiring system" }],
  medicalDetails: [{ key: "ehr", label: "EHR and practice management" }],
  insuranceDetails: [{ key: "agency_systems", label: "Agency systems" }],
  propertyManagementDetails: [{ key: "management_systems", label: "Management systems" }],
  personalDetails: [{ key: "email_platform", label: "Email and calendar" }],
};

/** The role blob present in a set of answers, with its tool fields. At most one ever is. */
export function roleToolFields(
  answers: Record<string, unknown>
): { blob: Record<string, unknown>; fields: RoleToolField[] } | null {
  for (const [detailsKey, fields] of Object.entries(ROLE_TOOL_FIELDS)) {
    const blob = answers[detailsKey];
    if (blob && typeof blob === "object" && !Array.isArray(blob)) {
      return { blob: blob as Record<string, unknown>, fields };
    }
  }
  return null;
}
