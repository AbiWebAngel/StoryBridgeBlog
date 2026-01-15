export function validateArticle(article: {
  title: string;
  slug: string;
  coverImage: string | null;
  coverImageAlt: string;
  body: any;
  tags: string[];
  status: "draft" | "published";
  metaDescription: string; // NEW
}): Record<string, string> | null {
  const errors: Record<string, string> = {};

  // -------------------------
  // Title
  // -------------------------
  if (!article.title || article.title.trim().length === 0) {
    errors.title = "Title is required.";
  }

  // -------------------------
  // Slug
  // -------------------------
  if (!article.slug || article.slug.trim().length === 0) {
    errors.slug = "Slug is required.";
  }

  // -------------------------
  // Cover Image
  // -------------------------
  if (!article.coverImage) {
    errors.coverImage = "Cover image is required.";
  }

  // -------------------------
  // Cover Image Alt Text
  // -------------------------
  if (article.coverImage) {
    const alt = article.coverImageAlt?.trim() || "";

    if (!alt) {
      errors.coverImageAlt = "Cover image alt text is required.";
    } else if (alt.length < 5 || alt.length > 125) {
      errors.coverImageAlt =
        "Alt text must be between 5 and 125 characters.";
    }
  }

  // -------------------------
  // Body
  // -------------------------
  const hasContent =
    article.body &&
    article.body.content &&
    Array.isArray(article.body.content) &&
    article.body.content.length > 0;

  if (!hasContent) {
    errors.body = "Article content cannot be empty.";
  }

  // -------------------------
  // Tags
  // -------------------------
  if (!Array.isArray(article.tags)) {
    errors.tags = "Tags must be an array.";
  } else {
    const tags = article.tags.map((t) => t.trim().toLowerCase());

    if (article.status === "published" && tags.length === 0) {
      errors.tags = "At least one tag is required to publish an article.";
    }

    if (tags.length > 8) {
      errors.tags = "You can add up to 8 tags only.";
    }

    const invalidTag = tags.find(
      (tag) =>
        tag.length < 2 ||
        tag.length > 30 ||
        !/^[a-z0-9-]+$/.test(tag)
    );

    if (invalidTag) {
      errors.tags =
        "Tags must be 2–30 characters and contain only letters, numbers, or hyphens.";
    }

    const uniqueTags = new Set(tags);
    if (uniqueTags.size !== tags.length) {
      errors.tags = "Duplicate tags are not allowed.";
    }
  }

  // -------------------------
  // Status
  // -------------------------
  if (!["draft", "published"].includes(article.status)) {
    errors.status = "Status must be either 'draft' or 'published'.";
  }

  // -------------------------
  // Meta Description (NEW)
  // -------------------------
  const meta = article.metaDescription?.trim() || "";

  if (article.status === "published") {
    if (!meta) {
      errors.metaDescription = "Meta description is required for published articles.";
    } else if (meta.length < 50 || meta.length > 160) {
      errors.metaDescription =
        "Meta description must be between 50 and 160 characters.";
    }
  } else if (meta && meta.length > 160) {
    // Optional max length check for drafts
    errors.metaDescription = "Meta description cannot exceed 160 characters.";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}
