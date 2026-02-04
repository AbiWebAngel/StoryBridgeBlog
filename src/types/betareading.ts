export type Testimonial = {
  text: string;
  image: string;
  imageAlt: string;
};

export type BetareadingContent = {
  whatIsBetareading: {
    text: string;
  };
  whatWeOffer: {
    text: string[];
    image: {
      src: string;
      alt: string;
      width: number;
      height: number;
    };
  };
  signUpNow: {
    findingBetaReadersSection: {
      title: string;
      description: string;
      buttonText: string;
      buttonUrl: string;
      image: {
        src: string;
        alt: string;
        width: number;
        height: number;
      };
    };
    becomingBetaReaderSection: {
      title: string;
      description: string;
      buttonText: string;
      buttonUrl: string;
      image: {
        src: string;
        alt: string;
        width: number;
        height: number;
      };
    };
  };
  testimonials: {
    testimonials: Testimonial[];
  };
};