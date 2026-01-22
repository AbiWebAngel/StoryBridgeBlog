"use client";

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import ArticleRenderer from "@/components/articles/ArticleRenderer";
import { getAuth } from "firebase/auth";
import { useAuth } from "@/context/AuthContext";

export default function PreviewArticlePage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user, authReady } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  console.log("🔍 PreviewArticlePage - Initial render:", {
    id,
    authReady,
    user: user ? `User exists (${user.email})` : "No user",
    loading,
    errorMsg
  });

  useEffect(() => {
    console.log("🔍 useEffect triggered:", {
      id,
      authReady,
      userExists: !!user,
      loading,
      timestamp: new Date().toISOString()
    });

    if (!id) {
      console.error("❌ No ID provided in params");
      setErrorMsg("No article ID provided");
      setLoading(false);
      return;
    }

    if (!authReady) {
      console.log("⏳ Auth not ready yet");
      return;
    }

    if (!user) {
      console.error("❌ No authenticated user");
      setErrorMsg("You must be logged in to view previews");
      setLoading(false);
      return;
    }

    const fetchPreview = async () => {
      console.log("🚀 Starting fetchPreview...");
      try {
        // Get Firebase ID token
        console.log("🔐 Getting ID token...");
        const token = await user.getIdToken();
        console.log("✅ Got token:", token ? `Exists (${token.substring(0, 10)}...)` : "No token");

        // Make API request
        const apiUrl = `/api/articles/preview?id=${id}`;
        console.log("🌐 Fetching from:", apiUrl);
        
        const res = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store'
        });

        console.log("📡 API Response:", {
          status: res.status,
          statusText: res.statusText,
          ok: res.ok,
          headers: Object.fromEntries(res.headers.entries())
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("❌ API Error response:", errorText);
          
          let errorMessage = `Failed to load preview (${res.status})`;
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
          
          throw new Error(errorMessage);
        }

        const responseData = await res.json();
        console.log("✅ API Success - Response data:", {
          hasData: !!responseData.data,
          dataKeys: responseData.data ? Object.keys(responseData.data) : [],
          fullResponse: responseData
        });

        const { data } = responseData;
        
        if (!data) {
          throw new Error("No data returned from API");
        }

        // Parse body content
        let body = data.body;
        console.log("📝 Body data type:", typeof body, "value:", body);
        
        if (typeof body === "string") {
          try {
            body = JSON.parse(body);
            console.log("✅ Successfully parsed body JSON");
          } catch (parseError) {
            console.error("❌ Failed to parse body JSON:", parseError);
            body = { type: "doc", content: [] };
          }
        }

        // Ensure body has correct structure
        if (body?.type !== "doc") {
          console.log("⚠️ Body missing type 'doc', fixing structure");
          body = { 
            type: "doc", 
            content: body?.content ?? body ?? [] 
          };
        }

        console.log("🎨 Final body structure:", {
          type: body.type,
          contentLength: body.content?.length || 0,
          contentSample: body.content?.[0]
        });

        // Prepare post data
        const postData = {
          ...data,
          body,
          date: data.updatedAt?.toDate?.()?.toISOString() ?? 
                data.createdAt?.toDate?.()?.toISOString() ?? 
                new Date().toISOString(),
        };

        console.log("📊 Post data prepared:", {
          title: postData.title,
          author: postData.author,
          hasCoverImage: !!postData.coverImage,
          date: postData.date
        });

        setPost(postData);
        setErrorMsg(null);
        
      } catch (err: any) {
        console.error("💥 Error in fetchPreview:", {
          message: err.message,
          stack: err.stack,
          name: err.name
        });
        setErrorMsg(err.message || "Failed to load preview");
      } finally {
        console.log("🏁 fetchPreview complete");
        setLoading(false);
      }
    };

    fetchPreview();

    // Cleanup function
    return () => {
      console.log("🧹 useEffect cleanup");
    };
  }, [id, authReady, user]);

  console.log("🔄 Render - Current state:", {
    loading,
    errorMsg,
    postExists: !!post,
    postTitle: post?.title
  });

  if (loading) {
    console.log("⏳ Rendering loading state");
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-48 h-2 bg-[#E0D6C7] rounded-full overflow-hidden">
          <div className="h-full w-full animate-pulse bg-[#4A3820]"></div>
        </div>
        <p className="mt-4 font-medium text-lg font-sans">
          Loading preview…
        </p>
        <div className="mt-4 text-sm text-gray-600">
          <p>ID: {id}</p>
          <p>User: {user ? "Authenticated" : "Not authenticated"}</p>
          <p>Auth ready: {authReady ? "Yes" : "No"}</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    console.log("❌ Rendering error state:", errorMsg);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">Preview unavailable</h1>
          <p className="mb-4 text-red-600">{errorMsg}</p>
          <div className="mb-4 p-3 bg-gray-100 rounded text-sm text-left">
            <p><strong>Debug info:</strong></p>
            <p>Article ID: {id}</p>
            <p>User: {user ? user.email : "Not signed in"}</p>
            <p>Auth ready: {authReady ? "Yes" : "No"}</p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-[#CF822A] text-white rounded"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    console.log("⚠️ Rendering 'not found' state");
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ECE1CF]">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Preview not found</h1>
          <p className="mt-2">No article data could be loaded.</p>
          <div className="mt-4 p-3 bg-gray-100 rounded text-sm">
            <p><strong>Debug info:</strong></p>
            <p>ID: {id}</p>
            <p>User: {user ? "Authenticated" : "Not authenticated"}</p>
          </div>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-[#CF822A] text-white rounded-lg hover:bg-[#B36F24] transition"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  console.log("✅ Rendering article preview");
  return (
    <div className="min-h-screen bg-[#ECE1CF] py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Debug banner - only in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-blue-500 text-white px-2 py-1 rounded">DEBUG</span>
              <span className="text-sm">Preview Mode • ID: {id}</span>
            </div>
          </div>
        )}

        {/* Back button */}
        <button 
          onClick={() => {
            console.log("🔙 Back button clicked");
            window.close();
            setTimeout(() => {
              if (!window.closed) {
                window.history.back();
              }
            }, 100);
          }}
          className="mb-6 flex items-center text-[#CF822A] hover:text-[#B36F24] transition font-inter font-bold group relative pb-1"
        >
          <span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#B36F24] after:transition-all after:duration-300 group-hover:after:w-full">
            Close Preview
          </span>
        </button>

        {/* Article Card */}
        <div className="bg-[#F2ECE3] rounded-[30px] shadow-xl p-6 sm:p-8">
          {/* Article Header */}
          <h1 className="font-cinzel text-[22px] sm:text-[26px] lg:text-[30px] font-bold min-w-0 wrap-break-word text-center mb-4">
            {post.title || "Untitled draft"}
          </h1>
          
          {/* Article Meta */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 font-inter mb-6 justify-center text-center">
            <span className="font-semibold">{post.author || "Author"}</span>
            <span className="hidden sm:inline">•</span>
            <span>
              {post.date ? new Date(post.date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              }) : "Draft"}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
              Draft Preview
            </span>
          </div>

          {/* Featured Image */}
          {post.coverImage && (
            <div className="mb-8 flex justify-center">
              <Image
                src={post.coverImage}
                alt={post.coverImageAlt || post.title || "Article cover"}
                width={1200}
                height={600}
                priority
                className="w-full h-62.5 sm:h-87.5 lg:h-112.5 rounded-[20px]"
                style={{
                  objectFit: "cover",
                  objectPosition: post.coverImagePosition
                    ? `${post.coverImagePosition.x}% ${post.coverImagePosition.y}%`
                    : "50% 50%",
                }}
                onError={(e) => {
                  console.error("❌ Image failed to load:", post.coverImage);
                  e.currentTarget.src = '/placeholder-image.jpg';
                }}
              />
            </div>
          )}

          {/* Article Content */}
          <article className="article-content">
            {post.body && <ArticleRenderer content={post.body} />}
          </article>

          {/* Debug footer */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-bold mb-2">📊 Article Data (Debug)</h3>
              <pre className="text-xs overflow-auto max-h-60">
                {JSON.stringify({
                  title: post.title,
                  author: post.author,
                  coverImage: post.coverImage ? "Exists" : "None",
                  bodyType: post.body?.type,
                  contentLength: post.body?.content?.length,
                  date: post.date
                }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}