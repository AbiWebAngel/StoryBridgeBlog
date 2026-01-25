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
  const { role, authReady } = useAuth();
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
        setLoading(false);
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

  const handleDeleteSuccess = async () => {
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

  useEffect(() => {
    let result = [...articles];

    if (search.trim()) {
      const lower = search.toLowerCase();
      result = result.filter((art) =>
        art.title?.toLowerCase().includes(lower) ||
        art.slug?.toLowerCase().includes(lower) ||
        art.tags?.some((t) => t.toLowerCase().includes(lower))
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((art) => art.status === statusFilter);
    }

    result.sort((a, b) => {
      const aTime = a.updatedAt?.toMillis?.() ?? 0;
      const bTime = b.updatedAt?.toMillis?.() ?? 0;
      return dateSort === "newest" ? bTime - aTime : aTime - bTime;
    });

    setFiltered(result);
  }, [articles, search, statusFilter, dateSort]);

  if (!authReady || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-48 h-2 bg-[#E0D6C7] rounded-full overflow-hidden">
          <div className="h-full w-full animate-pulse bg-[#4A3820]"></div>
        </div>
        <p className="mt-4 text-[#4A3820] font-medium text-lg text-center font-sans!">
          Loading articles...
        </p>
      </div>
    );
  }

  if (role !== "admin" && role !== "author") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 font-sans!">
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
    <div className="px-4 sm:px-6 min-h-screen pb-32 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#4A3820] mb-6 text-center font-sans!">
          My Articles
        </h1>
        <div className="bg-[#F0E8DB] border border-[#D8CDBE] rounded-lg shadow-md p-4 sm:p-6 md:p-8">
          {/* PAGE HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-medium text-[#4A3820] font-sans!">
              Manage Articles
            </h2>
            <a
              href="/author/articles/new"
              className="px-4 py-2 rounded-lg bg-[#4A3820] text-white font-semibold text-base hover:bg-[#6B4B2B] transition font-sans! text-center w-full sm:w-auto"
            >
              + New Article
            </a>
          </div>

          <hr className="border-[#D8CDBE] mb-6 sm:mb-8" />

          {/* SEARCH */}
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 mb-4 sm:mb-6 rounded-lg border border-[#D8CDBE] bg-white focus:outline-none focus:ring-2 focus:ring-[#CABAA2] text-base sm:text-lg font-sans!"
          />
          
          {/* FILTERS */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="p-3 rounded-lg border border-[#D8CDBE] bg-white focus:outline-none focus:ring-2 focus:ring-[#CABAA2] text-base sm:text-lg font-sans!"
            >
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            {/* Date */}
            <select
              value={dateSort}
              onChange={(e) => setDateSort(e.target.value as any)}
              className="p-3 rounded-lg border border-[#D8CDBE] bg-white focus:outline-none focus:ring-2 focus:ring-[#CABAA2] text-base sm:text-lg font-sans!"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>

          {/* LIST CONTAINER */}
          <div className="pr-0 sm:pr-2">
            {filtered.length === 0 ? (
              <div className="text-center py-8 sm:py-10 text-[#4A3820]/60 font-sans!">
                No articles found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
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