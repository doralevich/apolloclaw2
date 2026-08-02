import type { Metadata } from "next";
import Link from "next/link";
import { sanityClient } from "@/lib/sanity";
import { POSTS_QUERY } from "@/lib/sanity-queries";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import PageHero from "@/components/PageHero";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: "AI Agent Guides & Insights | Apollo[Claw]" },
  description:
    "Learn how AI agents handle client intake, follow-ups, and communication for law firms, insurance agencies, and real estate teams.",
  keywords: ["AI blog", "AI automation tips", "AI for business", "Apollo Claw insights", "AI agents for law firms", "AI agents for real estate", "AI agents for insurance"],
  alternates: {
    canonical: "https://apolloclaw.ai/blog",
  },
  openGraph: {
    title: "Apollo Claw Blog: AI Agent Guides for Law, Real Estate & Insurance",
    description:
      "Learn how AI agents handle client intake, follow-ups, and communication for law firms, insurance agencies, and real estate teams.",
  },
};

async function getPosts() {
  try {
    return await sanityClient.fetch(POSTS_QUERY);
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <>
      <PageHero
        label="Research Hub"
        title="AI"
        titleAccent="Insights"
        description="Expert thoughts on AI automation, strategy, and implementation for business owners."
      />
      <div className="bg-background py-16">
      <div className="container mx-auto max-w-5xl px-4 md:px-8">

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-body text-muted-foreground text-lg">Posts coming soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post: any, i: number) => (
              <ScrollReveal key={post._id || post.slug?.current} delay={i * 50}>
                <Link href={`/blog/${post.slug?.current || post.slug}`} className="block group">
                  <div className="bg-card border border-border rounded-2xl overflow-hidden h-full hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                    <div className="p-8">
                      {post.category && (
                        <span className="inline-block text-xs font-mono border border-border rounded-full px-3 py-1 mb-4 text-foreground">
                          {post.category}
                        </span>
                      )}
                      <h2 className="font-display text-xl md:text-2xl text-foreground group-hover:text-primary transition-colors mb-3">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="font-body text-sm text-muted-foreground mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-muted-foreground">
                          {post.publishedAt
                            ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : ""}
                        </span>
                        <span className="font-body text-sm text-primary group-hover:underline">
                          Read More
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        )}

        <div className="text-center mt-16 pb-8">
          <a
            href="https://calendly.com/therealdaveo/apolloai"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="cta" size="lg">
              Book a Free Consultation
            </Button>
          </a>
        </div>
      </div>
    </div>
    </>
  );
}
