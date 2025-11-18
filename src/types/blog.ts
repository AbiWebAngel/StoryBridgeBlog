import { ReactNode } from 'react';

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  image: string;
  excerpt: ReactNode;
  fullContent: ReactNode;
  date: string;
  author: string;
}

export interface BlogPostParams {
  slug: string;
}