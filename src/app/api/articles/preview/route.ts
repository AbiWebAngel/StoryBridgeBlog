import { NextResponse } from "next/server";
import admin from "firebase-admin";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (initError) {
    console.error("Firebase Admin initialization error:", initError);
  }
}

export async function GET(req: Request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const articleId = searchParams.get("id");

    // Validate article ID
    if (!articleId) {
      return NextResponse.json(
        { error: "Missing article ID" }, 
        { status: 400 }
      );
    }

    // Check authentication header
    const authHeader = req.headers.get("authorization");
    
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      );
    }

    // Extract and verify token
    const token = authHeader.replace("Bearer ", "");
    
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token);
    } catch (tokenError: any) {
      return NextResponse.json(
        { error: "Invalid token" }, 
        { status: 401 }
      );
    }

    // Fetch article from Firestore
    let snap;
    try {
      snap = await admin.firestore()
        .collection("articles")
        .doc(articleId)
        .get();
    } catch (firestoreError: any) {
      return NextResponse.json(
        { error: "Database error" }, 
        { status: 500 }
      );
    }

    // Check if article exists
    if (!snap.exists) {
      return NextResponse.json(
        { error: "Article not found" }, 
        { status: 404 }
      );
    }

    const data = snap.data() as any;

    // Check publication status
    const isPublished = data.published === true || data.status === "published";

    // Authorization check for draft articles
    const isAuthor = data.authorId === decodedToken.uid;
    const isAdmin = decodedToken.role === "admin";
    
    if (!isPublished && !isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden - You don't have permission to view this draft" }, 
        { status: 403 }
      );
    }
    let authorName = "Unknown author";

if (data.authorId) {
  try {
    const userSnap = await admin
      .firestore()
      .collection("users")
      .doc(data.authorId)
      .get();

    if (userSnap.exists) {
      const userData = userSnap.data() as any;

      if (userData.firstName || userData.lastName) {
        authorName = `${userData.firstName ?? ""} ${userData.lastName ?? ""}`.trim();
      } else if (userData.email) {
        authorName = userData.email;
      }
    }
  } catch (err) {
    console.warn("Author lookup failed:", err);
  }
}


    // Prepare response data
  const responseData = {
    ...data,
    author: authorName, // ✅ human-readable name
    createdAt: data.createdAt?.toDate?.()?.toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
    publishedAt: data.publishedAt?.toDate?.()?.toISOString(),
  };


    return NextResponse.json({ 
      data: responseData
    });

  } catch (err: any) {
    console.error("Error in preview API route:", err);
    
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}