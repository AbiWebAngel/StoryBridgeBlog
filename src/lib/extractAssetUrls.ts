import type { HomeContent } from "@/types/home";
import type { AboutContent } from "@/types/about"; // Or wherever AboutContent is defined
import type { TeamContent } from "@/types/team"; 
import type { MentorshipContent } from "@/types/mentorship";
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
  if (img.src) urls.push(img.src);
});


  // Add testimonial images
  content.testimonials?.forEach(t => {
    if (t.image?.src) {
      urls.push(t.image.src);
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

export function extractAssetUrlsFromMentorship(content: MentorshipContent): string[] {
  const urls: string[] = [];

  // How it Works image
  if (content.howItWorks.image.src) {
    urls.push(content.howItWorks.image.src);
  }

  // Sign Up Now images
  if (content.signUpNow.menteeSection.image.src) {
    urls.push(content.signUpNow.menteeSection.image.src);
  }
  if (content.signUpNow.mentorSection.image.src) {
    urls.push(content.signUpNow.mentorSection.image.src);
  }

  // Testimonials images
  content.testimonials.testimonials.forEach((testimonial) => {
    if (testimonial.image) {
      urls.push(testimonial.image);
    }
  });

  return urls.filter(Boolean);
}