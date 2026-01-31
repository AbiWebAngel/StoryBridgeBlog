"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Timestamp } from "firebase/firestore";

interface AnalyticsArticle {
  id: string;
  title: string;
  readCount?: number;
  updatedAt: Timestamp;
  status: "published" | "draft";
  authorName?: string;
  authorId?: string;
}

export default function AdminAnalyticsPage() {
  const { role, authReady } = useAuth();
  const router = useRouter();

  const [articles, setArticles] = useState<AnalyticsArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<AnalyticsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"title" | "readCount" | "updatedAt" | "authorName">("readCount");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const fetch = async () => {
      if (!authReady) return;

      try {
        const ref = collection(db, "articles");
        // 👉 ONLY PUBLISHED ARTICLES
        const q = query(
          ref, 
          where("status", "==", "published"),
          orderBy("readCount", "desc")
        );

        const snap = await getDocs(q);

        const articlesList = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as AnalyticsArticle[];

        setArticles(articlesList);
        setFilteredArticles(articlesList);
      } catch (err) {
        console.error("Admin analytics fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [authReady]);

  // Apply search filter
  useEffect(() => {
    if (!search.trim()) {
      setFilteredArticles(articles);
      return;
    }

    const lower = search.toLowerCase();
    const filtered = articles.filter((article) => {
      return (
        article.title?.toLowerCase().includes(lower) ||
        article.id?.toLowerCase().includes(lower) ||
        article.authorName?.toLowerCase().includes(lower)
      );
    });

    setFilteredArticles(filtered);
  }, [search, articles]);

  const totalReads = filteredArticles.reduce(
    (sum, a) => sum + (a.readCount || 0),
    0
  );

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    let A: any = a[sortKey];
    let B: any = b[sortKey];

    if (sortKey === "updatedAt") {
      A = a.updatedAt?.toMillis() || 0;
      B = b.updatedAt?.toMillis() || 0;
    }

    // Handle undefined values
    if (A === undefined || A === null) A = "";
    if (B === undefined || B === null) B = "";

    if (A < B) return sortDir === "asc" ? -1 : 1;
    if (A > B) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  if (!authReady || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-48 h-2 bg-[#E0D6C7] rounded-full overflow-hidden">
          <div className="h-full w-full animate-pulse bg-[#4A3820]"></div>
        </div>
        <p className="mt-4 text-[#4A3820] font-medium text-lg text-center font-sans!">
          Loading admin analytics...
        </p>
      </div>
    );
  }

  if (role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 font-sans!">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#4A3820] mb-4 font-sans!">
            Access Denied
          </h1>
          <p className="text-[#4A3820]/70 font-sans!">
            Admin access required.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 min-h-screen pb-32 font-sans!">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#4A3820] mb-6 text-center font-sans!">
          Admin Analytics
        </h1>
        
        {/* Container matching admin/articles design */}
        <div className="bg-[#F0E8DB] border border-[#D8CDBE] rounded-lg shadow-md p-6 sm:p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-medium text-[#4A3820] font-sans!">
              Overview
            </h2>
          </div>

          <hr className="border-[#D8CDBE] mb-8" />

          {/* GLOBAL STATS - Updated to match design */}
          <div className="flex justify-center mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white border border-[#D8CDBE] rounded-lg p-6 text-center">
                <div className="text-sm text-[#4A3820]/70 font-sans!">Total Reads</div>
                <div className="mt-2 text-3xl font-bold text-[#4A3820] font-sans!">
                  {totalReads}
                </div>
              </div>

              <div className="bg-white border border-[#D8CDBE] rounded-lg p-6 text-center">
                <div className="text-sm text-[#4A3820]/70 font-sans!">Published Articles</div>
                <div className="mt-2 text-3xl font-bold text-[#4A3820] font-sans!">
                  {filteredArticles.length}
                </div>
              </div>

              <div className="bg-white border border-[#D8CDBE] rounded-lg p-6 text-center">
                <div className="text-sm text-[#4A3820]/70 font-sans!">Avg per Article</div>
                <div className="mt-2 text-3xl font-bold text-[#4A3820] font-sans!">
                  {Math.round(totalReads / (filteredArticles.length || 1))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABLE - Simplified for analytics */}
        <div className="bg-[#F0E8DB] border border-[#D8CDBE] rounded-lg shadow-md p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-medium text-[#4A3820] font-sans!">
              All Articles Performance
            </h2>
          </div>

          <hr className="border-[#D8CDBE] mb-6" />

          {/* SEARCH BAR */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input
              type="text"
              placeholder="Search articles by title, ID, or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 p-3 rounded-lg border border-[#D8CDBE] bg-white focus:outline-none focus:ring-2 focus:ring-[#CABAA2] text-base font-sans!"
            />
          </div>

          {filteredArticles.length === 0 ? (
            <div className="text-center py-10 text-[#4A3820]/60 font-sans!">
              {search 
                ? "No published articles found matching your search." 
                : "No published articles found."}
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="mt-4 block mx-auto text-[#4A3820] hover:text-[#6B4B2B] font-medium font-sans!"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto scrollable-description">
              <table className="min-w-full divide-y divide-[#D8CDBE]">
                <thead>
                  <tr>
                    <th
                      onClick={() => handleSort("title")}
                      className="px-4 py-3 text-left text-lg font-medium text-[#4A3820] uppercase tracking-wider font-sans! cursor-pointer select-none whitespace-nowrap"
                    >
                      <div className="flex items-center justify-between">
                        <span>Article</span>
                        <span className="ml-2">{sortKey === "title" && (sortDir === "asc" ? "↑" : "↓")}</span>
                      </div>
                    </th>

                    <th
                      onClick={() => handleSort("authorName")}
                      className="px-4 py-3 text-left text-lg font-medium text-[#4A3820] uppercase tracking-wider font-sans! cursor-pointer select-none whitespace-nowrap"
                    >
                      <div className="flex items-center justify-between">
                        <span>Author</span>
                        <span className="ml-2">{sortKey === "authorName" && (sortDir === "asc" ? "↑" : "↓")}</span>
                      </div>
                    </th>

                    <th
                      onClick={() => handleSort("readCount")}
                      className="px-4 py-3 text-left text-lg font-medium text-[#4A3820] uppercase tracking-wider font-sans! cursor-pointer select-none whitespace-nowrap text-center"
                    >
                      <div className="flex items-center justify-between">
                        <span>Views</span>
                        <span className="ml-2">{sortKey === "readCount" && (sortDir === "asc" ? "↑" : "↓")}</span>
                      </div>
                    </th>

                    <th
                      onClick={() => handleSort("updatedAt")}
                      className="px-4 py-3 text-left text-lg font-medium text-[#4A3820] uppercase tracking-wider font-sans! cursor-pointer select-none whitespace-nowrap text-center"
                    >
                      <div className="flex items-center justify-between">
                        <span>Last Updated</span>
                        <span className="ml-2">{sortKey === "updatedAt" && (sortDir === "asc" ? "↑" : "↓")}</span>
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#D8CDBE]">
                  {sortedArticles.map((a) => (
                    <tr
                      key={a.id}
                      onClick={() => router.push(`/admin/analytics/${a.id}`)}
                      className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-px pb-0"
                    >
                      <td className="px-4 py-4">
                        <div className="text-base text-[#4A3820] font-sans!">
                          {a.title || "Untitled"}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="text-base text-[#4A3820] font-sans!">
                          {a.authorName || "Unknown"}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="text-base text-[#4A3820] text-center font-sans!">
                          {a.readCount || 0}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="text-base text-center text-[#4A3820] font-sans!">
                          {a.updatedAt ? new Date(a.updatedAt.toMillis()).toLocaleDateString("en-GB", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }) : "N/A"}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Results count */}
          {filteredArticles.length > 0 && (
            <div className="mt-6 pt-6 border-t border-[#D8CDBE]">
              <p className="text-base! text-[#4A3820]/70 font-sans!">
                Showing {filteredArticles.length} published articles
                {search && ` matching "${search}"`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}