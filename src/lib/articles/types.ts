export type Article = {
  id: string;
  title: string;
  slug: string;
  body: any;
  authorName?: string;
  coverImage?: string;
  coverImageAlt?: string;
  readTime?: number;

  publishedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};
