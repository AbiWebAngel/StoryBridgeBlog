export type Testimonial = {
  text: string;
  image: string;
};

export type AboutContent = {
  missionStatement: string;
  whoWeAre: string;
  whatWeDo: string;
  whyItMatters: string;
  testimonials: Testimonial[];
  bookImages: string[];
};