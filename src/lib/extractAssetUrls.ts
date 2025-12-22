import type { HomeContent } from "@/types/home";
import type { AboutContent } from "@/types/about"; // Or wherever AboutContent is defined
import type { TeamContent } from "@/types/team"; 
/**
 * Extracts all R2 asset URLs referenced by Home content.
 * Used for safe asset garbage collection.
 */
export function extractAssetUrlsFromHome(content: HomeContent): string[] {
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

/**
 * Extracts all R2 asset URLs referenced by About content.
 * Used for safe asset garbage collection.
 */
export function extractAssetUrlsFromAbout(content: AboutContent): string[] {
  const urls: string[] = [];

  // Add book images
  content.bookImages?.forEach(img => {
    if (img) {
      urls.push(img);
    }
  });

  // Add testimonial images
  content.testimonials?.forEach(t => {
    if (t.image) {
      urls.push(t.image);
    }
  });

  return urls;
}

export function extractAssetUrlsFromTeam(content: TeamContent): string[] {
  const urls: string[] = [];

  // Add team member images
  content.teamMembers?.forEach(m => {
    if (m.image) {
      urls.push(m.image);
    }
  });

  return urls;
}
