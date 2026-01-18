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
            const data = snap.data();

            let authorName = "Unknown Author";

            // 🔥 Fetch the author's profile from Firestore
            if (data.authorId) {
            const authorRef = doc(db, "users", data.authorId);
            const authorSnap = await getDoc(authorRef);

            if (authorSnap.exists()) {
                const authorData = authorSnap.data();
                authorName = [
                authorData.firstName,
                authorData.lastName
                ].filter(Boolean).join(" ") || authorData.initials || authorName;
            }
            }

            let body = data.body;

            if (typeof body === "string") {
            try {
                body = JSON.parse(body);
            } catch {
                body = null;
            }
            }

            // Ensure TipTap root node exists
            if (body && body.type !== "doc") {
            body = {
                type: "doc",
                content: body.content ?? [],
            };
            }


           setPost({
            ...data,
            body,
            author: authorName,
            date: data.updatedAt?.toDate().toISOString() ?? new Date().toISOString(),
            });

        }

        setLoading(false);
        };


    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center ">
        <div className="w-48 h-2 bg-[#E0D6C7] rounded-full overflow-hidden">
          <div className="h-full w-full animate-pulse bg-[#4A3820]"></div>
        </div>

        <p className="mt-4 text-[#4A3820] font-medium text-lg font-sans">
          Loading preview…
        </p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ECE1CF]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#413320]">Preview not found</h1>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-[#CF822A] text-white rounded-lg hover:bg-[#B36F24] transition"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ECE1CF] py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back button - exact design from blog page */}
        <button 
          onClick={() => window.close()}
          className="mb-6 flex items-center text-[#CF822A] hover:text-[#B36F24] transition font-inter font-bold group relative pb-1"
        >
          <span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#B36F24] after:transition-all after:duration-300 group-hover:after:w-full">
             Close Preview
          </span>
        </button>

        {/* Article Card - exact design from blog page */}
        <div className="bg-[#F2ECE3] rounded-[30px] text-[#413320] shadow-xl p-6 sm:p-8">
          {/* Article Header */}
          <h1 className="font-cinzel text-[22px] sm:text-[26px] lg:text-[30px] font-bold min-w-0 wrap-break-word text-[#413320] text-center mb-4">
            {post.title || "Untitled draft"}
          </h1>
          
          {/* Article Meta - with preview indicator */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-[#413320] font-inter mb-6 justify-center text-center">
            <span className="font-semibold">{post.author || "Author"}</span>
            <span className="hidden sm:inline">•</span>
            <span>
              {post.date ? new Date(post.date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              }) : "Draft"}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
              Draft Preview
            </span>
          </div>

          {/* Featured Image */}
          {post.coverImage && (
            <div className="mb-8 flex justify-center">
              <Image
                src={post.coverImage}
                alt={post.coverImageAlt || post.title || "Article cover"}
                width={1200}
                height={600}
                className="w-full h-62.5 sm:h-87.5 lg:h-112.5 object-cover rounded-[20px]"
                priority
              />
            </div>
          )}

          {/* Article Content */}
          <article className="article-content">
            {post.body && <ArticleRenderer content={post.body} />}
          </article>


        </div>
      </div>
    </div>
  );
}