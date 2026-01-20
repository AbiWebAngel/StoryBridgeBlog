"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { X } from "lucide-react";

import { validateArticle } from "@/lib/articles/validateArticle";
import { extractArticleAssets } from "@/lib/articles/extractArticleAssets";
import { findUnusedAssets } from "@/lib/articles/findUnusedAssets";

import CoverUpload from "@/components/articles/CoverUpload";
import ArticleEditor from "@/components/articles/ArticleEditor";
import FloatingAutosaveIndicator from "@/components/admin/FloatingAutosaveIndicator";
import FloatingSaveBar from "@/components/admin/FloatingSaveBar";
import { getDoc } from "firebase/firestore";


// Constants
const BACKUP_AUTOSAVE_INTERVAL = 10 * 60 * 1000; // 10 minutes


// Helper functions
const getActiveArticleIdKey = (uid: string) => `active-article-id:${uid}`;
const getAutosaveKey = (uid: string, articleId: string) => `article-draft:${uid}:${articleId}`;


export default function NewArticlePage() {
  const { user: currentAuthUser } = useAuth();
  
  // Refs
  const articleIdRef = useRef<string | null>(null);
  const hasSavedOnceRef = useRef(false);
  const hasRestoredRef = useRef(false);
  const serverSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [nextServerSaveAt, setNextServerSaveAt] = useState<number | null>(null);
  const backupIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);


  // State
  const [articleData, setArticleData] = useState({
    title: "",
    slug: "",
    metaDescription: "",
    coverImage: null as string | null,
    coverImageAlt: "",
    body: null as any,
    tags: [] as string[],
    status: "draft" as "draft" | "published",
  });

  const articleDataRef = useRef(articleData);

  const [uploadedAssets, setUploadedAssets] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [resetEditorToken, setResetEditorToken] = useState(0);
  const [pageReady, setPageReady] = useState(false);
  const [articleReady, setArticleReady] = useState(false);
  
  // Autosave UI State
  const [autosaving, setAutosaving] = useState(false);
  const [lastLocalSave, setLastLocalSave] = useState<number | null>(null);
  const [lastServerSave, setLastServerSave] = useState<number | null>(null);
  const [isDocked, setIsDocked] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Destructure for easier access - do this BEFORE using the variables
  const { title, slug, metaDescription, coverImage, coverImageAlt, body, tags, status } = articleData;

  // Derived state updaters
  const updateArticleData = useCallback((updates: Partial<typeof articleData>) => {
    setArticleData(prev => ({ ...prev, ...updates }));
  }, []);
  


  // Initialization effects
  useEffect(() => {
    const timer = setTimeout(() => setPageReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!coverImage) {
      updateArticleData({ coverImageAlt: "" });
    }
  }, [coverImage, updateArticleData]);

  useEffect(() => {
  articleDataRef.current = articleData;
}, [articleData]);


useEffect(() => {
  if (!currentAuthUser) return;

  const uid = currentAuthUser.uid;
  const localKey = getActiveArticleIdKey(uid);

  const init = async () => {
    let id = localStorage.getItem(localKey);

    // 1️⃣ Firebase FIRST
    try {
      const userSnap = await getDoc(doc(db, "users", uid));
      const remoteId = userSnap.data()?.lastActiveArticleId;

      if (remoteId) {
        id = remoteId;
      }
    } catch {
      // ignore, fallback to local
    }

    // 2️⃣ Local fallback
    if (!id) {
      id = crypto.randomUUID();
    }

    // 3️⃣ LOCK IT
    localStorage.setItem(localKey, id);
    articleIdRef.current = id;
    setArticleReady(true);

    console.log("🔒 Locked article ID:", id);
  };

  init();
}, [currentAuthUser]);






  // Auto-generate slug
  useEffect(() => {
    if (!title) return;
    
    const newSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    
    updateArticleData({ slug: newSlug });
  }, [title, updateArticleData]);

  // Local autosave
useEffect(() => {
  if (
    !hasRestoredRef.current ||
    !articleReady ||
    !pageReady ||
    !currentAuthUser
  ) return;



  const timeout = setTimeout(() => {
    const key = getAutosaveKey(currentAuthUser.uid, articleIdRef.current!);
    localStorage.setItem(
      key,
      JSON.stringify({ ...articleData, uploadedAssets })
    );
    setLastLocalSave(Date.now());
  }, 800);

  return () => clearTimeout(timeout);
}, [articleData, uploadedAssets]);


  // Local restore
useEffect(() => {
  if (!currentAuthUser || !articleReady || !articleIdRef.current) return;

  const articleId = articleIdRef.current;
  const localKey = getAutosaveKey(currentAuthUser.uid, articleId);

  const restore = async () => {
    console.log("🔄 Starting restore flow", articleId);

    // 1️⃣ LOCAL (highest priority)
    const raw = localStorage.getItem(localKey);
    if (raw) {
      try {
        const draft = JSON.parse(raw);
        console.log("💾 Restored from LOCAL");

        setArticleData({
          title: draft.title ?? "",
          slug: draft.slug ?? "",
          metaDescription: draft.metaDescription ?? "",
          coverImage: draft.coverImage ?? null,
          coverImageAlt: draft.coverImageAlt ?? "",
          body: draft.body ?? null,
          tags: draft.tags ?? [],
          status: "draft",
        });

        setUploadedAssets(draft.uploadedAssets ?? []);
        hasRestoredRef.current = true;
        return;
      } catch {
        console.warn("⚠️ Local draft corrupted, ignoring");
      }
    }

    // 2️⃣ FIREBASE (fallback)
    console.log("📡 Checking Firebase…");

    const snap = await getDoc(doc(db, "articles", articleId));
    if (snap.exists()) {
      const data = snap.data();
      console.log("📡 Restored from Firebase");

      setArticleData({
        title: data.title ?? "",
        slug: data.slug ?? "",
        metaDescription: data.metaDescription ?? "",
        coverImage: data.coverImage ?? null,
        coverImageAlt: data.coverImageAlt ?? "",
        body: data.body ?? null,
        tags: data.tags ?? [],
        status: data.status ?? "draft",
      });

      setUploadedAssets(data.uploadedAssets ?? []);
    } else {
      console.log("🆕 No draft found — starting fresh");
    }

    hasRestoredRef.current = true;
  };

  restore();
}, [currentAuthUser, articleReady]);




  // Server autosave
const autosaveToServer = useCallback(async (force = false) => {
  if (!hasRestoredRef.current) return;
  if (!currentAuthUser) return;

  const articleId = articleIdRef.current;
  if (!articleId) return;

  const data = articleDataRef.current;

  if (!force && !data.title && !data.body && !data.coverImage) return;

  setAutosaving(true);

  try {
    await setDoc(
      doc(db, "articles", articleId),
      {
        ...data,
        authorId: currentAuthUser.uid,
        updatedAt: serverTimestamp(),
        autosaved: true,
      },
      { merge: true }
    );

    await setDoc(
      doc(db, "users", currentAuthUser.uid),
      { lastActiveArticleId: articleId },
      { merge: true }
    );

    setLastServerSave(Date.now());
  } catch (err) {
    console.warn("Server autosave failed", err);
  } finally {
    setAutosaving(false);
  }
}, [currentAuthUser]);



  // Periodic backup autosave
useEffect(() => {
  if (!currentAuthUser) return;

  setNextServerSaveAt(Date.now() + BACKUP_AUTOSAVE_INTERVAL);

  backupIntervalRef.current = setInterval(() => {
    autosaveToServer();
    setNextServerSaveAt(Date.now() + BACKUP_AUTOSAVE_INTERVAL);
  }, BACKUP_AUTOSAVE_INTERVAL);

  return () => {
    clearInterval(backupIntervalRef.current!);
    setNextServerSaveAt(null);
  };
}, [currentAuthUser, autosaveToServer]);



  // Cleanup
  useEffect(() => {
    return () => {
      if (serverSaveTimeoutRef.current) {
        clearTimeout(serverSaveTimeoutRef.current);
      }
    };
  }, []);

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Tag handlers
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    
    e.preventDefault();
    let value = e.currentTarget.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    
    if (!value || tags.includes(value)) return;
    
    updateArticleData({ tags: [...tags, value] });
    e.currentTarget.value = "";
  };

  const handleRemoveTag = (tag: string) => {
    updateArticleData({ tags: tags.filter(t => t !== tag) });
  };

const handlePreview = async () => {
  if (!articleIdRef.current) return;

  // Prevent preview if important fields are empty
  const missing = [];
  if (!title.trim()) missing.push("Title");
  if (!slug.trim()) missing.push("Slug");
  if (!body) missing.push("Content");

  if (missing.length > 0) {
    alert(`You need to fill in:\n- ${missing.join("\n- ")}\nbefore previewing.`);
    return;
  }

  try {
    await autosaveToServer(true);
    window.open(`/dashboard/articles/preview/${articleIdRef.current}`, "_blank");
  } catch {
    alert("Preview failed — could not save article to server.");
  }
};

const timeUntilNextSave =
  nextServerSaveAt ? Math.max(0, nextServerSaveAt - now) : null;


  // Form reset
  const resetForm = useCallback(() => {
    hasRestoredRef.current = false;
    setArticleReady(false);
    setArticleData({
      title: "",
      slug: "",
      metaDescription: "",
      coverImage: null,
      coverImageAlt: "",
      body: null,
      tags: [],
      status: "draft",
    });
    setUploadedAssets([]);
    setResetEditorToken(v => v + 1);
    hasSavedOnceRef.current = false;

    if (currentAuthUser) {
      const newId = crypto.randomUUID();
      articleIdRef.current = newId;
      localStorage.setItem(getActiveArticleIdKey(currentAuthUser.uid), newId);
    }

    setArticleReady(true);
  }, [currentAuthUser]);

  // Save handler
  const handleSave = async () => {
    if (!articleIdRef.current) {
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

    const validation = validateArticle(articleData);
    if (validation) {
      setErrors(validation);
      setSaving(false);
      return;
    }

    try {
      const token = await currentAuthUser.getIdTokenResult();
      if (token.claims.role !== "admin" && token.claims.role !== "author") {
        throw new Error("Insufficient permissions. Admin or author role required.");
      }
    

      let unusedAssets: string[] = [];
      if (body && typeof body === "object") {
        const usedAssets = extractArticleAssets({ coverImage, body });
        unusedAssets = findUnusedAssets(uploadedAssets, usedAssets);
      }


      await setDoc(
        doc(db, "articles", articleIdRef.current),
        {
          ...articleData,
          authorId: currentAuthUser.uid,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

    await setDoc(
      doc(db, "users", currentAuthUser.uid),
      { lastActiveArticleId: null },
      { merge: true }
    );

      const shouldCleanup = hasSavedOnceRef.current;
      if (!hasSavedOnceRef.current) {
        hasSavedOnceRef.current = true;
      }

      if (shouldCleanup && uploadedAssets.length > 0 && unusedAssets.length > 0) {
        if (unusedAssets.length !== uploadedAssets.length) {
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

      setSuccessMessage(
        hasSavedOnceRef.current ? "Article updated successfully!" : "Article created successfully!"
      );

      if (currentAuthUser && articleIdRef.current) {
        localStorage.removeItem(getAutosaveKey(currentAuthUser.uid, articleIdRef.current));
        localStorage.removeItem(getActiveArticleIdKey(currentAuthUser.uid));
      }

      if (serverSaveTimeoutRef.current) {
        clearTimeout(serverSaveTimeoutRef.current);
        serverSaveTimeoutRef.current = null;
      }

      resetForm();
      setAutosaving(false);
      setLastLocalSave(null);
      setLastServerSave(null);

      setTimeout(() => setSuccessMessage(""), 2500);
    } catch (err: any) {
      console.error("Error saving article:", err);
      setErrors({ general: err.message || "Failed to save article." });
    } finally {
      setSaving(false);
    }
  };


 if (!currentAuthUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#4A3820] text-xl font-semibold font-sans!">
          You must be logged in to access this page.
        </p>
      </div>
    );
  }

  if (!pageReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-48 h-2 bg-[#E0D6C7] rounded-full overflow-hidden">
          <div className="h-full w-full animate-pulse bg-[#4A3820]"></div>
        </div>
        <p className="mt-4 text-[#4A3820] font-medium text-lg font-sans!">Loading editor…</p>
      </div>
    );
  }

  // Render
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
            {/* Title */}
            <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
              <label className="block text-lg font-bold text-[#4A3820] mb-3 font-sans!">
                Title
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border-2 border-[#805C2C]"
                value={title}
                onChange={(e) => updateArticleData({ title: e.target.value })}
                placeholder="Enter article title"
              />
              {errors.title && <p className="mt-2 text-red-600 font-medium">{errors.title}</p>}
            </div>

            {/* Slug */}
            <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
              <label className="block text-lg font-bold text-[#4A3820] mb-3 font-sans!">
                Slug (URL)
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border-2 border-[#805C2C]"
                value={slug}
                onChange={(e) => updateArticleData({ slug: e.target.value })}
                placeholder="Article URL slug"
              />
              {errors.slug && <p className="mt-2 text-red-600 font-medium">{errors.slug}</p>}
            </div>

            {/* Meta Description */}
            <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
              <label className="block text-lg font-bold text-[#4A3820] mb-3 font-sans!">
                Meta Description
              </label>
              <textarea
                value={metaDescription}
                onChange={(e) => updateArticleData({ metaDescription: e.target.value })}
                maxLength={160}
                rows={3}
                placeholder="Short summary shown in search results (150–160 chars)"
                className="w-full px-4 py-3 rounded-lg border-2 border-[#805C2C]"
              />
              <p className="mt-1 text-sm! text-gray-600 font-sans!">
                {metaDescription.length}/160 characters
              </p>
              {errors.metaDescription && (
                <p className="mt-2 text-red-600 font-medium">{errors.metaDescription}</p>
              )}
            </div>

            {/* Cover Image */}
            <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
              <label className="block text-lg font-bold text-[#4A3820] mb-3 font-sans!">
                Cover Image
              </label>
              <CoverUpload
                value={coverImage}
                articleId={articleIdRef.current!}
                onChange={(url) => {
                  updateArticleData({ coverImage: url });
                  if (url) {
                    setUploadedAssets(prev => prev.includes(url) ? prev : [...prev, url]);
                  }
                }}
              />
              <div className="mt-4">
                <label className="block text-sm font-semibold text-[#4A3820] mb-1">
                  Cover Image Alt Text
                </label>
                <input
                  type="text"
                  value={coverImageAlt}
                  onChange={(e) => updateArticleData({ coverImageAlt: e.target.value })}
                  placeholder="Describe the image for accessibility & SEO"
                  disabled={!coverImage}
                  className={`w-full px-4 py-2 rounded-lg border-2 ${
                    coverImage
                      ? "border-[#805C2C]"
                      : "border-gray-300 bg-gray-100 cursor-not-allowed"
                  }`}
                />
                {errors.coverImageAlt && (
                  <p className="mt-1 text-red-600 font-medium">{errors.coverImageAlt}</p>
                )}
              </div>
            </div>

            {/* Body Editor */}
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
               {articleReady && articleIdRef.current && (
                  <ArticleEditor
                    key={`${currentAuthUser?.uid}:${articleIdRef.current}`}
                    articleId={articleIdRef.current}
                    value={body}
                    onChange={(newBody) => updateArticleData({ body: newBody })}
                    resetToken={resetEditorToken}
                    onImageUploaded={(url) =>
                      setUploadedAssets(prev => prev.includes(url) ? prev : [...prev, url])
                    }
                    title={title}
                    metaDescription={metaDescription}
                    coverImage={coverImage}
                    coverImageAlt={coverImageAlt}
                  />
                )}

              {errors.body && <p className="mt-2 text-red-600 font-medium">{errors.body}</p>}
            </div>

            {/* Tags */}
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
              {errors.tags && <p className="mt-2 text-red-600 font-medium">{errors.tags}</p>}
            </div>

            {/* Status */}
            <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
              <label className="block text-lg font-bold text-[#4A3820] mb-3 font-sans!">
                Publish Status
              </label>
              <select
                value={status}
                onChange={(e) => updateArticleData({ status: e.target.value as "draft" | "published" })}
                className="w-full px-4 py-3 rounded-lg border-2 border-[#805C2C]"
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
          onDockChange={setIsDocked}
        >
         <FloatingAutosaveIndicator
            autosaving={autosaving}
            lastLocalSave={lastLocalSave}
            lastServerSave={lastServerSave}
            timeUntilNextSave={timeUntilNextSave}
            docked={isDocked}
          />

        </FloatingSaveBar>
      </div>
    </div>
  );
}