"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import LatestBlogs from "@/components/blog/BlogList";

interface FavouriteItem {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  excerpt: string;
}

export default function FavouritesPage() {
  const { user, authReady } = useAuth();
  const [favourites, setFavourites] = useState<FavouriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchFavourites = async () => {
      setLoading(true);

      const favCol = collection(db, "favourites", user.uid, "items");
      const snapshot = await getDocs(favCol);

      const favs = snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<FavouriteItem, "id">;
        return { id: doc.id, ...data };
      });

      setFavourites(favs);
      setLoading(false);
    };

    fetchFavourites();
  }, [user]);

  const handleRemoveFavourite = (articleId: string) => {
  setFavourites((prev) => prev.filter((f) => f.id !== articleId));
};


  if (!authReady || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-48 h-2 bg-[#E0D6C7] rounded-full overflow-hidden">
          <div className="h-full w-full animate-pulse bg-[#4A3820]"></div>
        </div>
        <p className="mt-4 text-[#4A3820] font-medium text-lg text-center font-sans!">
          Loading your saved gems…
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#4A3820] text-lg font-sans!">
        Please log in to view page
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-8 py-10">
      <h1 className="text-4xl font-cinzel text-[#4A3820] text-center mb-10">
        My Favourites
      </h1>

      {favourites.length === 0 ? (
        <p className="text-center text-gray-600">No favourites yet 👀</p>
      ) : (
        <LatestBlogs
          articles={favourites.map((f) => ({
            id: f.id,
            title: f.title,
            slug: f.slug,
            coverImage: f.coverImage,
            excerpt: f.excerpt,
          }))}
          onRemoveFavourite={handleRemoveFavourite}
        />

      )}
    </div>
  );
}
