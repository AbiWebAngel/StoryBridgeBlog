import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export async function GET(req: Request) {
  try {
    // 1️⃣ Read token from cookie
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/auth-token=([^;]+)/);
    const token = match?.[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Verify token
    const decoded = await adminAuth.verifyIdToken(token);

    // 🔍 TEMP DEBUG LOG (THIS IS THE CORRECT SPOT)
    console.log("Decoded auth token:", {
      uid: decoded.uid,
      admin: decoded.admin,
      role: decoded.role,
      claims: decoded,
    });

    // 3️⃣ Admin guard
    if (!decoded.admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 4️⃣ Fetch users
    const list = await adminAuth.listUsers();
    const users: any[] = [];

    for (const u of list.users) {
      const doc = await adminDb.collection("users").doc(u.uid).get();
      const data = doc.data();

      users.push({
        uid: u.uid,
        email: u.email,
        firstName: data?.firstName || "",
        lastName: data?.lastName || "",
        role: data?.role || "user",
        createdAt: data?.createdAt?.toDate?.().toISOString() || "",
      });
    }

    return NextResponse.json({ users });
  } catch (error) {
    console.error("getUsers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
