"use client";

import { useParams } from "next/navigation";
import ArticleEditorPage from "@/components/articles/ArticleEditorPage";

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>();

  return <ArticleEditorPage mode="edit" articleId={id} />;
}
