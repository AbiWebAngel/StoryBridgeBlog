import { adminDb } from "@/lib/firebaseAdmin";

export async function getNavigation() {
  try {
    const ref = adminDb.collection("siteContent").doc("navigation");
    const snap = await ref.get();

    if (!snap.exists) return null;

    const data = snap.data();

    return {
      donateUrl: data?.donateUrl || "/donate",
    };
  } catch (err) {
    console.error("Failed to fetch navigation:", err);
    return null;
  }
}
