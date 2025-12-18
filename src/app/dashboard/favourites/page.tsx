"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";

interface Post {
  id: string;
  title: string;
}

export default function FavouritesPage() {
  const { user } = useAuth();
  const [favourites, setFavourites] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchFavourites = async () => {
      setLoading(true);
      const favCol = collection(db, "users", user.uid, "favourites");
      const snapshot = await getDocs(favCol);
      const favs = snapshot.docs.map(doc => {
      const data = doc.data() as Omit<Post, "id">; // Exclude id from the spread
        return { id: doc.id, ...data };
        });

      setFavourites(favs);
      setLoading(false);
    };

    fetchFavourites();
  }, [user]);

  const removeFavourite = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "favourites", id));
    setFavourites(favourites.filter(f => f.id !== id));
  };

 if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#4A3820]">
        Please log in to view your favourites.
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 font-sans">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-extrabold text-[#4A3820] mb-6 text-center !font-sans">
          My Favourites
        </h1>
      </div>
    </div>
  );
}
