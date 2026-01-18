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

import FloatingAutosaveIndicator from "@/components/admin/FloatingAutosaveIndicator";
import FloatingSaveBar from "@/components/admin/FloatingSaveBar";

import { useRef } from "react";

export default function NewArticlePage() {
  const { user: currentAuthUser } = useAuth();
  const getActiveArticleIdKey = (uid: string) =>
  `active-article-id:${uid}`;

const getAutosaveKey = (uid: string, articleId: string) =>
  `article-draft:${uid}:${articleId}`;
const [resetEditorToken, setResetEditorToken] = useState(0);


  // -------------------------
  // FORM STATE
  // -------------------------
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverImageAlt, setCoverImageAlt] = useState("");
  const [body, setBody] = useState<any>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [editorKey, setEditorKey] = useState(Date.now());
  const [metaDescription, setMetaDescription] = useState("");

  // 🔥 NEW: Track ALL uploaded asset URLs
  const [uploadedAssets, setUploadedAssets] = useState<string[]>([]);
  
  // Errors + UI
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const articleIdRef = useRef<string | null>(null);
  const hasSavedOnceRef = useRef(false);
  const serverSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [pageReady, setPageReady] = useState(false);
  
  // -------------------------
// AUTOSAVE UI STATE
// -------------------------
const [autosaving, setAutosaving] = useState(false);
const [lastLocalSave, setLastLocalSave] = useState<number | null>(null);
const [lastServerSave, setLastServerSave] = useState<number | null>(null);
const [articleReady, setArticleReady] = useState(false);
const [now, setNow] = useState(Date.now());


const [isDocked, setIsDocked] = useState(false);



useEffect(() => {
  if (!articleReady) return;   // 👈 ONLY this check
  if (!pageReady) return;      // 👈 this one is fine as a secondary check

if (!currentAuthUser) return;
if (!articleIdRef.current) return;

const key = getAutosaveKey(
  currentAuthUser.uid,
  articleIdRef.current
);

  if (!key) return;

  const timeout = setTimeout(() => {
    const draft = {
      title,
      slug,
      metaDescription,
      coverImage,
      coverImageAlt,
      body,
      tags,
      status,
      uploadedAssets,
    };

    localStorage.setItem(key, JSON.stringify(draft));
    setLastLocalSave(Date.now());
    console.log("💾 Local draft autosaved");
  }, 800);

  return () => clearTimeout(timeout);
}, [
  title,
  slug,
  metaDescription,
  coverImage,
  coverImageAlt,
  body,
  tags,
  status,
  uploadedAssets,
  articleReady,   // 👈 correct dependency
  pageReady,      // optional
]);

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

useEffect(() => {
  if (!coverImage) {
    setCoverImageAlt("");
  }
}, [coverImage]);





useEffect(() => {
  if (!currentAuthUser) return;

  const key = getActiveArticleIdKey(currentAuthUser.uid);
  const storedId = localStorage.getItem(key);

if (storedId) {
  articleIdRef.current = storedId;
} else {
  const newId = crypto.randomUUID();
  articleIdRef.current = newId;

  localStorage.setItem(
    getActiveArticleIdKey(currentAuthUser.uid),
    newId
  );
}


  setArticleReady(true);
}, [currentAuthUser]);


useEffect(() => {
  if (!currentAuthUser) return;
  if (!articleReady) return;
  if (!articleIdRef.current) return;

  const key = getAutosaveKey(
    currentAuthUser.uid,
    articleIdRef.current
  );

  const raw = localStorage.getItem(key);
  if (!raw) return;

  try {
    const draft = JSON.parse(raw);

    setTitle(draft.title ?? "");
    setSlug(draft.slug ?? "");
    setMetaDescription(draft.metaDescription ?? "");
    setCoverImage(draft.coverImage ?? null);
    setCoverImageAlt(draft.coverImageAlt ?? "");
    setBody(draft.body ?? null);
    setTags(draft.tags ?? []);
    setStatus("draft");
    setUploadedAssets(draft.uploadedAssets ?? []);

    console.log("♻️ Draft restored for user", currentAuthUser.uid);
  } catch {
    console.warn("Failed to restore draft");
  }
}, [currentAuthUser, articleReady]);
; // 👈 IMPORTANT

const autosaveToServer = async (force = false) => {
  const articleId = articleIdRef.current;
  if (!currentAuthUser || !articleId) return;

  // 👇 prevent empty junk saves unless forced
  if (!force && !title && !body && !coverImage) return;

  setAutosaving(true);

  try {
    await setDoc(
      doc(db, "articles", articleId),
      {
        title,
        slug,
        metaDescription,
        coverImage,
        coverImageAlt,
        body,
        tags,
        status: "draft",
        authorId: currentAuthUser.uid,
        updatedAt: serverTimestamp(),
        autosaved: true,
      },
      { merge: true }
    );

    setLastServerSave(Date.now());
    console.log("☁️ Server autosave complete");
  } catch (err) {
    console.warn("Server autosave failed", err);
    throw err; // 👈 important so preview knows it failed
  } finally {
    setAutosaving(false);
  }
};

const scheduleServerSave = (delay = 15000) => {
  if (!currentAuthUser || !articleIdRef.current) return;
  if (autosaving) return; // 👈 add this

  if (serverSaveTimeoutRef.current) {
    clearTimeout(serverSaveTimeoutRef.current);
  }

  serverSaveTimeoutRef.current = setTimeout(() => {
    autosaveToServer();
  }, delay);
};


useEffect(() => {
  return () => {
    if (serverSaveTimeoutRef.current) {
      clearTimeout(serverSaveTimeoutRef.current);
    }
  };
}, []);

useEffect(() => {
  if (!articleReady) return;
  if (!pageReady) return;
  if (!currentAuthUser) return;
  if (!articleIdRef.current) return;

  scheduleServerSave();
}, [
  title,
  slug,
  metaDescription,
  coverImage,
  coverImageAlt,
  body,
  tags,
  status,
  uploadedAssets,
]);


useEffect(() => {
  if (!currentAuthUser) return;

  const interval = setInterval(() => {
    autosaveToServer();
  }, 10 * 60 * 1000); // 10 min backup

  return () => clearInterval(interval);
}, [currentAuthUser]); // ← only depends on user


useEffect(() => {
  const interval = setInterval(() => {
    setNow(Date.now());
  }, 1000);

  return () => clearInterval(interval);
}, []);



if (!articleIdRef.current) {
  return null; // or a small loading placeholder
}


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

const handlePreview = async () => {
  const articleId = articleIdRef.current;
  if (!articleId) return;

  try {
    // 🛑 Ensure latest content is on the server
    await autosaveToServer(true);

    // 🚀 Only open preview AFTER save completes
    window.open(`/dashboard/articles/preview/${articleId}`, "_blank");
  } catch {
    alert("Preview failed — could not save article to server.");
  }
};




  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

function resetForm() {
    setArticleReady(false);
  setTitle("");
  setSlug("");
  setMetaDescription("");
  setCoverImageAlt("");
  setCoverImage(null);
  setBody(null);

  setResetEditorToken((v) => v + 1);
  setTags([]);
  setStatus("draft");
  setBody(null);
  
  setUploadedAssets([]);
  hasSavedOnceRef.current = false;

  if (currentAuthUser) {
    const newId = crypto.randomUUID();
    articleIdRef.current = newId;

    localStorage.setItem(
      getActiveArticleIdKey(currentAuthUser.uid),
      newId
    );
  }

  setArticleReady(true);
}


  // -------------------------
  // SAVE ARTICLE
  // -------------------------
  const handleSave = async () => {
    const articleId = articleIdRef.current;
    if (!articleId) {
      setErrors({ general: "Article ID not ready yet." });
      return;
    }

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
      metaDescription,
      coverImage,
      coverImageAlt,
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
      title,
      slug,
      metaDescription,
      coverImage,
      coverImageAlt,
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
      if (currentAuthUser && articleId) {
        localStorage.removeItem(
          getAutosaveKey(currentAuthUser.uid, articleId)
        );

        localStorage.removeItem(
          getActiveArticleIdKey(currentAuthUser.uid)
        );
      }

      if (serverSaveTimeoutRef.current) {
        clearTimeout(serverSaveTimeoutRef.current);
        serverSaveTimeoutRef.current = null;
      }

      // Reset form
      resetForm();
      
      // 🔄 Reset autosave UI state after manual save
      setAutosaving(false);
      setLastLocalSave(null);
      setLastServerSave(null);


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

      <p className="mt-4 text-[#4A3820] font-medium text-lg font-sans!">
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
        <h1 className="text-3xl font-extrabold text-[#4A3820] mb-6 text-center font-sans!">
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
          <h2 className="text-2xl font-medium text-[#4A3820] mb-8 font-sans!">
            Article Details
          </h2>

          <div className="space-y-8">
           {/* TITLE */}
              <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
                <label className="block text-lg font-bold text-[#4A3820] mb-3 font-sans!">
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
              <label className="block text-lg font-bold text-[#4A3820] mb-3 font-sans!">
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

          {/* META DESCRIPTION */}
          <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
            <label className="block text-lg font-bold text-[#4A3820] mb-3 font-sans!">
              Meta Description
            </label>

            <textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              maxLength={160}
              rows={3}
              placeholder="Short summary shown in search results (150–160 chars)"
              className="w-full px-4 py-3 rounded-lg border-2 border-[#805C2C]"
            />

            <p className="mt-1 text-sm! text-gray-600 font-sans!">
              {metaDescription.length}/160 characters
            </p>

            {errors.metaDescription && (
              <p className="mt-2 text-red-600 font-medium">
                {errors.metaDescription}
              </p>
            )}
          </div>


            {/* COVER IMAGE */}
            <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
              <label className="block text-lg font-bold text-[#4A3820] mb-3 font-sans!">
                Cover Image
              </label>
           <CoverUpload
              value={coverImage}
              articleId={articleIdRef.current!}   // 👈 ADD THIS
              onChange={setCoverImage}
             onUploaded={(url) => {
              setUploadedAssets((prev) =>
                prev.includes(url) ? prev : [...prev, url]
              );
              setCoverImage(url);
            }}

            />
            <div className="mt-4">
              <label className="block text-sm font-semibold text-[#4A3820] mb-1">
                Cover Image Alt Text
              </label>

              <input
                type="text"
                value={coverImageAlt}
                onChange={(e) => setCoverImageAlt(e.target.value)}
                placeholder="Describe the image for accessibility & SEO"
                disabled={!coverImage}
                className={`w-full px-4 py-2 rounded-lg border-2 ${
                  coverImage
                    ? "border-[#805C2C]"
                    : "border-gray-300 bg-gray-100 cursor-not-allowed"
                }`}
              />

              {errors.coverImageAlt && (
                <p className="mt-1 text-red-600 font-medium">
                  {errors.coverImageAlt}
                </p>
              )}
            </div>


              {errors.coverImage && (
                <p className="mt-2 text-red-600 font-medium">{errors.coverImage}</p>
              )}
            </div>

            {/* BODY EDITOR */}
            <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <label className="text-lg font-bold text-[#4A3820] font-sans!">
                  Article Content
                </label>

                <button
                  type="button"
                  onClick={handlePreview}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#4A3820] text-white rounded-md hover:bg-[#3A2D18] transition font-sans!"
                  title="Preview article"
                >
                  Preview
                </button>
              </div>

             <ArticleEditor
                key={currentAuthUser?.uid}
                value={body}
                articleId={articleIdRef.current!}
                onChange={setBody}
                resetToken={resetEditorToken}
                onImageUploaded={(url) =>
                  setUploadedAssets((prev) =>
                    prev.includes(url) ? prev : [...prev, url]
                  )
                }
                title={title}
                metaDescription={metaDescription}
                coverImage={coverImage}
                coverImageAlt={coverImageAlt}
              />


              {errors.body && (
                <p className="mt-2 text-red-600 font-medium">{errors.body}</p>
              )}
            </div>

            {/* TAGS */}
            <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
              <label className="block text-lg font-bold text-[#4A3820] mb-3 font-sans!">
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
              <label className="block text-lg font-bold text-[#4A3820] mb-3 font-sans!">
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
           
           <div className="fixed bottom-24 right-4 bg-black text-white px-3 py-2 rounded-lg text-sm opacity-80 z-50">
            <div>⏱️ Local last: {lastLocalSave ? ((now - lastLocalSave) / 1000).toFixed(0) + "s ago" : "—"}</div>
            <div>☁️ Server last: {lastServerSave ? ((now - lastServerSave) / 1000).toFixed(0) + "s ago" : "—"}</div>
          </div>

<FloatingSaveBar
  onClick={handleSave}
  saving={saving}
  label="Save Article"
  onDockChange={setIsDocked}
>
  <FloatingAutosaveIndicator
    autosaving={autosaving}
    lastLocalSave={lastLocalSave}
    lastServerSave={lastServerSave}
    docked={isDocked} // true when bar is docked
  />
</FloatingSaveBar>



      </div>
    </div>
  );
}
