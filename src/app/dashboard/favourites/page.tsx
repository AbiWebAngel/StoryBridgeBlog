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

  if (loading) return <p>Loading favourites...</p>;

  return (
    <div>
      <h1 className="text-2xl font-cinzel mb-4">Your Favourites</h1>
      {favourites.length === 0 ? (
        <p>No favourites yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {favourites.map(fav => (
            <li key={fav.id} className="p-4 border rounded flex justify-between items-center bg-white">
              <span>{fav.title}</span>
              <button
                onClick={() => removeFavourite(fav.id)}
                className="bg-[#805C2C] text-white px-3 py-1 rounded hover:bg-[#D1BDA1]"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
