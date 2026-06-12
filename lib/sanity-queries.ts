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

export const POST_BY_SLUG_QUERY = `*[_type == "post" && slug.current == $slug][0] {
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
