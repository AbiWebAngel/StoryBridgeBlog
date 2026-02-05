export type WorkshopEvent = {
  id: number;
  title: string;
  date: Date;
  description: string;
  fullDescription: string;
  image: {
    src: string;
    alt: string;
  };
  location: string;
  category: string;
  additionalInfo: string[];
  registrationLink: string;
};

export type WorkshopContent = {
  whatAreWorkshops: {
    text: string;
  };
  events: WorkshopEvent[];
};