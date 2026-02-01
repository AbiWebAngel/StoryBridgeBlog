import { adminDb } from "@/lib/firebaseAdmin";
import { AboutContent } from "@/types/about";

export async function getAboutContent(): Promise<AboutContent | null> {
  try {
    const ref = adminDb.collection("siteContent").doc("about");
    const snap = await ref.get();

    if (!snap.exists) return null;

    const data = snap.data();
    if (!data) return null;

    return {
      missionStatement: data.missionStatement ?? "",
      whoWeAre: data.whoWeAre ?? "",
      whatWeDo: data.whatWeDo ?? "",
      whyItMatters: data.whyItMatters ?? "",
      testimonials: data.testimonials ?? [],
      bookImages: data.bookImages ?? [],
    };
  } catch (error) {
    console.error("Error fetching about content:", error);
    return null;
  }
}
