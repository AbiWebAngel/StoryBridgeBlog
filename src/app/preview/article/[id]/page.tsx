"use client";

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import ArticleRenderer from "@/components/articles/ArticleRenderer";


export default function PreviewArticlePage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchArticle = async () => {
      const snap = await getDoc(doc(db, "articles", id as string));
      if (!snap.exists()) {
        setPost(null);
      } else {
        setPost(snap.data());
      }
      setLoading(false);
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading preview…
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#413320]">Preview not found</h1>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-[#CF822A] text-white rounded-lg"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ECE1CF] py-4">
      <div className="max-w-7xl mx-auto px-4">
        <button
          onClick={() => router.back()}
          className="mb-6 text-[#CF822A] font-bold"
        >
          ← Back to editor
        </button>

        <div className="bg-[#F2ECE3] rounded-[30px] shadow-xl p-6 sm:p-8">
          <h1 className="font-cinzel text-[26px] font-bold text-center mb-4">
            {post.title || "Untitled draft"}
          </h1>

          <div className="text-center text-sm mb-6 opacity-70">
            Draft preview • Not published
          </div>

          {post.coverImage && (
            <div className="mb-8">
              <Image
                src={post.coverImage}
                alt={post.coverImageAlt || post.title}
                width={1200}
                height={600}
                className="w-full rounded-[20px] object-cover"
                priority
              />
            </div>
          )}

          <article className="prose max-w-none">
            {/* 👇 Render TipTap JSON */}
            {/* Replace this with your renderer */}
           {post.body && <ArticleRenderer content={post.body} />}
          </article>
        </div>
      </div>
    </div>
  );
}
