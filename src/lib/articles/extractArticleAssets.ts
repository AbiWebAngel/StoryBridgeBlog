// lib/articles/extractArticleAssets.ts

export function extractArticleAssets(article: {
  coverImage: string | null;
  body: any;
}): string[] {
  const urls = new Set<string>();

  // Cover image
  if (article.coverImage) {
    urls.add(article.coverImage);
  }

  function scan(node: any) {
    if (!node) return;

    // ✅ Handle TipTap image extensions
    if (
      (node.type === "image" || node.type === "imageWithRemove") &&
      node.attrs?.src
    ) {
      urls.add(node.attrs.src);
    }

    // Recurse children
    if (Array.isArray(node.content)) {
      node.content.forEach(scan);
    }
  }

  scan(article.body);

  return Array.from(urls);
}
