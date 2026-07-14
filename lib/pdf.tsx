import "server-only";
import React from "react";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";

// Serverless-safe PDF rendering. @react-pdf/renderer is pure JavaScript — no Chrome, no
// child process, no filesystem — so it works in Vercel's serverless functions where the
// old Puppeteer/execFile approach silently failed. Shared by the intake form and the
// storefront agent-setup flow: both hand in labeled sections and get a Buffer back.

const RED = "#E8342A";

const styles = StyleSheet.create({
  page: { paddingTop: 40, paddingBottom: 46, paddingHorizontal: 44, fontSize: 10, color: "#1a1a1a", fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", borderBottomWidth: 2, borderBottomColor: RED, paddingBottom: 12, marginBottom: 18 },
  logo: { fontSize: 18, fontFamily: "Helvetica-Bold" },
  bracket: { color: RED },
  kicker: { fontSize: 7, color: "#6b7280", marginTop: 2, letterSpacing: 1 },
  headerRight: { textAlign: "right", maxWidth: 300 },
  docTitle: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  meta: { fontSize: 8, color: "#6b7280", marginTop: 2 },
  badge: { fontSize: 7, color: RED, marginTop: 4, fontFamily: "Helvetica-Bold", letterSpacing: 1 },
  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 8, fontFamily: "Helvetica-Bold", color: RED, letterSpacing: 1, marginBottom: 5, paddingBottom: 3, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  row: { flexDirection: "row", paddingVertical: 3, borderBottomWidth: 1, borderBottomColor: "#f5f5f5" },
  lbl: { width: "34%", fontSize: 8.5, color: "#6b7280", fontFamily: "Helvetica-Bold", paddingRight: 8 },
  val: { width: "66%", fontSize: 9, color: "#1a1a1a" },
  footer: { position: "absolute", bottom: 22, left: 44, right: 44, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#e0e0e0", paddingTop: 8 },
  footerText: { fontSize: 8, color: "#9da3af" },
});

function normalize(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.filter((v) => v != null && String(v).trim()).map((v) => String(v)).join(", ");
  return String(value).trim();
}

export interface PdfSectionInput {
  title: string;
  rows: { label: string; value: unknown }[];
}

// Render a labeled document. Empty rows and empty sections are dropped so the PDF only
// shows fields the submitter actually filled in.
export async function renderSectionsPdf(opts: {
  docTitle: string;
  heading: string;
  submittedAt: string;
  badge?: string;
  sections: PdfSectionInput[];
}): Promise<Buffer> {
  const sections = opts.sections
    .map((s) => ({
      title: s.title,
      rows: s.rows.map((r) => ({ label: r.label, value: normalize(r.value) })).filter((r) => r.value),
    }))
    .filter((s) => s.rows.length > 0);

  const doc = (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>
              Apollo<Text style={styles.bracket}>[</Text>Claw<Text style={styles.bracket}>]</Text>
            </Text>
            <Text style={styles.kicker}>AI IMPLEMENTATION</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.docTitle}>{opts.docTitle}</Text>
            {opts.heading ? <Text style={styles.meta}>{opts.heading}</Text> : null}
            <Text style={styles.meta}>Submitted: {opts.submittedAt}</Text>
            {opts.badge ? <Text style={styles.badge}>{opts.badge.toUpperCase()}</Text> : null}
          </View>
        </View>

        {sections.map((s, i) => (
          <View key={i} style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>{s.title.toUpperCase()}</Text>
            {s.rows.map((r, j) => (
              <View key={j} style={styles.row}>
                <Text style={styles.lbl}>{r.label}</Text>
                <Text style={styles.val}>{r.value}</Text>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>apolloclaw.ai | david@apolloclaw.ai</Text>
          <Text style={styles.footerText}>Confidential — Internal Use Only</Text>
        </View>
      </Page>
    </Document>
  );

  return renderToBuffer(doc);
}
