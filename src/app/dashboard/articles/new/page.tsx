"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import CoverUpload from "@/components/articles/CoverUpload";
import ArticleEditor from "@/components/articles/ArticleEditor";

import { validateArticle } from "@/lib/articles/validateArticle";
import { extractArticleAssets } from "@/lib/articles/extractArticleAssets";
import { findUnusedAssets } from "@/lib/articles/findUnusedAssets"; // 🔥 NEW
import { useAuth } from "@/context/AuthContext";

import { X } from "lucide-react";
import FloatingSaveBar from "@/components/admin/FloatingSaveBar";
import { useRef } from "react";

export default function NewArticlePage() {
  const { user: currentAuthUser } = useAuth();

  // -------------------------
  // FORM STATE
  // -------------------------
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [body, setBody] = useState<any>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [editorKey, setEditorKey] = useState(Date.now());

  // 🔥 NEW: Track ALL uploaded asset URLs
  const [uploadedAssets, setUploadedAssets] = useState<string[]>([]);

  // Errors + UI
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const articleIdRef = useRef<string>(crypto.randomUUID());
  const articleId = articleIdRef.current;
  const hasSavedOnceRef = useRef(false);
  const [pageReady, setPageReady] = useState(false);

  // -------------------------
  // AUTO GENERATE SLUG
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

  useEffect(() => {
  const timer = setTimeout(() => setPageReady(true), 50); // tiny delay
  return () => clearTimeout(timer);
}, []);

  // -------------------------
  // TAG HELPERS
  // -------------------------
const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === "Enter") {
    e.preventDefault();

    // normalize & strip invalid chars (allow only a-z, 0-9, and hyphens)
    let value = e.currentTarget.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");

    if (!value) return;

    // prevent duplicates
    if (!tags.includes(value)) {
      setTags([...tags, value]);
    }

    e.currentTarget.value = "";
  }
};



  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

 function resetForm() {
  setTitle("");
  setSlug("");
  setCoverImage(null);
  setBody(null);
  setTags([]);
  setStatus("draft");
  setEditorKey(Date.now());
  setUploadedAssets([]);

  // 🔥 REGENERATE ARTICLE ID AFTER SAVE
  articleIdRef.current = crypto.randomUUID();

  hasSavedOnceRef.current = false;
}

  // -------------------------
  // SAVE ARTICLE
  // -------------------------
  const handleSave = async () => {
    if (!currentAuthUser) {
      setErrors({ general: "Please log in to save changes." });
      return;
    }

    setErrors({});
    setSaving(true);
    setSuccessMessage("");

    // Validate fields
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
      // Auth check
      const token = await currentAuthUser.getIdTokenResult();
      if (token.claims.role !== "admin" && token.claims.role !== "author") {
        throw new Error("Insufficient permissions. Admin or author role required.");
      }



      // 🧯 Safety: body must be valid before cleanup
      let unusedAssets: string[] = [];

    if (body && typeof body === "object") {
      const usedAssets = extractArticleAssets({ coverImage, body });
      unusedAssets = findUnusedAssets(uploadedAssets, usedAssets);
    }

      // Save article
      await setDoc(
        doc(db, "articles", articleId),
        {
          articleId,
          slug,
          title,
          coverImage,
          body,
          tags,
          status,
          authorId: currentAuthUser.uid,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      const shouldCleanup = hasSavedOnceRef.current;
      if (!hasSavedOnceRef.current) {
        hasSavedOnceRef.current = true;
        console.log("First save — skipping asset cleanup");
      }

    if (shouldCleanup) {
  let canCleanup = true;

  // 1️⃣ Nothing uploaded → nothing to clean
  if (!uploadedAssets.length) {
    console.log("No uploaded assets — skipping cleanup");
    canCleanup = false;
  }

  // 2️⃣ Everything looks unused → abort
  if (unusedAssets.length === uploadedAssets.length) {
    console.warn("Asset cleanup aborted: all assets appear unused", {
      uploadedAssets,
      unusedAssets,
    });
    canCleanup = false;
  }

  // 🔥 Safe cleanup
  if (canCleanup && unusedAssets.length > 0) {
    await Promise.all(
      unusedAssets.map(async (url) => {
        try {
          await fetch("/api/delete-asset", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
          });
        } catch (err) {
          console.warn("Failed to delete unused asset", url, err);
        }
      })
    );
  }
}
      // Success
     setSuccessMessage(
      hasSavedOnceRef.current ? "Article updated successfully!" : "Article created successfully!"
    );

      setSaving(false);

      // Reset form
      resetForm();

      setTimeout(() => setSuccessMessage(""), 2500);
    } catch (err: any) {
      console.error("Error saving article:", err);
      setErrors({ general: err.message || "Failed to save article." });
      setSaving(false);
    }
  };

if (!pageReady) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0E8DB]">
      <div className="w-48 h-2 bg-[#E0D6C7] rounded-full overflow-hidden">
        <div className="h-full w-full animate-pulse bg-[#4A3820]"></div>
      </div>

      <p className="mt-4 text-[#4A3820] font-medium text-lg !font-sans">
        Loading editor…
      </p>
    </div>
  );
}

  // -------------------------
  // MAIN UI
  // -------------------------
  return (
    <div className="px-6 min-h-screen pb-32 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#4A3820] mb-6 text-center !font-sans">
          Create New Article
        </h1>

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

        <div className="bg-[#F0E8DB] border border-[#D8CDBE] rounded-lg shadow-md p-6 sm:p-8 mb-8">
          <h2 className="text-2xl font-medium text-[#4A3820] mb-8 !font-sans">
            Article Details
          </h2>

          <div className="space-y-8">
            {/* TITLE */}
            <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
              <label className="block text-lg font-bold text-[#4A3820] mb-3 !font-sans">
                Title
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border-2 border-[#805C2C]"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter article title"
              />
              {errors.title && (
                <p className="mt-2 text-red-600 font-medium">{errors.title}</p>
              )}
            </div>

            {/* SLUG */}
            <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
              <label className="block text-lg font-bold text-[#4A3820] mb-3 !font-sans">
                Slug (URL)
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border-2 border-[#805C2C]"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Article URL slug"
              />
              {errors.slug && (
                <p className="mt-2 text-red-600 font-medium">{errors.slug}</p>
              )}
            </div>

            {/* COVER IMAGE */}
            <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
              <label className="block text-lg font-bold text-[#4A3820] mb-3 !font-sans">
                Cover Image
              </label>
           <CoverUpload
              value={coverImage}
              articleId={articleId}   // 👈 ADD THIS
              onChange={setCoverImage}
             onUploaded={(url) => {
              setUploadedAssets((prev) =>
                prev.includes(url) ? prev : [...prev, url]
              );
              setCoverImage(url);
            }}

            />


              {errors.coverImage && (
                <p className="mt-2 text-red-600 font-medium">{errors.coverImage}</p>
              )}
            </div>

            {/* BODY EDITOR */}
            <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
              <label className="block text-lg font-bold text-[#4A3820] mb-3 !font-sans">
                Article Content
              </label>
             <ArticleEditor
              key={editorKey}
              value={body}
              articleId={articleId}   // 👈 ADD
              onChange={setBody}
              onImageUploaded={(url) =>
              setUploadedAssets((prev) =>
                prev.includes(url) ? prev : [...prev, url]
              )
            }
            />

              {errors.body && (
                <p className="mt-2 text-red-600 font-medium">{errors.body}</p>
              )}
            </div>

            {/* TAGS */}
            <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
              <label className="block text-lg font-bold text-[#4A3820] mb-3 !font-sans">
                Tags
              </label>
              <input
                type="text"
                placeholder="Type a tag and press Enter"
                onKeyDown={handleAddTag}
                className="w-full px-4 py-3 rounded-lg border-2 border-[#805C2C]"
              />
              <div className="flex gap-2 flex-wrap mt-3">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="px-4 py-1.5 bg-[#F0E8DB] border border-[#D8CDBE] rounded-full flex items-center gap-2"
                  >
                    {t}
                    <button
                      onClick={() => handleRemoveTag(t)}
                      className="p-1 rounded-full hover:bg-red-100"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
               {errors.tags && (
              <p className="mt-2 text-red-600 font-medium">{errors.tags}</p>
            )}

            </div>
           
            {/* STATUS */}
            <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
              <label className="block text-lg font-bold text-[#4A3820] mb-3 !font-sans">
                Publish Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "draft" | "published")}
                className="w-full px-4 py-3 rounded-lg border-2 border-[#805C2C]"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
        </div>

        <FloatingSaveBar onClick={handleSave} saving={saving} label="Save Article" />
      </div>
    </div>
  );
}
