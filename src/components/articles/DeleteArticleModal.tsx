"use client";

import { deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Article } from "@/types/Article";
import { useState, useEffect } from "react";

interface DeleteArticleModalProps {
  open: boolean;
  onClose: () => void;
  article: Article | null;
  onSuccess?: (message: string) => void; // New prop for success callback
}

export default function DeleteArticleModal({
  open,
  onClose,
  article,
  onSuccess,
}: DeleteArticleModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  if (!open) {
    setIsDeleting(false);
    setError(null);
  }
}, [open]);

  if (!open || !article) return null;

const handleDelete = async () => {
  if (!article || isDeleting) return;

  setIsDeleting(true);
  setError(null);

  try {
    const res = await fetch("/api/articles/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId: article.id }),
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);
      throw new Error(errorBody?.error || "Delete failed");
    }

    onSuccess?.(`Article "${article.title}" deleted successfully.`);
    onClose();
  } catch (err) {
    console.error("Delete failed:", err);
    setError(err instanceof Error ? err.message : "Failed to delete article");
  } finally {
    setIsDeleting(false); // 👈 insurance policy
  }
};



  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl max-w-sm w-full shadow-lg border border-[#D8CDBE]">
        <h2 className="text-2xl font-bold text-[#4A3820] mb-4 font-sans!">
          Delete Article
        </h2>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <p className="text-[#4A3820]/80 mb-6">
          Are you sure you want to delete <strong>{article.title}</strong>?
          This cannot be undone.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg border border-[#CABAA2] text-[#4A3820] font-sans! disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`px-4 py-2 rounded-lg font-semibold font-sans! flex items-center justify-center gap-2
              ${isDeleting
                ? "bg-red-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 text-white"
              }`}
          >
            {isDeleting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting…
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}