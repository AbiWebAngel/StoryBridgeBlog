export function validateArticle(article: {
  title: string;
  slug: string;
  coverImage: string | null;
  body: any;
  tags: string[];
  status: "draft" | "published"; // ⬅️ added this
}): Record<string, string> | null {
  const errors: Record<string, string> = {};

  // Title
  if (!article.title || article.title.trim().length === 0) {
    errors.title = "Title is required.";
  }

  // Slug
  if (!article.slug || article.slug.trim().length === 0) {
    errors.slug = "Slug is required.";
  }

  // Cover Image
  if (!article.coverImage) {
    errors.coverImage = "Cover image is required.";
  }

  // Body (TipTap JSON)
  const hasContent =
    article.body &&
    article.body.content &&
    Array.isArray(article.body.content) &&
    article.body.content.length > 0;

  if (!hasContent) {
    errors.body = "Article content cannot be empty.";
  }

  // Tags array
  if (!Array.isArray(article.tags)) {
    errors.tags = "Tags must be an array.";
  }

  // ✅ Status
  if (!article.status || !["draft", "published"].includes(article.status)) {
    errors.status = "Status must be either 'draft' or 'published'.";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
