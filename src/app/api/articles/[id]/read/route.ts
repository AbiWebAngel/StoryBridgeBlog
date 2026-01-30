import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import crypto from "crypto";

// Debug configuration
const DEBUG_ENABLED =
  process.env.NODE_ENV !== "production" ||
  process.env.DEBUG_READ_TRACKING === "true";

function debugLog(message: string, data?: any) {
  if (DEBUG_ENABLED) {
    console.log(
      `🔍 [Read API ${new Date().toISOString()}] ${message}`,
      data || ""
    );
  }
}

function debugError(message: string, error: any) {
  console.error(
    `🔥 [Read API ERROR ${new Date().toISOString()}] ${message}:`,
    {
      error: error?.message,
      stack: error?.stack,
      ...(error?.code && { code: error.code }),
    }
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: articleId } = await params;
    const requestId = crypto.randomBytes(4).toString("hex");

    debugLog(
      `[${requestId}] Processing read tracking for article: ${articleId}`,
      {
        url: req.url,
        method: req.method,
      }
    );

    // 1️⃣ Get IP safely
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

    debugLog(`[${requestId}] IP detection:`, {
      originalIP: ip,
      xForwardedFor: req.headers.get("x-forwarded-for"),
      userAgent: req.headers.get("user-agent"),
      referer: req.headers.get("referer"),
    });

    // 2️⃣ Hash IP (privacy)
    const ipHash = crypto
      .createHash("sha256")
      .update(ip)
      .digest("hex");

    debugLog(`[${requestId}] IP hashed:`, {
      original: ip,
      hashed: ipHash.substring(0, 8) + "...",
      articleId,
    });


    const articleRef = adminDb.collection("articles").doc(articleId);
    const ipRef = articleRef.collection("reads").doc(ipHash);

    const articleSnap = await articleRef.get();

    // ⛔ Stop early: article doesn't exist
    if (!articleSnap.exists) {
      debugError(`[${requestId}] Article does not exist`, {
        articleId,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Article not found",
          articleId,
          requestId,
        },
        { status: 404 }
      );
    }

    debugLog(`[${requestId}] Firestore references:`, {
      articlePath: articleRef.path,
      ipPath: ipRef.path,
    });

    const startTime = Date.now();

    await adminDb.runTransaction(async (tx) => {
      const ipSnap = await tx.get(ipRef);

      debugLog(`[${requestId}] Transaction snapshot:`, {
        ipExists: ipSnap.exists,
        articleId,
      });

      // Already counted → skip
      if (ipSnap.exists) {
        debugLog(
          `[${requestId}] Duplicate IP detected - skipping increment`,
          {
            ipHash: ipHash.substring(0, 8) + "...",
            articleId,
          }
        );
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


      debugLog(`[${requestId}] Transaction updates prepared`);
    });

    const duration = Date.now() - startTime;

    debugLog(`[${requestId}] Successfully tracked read`, {
      articleId,
      ipHash: ipHash.substring(0, 8) + "...",
      processingTime: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      articleId,
      requestId,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    debugError(`[Unhandled] Read count error`, err);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
