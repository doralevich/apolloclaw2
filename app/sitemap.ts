import { MetadataRoute } from "next";
import { sanityClient } from "@/lib/sanity";
import { USE_CASES } from "@/config/useCases";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let posts: Array<{ slug: string; _updatedAt: string }> = [];
  try {
    posts = await sanityClient.fetch(
      `*[_type == "post"]{ "slug": slug.current, _updatedAt }`,
    );
  } catch {
    // Sanity fetch may fail at build time without network — that's fine
  }

  // `changed` is the date the page's CONTENT last changed, kept by hand next to the page.
  //
  // Every entry used to carry `new Date()`, the build time, so all 152 URLs said they changed
  // at the same instant on every deploy and Google learned to ignore the field (the SEO brief,
  // Donna, Oct 9 2026). The dates below were read off git when this was written. The rule from
  // here: a change to a page's words or structure updates its date in the same commit. A
  // metadata-only edit, a style change or a shared component edit does not. Blog posts take
  // their date from Sanity below and are not listed here.
  const staticPages = [
    { path: "/",                 priority: 1.0, changed: "2026-10-09" },
    { path: "/how-it-works",     priority: 0.9, changed: "2026-09-27" },
    { path: "/pricing",          priority: 0.9, changed: "2026-10-04" },
    { path: "/privacy",          priority: 0.3, changed: "2026-09-26" },
    { path: "/cookies",          priority: 0.3, changed: "2026-09-26" },
    { path: "/terms",            priority: 0.3, changed: "2026-10-04" },
    // The fleet page: the index every /ai-agents/* entry below hangs off.
    { path: "/ai-agents",              priority: 0.9, changed: "2026-09-27" },
    { path: "/ai-agents/ceo",          priority: 0.9, changed: "2026-10-09" },
    { path: "/ai-agents/cfo",          priority: 0.9, changed: "2026-10-09" },
    { path: "/ai-agents/legal",        priority: 0.9, changed: "2026-10-05" },
    { path: "/industries/medical-practices",       priority: 0.9, changed: "2026-10-05" },
    { path: "/industries/law-firms",        priority: 0.9, changed: "2026-10-05" },
    { path: "/industries/personal-injury-law", priority: 0.8, changed: "2026-10-04" },
    { path: "/industries/insurance",    priority: 0.9, changed: "2026-10-05" },
    { path: "/industries/real-estate",  priority: 0.9, changed: "2026-10-05" },
    { path: "/ai-agents/recruiting",   priority: 0.9, changed: "2026-09-08" },
    { path: "/industries/accounting-firms",   priority: 0.9, changed: "2026-09-04" },
    { path: "/industries/ecommerce",    priority: 0.9, changed: "2026-09-08" },
    { path: "/industries/financial-services",      priority: 0.9, changed: "2026-09-22" },
    { path: "/industries/nonprofit",    priority: 0.9, changed: "2026-09-04" },
    { path: "/ai-agents/sales",        priority: 0.9, changed: "2026-09-08" },
    { path: "/ai-agents/receptionist", priority: 0.9, changed: "2026-09-04" },
    { path: "/ai-agents/hr",           priority: 0.9, changed: "2026-09-22" },
    { path: "/industries/private-equity",        priority: 0.9, changed: "2026-09-22" },
    { path: "/industries/professional-services", priority: 0.9, changed: "2026-09-26" },
    { path: "/get-started",  priority: 0.9, changed: "2026-09-04" },
    { path: "/company",      priority: 0.8, changed: "2026-10-09" },
    { path: "/faq",          priority: 0.8, changed: "2026-09-27" },
    { path: "/blog",         priority: 0.8, changed: "2026-09-27" },
    { path: "/use-cases", priority: 0.8, changed: "2026-09-27" },
    { path: "/enterprise", priority: 0.8, changed: "2026-10-04" },
    ...USE_CASES.map((u) => ({ path: `/use-cases/${u.slug}`, priority: 0.7, changed: "2026-10-04" })),
    { path: "/ai-consulting-education",       priority: 0.8, changed: "2026-10-04" },
    { path: "/ai-agent-for-business",   priority: 0.9, changed: "2026-10-05" },
    { path: "/ai-consulting-long-island",     priority: 0.8, changed: "2026-10-09" },
    { path: "/ai-consulting-nyc",             priority: 0.8, changed: "2026-09-22" },
    { path: "/contact",      priority: 0.7, changed: "2026-09-21" },
    { path: "/what-we-do",       priority: 0.8, changed: "2026-09-27" },
    { path: "/ai-101",       priority: 0.7, changed: "2026-09-27" },
    { path: "/security",       priority: 0.6, changed: "2026-10-04" },
    { path: "/ai-agents/personal-assistant", priority: 0.8, changed: "2026-09-08" },
    { path: "/accessibility", priority: 0.3, changed: "2026-10-09" },
    { path: "/integrations", priority: 0.8, changed: "2026-09-27" },
    // Both of these are public, indexable pages that were simply never added here.
    { path: "/create-an-agent", priority: 0.8, changed: "2026-10-04" },
    { path: "/blog/ai-assistant-for-ceo", priority: 0.6, changed: "2026-09-21" },
    // Donna, full size. High, because it is the page the whole site is trying to get somebody
    // to: every other page argues that the agents work and this one lets them find out.
    { path: "/demo", priority: 0.9, changed: "2026-09-26" },
  ].map(({ path, priority, changed }) => ({
    url: `https://apolloclaw.ai${path}`,
    lastModified: new Date(`${changed}T12:00:00Z`),
    changeFrequency: "monthly" as const,
    priority,
  }));

  // Deduplicate blog posts by slug before building URLs
  const seen = new Set<string>();
  const blogPages = posts
    .filter((post) => {
      if (!post.slug || seen.has(post.slug)) return false;
      seen.add(post.slug);
      return true;
    })
    .map((post) => ({
      url: `https://apolloclaw.ai/blog/${post.slug}`,
      lastModified: new Date(post._updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  // Dedupe across the whole sitemap, not just the Sanity posts. /contact and /what-we-do had
  // each been listed twice in the static array, and /blog/ai-assistant-for-ceo is a hand-built
  // post that may also exist in Sanity - either way the URL should appear once. First entry
  // wins, so the static priority is the one that survives a collision.
  const byUrl = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const page of [...staticPages, ...blogPages]) {
    if (!byUrl.has(page.url)) byUrl.set(page.url, page);
  }
  return [...byUrl.values()];
}
