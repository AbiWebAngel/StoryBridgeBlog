export function buildDraft(data: {
  title: string;
  slug: string;
  metaDescription: string;
  coverImage: string | null;
  coverImageAlt: string;
  body: any;
  tags: string[];
  status: "draft" | "published";
  uploadedAssets: string[];
}) {
  return {
    ...data,
    status: "draft",
    updatedAt: Date.now(),
  };
}
