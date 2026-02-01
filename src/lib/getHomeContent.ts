import { adminDb } from "@/lib/firebaseAdmin";
import { ProgramLink } from "@/types/home";
import { DirectorContent } from "@/types/home";
import { HomeContent } from "@/types/home";


export async function getHomeContent(): Promise<HomeContent | null> {
  try {
    const ref = adminDb.collection("siteContent").doc("home");
    const snap = await ref.get();

    if (!snap.exists) {
      return null;
    }

    const data = snap.data();

    // Return null if document exists but has no data
    if (!data) {
      return null;
    }

    // Return with searchTags if they exist
    return {
      director: data.director || {
        imageSrc: "",
        imageAlt: "",
        message: "",
        name: "",
        buttonText: "",
        buttonLink: ""
      },
      programLinks: data.programLinks || [],
      searchTags: data.searchTags // Will be undefined if not in Firestore
    } as HomeContent;
  } catch (error) {
    console.error("Error fetching home content:", error);
    return null;
  }
}