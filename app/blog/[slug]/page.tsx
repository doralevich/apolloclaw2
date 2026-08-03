import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import { sanityClient } from "@/lib/sanity";
import { POST_BY_SLUG_QUERY, ALL_POST_SLUGS_QUERY, POSTS_QUERY } from "@/lib/sanity-queries";
import { Button } from "@/components/ui/button";

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const slugs: Array<{ slug: string }> = await sanityClient.fetch(ALL_POST_SLUGS_QUERY);
    return slugs.map((s) => ({ slug: s.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await sanityClient.fetch(POST_BY_SLUG_QUERY, { slug });
    if (!post) return { title: "Post Not Found" };
    return {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt || "",
    };
  } catch {
    return { title: "Blog Post" };
  }
}

const ptComponents = {
  // No imagery in blog posts, per David's call. Sanity image blocks in the post body render
  // as nothing rather than a broken/missing type-handler warning.
  types: {
    image: () => null,
  },
  block: {
    h2: ({ children }: any) => (
      <h2 className="font-display text-2xl md:text-3xl text-foreground mt-10 mb-4">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="font-display text-xl md:text-2xl text-foreground mt-8 mb-3">{children}</h3>
    ),
    normal: ({ children }: any) => (
      <p className="font-body text-base text-foreground/80 leading-relaxed mb-4">{children}</p>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-primary pl-6 italic my-6 text-muted-foreground">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-disc list-outside ml-6 space-y-2 mb-4 font-body text-foreground/80">
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol className="list-decimal list-outside ml-6 space-y-2 mb-4 font-body text-foreground/80">
        {children}
      </ol>
    ),
  },
  marks: {
    strong: ({ children }: any) => <strong className="font-semibold text-foreground">{children}</strong>,
    link: ({ value, children }: any) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline hover:no-underline"
      >
        {children}
      </a>
    ),
  },
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let post: any = null;
  try {
    post = await sanityClient.fetch(POST_BY_SLUG_QUERY, { slug });
  } catch {
    notFound();
  }

  if (!post) notFound();

  let recentPosts: Array<{slug: string; title: string; publishedAt: string}> = [];
  try {
    const allPosts = await sanityClient.fetch(POSTS_QUERY);
    recentPosts = (allPosts || [])
      .filter((p: any) => p.slug?.current !== slug)
      .slice(0, 5)
      .map((p: any) => ({ slug: p.slug?.current || "", title: p.title, publishedAt: p.publishedAt || "" }));
  } catch {}

  const useCaseLinks = [
    { label: "Healthcare", href: "/industries/medical-practices" },
    { label: "Legal", href: "/industries/law-firms" },
    { label: "Real Estate", href: "/industries/real-estate" },
    { label: "Accounting", href: "/industries/accounting-firms" },
    { label: "E-Commerce", href: "/industries/ecommerce" },
    { label: "Finance", href: "/industries/financial-services" },
  ];

  const serviceLinks = [
    { label: "The Personal Agent", href: "/ai-agents/personal" },
    { label: "The CEO Agent", href: "/ai-agents/ceo" },
    { label: "The CFO Agent", href: "/ai-agents/cfo" },
  ];

  return (
    <div className="min-h-screen bg-background py-10 pt-8">
      <div className="container mx-auto max-w-6xl px-4 md:px-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          &larr; Back to Blog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 items-start">
          {/* Main article */}
          <div>
            {post.category && (
              <span className="inline-block text-xs font-mono border border-border rounded-full px-3 py-1 mb-4 text-foreground">
                {post.category}
              </span>
            )}
            <h1 className="font-display text-3xl md:text-5xl text-foreground leading-tight mb-4">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground mb-8 pb-6 border-b border-border/40">
              {post.author && <span>By {post.author}</span>}
              {post.publishedAt && (
                <span>
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>

            <article className="prose-content">
              {post.body ? (
                <PortableText value={post.body} components={ptComponents} />
              ) : (
                post.excerpt && (
                  <p className="font-body text-base text-foreground/80 leading-relaxed">
                    {post.excerpt}
                  </p>
                )
              )}
            </article>

            <div className="mt-16 bauhaus-card p-8 text-center">
              <h3 className="font-display text-2xl text-foreground mb-3">
                Ready to put AI to work?
              </h3>
              <p className="font-body text-muted-foreground mb-6">
                Schedule a consultation and let&apos;s talk about your business.
              </p>
              <a href="https://calendly.com/therealdaveo/apolloai" target="_blank" rel="noopener noreferrer">
                <Button variant="cta" size="lg">Schedule Today</Button>
              </a>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-28 self-start space-y-6">
            {recentPosts.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">Recent Posts</h3>
                <div className="space-y-4">
                  {recentPosts.map((p) => (
                    <Link key={p.slug} href={`/blog/${p.slug}`} className="block group">
                      <p className="font-body text-sm text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">{p.title}</p>
                      {p.publishedAt && (
                        <span className="font-mono text-xs text-muted-foreground">
                          {new Date(p.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
                <Link href="/blog" className="block font-body text-xs text-primary hover:underline mt-4">View all posts &rarr;</Link>
              </div>
            )}

            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">Industry Use Cases</h3>
              <div className="space-y-2">
                {useCaseLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="block font-body text-sm text-foreground hover:text-primary transition-colors py-0.5">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
              <div className="font-mono text-xs text-primary uppercase tracking-widest mb-2">Free Consultation</div>
              <h3 className="font-display text-base text-foreground mb-2">See AI working in your business</h3>
              <p className="font-body text-xs text-muted-foreground mb-4">30 minutes. No obligation.</p>
              <a href="https://calendly.com/therealdaveo/apolloai" target="_blank" rel="noopener noreferrer" className="block">
                <Button variant="cta" size="sm" className="w-full">Schedule Today</Button>
              </a>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">Our Services</h3>
              <div className="space-y-2">
                {serviceLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="block font-body text-sm text-foreground hover:text-primary transition-colors py-0.5">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
