import { MetadataRoute } from "next";
import { sanityClient } from "@/lib/sanity";

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

  const staticPages = [
    { path: "/",                 priority: 1.0 },
    { path: "/how-it-works",     priority: 0.9 },
    { path: "/create-an-agent",  priority: 0.9 },
    { path: "/industries",       priority: 0.9 },
    { path: "/ai-agents",        priority: 0.9 },
    { path: "/solutions",        priority: 0.8 },
    { path: "/ai-agents/ceo",          priority: 0.9 },
    { path: "/ai-agents/cfo",          priority: 0.9 },
    { path: "/industries/medical-practices",       priority: 0.9 },
    { path: "/industries/law-firms",        priority: 0.9 },
    { path: "/industries/insurance",    priority: 0.9 },
    { path: "/industries/real-estate",  priority: 0.9 },
    { path: "/ai-agents/college",      priority: 0.9 },
    { path: "/ai-agents/recruiting",   priority: 0.9 },
    { path: "/industries/accounting-finance",   priority: 0.9 },
    { path: "/ai-agents/brokers",      priority: 0.9 },
    { path: "/industries/construction", priority: 0.9 },
    { path: "/industries/ecommerce",    priority: 0.9 },
    { path: "/industries/financial-services",      priority: 0.9 },
    { path: "/industries/nonprofit",    priority: 0.9 },
    { path: "/industries/restaurants",  priority: 0.9 },
    { path: "/ai-agents/sales",        priority: 0.9 },
    { path: "/ai-agents/receptionist", priority: 0.9 },
    { path: "/ai-agents/hr",           priority: 0.9 },
    { path: "/industries/private-equity",        priority: 0.9 },
    { path: "/industries/professional-services", priority: 0.9 },
    { path: "/get-started",  priority: 0.9 },
    { path: "/about",        priority: 0.8 },
    { path: "/faq",          priority: 0.8 },
    { path: "/blog",         priority: 0.8 },
    { path: "/case-studies", priority: 0.8 },
    { path: "/ai-implementation",             priority: 0.8 },
    { path: "/ai-consulting-small-business",  priority: 0.8 },
    { path: "/ai-consulting-new-york",        priority: 0.8 },
    { path: "/ai-consulting-enterprise",      priority: 0.8 },
    { path: "/ai-consulting-mid-market",      priority: 0.8 },
    { path: "/ai-consulting-education",       priority: 0.8 },
    { path: "/contact",      priority: 0.7 },
    { path: "/what-we-do",       priority: 0.8 },
    { path: "/agents",       priority: 0.9 },
    { path: "/ai-101",       priority: 0.7 },
    { path: "/security",       priority: 0.6 },
    { path: "/membership",       priority: 0.7 },
    { path: "/ai-agents/personal", priority: 0.8 },
  ].map(({ path, priority }) => ({
    url: `https://apolloclaw.ai${path}`,
    lastModified: new Date(),
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

  return [...staticPages, ...blogPages];
}
