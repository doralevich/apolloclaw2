/**
 * agent-setup-pdf-gen.cjs
 * Generates a formatted PDF from a storefront agent-setup submission using Puppeteer.
 * Same mechanism and styling as intake-pdf-gen.cjs (called via child_process from the API
 * route). Input is generic sections so it works for any agent type.
 *
 * Usage:  node agent-setup-pdf-gen.cjs <base64-encoded-json>
 * Input:  { agentLabel, businessName, email, submittedAt, sections: [{ title, rows: [{label,value}] }] }
 * Output: base64-encoded PDF to stdout
 */

const puppeteer = require('puppeteer');

(async () => {
  let data = {};
  try {
    data = JSON.parse(Buffer.from(process.argv[2], 'base64').toString('utf8'));
  } catch (e) {
    process.stderr.write('Failed to parse input: ' + e.message + '\n');
    process.exit(1);
  }

  const agentLabel = data.agentLabel || 'Agent';
  const businessName = data.businessName || '';
  const email = data.email || '';
  const now = data.submittedAt || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function row(label, value) {
    if (value === undefined || value === null) return '';
    const display = Array.isArray(value) ? value.join(', ') : String(value);
    if (!display.trim()) return '';
    return `<tr><td class="lbl">${escHtml(label)}</td><td class="val">${escHtml(display)}</td></tr>`;
  }

  function section(title, rows) {
    const content = (rows || []).map((r) => row(r.label, r.value)).join('');
    if (!content.trim()) return '';
    return `<div class="section"><div class="section-title">${escHtml(title)}</div><table class="dtable">${content}</table></div>`;
  }

  const sectionsHtml = (data.sections || []).map((s) => section(s.title, s.rows)).join('');

  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; padding: 40px 44px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #E8342A; }
  .logo { font-size: 20pt; font-weight: 800; letter-spacing: -0.02em; }
  .logo span { color: #E8342A; }
  .header-right { text-align: right; }
  .doc-title { font-size: 12pt; font-weight: 700; }
  .doc-meta { font-size: 8pt; color: #6b7280; margin-top: 2px; }
  .track-badge { display: inline-block; margin-top: 6px; padding: 2px 10px; border-radius: 20px; background: rgba(232,52,42,0.1); color: #E8342A; font-size: 7.5pt; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
  .section { margin-bottom: 16px; page-break-inside: avoid; }
  .section-title { font-size: 7.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #E8342A; margin-bottom: 6px; padding-bottom: 3px; border-bottom: 1px solid #f0f0f0; }
  .dtable { width: 100%; border-collapse: collapse; }
  .dtable tr { border-bottom: 1px solid #f5f5f5; }
  .dtable tr:last-child { border-bottom: none; }
  .lbl { width: 34%; padding: 5px 10px 5px 0; font-size: 8.5pt; font-weight: 600; color: #6b7280; vertical-align: top; }
  .val { padding: 5px 0; font-size: 9pt; color: #1a1a1a; vertical-align: top; word-break: break-word; white-space: pre-wrap; }
  .footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #e0e0e0; display: flex; justify-content: space-between; font-size: 8pt; color: #9da3af; }
  </style></head><body>
  <div class="header">
    <div>
      <div class="logo">Apollo<span>[</span>Claw<span>]</span></div>
      <div style="font-size:8pt; color:#6b7280; margin-top:2px; letter-spacing:0.1em; text-transform:uppercase;">Agent Setup</div>
    </div>
    <div class="header-right">
      <div class="doc-title">${escHtml(agentLabel)} — Setup Profile</div>
      <div class="doc-meta">${escHtml(businessName)}${businessName && email ? ' &bull; ' : ''}${escHtml(email)}</div>
      <div class="doc-meta">Submitted: ${escHtml(now)}</div>
      <div class="track-badge">${escHtml(agentLabel)}</div>
    </div>
  </div>
  ${sectionsHtml}
  <div class="footer">
    <span>Apollo[Claw] &bull; david@apolloclaw.ai &bull; apolloclaw.ai</span>
    <span>Confidential — Internal Use Only</span>
  </div>
  </body></html>`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    executablePath: require('puppeteer').executablePath(),
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  const pdfBuffer = await page.pdf({ format: 'Letter', printBackground: true, margin: { top: '0', bottom: '0', left: '0', right: '0' } });
  await browser.close();
  process.stdout.write(Buffer.from(pdfBuffer).toString('base64'));
})().catch((e) => {
  process.stderr.write('PDF generation error: ' + e.message + '\n');
  process.exit(1);
});
