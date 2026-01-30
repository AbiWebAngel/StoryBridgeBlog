import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import crypto from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: articleId } = await params;

    // 1️⃣ Get IP safely
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

    // 2️⃣ Hash IP (privacy)
    const ipHash = crypto
      .createHash("sha256")
      .update(ip)
      .digest("hex");

    const articleRef = adminDb.collection("articles").doc(articleId);
    const ipRef = articleRef.collection("reads").doc(ipHash);

    const articleSnap = await articleRef.get();

    // ⛔ Stop early: article doesn't exist
    if (!articleSnap.exists) {
      return NextResponse.json(
        {
          success: false,
          error: "Article not found",
          articleId,
        },
        { status: 404 }
      );
    }

    await adminDb.runTransaction(async (tx) => {
      const ipSnap = await tx.get(ipRef);

      // Already counted → skip
      if (ipSnap.exists) {
        return;
      }

      // Create read record
      tx.set(ipRef, {
        createdAt: new Date(),
        ipHash: ipHash.substring(0, 8) + "...",
        userAgent: req.headers.get("user-agent")?.substring(0, 100),
        referer: req.headers.get("referer"),
        timestamp: FieldValue.serverTimestamp(),
      });

      // Increment read count
      tx.set(
        articleRef,
        {
          readCount: FieldValue.increment(1),
          lastReadAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    });

    return NextResponse.json({
      success: true,
      articleId,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}