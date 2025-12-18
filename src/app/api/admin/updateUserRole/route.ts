import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

type Role = "admin" | "author" | "reader";

export async function POST(req: Request) {
  try {
    // 1️⃣ Read auth token from cookie
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/auth-token=([^;]+)/);
    const token = match?.[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Verify token
    const decoded = await adminAuth.verifyIdToken(token);

    // 🔒 Admin guard
    if (!decoded.admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3️⃣ Parse body
    const { uid, role } = (await req.json()) as {
      uid?: string;
      role?: Role;
    };

    if (!uid || !role) {
      return NextResponse.json(
        { error: "Missing uid or role" },
        { status: 400 }
      );
    }

    // 4️⃣ Validate role
    const allowedRoles: Role[] = ["admin", "author", "reader"];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // 5️⃣ Prevent admin from changing own role
    if (uid === decoded.uid) {
      return NextResponse.json(
        { error: "You cannot change your own role" },
        { status: 400 }
      );
    }

    // 6️⃣ Update Firestore
    await adminDb.collection("users").doc(uid).update({
      role,
      updatedAt: new Date(),
    });

    // 7️⃣ Update custom claims
    await adminAuth.setCustomUserClaims(uid, {
      admin: role === "admin",
      role,
    });

    return NextResponse.json({
      success: true,
      message: `User role updated to ${role}`,
    });
  } catch (error) {
    console.error("updateUserRole error:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
}
