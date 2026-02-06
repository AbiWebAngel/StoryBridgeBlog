// lib/getResourcesContent.ts
import { adminDb } from "@/lib/firebaseAdmin";
import { ResourceContent } from "@/types/resources";

export async function getResourcesContent(): Promise<ResourceContent | null> {
  try {
    const ref = adminDb.collection("siteContent").doc("resources");
    const snap = await ref.get();

    if (!snap.exists) return null;

    const data = snap.data();
    if (!data) return null;

    // Transform magazines data
    const magazines = data.magazines?.map((magazine: any, index: number) => ({
      id: magazine.id ?? index + 1,
      title: magazine.title ?? "",
      description: magazine.description ?? "",
      image: {
        src: magazine.image?.src ?? "",
        alt: magazine.image?.alt ?? "",
      },
    })) ?? [];

    // Transform summer programs data
    const summerPrograms = data.summerPrograms?.map((program: any, index: number) => ({
      id: program.id ?? index + 1,
      title: program.title ?? "",
      duration: program.duration ?? "",
      location: program.location ?? "",
      shortDescription: program.shortDescription ?? "",
      fullDescription: program.fullDescription ?? "",
      bestFor: program.bestFor ?? "",
      outcome: program.outcome ?? "",
      category: program.category ?? "Writing & Creative Arts",
      additionalInfo: program.additionalInfo ?? [],
      registrationLink: program.registrationLink ?? "/apply",
    })) ?? [];

    // Transform writing competitions data
    const writingCompetitions = data.writingCompetitions?.map((competition: any, index: number) => ({
      id: competition.id ?? index + 1,
      title: competition.title ?? "",
      description: competition.description ?? "",
      deadline: competition.deadline ?? "",
      prize: competition.prize ?? "",
      entryFee: competition.entryFee ?? "",
      eligibility: competition.eligibility ?? "",
      rules: competition.rules ?? [],
      registrationLink: competition.registrationLink ?? "/apply",
      image: {
        src: competition.image?.src ?? "",
        alt: competition.image?.alt ?? "",
      },
    })) ?? [];

    return {
      magazines,
      summerPrograms,
      writingCompetitions,
    };
  } catch (error) {
    console.error("Error fetching resources content:", error);
    return null;
  }
}