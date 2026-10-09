export const POSTS_QUERY = `*[_type == "post" && publishedAt <= now()] | order(publishedAt desc) {
  _id,
  title,
  slug,
  publishedAt,
  author,
  category,
  excerpt,
  featuredImage {
    asset->{_id, url},
    alt
  }
}`;

// The home page's three newest posts. Same published filter and order as POSTS_QUERY, sliced in
// the query so the home page never pulls the whole archive.
export const RECENT_POSTS_QUERY = `*[_type == "post" && publishedAt <= now()] | order(publishedAt desc)[0...3] {
  _id,
  title,
  slug,
  publishedAt,
  category,
  excerpt
}`;

export const POST_BY_SLUG_QUERY = `*[_type == "post" && slug.current == $slug][0] {
  _id,
  _updatedAt,
  title,
  slug,
  publishedAt,
  author,
  category,
  excerpt,
  featuredImage {
    asset->{_id, url},
    alt
  },
  body[] {
    ...,
    _type == "image" => {
      ...,
      asset->{_id, url}
    }
  },
  seoTitle,
  seoDescription
}`;

export const ALL_POST_SLUGS_QUERY = `*[_type == "post"] { "slug": slug.current }`;
