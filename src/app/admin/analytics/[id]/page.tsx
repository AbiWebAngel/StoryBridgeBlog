"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, orderBy, query } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import DailyReadsChart from "@/components/analytics/DailyReadsChart";
import Link from "next/link";

function getDevice(ua = "") {
  ua = ua.toLowerCase();
  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) return "mobile";
  return "desktop";
}

export default function AdminArticleAnalytics() {
  const { id } = useParams();
  const router = useRouter();
  const { role, authReady } = useAuth();

  const articleId =
  typeof id === "string"
    ? id
    : Array.isArray(id)
    ? id[0]
    : undefined;

  const [daily, setDaily] = useState<Record<string, number>>({});
  const [devices, setDevices] = useState({ mobile: 0, desktop: 0 });
  const [sources, setSources] = useState<Record<string, number>>({});
  const [articleTitle, setArticleTitle] = useState<string>("");
  const [articleAuthor, setArticleAuthor] = useState<string>("");
  const [totalReads, setTotalReads] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!authReady) return;
      if (!articleId) return;

      try {
        // Get article details
        const articleRef = doc(db, "articles", articleId);
        let articleSnap;
        
        try {
          articleSnap = await getDoc(articleRef);
        } catch (e) {
          console.error("No permission to read article document", e);
          setLoading(false);
          return;
        }

        if (!articleSnap.exists()) {
          setLoading(false);
          return;
        }

        const articleData = articleSnap.data();
        setArticleTitle(articleData.title || "Untitled Article");
        setArticleAuthor(articleData.authorName || "Unknown Author");

        // Get analytics data
        const readsRef = collection(db, `articles/${articleId}/reads`);
        const readsQuery = query(readsRef, orderBy("timestamp", "desc"));
        const snap = await getDocs(readsQuery);

        const d: Record<string, number> = {};
        const dev = { mobile: 0, desktop: 0 };
        const src: Record<string, number> = {};
        let total = 0;

        snap.forEach((doc) => {
          const r = doc.data();

          // 🔧 Firestore Timestamp → Date fix
          const date =
            r.timestamp?.toDate?.() ||
            new Date(r.timestamp);

         const dayKey = date.toISOString().slice(0, 10); // YYYY-MM-DD

          d[dayKey] = (d[dayKey] || 0) + 1;

          total++;

          dev[getDevice(r.userAgent)]++;

          const s =
            r.referer?.includes("facebook")
              ? "facebook"
              : r.referer?.includes("google")
              ? "google"
              : r.referer?.includes("twitter") || r.referer?.includes("x.com")
              ? "twitter"
              : r.referer?.includes("linkedin")
              ? "linkedin"
              : "direct";

          src[s] = (src[s] || 0) + 1;
        });

        setDaily(d);
        setDevices(dev);
        setSources(src);
        setTotalReads(total);
      } catch (err) {
        console.error("Admin analytics load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    if (articleId) load();
  }, [articleId, authReady]);

  if (!authReady || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 font-sans!">
        <div className="w-48 h-2 bg-[#E0D6C7] rounded-full overflow-hidden">
          <div className="h-full w-full animate-pulse bg-[#4A3820]"></div>
        </div>
        <p className="mt-4 text-[#4A3820] font-medium text-lg text-center font-sans!">
          Loading article analytics...
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

  if (!articleId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 font-sans!">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#4A3820] mb-4 font-sans!">
            Article Not Found
          </h1>
          <p className="text-[#4A3820]/70 font-sans!">
            The requested article analytics could not be found.
          </p>
          <Link 
            href="/admin/analytics" 
            className="mt-4 inline-block text-[#4A3820] hover:text-[#6B4B2B] font-medium font-sans!"
          >
            ← Back to Admin Analytics
          </Link>
        </div>
      </div>
    );
  }

  // Sort days chronologically
  const sortedDays = Object.entries(daily).sort(
    ([a], [b]) => new Date(a).getTime() - new Date(b).getTime()
  );

  const chartData = sortedDays.map(([day, count]) => ({
    day: new Date(day).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short"
    }),
    count
  }));

  // Sort sources by count
  const sortedSources = Object.entries(sources).sort(([,a], [,b]) => b - a);

  return (
    <div className="px-6 min-h-screen pb-32 font-sans!">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            href="/admin/analytics" 
            className="inline-flex items-center text-[#4A3820] hover:text-[#6B4B2B] font-medium font-sans!"
          >
            ← Back to Admin Analytics
          </Link>
        </div>

        <h1 className="text-3xl font-extrabold text-[#4A3820] mb-2 text-center font-sans!">
          Article Analytics (Admin)
        </h1>
        
        {/* Article Title & Author */}
        <div className="text-center mb-8">
          <h2 className="text-xl text-[#4A3820] font-sans!">
            {articleTitle}
          </h2>
          <p className="text-lg text-[#4A3820]/70 font-sans!">
            by {articleAuthor}
          </p>
        </div>
        
        {/* Overview Stats Container */}
        <div className="bg-[#F0E8DB] border border-[#D8CDBE] rounded-lg shadow-md p-6 sm:p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-medium text-[#4A3820] font-sans!">
              Overview
            </h2>
          </div>

          <hr className="border-[#D8CDBE] mb-8" />

          {/* Stats Cards */}
          <div className="flex justify-center mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <div className="bg-white border border-[#D8CDBE] rounded-lg p-6 text-center">
                <div className="text-sm text-[#4A3820]/70 font-sans!">Total Reads</div>
                <div className="mt-2 text-3xl font-bold text-[#4A3820] font-sans!">
                  {totalReads}
                </div>
              </div>

              <div className="bg-white border border-[#D8CDBE] rounded-lg p-6 text-center">
                <div className="text-sm text-[#4A3820]/70 font-sans!">Days Tracked</div>
                <div className="mt-2 text-3xl font-bold text-[#4A3820] font-sans!">
                  {sortedDays.length}
                </div>
              </div>

              <div className="bg-white border border-[#D8CDBE] rounded-lg p-6 text-center">
                <div className="text-sm text-[#4A3820]/70 font-sans!">Daily Avg</div>
                <div className="mt-2 text-3xl font-bold text-[#4A3820] font-sans!">
                  {sortedDays.length > 0 ? Math.round(totalReads / sortedDays.length) : 0}
                </div>
              </div>

              <div className="bg-white border border-[#D8CDBE] rounded-lg p-6 text-center">
                <div className="text-sm text-[#4A3820]/70 font-sans!">Peak Day</div>
                <div className="mt-2 text-3xl font-bold text-[#4A3820] font-sans!">
                  {sortedDays.length > 0 ? Math.max(...sortedDays.map(([, count]) => count)) : 0}
                </div>
              </div>
            </div>
          </div>

       
            {/* DEVICES PANEL - Now takes full width */}
          <div className="bg-white border border-[#D8CDBE] rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-medium text-[#4A3820] mb-4 font-sans!">
              Devices
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[#4A3820] font-sans!">📱 Mobile</span>
                  <span className="text-[#4A3820] font-medium font-sans!">
                    {devices.mobile} ({devices.mobile + devices.desktop > 0 ? 
                      Math.round((devices.mobile / (devices.mobile + devices.desktop)) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-2 bg-[#E0D6C7] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#4A3820] rounded-full transition-all"
                    style={{ 
                      width: `${devices.mobile + devices.desktop > 0 ? 
                        (devices.mobile / (devices.mobile + devices.desktop)) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[#4A3820] font-sans!">🖥 Desktop</span>
                  <span className="text-[#4A3820] font-medium font-sans!">
                    {devices.desktop} ({devices.mobile + devices.desktop > 0 ? 
                      Math.round((devices.desktop / (devices.mobile + devices.desktop)) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-2 bg-[#E0D6C7] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#4A3820] rounded-full transition-all"
                    style={{ 
                      width: `${devices.mobile + devices.desktop > 0 ? 
                        (devices.desktop / (devices.mobile + devices.desktop)) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

   
        </div>

        {/* DAILY READS */}
        <div className="bg-[#F0E8DB] border border-[#D8CDBE] rounded-lg shadow-md p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-medium text-[#4A3820] font-sans!">
              Daily Reads
            </h2>
          </div>

          <hr className="border-[#D8CDBE] mb-6" />
          
          {chartData.length > 0 ? (
            <div className="mb-8">
              <DailyReadsChart data={chartData} />
            </div>
          ) : (
            <div className="text-center py-10 text-[#4A3820]/60 font-sans!">
              No read data available for this article.
            </div>
          )}

          {/* Results count */}
          {sortedDays.length > 0 && (
            <div className="mt-6 pt-6 border-t border-[#D8CDBE]">
              <p className="text-base! text-[#4A3820]/70 font-sans!">
                Showing {sortedDays.length} days of activity
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}