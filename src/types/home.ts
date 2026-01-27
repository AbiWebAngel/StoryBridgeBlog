export type ProgramLink = {
  programName: string;
  link: string;
  svgPath: string;
};

export type DirectorContent = {
  imageSrc: string;
  imageAlt: string;
  message: string;
  name: string;
  buttonText: string;
  buttonLink: string;
};

export type HomeContent = {
  searchTags?: string[];
  director: DirectorContent;
  programLinks: ProgramLink[];
};
