import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
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
        createdAt: data?.createdAt.toDate().toISOString() || "",
      });
    }

    return NextResponse.json({ users });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
