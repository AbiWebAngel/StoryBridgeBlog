"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";

interface Props {
  articleId: string;
  title: string;
  slug?: string; // ✅ optional
  coverImage: string;
  excerpt: string;
  onUnfavourite?: (id: string) => void;
}


export default function FavouriteHeart({
  articleId,
  title,
  slug,
  coverImage,
  excerpt,
  onUnfavourite,
}: Props) {

  const { user } = useAuth();
  const [isFavourite, setIsFavourite] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

useEffect(() => {
  if (!mounted || !user) {
    setIsFavourite(false);
    return;
  }

  const checkFavourite = async () => {
    const ref = doc(db, "favourites", user.uid, "items", articleId);
    const snap = await getDoc(ref);
    setIsFavourite(snap.exists());
  };

  checkFavourite();
}, [mounted, user, articleId]);


  const toggleFavourite = async (e: React.MouseEvent) => {
    e.preventDefault(); // ⛔ stop Link navigation
    e.stopPropagation();

    if (!user) {
      alert("Please log in to save favourites");
      return;
    }

    if (!user) {
        alert("Please log in to save favourites");
        return;
        }

        if (!title || !coverImage) {
        console.warn("Missing favourite fields:", { title, coverImage });
        return;
      }


        const ref = doc(db, "favourites", user.uid, "items", articleId);



    if (isFavourite) {
      await deleteDoc(ref);
      setIsFavourite(false);
      onUnfavourite?.(articleId);
    } else {
      await setDoc(
      ref,
      {
        id: articleId,
        title: title ?? null,
        slug: slug ?? null,        // ✅ optional, safe
        coverImage: coverImage ?? null,
        excerpt: excerpt ?? "",
        createdAt: new Date(),
      },
      { merge: true }
    );

      setIsFavourite(true);
    }

  };

if (!mounted) {
  return <div className="w-8 h-8" />;
}

  return (
  <div
    role="button"
    aria-label="Toggle favourite"
    onClick={toggleFavourite}
    className="w-8 h-8 cursor-pointer"
  >
    <Image
      src={
        isFavourite
          ? "/assets/icons/home/heart-filled.png"
          : "/assets/icons/home/heart.png"
      }
      alt="Favourite"
      width={32}
      height={32}
    />
  </div>
);

}
