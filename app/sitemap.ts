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
    { path: "/",                         priority: 1.0 },
    { path: "/about",                    priority: 0.9 },
    { path: "/contact",                  priority: 0.8 },
    { path: "/faq",                      priority: 0.8 },
    { path: "/blog",                     priority: 0.7 },
    { path: "/case-studies",             priority: 0.8 },
    { path: "/use-cases/ceo",            priority: 0.9 },
    { path: "/use-cases/cfo",            priority: 0.9 },
    { path: "/use-cases/health",         priority: 0.9 },
    { path: "/use-cases/legal",          priority: 0.9 },
    { path: "/use-cases/insurance",      priority: 0.9 },
    { path: "/use-cases/real-estate",    priority: 0.9 },
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
