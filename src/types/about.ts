export type ImageAsset = {
  src: string;
  alt: string;
};

export type Testimonial = {
  text: string;
  image: ImageAsset;
};

export type AboutContent = {
  missionStatement: string;
  whoWeAre: string;
  whatWeDo: string;
  whyItMatters: string;
  testimonials: Testimonial[];
  bookImages: ImageAsset[];
};
