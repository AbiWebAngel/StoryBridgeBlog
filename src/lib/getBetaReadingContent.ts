// lib/getBetareadingContent.ts
import { adminDb } from "@/lib/firebaseAdmin";
import { BetareadingContent } from "@/types/betareading";

export async function getBetaReadingContent(): Promise<BetareadingContent | null> {
  try {
    const ref = adminDb.collection("siteContent").doc("betareading");
    const snap = await ref.get();

    if (!snap.exists) return null;

    const data = snap.data();
    if (!data) return null;

    return {
      whatIsBetareading: {
        text: data.whatIsBetareading?.text ?? "",
      },

      whatWeOffer: {
        text: data.whatWeOffer?.text ?? [],
        image: data.whatWeOffer?.image ?? {
          src: "",
          alt: "",
          width: 0,
          height: 0,
        },
      },

      signUpNow: {
        findingBetaReadersSection: {
          title: data.signUpNow?.findingBetaReadersSection?.title ?? "",
          description: data.signUpNow?.findingBetaReadersSection?.description ?? "",
          buttonText: data.signUpNow?.findingBetaReadersSection?.buttonText ?? "",
          buttonUrl: data.signUpNow?.findingBetaReadersSection?.buttonUrl ?? "",
          image: data.signUpNow?.findingBetaReadersSection?.image ?? {
            src: "",
            alt: "",
            width: 0,
            height: 0,
          },
        },
        becomingBetaReaderSection: {
          title: data.signUpNow?.becomingBetaReaderSection?.title ?? "",
          description: data.signUpNow?.becomingBetaReaderSection?.description ?? "",
          buttonText: data.signUpNow?.becomingBetaReaderSection?.buttonText ?? "",
          buttonUrl: data.signUpNow?.becomingBetaReaderSection?.buttonUrl ?? "",
          image: data.signUpNow?.becomingBetaReaderSection?.image ?? {
            src: "",
            alt: "",
            width: 0,
            height: 0,
          },
        },
      },

      testimonials: {
        testimonials: data.testimonials?.testimonials ?? [],
      },
    };
  } catch (error) {
    console.error("Error fetching betareading content:", error);
    return null;
  }
}