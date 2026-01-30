"use client";

import { useEffect } from "react";

export default function TrackRead({ articleId }: { articleId: string }) {
  useEffect(() => {
    const key = `read:${articleId}`;

    console.log("📊 TrackRead Component:", {
      articleId,
      localStorageKey: key,
      hasExistingRecord: !!localStorage.getItem(key),
      timestamp: new Date().toISOString(),
    });

    // Already tracked?
    if (localStorage.getItem(key)) {
      console.log(`✅ Already tracked read for article: ${articleId}`);
      return;
    }

    // Mark in localStorage BEFORE calling API (prevents double-fires)
    localStorage.setItem(key, "1");
    console.log(`📝 Stored read marker in localStorage: ${key}`);

    const trackRead = async () => {
      try {
        const response = await fetch(`/api/articles/${articleId}/read`, {
          method: "POST",
        });

        let data = null;

        // Try parsing JSON safely
        try {
          data = await response.json();
        } catch {
          console.error("⚠️ API returned non-JSON response");
        }

        console.log(`📨 API Response (${response.status}):`, {
          success: data?.success,
          articleId,
          responseTime: new Date().toISOString(),
        });

        // Handle server-reported errors
        if (!response.ok) {
          console.error(`❌ API Error for ${articleId}:`, data);
        }
      } catch (error: any) {
        console.error(`🚨 Fetch Error for article ${articleId}:`, {
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    };

    trackRead();
  }, [articleId]);

  return null;
}
