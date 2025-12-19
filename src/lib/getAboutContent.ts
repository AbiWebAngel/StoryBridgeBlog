import { adminDb } from "@/lib/firebaseAdmin";

export type Testimonial = {
  text: string;
  image: string;
};

export type AboutContent = {
  missionStatement: string;
  whoWeAre: string;
  whatWeDo: string;
  whyItMatters: string;
  testimonials: Testimonial[];
  bookImages: string[]; // Add this line
};

export async function getAboutContent(): Promise<AboutContent | null> {
  const ref = adminDb.collection("siteContent").doc("about");
  const snap = await ref.get();

  if (!snap.exists) return null;

  const data = snap.data();

  return {
    missionStatement: data?.missionStatement ?? "",
    whoWeAre: data?.whoWeAre ?? "",
    whatWeDo: data?.whatWeDo ?? "",
    whyItMatters: data?.whyItMatters ?? "",
    testimonials: data?.testimonials ?? [],
    bookImages: data?.bookImages ?? [], // Add this line
  };
}