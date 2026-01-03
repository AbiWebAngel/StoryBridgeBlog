import type { MentorshipContent } from "@/types/mentorship";
import type { HomeContent } from "@/types/home";

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

// Keep the existing function for Home
export function extractAssetUrlsFromHome(content: HomeContent): string[] {
  const urls: string[] = [];

  if (content.director.imageSrc) {
    urls.push(content.director.imageSrc);
  }

  content.programLinks.forEach((link) => {
    if (link.svgPath) {
      urls.push(link.svgPath);
    }
  });

  return urls.filter(Boolean);
}