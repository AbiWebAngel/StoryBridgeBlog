import type { HomeContent } from "@/types/home";
import type { AboutContent } from "@/types/about"; // Or wherever AboutContent is defined
import type { TeamContent } from "@/types/team"; 
import type { MentorshipContent } from "@/types/mentorship";
import type { BetareadingContent } from "@/types/betareading";
import type { WorkshopContent } from "@/types/workshops";
import type { ResourceContent } from "@/types/resources";
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

  content.teamMembers?.forEach(member => {
    const src = member.image?.src;
    if (typeof src === "string" && src.trim() !== "") {
      urls.push(src);
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

export function extractAssetUrlsFromBetareading(content: BetareadingContent): string[] {
  const urls: string[] = [];

  // What We Offer image
  if (content.whatWeOffer.image.src) {
    urls.push(content.whatWeOffer.image.src);
  }

  // Finding Beta Readers image
  if (content.signUpNow.findingBetaReadersSection.image.src) {
    urls.push(content.signUpNow.findingBetaReadersSection.image.src);
  }

  // Becoming Beta Reader image
  if (content.signUpNow.becomingBetaReaderSection.image.src) {
    urls.push(content.signUpNow.becomingBetaReaderSection.image.src);
  }

  // Testimonial images
  content.testimonials.testimonials.forEach((testimonial) => {
    if (testimonial.image) {
      urls.push(testimonial.image);
    }
  });

  return urls.filter(Boolean);
}

export function extractAssetUrlsFromWorkshops(content: WorkshopContent): string[] {
  const urls: string[] = [];
  
  // Extract image URLs from events
  content.events.forEach(event => {
    if (event.image?.src) {
      urls.push(event.image.src);
    }
  });
  
  return urls;
}

export function extractAssetUrlsFromResources(content: ResourceContent): string[] {
  const urls: string[] = [];

  // Extract magazine image URLs
  content.magazines.forEach((magazine) => {
    if (magazine.image.src) {
      urls.push(magazine.image.src);
    }
  });

  // Extract competition image URLs
  content.writingCompetitions.forEach((competition) => {
    if (competition.image.src) {
      urls.push(competition.image.src);
    }
  });

  return urls;
}