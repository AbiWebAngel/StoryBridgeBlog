import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    // 1️⃣ Auth token
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/auth-token=([^;]+)/);
    const token = match?.[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Verify
    const decoded = await adminAuth.verifyIdToken(token);

    if (!decoded.admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3️⃣ Body
    const { uid, disabled } = (await req.json()) as {
      uid?: string;
      disabled?: boolean;
    };

    if (!uid || typeof disabled !== "boolean") {
      return NextResponse.json(
        { error: "Missing uid or disabled flag" },
        { status: 400 }
      );
    }

    // 4️⃣ Prevent self-disable (admins keep the keys 🔑)
    if (uid === decoded.uid) {
      return NextResponse.json(
        { error: "You cannot disable your own account" },
        { status: 400 }
      );
    }

    // 5️⃣ Disable in Firebase Auth (THE REAL SWITCH)
    await adminAuth.updateUser(uid, { disabled });

    // 6️⃣ Mirror in Firestore (UI / audits)
    await adminDb.collection("users").doc(uid).update({
      disabled,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: disabled ? "User disabled" : "User re-enabled",
    });
  } catch (error) {
    console.error("setUserDisabled error:", error);
    return NextResponse.json(
      { error: "Failed to update user status" },
      { status: 500 }
    );
  }
}
