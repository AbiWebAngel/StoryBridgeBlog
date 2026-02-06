// types/resources.ts
export interface MagazineItem {
  id: number;
  title: string;
  description: string;
  image: {
    src: string;
    alt: string;
  };
}

export interface SummerProgram {
  id: number;
  title: string;
  duration: string;
  location: string;
  shortDescription: string;
  fullDescription: string;
  bestFor: string;
  outcome: string;
  category: string;
  additionalInfo: string[];
  registrationLink: string;
}

// Update Writing Competition interface to use Date for deadline
export interface WritingCompetition {
  id: number;
  title: string;
  description: string;
  deadline: Date; // Changed from string to Date
  prize: string;
  entryFee: string;
  eligibility: string;
  rules: string[];
  registrationLink: string;
  image: {
    src: string;
    alt: string;
  };
}

// You can keep the old interface as WritingCompetitionItem for backward compatibility
export type WritingCompetitionItem = WritingCompetition;

export interface ResourceContent {
  magazines: MagazineItem[];
  summerPrograms: SummerProgram[];
  writingCompetitions: WritingCompetition[]; // This will now have Date objects for deadlines
}