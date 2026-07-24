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
    { path: "/",             priority: 1.0 },
    { path: "/how-it-works", priority: 0.9 },
    { path: "/use-cases/ceo",          priority: 0.9 },
    { path: "/use-cases/cfo",          priority: 0.9 },
    { path: "/use-cases/health",       priority: 0.9 },
    { path: "/use-cases/legal",        priority: 0.9 },
    { path: "/use-cases/insurance",    priority: 0.9 },
    { path: "/use-cases/real-estate",  priority: 0.9 },
    { path: "/use-cases/college",      priority: 0.9 },
    { path: "/use-cases/recruiting",   priority: 0.9 },
    { path: "/use-cases/accounting",   priority: 0.9 },
    { path: "/use-cases/brokers",      priority: 0.9 },
    { path: "/use-cases/construction", priority: 0.9 },
    { path: "/use-cases/ecommerce",    priority: 0.9 },
    { path: "/use-cases/finance",      priority: 0.9 },
    { path: "/use-cases/nonprofit",    priority: 0.9 },
    { path: "/use-cases/restaurants",  priority: 0.9 },
    { path: "/use-cases/sales",        priority: 0.9 },
    { path: "/get-started",  priority: 0.9 },
    { path: "/about",        priority: 0.8 },
    { path: "/faq",          priority: 0.8 },
    { path: "/blog",         priority: 0.8 },
    { path: "/case-studies", priority: 0.8 },
    { path: "/services",     priority: 0.8 },
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
    { path: "/use-cases/personal", priority: 0.8 },
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
