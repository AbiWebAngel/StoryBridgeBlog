import { adminDb } from "@/lib/firebaseAdmin";
import { MentorshipContent } from "@/types/mentorship";

export async function getMentorshipContent(): Promise<MentorshipContent | null> {
  try {
    const ref = adminDb.collection("siteContent").doc("mentorship");
    const snap = await ref.get();

    if (!snap.exists) return null;

    const data = snap.data();
    if (!data) return null;

    return {
      whatIsMentorship: {
        text: data.whatIsMentorship?.text ?? "",
      },

      howItWorks: {
        text: data.howItWorks?.text ?? [],
        image: data.howItWorks?.image ?? {
          src: "",
          alt: "",
          width: 0,
          height: 0,
        },
      },

      signUpNow: {
        menteeSection: {
          title: data.signUpNow?.menteeSection?.title ?? "",
          description: data.signUpNow?.menteeSection?.description ?? "",
          buttonText: data.signUpNow?.menteeSection?.buttonText ?? "",
          buttonUrl: data?.signUpNow?.menteeSection?.buttonUrl || "",
          image: data.signUpNow?.menteeSection?.image ?? {
            src: "",
            alt: "",
            width: 0,
            height: 0,
          },
        },
        mentorSection: {
          title: data.signUpNow?.mentorSection?.title ?? "",
          description: data.signUpNow?.mentorSection?.description ?? "",
          buttonText: data.signUpNow?.mentorSection?.buttonText ?? "",
          buttonUrl: data?.signUpNow?.mentorSection?.buttonUrl || "",
          image: data.signUpNow?.mentorSection?.image ?? {
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
    console.error("Error fetching mentorship content:", error);
    return null;
  }
}
