/**
 * intake-pdf-gen.cjs
 * Generates a formatted PDF from Apollo Claw intake form data using Puppeteer.
 * Called from the Next.js API route via child_process.
 * Usage: node intake-pdf-gen.cjs <base64-encoded-json>
 * Outputs: base64-encoded PDF to stdout
 */

const puppeteer = require('puppeteer');

(async () => {
  let data = {};
  try {
    const raw = Buffer.from(process.argv[2], 'base64').toString('utf8');
    data = JSON.parse(raw);
  } catch (e) {
    process.stderr.write('Failed to parse input: ' + e.message + '\n');
    process.exit(1);
  }

  const R = '#E8342A';

  const trackLabels = {
    business: 'Business Owner / Executive',
    personal: 'Personal CEO',
    student: 'Collegiate — Student',
    admin: 'Collegiate — Administrator',
    agency: 'Agency / Reseller',
    setup: 'Technical Setup',
  };

  const trackLabel = trackLabels[data.trackType] || data.trackType || 'General';
  const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  function row(label, value) {
    if (!value || (Array.isArray(value) && value.length === 0)) return '';
    const display = Array.isArray(value) ? value.join(', ') : String(value);
    if (!display.trim()) return '';
    return `
      <tr>
        <td class="lbl">${escHtml(label)}</td>
        <td class="val">${escHtml(display)}</td>
      </tr>`;
  }

  function section(title, rows) {
    const content = rows.join('');
    if (!content.trim()) return '';
    return `
      <div class="section">
        <div class="section-title">${escHtml(title)}</div>
        <table class="dtable">${content}</table>
      </div>`;
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Build sections based on track
  const sections = [];

  // Always: Contact
  sections.push(section('Contact Information', [
    row('First Name', data.firstName),
    row('Last Name', data.lastName),
    row('Email', data.email),
    row('Phone', data.phone),
    row('Track', trackLabel),
    row('How They Heard', data.source),
    row('Contact Preference', data.contactMethod),
    row('Best Time to Reach', data.bestTime),
    row('Timezone', data.timezone),
    row('Job Title', data.jobTitle),
    row('LinkedIn', data.linkedin),
  ]));

  if (data.trackType === 'business' || data.trackType === 'personal') {
    sections.push(section('Business Profile', [
      row('Company', data.companyName),
      row('Website', data.website),
      row('Industry', data.industry),
      row('Team Size', data.companySize),
      row('Monthly Revenue', data.revenue),
      row('Years in Business', data.businessAge),
      row('Business Model', data.businessModel),
      row('Description', data.businessDescription),
      row('Differentiation', data.differentiation),
      row('Web Platform', data.webPlatform),
      row('CRM Tools', data.crmTools),
      row('E-commerce', data.ecomTools),
      row('Communications', data.commsTools),
      row('Project Mgmt', data.pmTools),
      row('Billing Tools', data.billingTools),
      row('Marketing Tools', data.mktgTools),
      row('Automation Tools', data.autoTools),
      row('Support Tools', data.supportTools),
    ]));

    sections.push(section('Pain Points & Operations', [
      row('Main Pain Point', data.mainPain),
      row('Broken Areas', data.brokenAreas),
      row('Hours/Wk on Manual Tasks', data.manualHours),
      row('Pain Duration', data.painDuration),
      row('Task They Hate Most', data.hatedTasks),
      row('Already Tried', data.triedBefore),
      row('Business Impact', data.costImpact),
      row('What Fixed Looks Like', data.fixedLooksLike),
    ]));

    sections.push(section('Family & Life Context', [
      row('Relationship Status', data.maritalStatus),
      row('Children', data.children),
      row('Children Ages', data.childrenAges),
      row('Caregiving', data.caretaking),
      row('Home / Work Situation', data.homeLife),
      row('Protecting', data.protecting),
      row('Life Stage', data.lifeStage),
      row('3-Year Goals', data.threeYearGoals),
      row('Personal Vision', data.personalGoal),
    ]));

    sections.push(section('Psychology & Mindset', [
      row('Decision Style', data.decisionStyle),
      row('Stress Response', data.stressResponse),
      row('Motivators', data.motivators),
      row('Internal Blockers', data.blockers),
      row('Money Mindset', data.moneyMindset),
      row('Agency History', data.agencyHistory),
      row('Tech Trust (1–10)', data.techTrust),
      row('Control Comfort (1–10)', data.controlComfort),
      row('What Makes It Worth It', data.worthIt),
    ]));

    sections.push(section('Voice & Communication Style', [
      row('Writing Tone', data.writingTone),
      row('Comfort With Writing', data.writingComfort),
      row('Brand Voice Like', data.brandVoiceLike),
      row('Voice Description', data.voiceDescription),
      row('Loves These Words/Phrases', data.loveWords),
      row('Hates These Words/Styles', data.hateWords),
      row('Social Presence', data.socialPresence),
      row('Platforms', data.platforms),
      row('Writing Sample', data.writingSample),
    ]));

    sections.push(section('AI Goals & Vision', [
      row('AI Goals', data.aiGoals),
      row('Primary Success Metric', data.successMetric),
      row('#1 Workflow to Automate', data.priorityWorkflow),
      row('Prior AI Experience', data.priorAI),
      row('Past AI Attempts', data.pastExperience),
      row('Team Sentiment', data.teamSentiment),
    ]));

    sections.push(section('IT Infrastructure & Scope', [
      row('Hosting / Cloud', data.hosting),
      row('Operating System', data.os),
      row('Security Measures', data.securityMeasures),
      row('Data Types Stored', data.dataTypes),
      row('Compliance', data.compliance),
      row('Budget', data.budget),
      row('Timeline', data.timeline),
      row('Engagement Type', data.engagement),
      row('Internal Tech Resources', data.internalTech),
      row('Constraints', data.constraints),
    ]));
  }

  if (data.trackType === 'student') {
    sections.push(section('Academic Profile', [
      row('School', data.school),
      row('School Type', data.schoolType),
      row('Year', data.year),
      row('Major', data.major),
      row('AI Bot Uses', data.uses),
      row('Current AI Tools', data.currentTools),
      row('Biggest Challenge', data.goalShort),
      row('Longer-Term Goal', data.goalLong),
      row('Budget', data.budget),
      row('Timeline', data.timeline),
    ]));
  }

  if (data.trackType === 'admin') {
    sections.push(section('Institutional Profile', [
      row('Role', data.adminRole),
      row('School', data.school),
      row('School Type', data.schoolType),
      row('AI Bot Uses', data.uses),
      row('Compliance', data.compliance),
      row('Budget', data.budget),
      row('Timeline', data.timeline),
    ]));
  }

  if (data.trackType === 'agency') {
    sections.push(section('Agency Profile', [
      row('Agency Name', data.agencyName),
      row('Website', data.website),
      row('Agency Size', data.size),
      row('Agency Model', data.model),
      row('Client Types', data.clientTypes),
      row('Client Count', data.clientCount),
      row('Services Offered', data.services),
      row('Why Partner', data.whyPartner),
      row('Revenue Goal', data.revenue),
      row('Timeline', data.timeline),
      row('Questions', data.questions),
    ]));
  }

  if (data.trackType === 'setup') {
    sections.push(section('Client Info', [
      row('First Name', data.firstName),
      row('Last Name', data.lastName),
      row('Email', data.email),
      row('Timezone', data.timezone),
    ]));

    sections.push(section('AI Assistant', [
      row('Assistant Name', data.assistantName),
      row('Computer Name', data.computerName),
    ]));

    sections.push(section('API Credentials', [
      row('Anthropic API Key', data.anthropicKey),
      row('Telegram Bot Token', data.telegramToken),
      row('Telegram Bot Username', data.telegramUsername),
    ]));
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Apollo[Claw] — Intake Form — ${escHtml(data.firstName || '')} ${escHtml(data.lastName || '')}</title>
<style>
  @page { margin: 0.6in 0.65in 0.6in; size: letter; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 9.5pt; color: #1a1a1a; background: #fff; line-height: 1.5; }

  .header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #E8342A; }
  .logo { font-family: 'Courier New', monospace; font-size: 22pt; font-weight: 900; color: #1a1a1a; letter-spacing: -1px; }
  .logo span { color: #E8342A; }
  .header-right { text-align: right; }
  .doc-title { font-size: 13pt; font-weight: 700; color: #1a1a1a; margin-bottom: 2px; }
  .doc-meta { font-size: 8.5pt; color: #6b7280; }
  .track-badge { display: inline-block; font-size: 8pt; font-weight: 700; padding: 2px 10px; border-radius: 12px; background: rgba(232,52,42,0.12); color: #E8342A; border: 1px solid rgba(232,52,42,0.3); letter-spacing: 0.06em; text-transform: uppercase; margin-top: 5px; }

  .section { margin-bottom: 16px; page-break-inside: avoid; }
  .section-title { font-size: 7.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #E8342A; margin-bottom: 6px; padding-bottom: 3px; border-bottom: 1px solid #f0f0f0; }

  .dtable { width: 100%; border-collapse: collapse; }
  .dtable tr { border-bottom: 1px solid #f5f5f5; }
  .dtable tr:last-child { border-bottom: none; }
  .lbl { width: 30%; padding: 5px 10px 5px 0; font-size: 8.5pt; font-weight: 600; color: #6b7280; vertical-align: top; white-space: nowrap; }
  .val { padding: 5px 0; font-size: 9pt; color: #1a1a1a; vertical-align: top; word-break: break-word; }

  .footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #e0e0e0; display: flex; justify-content: space-between; font-size: 8pt; color: #9da3af; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">Apollo<span>[</span>Claw<span>]</span></div>
      <div style="font-size:8pt; color:#6b7280; margin-top:2px; letter-spacing:0.1em; text-transform:uppercase;">AI Implementation</div>
    </div>
    <div class="header-right">
      <div class="doc-title">Client Intake Form</div>
      <div class="doc-meta">${escHtml(data.firstName || '')} ${escHtml(data.lastName || '')} &bull; ${escHtml(data.email || '')}</div>
      <div class="doc-meta">Submitted: ${now}</div>
      <div class="track-badge">${escHtml(trackLabel)}</div>
    </div>
  </div>

  ${sections.join('')}

  <div class="footer">
    <span>Apollo[Claw] &bull; david@apolloclaw.ai &bull; apolloclaw.ai</span>
    <span>Confidential — Internal Use Only</span>
  </div>
</body>
</html>`;

  // Detect Vercel/Lambda environment — use @sparticuz/chromium if available
  let browser;
  const isServerless = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);

  if (isServerless) {
    try {
      const chromium = require('@sparticuz/chromium');
      const puppeteerCore = require('puppeteer-core');
      browser = await puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    } catch (e) {
      process.stderr.write('Serverless chromium unavailable: ' + e.message + '\n');
      process.exit(2);
    }
  } else {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      executablePath: require('puppeteer').executablePath(),
    });
  }

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  const pdfBuffer = await page.pdf({
    format: 'Letter',
    printBackground: true,
  });
  await browser.close();

  process.stdout.write(Buffer.from(pdfBuffer).toString('base64'));
})();
