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

  // Scan TipTap JSON for images
  function scan(node: any) {
    if (!node) return;

    // Image nodes
    if (node.type === "image" && node.attrs?.src) {
      urls.add(node.attrs.src);
    }

    // Recurse through children
    if (node.content && Array.isArray(node.content)) {
      node.content.forEach((child: any) => scan(child));
    }
  }

  scan(article.body);

  return Array.from(urls);
}
