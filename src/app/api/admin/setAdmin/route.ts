// For App Router:
import { NextRequest, NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin"; // make sure this exports initialized Firebase Admin SDK

export async function POST(req: NextRequest) {
  try {
    const { uid } = await req.json();

    if (!uid) {
      return NextResponse.json({ error: "UID is required" }, { status: 400 });
    }

    await admin.auth().setCustomUserClaims(uid, { role: "admin" });

    return NextResponse.json({ success: true, message: "Admin role assigned" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to assign role" }, { status: 500 });
  }
}
