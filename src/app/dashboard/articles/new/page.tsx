"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import CoverUpload from "@/components/articles/CoverUpload";
import ArticleEditor from "@/components/articles/ArticleEditor";

import { validateArticle } from "@/lib/articles/validateArticle";
import { extractArticleAssets } from "@/lib/articles/extractArticleAssets";
import { useAuth } from "@/context/AuthContext";

import { X } from "lucide-react";
import FloatingSaveBar from "@/components/admin/FloatingSaveBar";

export default function NewArticlePage() {
  const { user: currentAuthUser } = useAuth();
  
  // -------------------------
  // FORM STATE
  // -------------------------
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [body, setBody] = useState<any>(null); // TipTap JSON
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<"draft" | "published">("draft");


  // Errors + UI
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // -------------------------
  // AUTO GENERATE SLUG FROM TITLE
  // -------------------------
  useEffect(() => {
    if (!title) return;
    const newSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setSlug(newSlug);
  }, [title]);

  // -------------------------
  // TAGS INPUT HELPERS
  //--------------------------
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = e.currentTarget.value.trim();
      if (!value) return;
      if (!tags.includes(value)) {
        setTags([...tags, value]);
      }
      e.currentTarget.value = "";
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  // -------------------------
  // SUBMIT
  // -------------------------
  const handleSave = async () => {
    if (!currentAuthUser) {
      setErrors({ general: "Please log in to save changes." });
      return;
    }

    setErrors({});
    setSaving(true);
    setSuccessMessage("");

    // Validate
    const validation = validateArticle({
      title,
      slug,
      coverImage,
      body,
      tags,
      status,
    });

    if (validation) {
      setErrors(validation);
      setSaving(false);
      return;
    }

    try {
      // Check user role
      const token = await currentAuthUser.getIdTokenResult();
      if (token.claims.role !== "admin" && token.claims.role !== "author") {
        throw new Error("Insufficient permissions. Admin or author role required.");
      }

      const articleId = slug; // using slug as stable doc ID

      // Extract assets for cleanup
      const allAssets = extractArticleAssets({ coverImage, body });

      // Save to Firestore
      await setDoc(doc(db, "articles", articleId), {
        title,
        slug,
        coverImage,
        body,
        tags,
        status,
        authorId: currentAuthUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSuccessMessage("Article created successfully!");
      setSaving(false);

      // Clear form for new article creation
      setTitle("");
      setSlug("");
      setCoverImage(null);
      setBody(null);
      setTags([]);
      setStatus("draft");

      setTimeout(() => setSuccessMessage(""), 2500);
    } catch (err: any) {
      console.error("Error saving article:", err);
      setErrors({ general: err.message || "Failed to save article. Check console." });
      setSaving(false);
    }
  };


  // Guest state when not logged in
  if (!currentAuthUser) {
    return (
    <div className="px-6 min-h-screen pb-32 font-sans">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-extrabold text-[#4A3820] mb-6 text-center !font-sans">
            Create New Article
          </h1>
          <div className="space-y-6 mt-8">
            <div className="bg-[#F0E8DB] border border-[#D8CDBE] rounded-lg shadow-md p-6 sm:p-8">
              <h2 className="text-2xl font-extrabold text-[#4A3820] mb-6 text-center !font-sans">
                Please Log In
              </h2>
              <div className="text-center">
                <p className="text-lg text-[#4A3820] mb-6">
                  Log in as an administrator or author to create new articles
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------
  // UI - Matched Design
  // -------------------------
  return (
    <div className="px-6 min-h-screen pb-32 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#4A3820] mb-6 text-center !font-sans">
          Create New Article
        </h1>

        {/* Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        {errors.general && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {errors.general}
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-[#F0E8DB] border border-[#D8CDBE] rounded-lg shadow-md p-6 sm:p-8 mb-8">
          <h2 className="text-2xl font-medium text-[#4A3820] mb-8 !font-sans">
            Article Details
          </h2>

          <div className="space-y-8">
            {/* Title */}
            <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
              <label className="block text-lg font-bold text-[#4A3820] mb-3 !font-sans">
                Title
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter article title"
              />
              {errors.title && (
                <p className="mt-2 text-red-600 font-medium">{errors.title}</p>
              )}
            </div>

            {/* Slug */}
            <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
              <label className="block text-lg font-bold text-[#4A3820] mb-3 !font-sans">
                Slug (URL)
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Article URL slug"
              />
              <p className="mt-2 text-sm text-[#4A3820]/70">
                This will be used in the article URL: /articles/{slug || "your-slug"}
              </p>
              {errors.slug && (
                <p className="mt-2 text-red-600 font-medium">{errors.slug}</p>
              )}
            </div>

            {/* Cover Image Upload */}
            <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
              <label className="block text-lg font-bold text-[#4A3820] mb-3 !font-sans">
                Cover Image
              </label>
              <CoverUpload
                value={coverImage}
                onChange={(url) => setCoverImage(url)}
              />
              {errors.coverImage && (
                <p className="mt-2 text-red-600 font-medium">{errors.coverImage}</p>
              )}
            </div>

            {/* Body - TipTap */}
            <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
              <label className="block text-lg font-bold text-[#4A3820] mb-3 !font-sans">
                Article Content
              </label>
              <ArticleEditor value={body} onChange={setBody} />
              {errors.body && (
                <p className="mt-2 text-red-600 font-medium">{errors.body}</p>
              )}
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
              <label className="block text-lg font-bold text-[#4A3820] mb-3 !font-sans">
                Tags
              </label>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Type a tag and press Enter to add"
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                  onKeyDown={handleAddTag}
                />

                <div className="flex gap-2 flex-wrap">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="px-4 py-1.5 bg-[#F0E8DB] border border-[#D8CDBE] text-[#4A3820] rounded-full flex items-center gap-2 font-medium"
                    >
                      {t}
                     <button
                        onClick={() => handleRemoveTag(t)}
                        className="p-1 rounded-full hover:bg-red-100 hover:text-red-700 transition flex items-center justify-center"
                      >
                        <X size={16} strokeWidth={3} />
                      </button>

                    </span>
                  ))}
                </div>
                
                {tags.length === 0 && (
                  <p className="text-[#4A3820]/70 italic">No tags added yet.</p>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
              <label className="block text-lg font-bold text-[#4A3820] mb-3 !font-sans">
                Publish Status
              </label>
              <select
                className="w-full px-4 py-3 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                value={status}
                onChange={(e) => setStatus(e.target.value as "draft" | "published")}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
        </div>

    
      <FloatingSaveBar
        onClick={handleSave}
        saving={saving}
        label="Save Article"
      />


      </div>
    </div>
  );
}