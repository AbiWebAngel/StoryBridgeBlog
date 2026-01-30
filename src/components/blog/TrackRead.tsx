"use client";

import { useEffect } from "react";

export default function TrackRead({ articleId }: { articleId: string }) {
  useEffect(() => {
    const key = `read:${articleId}`;

    // Already tracked?
    if (localStorage.getItem(key)) {
      return;
    }

    // Mark in localStorage BEFORE calling API (prevents double-fires)
    localStorage.setItem(key, "1");

    const trackRead = async () => {
      try {
        const response = await fetch(`/api/articles/${articleId}/read`, {
          method: "POST",
        });

        // Handle server-reported errors
        if (!response.ok) {
          // Optional: Remove the localStorage key if tracking failed
          localStorage.removeItem(key);
        }
      } catch (error) {
        // Optional: Remove the localStorage key if tracking failed
        localStorage.removeItem(key);
      }
    };

    trackRead();
  }, [articleId]);

  return null;
}