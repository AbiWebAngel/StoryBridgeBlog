import { adminDb } from "@/lib/firebaseAdmin";

export type ProgramLink = {
  programName: string;
  link: string;
  svgPath: string; // Add this
};

export type DirectorContent = {
  imageSrc: string;
  imageAlt: string;
  message: string;
  name: string;
  buttonText: string;
  buttonLink: string;
};

export type HomeContent = {
  director: DirectorContent;
  programLinks: ProgramLink[];
};

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

    return data as HomeContent;
  } catch (error) {
    console.error("Error fetching home content:", error);
    return null;
  }
}