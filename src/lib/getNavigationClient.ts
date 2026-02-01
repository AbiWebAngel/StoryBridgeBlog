import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function getNavigationClient() {
  try {
    const ref = doc(db, "siteContent", "navigation");
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;

    const data = snap.data();

    return {
      donateUrl: data?.donateUrl || "/apply",
    };
  } catch (err) {
    console.error("Failed to fetch navigation:", err);
    return null;
  }
}
