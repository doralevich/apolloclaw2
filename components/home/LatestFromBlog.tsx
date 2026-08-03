import Link from "next/link";
import { sanityClient } from "@/lib/sanity";
import { POSTS_QUERY } from "@/lib/sanity-queries";
import { BodyLarge, BracketLabel, H2, RED, Section, TAN, TAN_INK, TAN_INK_MUTED } from "@/components/home/ui";

// Latest four posts on the homepage, per David's call that the blog wasn't surfaced anywhere
// except a single "Insights" link in the footer. Same Sanity query the /blog index uses, so
// the two can't drift.

type Post = {
  _id: string;
  title?: string;
  slug?: { current?: string };
  publishedAt?: string;
  category?: string;
  excerpt?: string;
};

// Sanity is unreachable during a sandboxed/offline build, and a missing blog must never fail
// the homepage — the section just doesn't render. Same swallow-and-continue the /blog index uses.
async function getPosts(): Promise<Post[]> {
  try {
    const posts: Post[] = await sanityClient.fetch(POSTS_QUERY);
    return Array.isArray(posts) ? posts.slice(0, 4) : [];
  } catch {
    return [];
  }
}

function formatDate(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export async function LatestFromBlog() {
  const posts = await getPosts();
  if (posts.length === 0) return null;

  return (
    <Section bg={TAN}>
      <div className="mx-auto max-w-3xl text-center">
        <BracketLabel light>Research Hub</BracketLabel>
        <H2 light>
          Latest from the <span style={{ color: RED }}>Blog</span>
        </H2>
        <BodyLarge light>Expert insights on AI automation for business owners.</BodyLarge>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {posts.map((post) => {
          const slug = post.slug?.current;
          const date = formatDate(post.publishedAt);
          return (
            <div
              key={post._id}
              className="flex flex-col rounded-xl p-7"
              style={{ background: "#FFFFFF", border: "1px solid rgba(11,23,41,0.08)", boxShadow: "0 2px 12px rgba(11,23,41,0.04)" }}
            >
              {post.category && (
                <span
                  className="font-mono mb-3 text-[11px] uppercase tracking-[0.14em]"
                  style={{ color: "rgba(11,23,41,0.4)" }}
                >
                  [ {post.category} ]
                </span>
              )}
              <p className="font-heading text-[18px] font-bold leading-[1.3]" style={{ color: TAN_INK }}>
                {post.title}
              </p>
              {post.excerpt && (
                <p className="mt-3 flex-1 text-[14px] leading-[1.7]" style={{ color: TAN_INK_MUTED }}>
                  {post.excerpt}
                </p>
              )}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-1">
                <span className="font-mono text-[12px]" style={{ color: "rgba(11,23,41,0.4)" }}>
                  {date}
                </span>
                {slug && (
                  <Link
                    href={`/blog/${slug}`}
                    className="font-mono inline-flex items-center justify-center text-[11px] font-bold uppercase tracking-[0.1em] transition-all hover:brightness-110"
                    style={{ background: RED, color: "#FFFFFF", padding: "10px 18px", borderRadius: 4, textDecoration: "none" }}
                  >
                    Read More
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/blog"
          className="font-mono inline-flex items-center justify-center text-[12px] font-bold uppercase tracking-[0.1em] transition-colors"
          style={{
            color: TAN_INK,
            border: "1px solid rgba(11,23,41,0.2)",
            padding: "14px 28px",
            borderRadius: 4,
            textDecoration: "none",
          }}
        >
          View All Posts →
        </Link>
      </div>
    </Section>
  );
}
