"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import ArticleCard from "@/components/articles/ArticleCard";
import DeleteArticleModal from "@/components/articles/DeleteArticleModal";
import { Article } from "@/types/Article";
import { Eye, Pencil, Trash2, Loader2 } from "lucide-react";



// Define article status types
type ArticleStatus = "published" | "draft";

// Extend Article type for admin view
interface AdminArticle extends Article {
  status: ArticleStatus;
  authorName?: string;
  authorId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  views?: number;
}

// Status badge component matching your design
const StatusBadge = ({ status }: { status: ArticleStatus }) => {
  const getStatusColor = () => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 border-green-200";
      case "draft":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "published":
        return "Published";
      case "draft":
        return "Draft"; 
      default:
        return status;
    }
  };

    return (
    <span
      className={`px-3 py-1 text-base! font-medium rounded-full border ${getStatusColor()} font-sans! group-hover:bg-transparent group-hover:text-white group-hover:border-white transition-colors`}
    >
      {getStatusText()}
    </span>
  );

};

// Filter options
type StatusFilter = "all" | ArticleStatus;
type SortOption = "newest" | "oldest" | "title-asc" | "title-desc" | "views-desc";

export default function AdminArticlesPage() {
  const { user, role, authReady } = useAuth();
  const router = useRouter();
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<AdminArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [selectedArticle, setSelectedArticle] = useState<AdminArticle | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [draftConflictUsers, setDraftConflictUsers] = useState<any[]>([]);
  const [pendingEditArticleId, setPendingEditArticleId] = useState<string | null>(null);
  const [showDraftWarning, setShowDraftWarning] = useState(false);


  // Fetch all articles
  useEffect(() => {
    const fetchArticles = async () => {
      if (role !== "admin") return;

      try {
        setLoading(true);
        const articlesRef = collection(db, "articles");
        const q = query(articlesRef, orderBy("updatedAt", "desc"));
        const querySnapshot = await getDocs(q);

        const articlesList: AdminArticle[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AdminArticle[];

        setArticles(articlesList);
        setFilteredArticles(articlesList);
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    };

    if (role === "admin") {
      fetchArticles();
    }
  }, [role]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...articles];

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((article) => article.status === statusFilter);
    }

    // Apply search
    if (search.trim()) {
      const lower = search.toLowerCase();
      result = result.filter((art) => {
      return (
        art.title?.toLowerCase().includes(lower) ||
        art.metaDescription?.toLowerCase().includes(lower) ||
        art.tags?.some((t) => t.toLowerCase().includes(lower)) ||
        art.authorName?.toLowerCase().includes(lower)
      );
    });
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.updatedAt.toMillis() - a.updatedAt.toMillis();
        case "oldest":
          return a.updatedAt.toMillis() - b.updatedAt.toMillis();
        case "title-asc":
          return (a.title || "").localeCompare(b.title || "");
        case "title-desc":
          return (b.title || "").localeCompare(a.title || "");
        case "views-desc":
          return (b.views || 0) - (a.views || 0);
        default:
          return 0;
      }
    });

    setFilteredArticles(result);
  }, [articles, search, statusFilter, sortBy]);

  const handleDeleteSuccess = () => {
    // Re-fetch articles
    const refreshArticles = async () => {
      try {
        const articlesRef = collection(db, "articles");
        const q = query(articlesRef, orderBy("updatedAt", "desc"));
        const querySnapshot = await getDocs(q);

        const articlesList: AdminArticle[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AdminArticle[];

        setArticles(articlesList);
        setFilteredArticles(articlesList);
      } catch (err) {
        console.error("Failed refreshing articles:", err);
      }
    };

    refreshArticles();
  };

  const formatDate = (timestamp: Timestamp) => {
    return new Date(timestamp.toMillis()).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

const checkPendingDraftConflict = async (articleId: string) => {
  const usersRef = collection(db, "users");

  const q = query(
    usersRef,
    where("lastActiveArticleId", "==", articleId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));
};

  // Updated loading state UI
  if (loading || !authReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-48 h-2 bg-[#E0D6C7] rounded-full overflow-hidden">
          <div className="h-full w-full animate-pulse bg-[#4A3820]"></div>
        </div>
        <p className="mt-4 text-[#4A3820] font-medium text-lg font-sans!">
          Loading All articles...
        </p>
      </div>
    );
  }

  // Not admin state
  if (role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans!">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#4A3820] mb-4 font-sans!">
            Access Denied
          </h1>
          <p className="text-[#4A3820]/70 font-sans!">
            You need administrator privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 min-h-screen pb-32 font-sans!">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#4A3820] mb-6 text-center font-sans!">
          All Articles
        </h1>
        
        <div className="bg-[#F0E8DB] border border-[#D8CDBE] rounded-lg shadow-md p-6 sm:p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-medium text-[#4A3820] font-sans!">
              Manage All Articles
            </h2>

            <a
              href="/author/articles/new"
              className="px-4 py-2 rounded-lg bg-[#4A3820] text-white font-semibold text-base! hover:bg-black transition font-sans!"
            >
              + New Article
            </a>
          </div>

          <hr className="border-[#D8CDBE] mb-8" />

 
          {/* Stats Summary */}
          <div className="flex justify-center mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-xl w-full">
              <div className="bg-white border border-[#D8CDBE] rounded-lg p-4 text-center">
                <div className="text-sm text-[#4A3820]/70 font-sans!">Total</div>
                <div className="mt-1 text-2xl font-bold text-[#4A3820] font-sans!">
                  {articles.length}
                </div>
              </div>

              <div className="bg-white border border-[#D8CDBE] rounded-lg p-4 text-center">
                <div className="text-sm text-green-700 font-sans!">Published</div>
                <div className="mt-1 text-2xl font-bold text-green-700 font-sans!">
                  {articles.filter(a => a.status === "published").length}
                </div>
              </div>
            </div>
          </div>


          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {/* Search */}
            <input
              type="text"
              placeholder="Search articles by title, tags, or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 p-3 rounded-lg border border-[#D8CDBE] bg-white focus:outline-none focus:ring-2 focus:ring-[#CABAA2] text-base font-sans!"
            />

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="p-3 rounded-lg border border-[#D8CDBE] bg-white focus:outline-none focus:ring-2 focus:ring-[#CABAA2] text-base font-sans!"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="p-3 rounded-lg border border-[#D8CDBE] bg-white focus:outline-none focus:ring-2 focus:ring-[#CABAA2] text-base font-sans!"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title-asc">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
              <option value="views-desc">Most Views</option>
            </select>
          </div>
        </div>

        {/* Articles Container */}
        <div className="bg-[#F0E8DB] border border-[#D8CDBE] rounded-lg shadow-md p-6 sm:p-8">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-10 text-[#4A3820]/60 font-sans!">
              {search || statusFilter !== "all" 
                ? "No articles found matching your criteria." 
                : "No articles found."}
              {(search || statusFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                  className="mt-4 block mx-auto text-[#4A3820] hover:text-[#6B4B2B] font-medium font-sans!"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
    <div className="overflow-x-auto scrollable-description">
  <table className="min-w-full divide-y divide-[#D8CDBE]">
    <thead>
      <tr>
        <th className="px-4 py-3 text-left text-lg font-medium text-[#4A3820] uppercase tracking-wider font-sans!">
          Article
        </th>
        <th className="px-4 py-3 text-left text-lg font-medium text-[#4A3820] uppercase tracking-wider font-sans!">
          Author
        </th>
        <th className="px-4 py-3 text-left text-lg font-medium text-[#4A3820] uppercase tracking-wider font-sans!">
          Status
        </th>
        <th className="px-4 py-3 text-left text-lg font-medium text-[#4A3820] uppercase tracking-wider font-sans!">
          Updated
        </th>
        <th className="px-4 py-3 text-left text-lg font-medium text-[#4A3820] uppercase tracking-wider font-sans!">
          Views
        </th>
        <th className="px-4 py-3 text-left text-lg font-medium text-[#4A3820] uppercase tracking-wider font-sans!">
          Actions
        </th>
      </tr>
    </thead>

    <tbody className="divide-y divide-[#D8CDBE]">
      {filteredArticles.map((article) => (
     <tr
      key={article.id}
      onClick={() => {
        window.open(
          `/author/articles/preview/${article.id}`,
          "_blank",
          "noopener,noreferrer"
        );
      }}
      className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-px"
    >



          <td className="px-4 py-4">
            <div>
              <div className="font-medium text-lg text-[#4A3820] font-sans!">
                {article.title || "Untitled"}
              </div>

              <div className="text-base text-[#4A3820]/70 font-sans!">
                {article.metaDescription || "No meta description"}
              </div>

              {article.tags && article.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {article.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="bg-[#F0E8DB] border border-[#D8CDBE] text-[#4A3820] text-base! px-3 py-1 rounded-full font-medium font-sans!"
                    >
                      #{tag}
                    </span>
                  ))}

                  {article.tags.length > 4 && (
                    <span className="text-xs text-[#4A3820]/50 px-1 font-sans!">
                      +{article.tags.length - 4}
                    </span>
                  )}
                </div>
              )}
            </div>
          </td>

          <td className="px-4 py-4">
            <div className="text-base text-[#4A3820] font-sans!">
              {article.authorName || "Unknown"}
            </div>
          </td>

          <td className="px-4 py-4">
            <StatusBadge status={article.status} />
          </td>

          <td className="px-4 py-4">
            <div className="text-base text-[#4A3820] font-sans!">
              {formatDate(article.updatedAt)}
            </div>
          </td>

          <td className="px-4 py-4">
            <div className="text-base font-medium text-[#4A3820] font-sans!">
              {article.views || 0}
            </div>
          </td>

          <td className="px-4 py-4">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <a
              onClick={(e) => e.stopPropagation()}
              href={`/author/articles/preview/${article.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-[#D8CDBE] text-[#4A3820] hover:bg-[#EFE6D8] text-sm font-medium transition font-sans!"
              title="Preview article (opens in new tab)"
            >
              <Eye size={18} />
              <span className="hidden lg:inline">Preview</span>
            </a>


       <button
          disabled={pendingEditArticleId === article.id}
          onClick={async (e) => {
            e.stopPropagation();
            setPendingEditArticleId(article.id);

            try {
              const conflicts = await checkPendingDraftConflict(article.id);

              if (conflicts.length > 0) {
                setDraftConflictUsers(conflicts);
                setShowDraftWarning(true);
                return;
              }

              router.push(`/author/articles/edit/${article.id}`);
            } finally {
              // Only reset if we didn't navigate
              setPendingEditArticleId(null);
            }
          }}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-sm font-medium transition font-sans!
            ${
              pendingEditArticleId === article.id
                ? "border-[#D8CDBE] text-[#4A3820]/50 cursor-not-allowed"
                : "border-[#D8CDBE] text-[#4A3820] hover:bg-[#EFE6D8]"
            }
          `}
        >

           {pendingEditArticleId === article.id ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span className="hidden lg:inline">Checking…</span>
            </>
          ) : (
            <>
              <Pencil size={18} />
              <span className="hidden lg:inline">Edit</span>
            </>
          )}

          </button>


              <button
                onClick={(e) => {
                e.stopPropagation();
                  setSelectedArticle(article);
                  setDeleteModalOpen(true);
                }}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium transition font-sans!"
                title="Delete article"
              >
                <Trash2 size={18} />
                <span className="hidden lg:inline">Delete</span>
              </button>
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
                Showing {filteredArticles.length} of {articles.length} articles
              </p>
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

       {showDraftWarning && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-[#F0E8DB] max-w-md w-full rounded-lg border border-[#D8CDBE] p-6 shadow-xl">
      <h2 className="text-2xl font-bold text-[#4A3820] mb-3 font-sans!">
        Draft Conflict Detected
      </h2>

      <p className="text-[#4A3820] mb-4 text-base ">
        The article update you are trying to write will be <strong>overwritten</strong> by
        a pending draft currently open on the author’s machine.
      </p>

      <p className="text-[#4A3820] mb-4 text-base">
        Please ask the author to go to <strong>Dashboard → Write New Article</strong> and
        save their draft before continuing.
      </p>

      <div className="mb-4 text-xl text-[#4A3820]">
        Active draft detected for:
        <ul className="list-disc ml-6 mt-2">
          {draftConflictUsers.map(u => (
            <li key={u.id}>
              {u.firstName && u.lastName
                ? `${u.firstName} ${u.lastName}`
                : u.firstName
                ? u.firstName
                : u.email || u.id}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => {
            setShowDraftWarning(false);
            setPendingEditArticleId(null);
          }}
          className="px-4 py-2 rounded-md border border-[#D8CDBE] text-[#4A3820] font-sans!"
        >
          Cancel
        </button>

        <button
          onClick={() => {
            setShowDraftWarning(false);
            router.push(`/author/articles/edit/${pendingEditArticleId}`);
          }}
          className="px-4 py-2 rounded-md bg-red-600 text-white font-semibold font-sans!"
        >
          Edit Anyway
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}