import { NextResponse } from "next/server";
import admin from "firebase-admin";

console.log("🚀 /api/articles/preview - API route initialized");

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  console.log("🔥 Initializing Firebase Admin SDK");
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string);
    console.log("✅ Service account parsed successfully");
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ Firebase Admin initialized");
  } catch (initError) {
    console.error("❌ Firebase Admin initialization error:", initError);
  }
} else {
  console.log("✅ Firebase Admin already initialized");
}

// Define types for better TypeScript support
interface ArticleData {
  id?: string;
  title?: string;
  body?: any;
  author?: string;
  authorId?: string;
  coverImage?: string;
  coverImageAlt?: string;
  coverImagePosition?: { x: number; y: number };
  status?: string;
  published?: boolean;
  createdAt?: admin.firestore.Timestamp | any;
  updatedAt?: admin.firestore.Timestamp | any;
  publishedAt?: admin.firestore.Timestamp | any;
  [key: string]: any;
}

interface ArticleResponse extends Omit<ArticleData, 'createdAt' | 'updatedAt' | 'publishedAt'> {
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export async function GET(req: Request) {
  console.log("📞 GET /api/articles/preview called");
  console.log("🌐 Request URL:", req.url);

  try {
    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const articleId = searchParams.get("id");
    
    console.log("🔍 Query parameters:", {
      articleId,
      allParams: Object.fromEntries(searchParams.entries())
    });

    // Validate article ID
    if (!articleId) {
      console.error("❌ Missing article ID");
      return NextResponse.json(
        { 
          error: "Missing article ID",
          debug: { receivedId: articleId }
        }, 
        { status: 400 }
      );
    }

    console.log("✅ Article ID validated:", articleId);

    // Check authentication header
    const authHeader = req.headers.get("authorization");
    console.log("🔐 Authorization header:", authHeader ? `${authHeader.substring(0, 20)}...` : "Not present");

    if (!authHeader?.startsWith("Bearer ")) {
      console.error("❌ Invalid or missing authorization header");
      return NextResponse.json(
        { 
          error: "Unauthorized", 
          debug: { 
            authHeaderPresent: !!authHeader,
            authHeaderPrefix: authHeader?.substring(0, 7)
          }
        }, 
        { status: 401 }
      );
    }

    // Extract and verify token
    const token = authHeader.replace("Bearer ", "");
    console.log("🔑 Token extracted, length:", token.length);
    
    let decodedToken;
    try {
      console.log("🔐 Verifying ID token...");
      decodedToken = await admin.auth().verifyIdToken(token);
      console.log("✅ Token verified successfully:", {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role,
        tokenIssuedAt: new Date(decodedToken.iat * 1000).toISOString(),
        tokenExpiresAt: new Date(decodedToken.exp * 1000).toISOString()
      });
    } catch (tokenError: any) {
      console.error("❌ Token verification failed:", {
        error: tokenError.message,
        code: tokenError.code,
        stack: tokenError.stack
      });
      return NextResponse.json(
        { 
          error: "Invalid token", 
          debug: { 
            error: tokenError.message,
            tokenLength: token.length
          }
        }, 
        { status: 401 }
      );
    }

    // Fetch article from Firestore
    console.log("📚 Fetching article from Firestore:", articleId);
    
    let snap;
    try {
      snap = await admin.firestore()
        .collection("articles")
        .doc(articleId)
        .get();
      
      console.log("📄 Firestore response:", {
        exists: snap.exists,
        id: snap.id,
        dataPresent: !!snap.data()
      });
    } catch (firestoreError: any) {
      console.error("❌ Firestore fetch error:", {
        error: firestoreError.message,
        code: firestoreError.code,
        articleId
      });
      return NextResponse.json(
        { 
          error: "Database error", 
          debug: { 
            error: firestoreError.message,
            articleId 
          }
        }, 
        { status: 500 }
      );
    }

    // Check if article exists
    if (!snap.exists) {
      console.error("❌ Article not found in Firestore");
      return NextResponse.json(
        { 
          error: "Article not found", 
          debug: { 
            articleId,
            collection: "articles"
          }
        }, 
        { status: 404 }
      );
    }

    const data = snap.data() as ArticleData;
    console.log("📊 Article data retrieved:", {
      title: data.title,
      authorId: data.authorId,
      status: data.status,
      published: data.published,
      hasCoverImage: !!data.coverImage,
      dataKeys: Object.keys(data)
    });

    // Check publication status
    const isPublished = data.published === true || data.status === "published";
    console.log("📝 Publication status check:", {
      publishedField: data.published,
      statusField: data.status,
      isPublished
    });

    // Authorization check for draft articles
    const isAuthor = data.authorId === decodedToken.uid;
    const isAdmin = decodedToken.role === "admin";
    
    console.log("👤 Authorization check:", {
      articleAuthorId: data.authorId,
      currentUserId: decodedToken.uid,
      userRole: decodedToken.role,
      isAuthor,
      isAdmin,
      requiresAuth: !isPublished
    });

    if (!isPublished && !isAuthor && !isAdmin) {
      console.error("🚫 Unauthorized access to draft article:", {
        articleAuthor: data.authorId,
        currentUser: decodedToken.uid,
        userRole: decodedToken.role,
        articleStatus: data.status
      });
      
      return NextResponse.json(
        { 
          error: "Forbidden - You don't have permission to view this draft", 
          debug: {
            articleAuthorId: data.authorId,
            currentUserId: decodedToken.uid,
            userRole: decodedToken.role,
            articleStatus: data.status,
            isPublished
          }
        }, 
        { status: 403 }
      );
    }

    console.log("✅ Authorization passed, preparing response");

    // Prepare response data with proper typing
    const responseData: ArticleResponse = {
      ...data,
      // Ensure dates are properly serialized
      createdAt: data.createdAt?.toDate?.()?.toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
      publishedAt: data.publishedAt?.toDate?.()?.toISOString(),
    };

    // Remove the original timestamp fields to avoid duplicates
    delete (responseData as any).createdAtOriginal;
    delete (responseData as any).updatedAtOriginal;
    delete (responseData as any).publishedAtOriginal;

    console.log("📤 Sending successful response:", {
      title: responseData.title,
      status: responseData.status,
      responseSize: JSON.stringify(responseData).length,
      hasBody: !!responseData.body,
      bodyType: typeof responseData.body,
      bodyPreview: typeof responseData.body === 'string' 
        ? `${responseData.body.substring(0, 100)}...` 
        : 'Not a string'
    });

    return NextResponse.json({ 
      data: responseData,
      meta: {
        timestamp: new Date().toISOString(),
        debug: process.env.NODE_ENV === 'development' ? {
          userId: decodedToken.uid,
          articleId,
          isPublished,
          authorized: true
        } : undefined
      }
    });

  } catch (err: any) {
    console.error("💥 Unhandled error in API route:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
      url: req.url
    });
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        debug: process.env.NODE_ENV === 'development' ? {
          message: err.message,
          stack: err.stack
        } : undefined
      }, 
      { status: 500 }
    );
  } finally {
    console.log("🏁 API request completed");
  }
}

// Log environment info (once)
console.log("⚙️ Environment:", {
  nodeEnv: process.env.NODE_ENV,
  firebaseInitialized: !!admin.apps.length,
  timestamp: new Date().toISOString()
});