import Link from "next/link";
import { sanityClient } from "@/lib/sanity";
import { RECENT_POSTS_QUERY } from "@/lib/sanity-queries";
import { BracketLabel, H2, RED, Section, SoftLink, TAN, TAN_INK, TAN_INK_MUTED } from "@/components/home/ui";

export interface RecentPost {
  _id: string;
  title: string;
  slug?: { current?: string } | string;
  publishedAt?: string;
  category?: string;
  excerpt?: string;
}

const CARD_BORDER = "rgba(11,23,41,0.12)";

async function getRecentPosts(): Promise<RecentPost[]> {
  try {
    return (await sanityClient.fetch<RecentPost[]>(RECENT_POSTS_QUERY)) ?? [];
  } catch {
    return [];
  }
}

function slugOf(post: RecentPost): string | undefined {
  return typeof post.slug === "string" ? post.slug : post.slug?.current;
}

// The three newest blog posts, on tan between Proven Results (navy) and the FAQ (white). The
// section renders nothing when Sanity returns no posts or is unreachable, so the home page never
// shows an empty band. The home page revalidates hourly, the same cadence as /blog.
export async function LatestPosts() {
  const posts = (await getRecentPosts()).filter((p) => slugOf(p));
  if (posts.length === 0) return null;
  return <LatestPostsSection posts={posts} />;
}

export function LatestPostsSection({ posts }: { posts: RecentPost[] }) {
  return (
    <Section bg={TAN}>
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <BracketLabel light>From the Blog</BracketLabel>
          <H2 light>Latest Insights.</H2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post._id}
              href={`/blog/${slugOf(post)}`}
              className="group flex flex-col rounded-xl bg-white p-7 transition-shadow hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ border: `1px solid ${CARD_BORDER}`, outlineColor: RED }}
            >
              <span aria-hidden className="mb-5 block h-[2px] w-10 rounded-full" style={{ background: RED }} />
              {post.category && (
                <span
                  className="font-heading mb-3 text-[12px] font-bold uppercase tracking-[0.14em]"
                  style={{ color: TAN_INK_MUTED }}
                >
                  {post.category}
                </span>
              )}
              <h3
                className="font-heading text-[19px] font-bold leading-[1.3] transition-colors group-hover:text-[#E12E30]"
                style={{ color: TAN_INK }}
              >
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="mt-3 line-clamp-3 flex-1 text-[15px] leading-[1.7]" style={{ color: TAN_INK_MUTED }}>
                  {post.excerpt}
                </p>
              )}
              <div
                className="mt-6 flex items-center justify-between pt-5 text-[13px]"
                style={{ borderTop: `1px solid ${CARD_BORDER}` }}
              >
                <span style={{ color: TAN_INK_MUTED }}>
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : ""}
                </span>
                <span className="font-heading font-bold" style={{ color: TAN_INK }}>
                  Read More →
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <SoftLink light href="/blog">
            Read the Blog →
          </SoftLink>
        </div>
      </div>
    </Section>
  );
}
