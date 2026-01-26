"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { X } from "lucide-react";

import { validateArticle } from "@/lib/articles/validateArticle";
import { extractArticleAssets } from "@/lib/articles/extractArticleAssets";
import { findUnusedAssets } from "@/lib/articles/findUnusedAssets";

import CoverUpload from "@/components/articles/CoverUpload";
import ArticleEditor from "@/components/articles/ArticleEditor";
import FloatingAutosaveIndicator from "@/components/admin/FloatingAutosaveIndicator";
import FloatingSaveBar from "@/components/admin/FloatingSaveBar";
import { useRouter } from "next/navigation";
import { sanitizeSlug } from "@/lib/articles/sanitizeSlug";

type ArticleEditorPageProps = {
  articleId?: string;
  mode: "new" | "edit";
};

const BACKUP_AUTOSAVE_INTERVAL = 10 * 60 * 1000;
const DEFAULT_COVER_POSITION = { x: 50, y: 50 };

const getActiveArticleIdKey = (uid: string) => `active-article-id:${uid}`;
const getAutosaveKey = (uid: string, articleId: string) => `article-draft:${uid}:${articleId}`;

export default function ArticleEditorPage({ articleId, mode }: ArticleEditorPageProps) {
  
  const { user: currentAuthUser, authReady, role } = useAuth();
  const isAdmin = role === "admin";
  
  // Refs
  const articleIdRef = useRef<string | null>(null);
  const articleAuthorIdRef = useRef<string | null>(null);
  
  const isAdminOversight =
  isAdmin &&
  articleAuthorIdRef.current &&
  articleAuthorIdRef.current !== currentAuthUser?.uid;

  const hasSavedOnceRef = useRef(false);
  const hasRestoredRef = useRef(false);
  const shouldSkipLocalDrafts = useRef(false);
  const serverSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const backupIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const authorSnapshotRef = useRef<{
    authorName: string;
    authorInitials: string;
  } | null>(null);

  // State
  const [articleData, setArticleData] = useState({
    title: "",
    slug: "",
    metaDescription: "",
    coverImage: null as string | null,
    coverImageAlt: "",
    coverImagePosition: DEFAULT_COVER_POSITION,
    body: null as any,
    tags: [] as string[],
    status: "draft" as "draft" | "published",
  });
  
  const [uploadedAssets, setUploadedAssets] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccessPanel, setShowSuccessPanel] = useState(false);
  const [resetEditorToken, setResetEditorToken] = useState(0);
  const [pageReady, setPageReady] = useState(false);
  const [articleReady, setArticleReady] = useState(false);
  // after const [articleReady, setArticleReady] = useState(false);
  const [articleIdState, setArticleIdState] = useState<string | null>(null);

  // Autosave UI State
  const [autosaving, setAutosaving] = useState(false);
  const [lastLocalSave, setLastLocalSave] = useState<number | null>(null);
  const [lastServerSave, setLastServerSave] = useState<number | null>(null);
  const [nextServerSaveAt, setNextServerSaveAt] = useState<number | null>(null);
  const [isDocked, setIsDocked] = useState(false);
  const [now, setNow] = useState(Date.now());
  

const prevUserIdRef = useRef<string | null>(null);
const prevArticleIdRef = useRef<string | null>(null);
const slugManuallyEditedRef = useRef(false);

  const articleDataRef = useRef(articleData);
  const router = useRouter();

  // Destructure for easier access
  const { title, slug, metaDescription, coverImage, coverImageAlt, body, tags, status } = articleData;

  const updateArticleData = useCallback((updates: Partial<typeof articleData>) => {
    setArticleData(prev => ({ ...prev, ...updates }));
  }, []);

const resolveAuthorId = () => {
  // Admin editing someone else’s article → preserve original author
  if (isAdmin && articleAuthorIdRef.current) {
    return articleAuthorIdRef.current;
  }

  // Otherwise → current user
  return currentAuthUser!.uid;
};


  const clearEditorState = useCallback(() => {
  hasRestoredRef.current = false;
  hasSavedOnceRef.current = false;
  shouldSkipLocalDrafts.current = false;

  setArticleData({
    title: "",
    slug: "",
    metaDescription: "",
    coverImage: null,
    coverImageAlt: "",
    coverImagePosition: DEFAULT_COVER_POSITION,
    body: null,
    tags: [],
    status: "draft",
  });

  setUploadedAssets([]);
  setErrors({});
  setAutosaving(false);
  setLastLocalSave(null);
  setLastServerSave(null);

  // forces ArticleEditor remount
  setResetEditorToken(v => v + 1);
}, []);



  // Update ref when articleData changes
  useEffect(() => {
    articleDataRef.current = articleData;
  }, [articleData]);

  // Page initialization
  useEffect(() => {
    const timer = setTimeout(() => setPageReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Clear alt text when cover image is removed
  useEffect(() => {
    if (!coverImage) {
      updateArticleData({ coverImageAlt: "" });
    }
  }, [coverImage, updateArticleData]);

  // Initialize article ID
  useEffect(() => {
    if (!currentAuthUser) return;

    const uid = currentAuthUser.uid;

   if (mode === "edit" && articleId) {
  articleIdRef.current = articleId;
  setArticleIdState(articleId);

  (async () => {
    try {
      const uid = currentAuthUser!.uid;
      const snap = await getDoc(doc(db, "articles", articleId));

      if (!snap.exists()) {
        return;
      }

      const data = snap.data();

      // Cache author for later (restore + oversight logic)
      articleAuthorIdRef.current = data.authorId ?? null;
      // If admin editing foreign article → never load local drafts
      shouldSkipLocalDrafts.current =
        isAdmin && data.authorId !== currentAuthUser!.uid;


      const isForeignArticle = data.authorId !== uid;

      // Non-admins cannot edit foreign articles
      if (isForeignArticle && !isAdmin) {
        return;
      }

      // Only authors update lastActiveArticleId
      if (!isForeignArticle) {
        await setDoc(
          doc(db, "users", uid),
          { lastActiveArticleId: articleId },
          { merge: true }
        );
      }
    } catch (err) {
    }
  })();

  // Allow editor + restore logic to proceed
  setTimeout(() => {
    setArticleReady(true);
  }, 0);

  return;
}

    const init = async () => {
      const localKey = getActiveArticleIdKey(uid);
      let id = localStorage.getItem(localKey);

      try {
        const userSnap = await getDoc(doc(db, "users", uid));
        const userData = userSnap.data();

        // existing behavior
        const remoteId = userData?.lastActiveArticleId;
        if (remoteId) id = remoteId;

        // STORE AUTHOR SNAPSHOT LOCALLY
        if (userData) {
          authorSnapshotRef.current = {
            authorName: [userData.firstName, userData.lastName].filter(Boolean).join(" "),
            authorInitials: userData.initials ?? "",
          };
        }
      } catch (err) {
      }

      if (!id) {
        id = crypto.randomUUID();
      }

      localStorage.setItem(localKey, id);
      articleIdRef.current = id;
      setArticleIdState(id);

      // Track active article for recovery
      await setDoc(
        doc(db, "users", uid),
        { lastActiveArticleId: id },
        { merge: true }
      );

          setTimeout(() => {
          setArticleReady(true);
        }, 0);
    };

    init();
  }, [currentAuthUser, mode, articleId]);

  // Auto-generate slug
useEffect(() => {
  if (!title) return;
  if (slugManuallyEditedRef.current) return;
  if (mode === "edit") return; // 👈 extra protection

  const newSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  updateArticleData({ slug: newSlug });
}, [title, updateArticleData, mode]);



  // Local autosave
useEffect(() => {
  if (!hasRestoredRef.current || !articleReady || !pageReady || !currentAuthUser) return;

  const articleId = articleIdRef.current;
  if (!articleId) return;

  const timeout = setTimeout(() => {
    if (shouldSkipLocalDrafts.current) {
      return;
    }

    const key = getAutosaveKey(currentAuthUser.uid, articleId);

    const payload = {
      ...articleDataRef.current,
      uploadedAssets,
      savedAt: Date.now(),
    };

    localStorage.setItem(key, JSON.stringify(payload));
    setLastLocalSave(Date.now());
  }, 800);

  return () => clearTimeout(timeout);
}, [articleData, uploadedAssets, articleReady, pageReady, currentAuthUser]);


  // Local restore - FIXED VERSION WITH DEBUG LOGS
  useEffect(() => {
    if (!currentAuthUser || !articleReady || !articleIdRef.current) {
      return;
    }
    

    const articleId = articleIdRef.current;
    const uid = currentAuthUser.uid;
    const localKey = getAutosaveKey(uid, articleId);

    const restore = async () => {
      const skipLocal = shouldSkipLocalDrafts.current;


      // NEW mode - only check localStorage
      if (mode === "new") {
        const raw = localStorage.getItem(localKey);
        if (skipLocal) {
        } else {
          // allow existing NEW logic to check local
        

        if (raw) {
          try {
            const draft = JSON.parse(raw);
            setArticleData({
              title: draft.title ?? "",
              slug: draft.slug ?? "",
              metaDescription: draft.metaDescription ?? "",
              coverImage: draft.coverImage ?? null,
              coverImageAlt: draft.coverImageAlt ?? "",
              coverImagePosition: draft.coverImagePosition ?? DEFAULT_COVER_POSITION,
              body: draft.body ?? null,
              tags: draft.tags ?? [],
              status: "draft",
            });
            slugManuallyEditedRef.current = true;
            setUploadedAssets(draft.uploadedAssets ?? []);
          } catch (err) {
          }
        } else {
          // inside the NEW branch, after local check and if no local found:
        try {
          const snap = await getDoc(doc(db, "articles", articleId));
          if (snap.exists()) {
            const data = snap.data();
            articleAuthorIdRef.current = data.authorId ?? null;

            const isForeignArticle = data.authorId !== currentAuthUser.uid;

          if (isForeignArticle && !isAdmin) {
            return;
          }

          if (isForeignArticle && isAdmin) {
          }



    const remoteHasContent =
      Boolean(data?.title) ||
      Boolean(data?.body) ||
      Boolean(data?.slug) ||
      Boolean(data?.metaDescription) ||
      (Array.isArray(data?.tags) && data.tags.length > 0) ||
      (Array.isArray(data?.uploadedAssets) && data.uploadedAssets.length > 0) ||
      Boolean(data?.coverImage);

    if (remoteHasContent) {
      setArticleData({
        title: data.title ?? "",
        slug: data.slug ?? "",
        metaDescription: data.metaDescription ?? "",
        coverImage: data.coverImage ?? null,
        coverImageAlt: data.coverImageAlt ?? "",
        coverImagePosition: data.coverImagePosition ?? DEFAULT_COVER_POSITION,
        body: data.body ?? null,
        tags: data.tags ?? [],
        status: data.status ?? "draft",
      });
      setUploadedAssets(data.uploadedAssets ?? []);
      slugManuallyEditedRef.current = true;
    }
  }
} catch (err) {
}

        }
        hasRestoredRef.current = true;
        return;
      }
    }
      // EDIT mode - check localStorage first, then Firebase

    // ADMIN OVERSIGHT → Skip ALL local restore
    if (
      isAdmin &&
      articleAuthorIdRef.current &&
      articleAuthorIdRef.current !== currentAuthUser.uid
    ) {
      hasRestoredRef.current = true;
      return;
    }
  
    // Check localStorage first
    const raw = localStorage.getItem(localKey);

      if (raw) {
        try {
          const draft = JSON.parse(raw);
          setArticleData({
            title: draft.title ?? "",
            slug: draft.slug ?? "",
            metaDescription: draft.metaDescription ?? "",
            coverImage: draft.coverImage ?? null,
            coverImageAlt: draft.coverImageAlt ?? "",
            coverImagePosition: draft.coverImagePosition ?? DEFAULT_COVER_POSITION,
            body: draft.body ?? null,
            tags: draft.tags ?? [],
            status: "draft",
          });
          setUploadedAssets(draft.uploadedAssets ?? []);
          hasRestoredRef.current = true;
          return;
        } catch (err) {
        }
        
      } 

      // If no local draft, try Firebase
      try {
        const snap = await getDoc(doc(db, "articles", articleId));
        
        if (snap.exists()) {
          const data = snap.data();
          articleAuthorIdRef.current = data.authorId ?? null;

           // EDGE CASE 1 — ownership validation
        const isForeignArticle = data.authorId !== currentAuthUser.uid;

if (isForeignArticle && !isAdmin) {
  return;
}

if (isForeignArticle && isAdmin) {
}


          // Decide whether remote doc actually contains real content
          const remoteHasContent =
            Boolean(data.title) ||
            Boolean(data.body) ||
            Boolean(data.slug) ||
            Boolean(data.metaDescription) ||
            (Array.isArray(data.tags) && data.tags.length > 0) ||
            (Array.isArray(data.uploadedAssets) && data.uploadedAssets.length > 0) ||
            (data.coverImage && data.coverImage !== null);

          if (remoteHasContent) {
            setArticleData({
              title: data.title ?? "",
              slug: data.slug ?? "",
              metaDescription: data.metaDescription ?? "",
              coverImage: data.coverImage ?? null,
              coverImageAlt: data.coverImageAlt ?? "",
              coverImagePosition: data.coverImagePosition ?? DEFAULT_COVER_POSITION,
              body: data.body ?? null,
              tags: data.tags ?? [],
              status: data.status ?? "draft",
            });
            setUploadedAssets(data.uploadedAssets ?? []);
          }
        }
      } catch (err) {
      }
      
      hasRestoredRef.current = true;
    };

    if (!hasRestoredRef.current) {
      restore();
    }
  }, [currentAuthUser, articleReady, mode, articleIdState]);

const getAuthorPayload = () => {
  if (!authorSnapshotRef.current) return {};
  return {
    authorName: authorSnapshotRef.current.authorName,
    authorInitials: authorSnapshotRef.current.authorInitials,
  };
};

  // Server autosave function
  const autosaveToServer = useCallback(
    async (force = false, awaitConfirm = false) => {
      if (!hasRestoredRef.current || !currentAuthUser || !articleReady) {
        return;
      }

      const articleId = articleIdRef.current;
      if (!articleId) {
        return;
      }

      const data = articleDataRef.current;

      if (!force && !data.title && !data.body && !data.coverImage) {
        return;
      }

      setAutosaving(true);

      const articleRef = doc(db, "articles", articleId);

      const cleanSlug = sanitizeSlug(articleData.slug);

  
      try {
        await setDoc(
        articleRef,
        {
          ...data,
          authorId: resolveAuthorId(),
          ...getAuthorPayload(),
          updatedAt: new Date(),
          autosaved: true,
        },
        { merge: true }
      );

      const key = getAutosaveKey(currentAuthUser.uid, articleId);
      localStorage.removeItem(key);

        // Optional confirmation read (used by preview)
        if (awaitConfirm) {
          await getDoc(articleRef);
        }

        setLastServerSave(Date.now());
      } catch (err) {
        throw err;
      } finally {
        setAutosaving(false);
      }
    },
    [currentAuthUser, articleReady]
  );

  // Periodic backup autosave
  useEffect(() => {
    if (!currentAuthUser) return;

    setNextServerSaveAt(Date.now() + BACKUP_AUTOSAVE_INTERVAL);

    backupIntervalRef.current = setInterval(() => {
      autosaveToServer();
      setNextServerSaveAt(Date.now() + BACKUP_AUTOSAVE_INTERVAL);
    }, BACKUP_AUTOSAVE_INTERVAL);

    return () => {
      if (backupIntervalRef.current) {
        clearInterval(backupIntervalRef.current);
      }
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

useEffect(() => {
  if (!currentAuthUser) return;

  const currentUid = currentAuthUser.uid;

  if (
    prevUserIdRef.current &&
    prevUserIdRef.current !== currentUid
  ) {
    authorSnapshotRef.current = null;
    clearEditorState();

    articleIdRef.current = null;
    setArticleIdState(null);
    setArticleReady(false);
  }

  prevUserIdRef.current = currentUid;
}, [currentAuthUser?.uid, clearEditorState]);


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

    const missing = [];
    if (!title.trim()) missing.push("Title");
    if (!slug.trim()) missing.push("Slug");
    if (!body) missing.push("Content");

    if (missing.length > 0) {
      alert(`You need to fill in:\n- ${missing.join("\n- ")}`);
      return;
    }

    try {
      // FORCE save + CONFIRM
      await autosaveToServer(true, true);

      window.open(
        `/author/articles/preview/${articleIdRef.current}`,
        "_blank",
        "noopener,noreferrer"
      );
    } catch {
      alert("Preview failed — could not save article.");
    }
  };

  const resetForm = useCallback(() => {
    hasRestoredRef.current = false;
    setArticleReady(false);
    
    setArticleData({
      title: "",
      slug: "",
      metaDescription: "",
      coverImage: null,
      coverImageAlt: "",
      coverImagePosition: DEFAULT_COVER_POSITION,
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
      setArticleIdState(newId);
      localStorage.setItem(getActiveArticleIdKey(currentAuthUser.uid), newId);
    }

    setArticleReady(true);
  }, [currentAuthUser]);

  

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
          authorId: resolveAuthorId(),
          ...getAuthorPayload(),
          updatedAt: serverTimestamp(),

          // 👇 ADD THIS LOGIC
          ...(articleData.status === "published" && {
            publishedAt: serverTimestamp(),
          }),
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
              }
            })
          );
        }
      }

      setSuccessMessage(
        hasSavedOnceRef.current ? "Article updated successfully!" : "Article created successfully!"
      );
      
      setShowSuccessPanel(true);

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
      setErrors({ general: err.message || "Failed to save article." });
    } finally {
      setSaving(false);
    }
  };

  const timeUntilNextSave = nextServerSaveAt ? Math.max(0, nextServerSaveAt - now) : null;

  // Loading states
  if (!authReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-48 h-2 bg-[#E0D6C7] rounded-full overflow-hidden">
          <div className="h-full w-full animate-pulse bg-[#4A3820]" />
        </div>
        <p className="mt-4 text-[#4A3820] font-medium text-lg font-sans!">
          Loading editor…
        </p>
      </div>
    );
  }

  if (role !== "admin" && role !== "author") {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans!">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#4A3820] mb-4 font-sans!">
            Access Denied
          </h1>
          <p className="text-[#4A3820]/70 font-sans!">
            Log in as author to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 min-h-screen pb-32 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#4A3820] mb-6 text-center font-sans!">
          {mode === "edit" ? "Edit Article" : "Create New Article"}
        </h1>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        {showSuccessPanel && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md text-center">
              <h2 className="text-2xl font-bold text-[#4A3820] mb-4 font-sans!">
                Saved Successfully
              </h2>
              <p className="text-[#4A3820] mb-6 font-sans!">
                Your article has been saved. What would you like to do next?
              </p>

              <div className="flex flex-col gap-3">
                <button
                onClick={() => {
                  setShowSuccessPanel(false);
                  window.location.href = isAdminOversight
                    ? "/admin/articles"
                    : "/author/articles";
                }}
                className="w-full py-3 bg-[#4A3820] text-white rounded-lg hover:bg-[#3A2D18] transition font-sans!"
              >
                {isAdminOversight ? "Go to All Articles" : "Go to My Articles"}
              </button>


                <button
                  onClick={() => setShowSuccessPanel(false)}
                  className="w-full py-3 border border-[#4A3820] text-[#4A3820] rounded-lg hover:bg-[#F0E8DB] transition font-sans!"
                >
                  Keep Editing
                </button>
              </div>
            </div>
          </div>
        )}

        {errors.general && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {errors.general}
          </div>
        )}

        <div className="bg-[#F0E8DB] border border-[#D8CDBE] rounded-lg shadow-md p-6 sm:p-8">
          <h2 className="text-2xl font-medium text-[#4A3820] mb-4 font-sans!">
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
                onChange={(e) => {
                    slugManuallyEditedRef.current = true;
                    updateArticleData({ slug: e.target.value });
                  }}
                  onBlur={() => {
                updateArticleData({ slug: sanitizeSlug(slug) });
              }}
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
          {articleReady && articleIdRef.current && (
          <CoverUpload
            value={coverImage}
            articleId={articleIdRef.current}
            position={articleData.coverImagePosition}
            onPositionChange={(pos) => updateArticleData({ coverImagePosition: pos })}
            onChange={(url) => {
              updateArticleData({ coverImage: url });
              if (url) {
                setUploadedAssets(prev =>
                  prev.includes(url) ? prev : [...prev, url]
                );
              }
            }}
          />
        )}


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
                  disabled={autosaving}
                  onClick={handlePreview}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#4A3820] text-white rounded-md hover:bg-[#3A2D18] transition font-sans!"
                  title="Preview article"
                >
                  {autosaving ? "Saving…" : "Preview"}
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