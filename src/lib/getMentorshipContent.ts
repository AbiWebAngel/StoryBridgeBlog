import { adminDb } from "@/lib/firebaseAdmin";

export async function getMentorshipContent() {
  try {
    const ref = adminDb.collection("siteContent").doc("mentorship");
    const snap = await ref.get();

    if (!snap.exists) {
      return null;
    }

    const data = snap.data();

    // Return null if document exists but has no data
    if (!data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching mentorship content:", error);
    return null;
  }
}