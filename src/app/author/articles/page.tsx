"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import ArticleCard from "@/components/articles/ArticleCard";
import DeleteArticleModal from "@/components/articles/DeleteArticleModal";
import { Article } from "@/types/Article";
import { getAuth } from "firebase/auth";
import { useAuth } from "@/context/AuthContext";


export default function AuthorArticlesPage() {
  const { role, authReady  } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [filtered, setFiltered] = useState<Article[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [dateSort, setDateSort] = useState<"newest" | "oldest">("newest");
  

useEffect(() => {
  const auth = getAuth();

  const unsub = auth.onAuthStateChanged(async (user) => {
    if (!user) {
      setLoading(false); // user is logged out → stop loader
      return;
    }

    try {
      const qArticles = query(
        collection(db, "articles"),
        where("authorId", "==", user.uid),
        orderBy("updatedAt", "desc")
      );

      const snap = await getDocs(qArticles);

      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as Article[];

      setArticles(list);
      setFiltered(list);
    } catch (err) {
      console.error("Failed loading articles:", err);
    } finally {
      setLoading(false);
    }
  });

  return () => unsub();
}, []);

  // Refresh articles after successful deletion
const handleDeleteSuccess = async () => {
  // 1️⃣ Close modal immediately
  setDeleteModalOpen(false);
  setSelectedArticle(null);

  try {
    const user = getAuth().currentUser;
    if (!user) return;

    const qArticles = query(
      collection(db, "articles"),
      where("authorId", "==", user.uid),
      orderBy("updatedAt", "desc")
    );

    const snap = await getDocs(qArticles);

    const list = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Article[];

    setArticles(list);
    setFiltered(list);
  } catch (err) {
    console.error("Failed refreshing articles:", err);
  }
};


  // Basic search (title + tags)
useEffect(() => {
  let result = [...articles];

  // Text search
  if (search.trim()) {
    const lower = search.toLowerCase();
    result = result.filter((art) =>
      art.title?.toLowerCase().includes(lower) ||
      art.slug?.toLowerCase().includes(lower) ||
      art.tags?.some((t) => t.toLowerCase().includes(lower))
    );
  }

  // Status filter
  if (statusFilter !== "all") {
    result = result.filter((art) => art.status === statusFilter);
  }

  // Date sort
  result.sort((a, b) => {
    const aTime = a.updatedAt?.toMillis?.() ?? 0;
    const bTime = b.updatedAt?.toMillis?.() ?? 0;
    return dateSort === "newest" ? bTime - aTime : aTime - bTime;
  });

  setFiltered(result);
}, [articles, search, statusFilter, dateSort]);



  // Updated loading state UI
  if (!authReady || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-48 h-2 bg-[#E0D6C7] rounded-full overflow-hidden">
          <div className="h-full w-full animate-pulse bg-[#4A3820]"></div>
        </div>
        <p className="mt-4 text-[#4A3820] font-medium text-lg font-sans!">
          Loading articles...
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
      {/* Keep page background neutral if you want */}
      
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#4A3820] mb-6 text-center font-sans!">
          My Articles
        </h1>
        <div className="bg-[#F0E8DB] border border-[#D8CDBE] rounded-lg shadow-md p-6 sm:p-8">

          {/* PAGE HEADER */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-medium text-[#4A3820] mb-4 font-sans!">
              Manage Articles
            </h2>

            <a
              href="/author/articles/new"
              className="px-4 py-2 rounded-lg bg-[#4A3820] text-white font-semibold text-base! hover:bg-[#6B4B2B] transition font-sans!"
            >
              + New Article
            </a>
          </div>

          <hr className="border-[#D8CDBE] mb-8" />

          {/* SEARCH */}
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 mb-6 rounded-lg border border-[#D8CDBE] bg-white focus:outline-none focus:ring-2 focus:ring-[#CABAA2] text-lg font-sans!"
          />
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
        
        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="p-3 rounded-lg border border-[#D8CDBE] bg-white focus:outline-none focus:ring-2 focus:ring-[#CABAA2] text-lg font-sans!"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>

        {/* Date */}
        <select
          value={dateSort}
          onChange={(e) => setDateSort(e.target.value as any)}
          className="p-3 rounded-lg border border-[#D8CDBE] bg-white focus:outline-none focus:ring-2 focus:ring-[#CABAA2] text-lg font-sans!"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

          {/* LIST CONTAINER */}
         <div className="pr-2">
            {filtered.length === 0 ? (
              <div className="text-center py-10 text-[#4A3820]/60 font-sans!">
                No articles found.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {filtered.map((art) => (
                  <ArticleCard
                    key={art.id}
                    article={art}
                    onDelete={() => {
                      setSelectedArticle(art);
                      setDeleteModalOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* DELETE MODAL */}
        <DeleteArticleModal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          article={selectedArticle}
          onSuccess={handleDeleteSuccess}
        />
      </div>
    </div>
  );
}