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

export default function DashboardArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filtered, setFiltered] = useState<Article[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const qArticles = query(
          collection(db, "articles"),
          where("status", "!=", "draft-hidden"),
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
    };

    load();
  }, []);

  // Refresh articles after successful deletion
  const handleDeleteSuccess = () => {
    // Re-fetch articles
    const refreshArticles = async () => {
      try {
        const qArticles = query(
          collection(db, "articles"),
          where("status", "!=", "draft-hidden"),
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

    refreshArticles();
  };

  // Basic search (title + tags)
  useEffect(() => {
    if (!search.trim()) {
      setFiltered(articles);
      return;
    }

    const lower = search.toLowerCase();

    setFiltered(
      articles.filter((art) => {
        return (
          art.title?.toLowerCase().includes(lower) ||
          art.slug?.toLowerCase().includes(lower) ||
          art.tags?.some((t) => t.toLowerCase().includes(lower))
        );
      })
    );
  }, [search, articles]);

  // Updated loading state UI
  if (loading) {
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
              href="/dashboard/articles/new"
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

          {/* LIST CONTAINER */}
          <div className="max-h-screen overflow-y-auto pr-2">
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