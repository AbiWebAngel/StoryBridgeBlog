import type { HomeContent } from "@/types/home";

/**
 * Extracts all R2 asset URLs referenced by Home content.
 * Used for safe asset garbage collection.
 */
export function extractAssetUrls(content: HomeContent): string[] {
  const urls: string[] = [];

  if (content.director?.imageSrc) {
    urls.push(content.director.imageSrc);
  }

  content.programLinks?.forEach(p => {
    if (p.svgPath) {
      urls.push(p.svgPath);
    }
  });

  return urls;
}
