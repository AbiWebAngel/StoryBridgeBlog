export type Article = {
  id: string;
  title: string;
  slug: string;
  tags: string[];
  coverImage: string;
  coverImageAlt: string;
  status: string;
  updatedAt: any;
  [key: string]: any;
  readCount: number; 
};

