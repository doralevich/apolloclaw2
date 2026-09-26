// Every case study on the site, each filed under the industry page it belongs to. The single
// source for both /case-studies (the overview, grouped by industry) and the "Case Studies" section
// at the bottom of each industry page - David's call to fold Case Studies and Industries into one
// menu, with the studies living on their industry.
//
// `industry` is the page a study is filed under (a path, so it can't drift from the nav); `sector`
// is the finer label printed on the card. Two filings are judgment calls, confirmed with David:
// the regional insurance group's CFO sits under Insurance, and the B2B services founder under
// Professional Services.

export type CaseStudy = {
  industry: string;
  sector: string;
  result: string;
  quote: string;
  role: string;
  detail: string;
};

export const CASE_STUDY_INDUSTRY_LABELS: Record<string, string> = {
  "/industries/insurance": "Insurance",
  "/industries/medical-practices": "Medical Practices",
  "/industries/real-estate": "Real Estate",
  "/industries/law-firms": "Law Firms",
  "/industries/personal-injury-law": "Personal Injury Law",
  "/industries/professional-services": "Professional Services",
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    industry: "/industries/insurance",
    sector: "Insurance",
    result: "Renewal retention up. Zero micromanaging.",
    quote: "We were losing renewals not because of price but because nobody followed up in time. The CEO Agent now flags every policy 90 days out, drafts the outreach, and makes sure my producers actually send it. Retention is up and I stopped micromanaging the process.",
    role: "CEO, Independent Insurance Agency",
    detail: "Regional firm, 12 producers, Southeast",
  },
  {
    industry: "/industries/insurance",
    sector: "Finance",
    result: "Close cycle cut from 11 days to 6.",
    quote: "Our month-end close used to take eleven days. We're at six now. The CFO Agent pulls the data, flags the variances, and drafts the narrative. My team reviews instead of produces. That's the difference.",
    role: "CFO, Regional Insurance Group",
    detail: "Multi-line carrier, $180M in premiums",
  },
  {
    industry: "/industries/insurance",
    sector: "Health & Benefits",
    result: "Twice the volume. No additional staff.",
    quote: "Open enrollment is a 90-day sprint and we have 200 employer groups. The agent manages the entire communication calendar: reminders, enrollment confirmations, deadline alerts. My team handled twice the volume without adding staff.",
    role: "Benefits Agency Principal",
    detail: "Group health and benefits, 200 employer groups",
  },
  {
    industry: "/industries/medical-practices",
    sector: "Primary Care",
    result: "No-shows dropped from 18% to under 6%.",
    quote: "We were losing 18% of our appointments to no-shows. The Medical Agent sends a reminder 72 hours out, 24 hours out, and the morning of. No-shows dropped to under 6%. That's revenue we were leaving on the table every single day.",
    role: "Practice Manager",
    detail: "Multi-provider primary care practice, Long Island",
  },
  {
    industry: "/industries/medical-practices",
    sector: "Urgent Care",
    result: "Online reviews from 3.6 to 4.4 stars in 60 days.",
    quote: "We see 120 patients a day and our follow-up was nonexistent. The agent sends a post-visit summary and satisfaction check to every patient within 2 hours of discharge. Our online reviews went from 3.6 to 4.4 stars in 60 days.",
    role: "Medical Director",
    detail: "Urgent care network, 4 locations",
  },
  {
    industry: "/industries/medical-practices",
    sector: "Healthcare Finance",
    result: "Revenue cycle reporting, every morning.",
    quote: "Revenue cycle reporting was always a week behind. The CFO Agent runs it nightly. I walk in every morning knowing exactly where we are on collections, denials, and AR aging. No surprises.",
    role: "CFO, Multi-Site Medical Group",
    detail: "8 locations, Northeast",
  },
  {
    industry: "/industries/real-estate",
    sector: "Residential",
    result: "Lead conversion from 12% to over 20%.",
    quote: "I was losing leads because I couldn't follow up fast enough. The Real Estate Agent follows up within two minutes of an inquiry, qualifies the buyer, and schedules the showing. I went from converting 12% of leads to over 20% in the first month.",
    role: "Licensed Real Estate Agent",
    detail: "Boutique residential brokerage, Northeast",
  },
  {
    industry: "/industries/real-estate",
    sector: "Brokerage",
    result: "30 agents. One consistent follow-up standard.",
    quote: "Managing 30 agents meant 30 different ways of handling leads. Now everyone's follow-up is consistent, fast, and professional. The agent runs it all. My job became managing outcomes instead of managing process.",
    role: "Principal Broker & Owner",
    detail: "Independent brokerage, 30 agents",
  },
  {
    industry: "/industries/personal-injury-law",
    sector: "Personal Injury",
    result: "Retained cases up 40%.",
    quote: "We get 200 intake inquiries a month. Before, half of them fell through because we couldn't follow up fast enough. The agent screens every inquiry within minutes, collects the basic facts, and schedules a consultation with the right attorney. Our retained cases went up 40%.",
    role: "Founding Partner",
    detail: "Personal injury practice, Long Island",
  },
  {
    industry: "/industries/law-firms",
    sector: "Litigation",
    result: "10 billable hours recovered per week.",
    quote: "Partners bill by the hour. Every minute I spent on admin was money we weren't capturing. The Law Agent handles my inbox triage, meeting prep, and follow-ups. I got back about ten hours a week. That's ten hours of billable work I was leaving on the table.",
    role: "Managing Partner",
    detail: "Litigation firm, 18 attorneys, Mid-Atlantic",
  },
  {
    industry: "/industries/professional-services",
    sector: "B2B Services",
    result: "Cleared the bottleneck. Things move now.",
    quote: "I have a great team but I was still the bottleneck on everything. Decisions sat with me, follow-ups sat with me, research sat with me. The CEO Agent cleared the queue. Things move now without me touching them, and I only get involved when I actually need to.",
    role: "Founder & CEO",
    detail: "B2B services company, 45 employees",
  },
];

export function caseStudiesFor(industryPath: string): CaseStudy[] {
  return CASE_STUDIES.filter((c) => c.industry === industryPath);
}

export const CASE_STUDY_DISCLAIMER =
  "Outcomes from real client engagements. Names and identifying details changed or withheld at client request.";
