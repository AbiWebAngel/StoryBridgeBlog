export interface ImageAsset {
  src: string;
  alt: string;
  width: number;
  height: number;
  maxWidth?: string;
  mobileWidth?: number;
  mobileHeight?: number;
}

export interface Testimonial {
  text: string;
  image: string;
}

export interface MentorshipSection {
  title: string;
  description: string;
  buttonText: string;
  image: ImageAsset;
}

export interface MentorshipContent {
  whatIsMentorship: {
    text: string;
  };
  howItWorks: {
    text: string[];
    image: ImageAsset;
  };
  signUpNow: {
    menteeSection: MentorshipSection;
    mentorSection: MentorshipSection;
  };
  testimonials: {
    testimonials: Testimonial[];
  };
}