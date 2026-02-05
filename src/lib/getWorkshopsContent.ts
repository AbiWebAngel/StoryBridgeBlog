// lib/getWorkshopsContent.ts
import { adminDb } from "@/lib/firebaseAdmin";
import { WorkshopContent, WorkshopEvent } from "@/types/workshops";

export async function getWorkshopsContent(): Promise<WorkshopContent | null> {
  try {
    const ref = adminDb.collection("siteContent").doc("workshops");
    const snap = await ref.get();

    if (!snap.exists) return null;

    const data = snap.data();
    if (!data) return null;

    // Convert Firestore timestamps to Date objects for events
    const events: WorkshopEvent[] = data.events?.map((event: any, index: number) => ({
      id: event.id ?? index + 1,
      title: event.title ?? "",
      date: event.date?.toDate() ?? new Date(),
      description: event.description ?? "",
      fullDescription: event.fullDescription ?? "",
      image: {
        src: event.image?.src ?? "",
        alt: event.image?.alt ?? "",
      },
      location: event.location ?? "",
      category: event.category ?? "Workshop",
      additionalInfo: event.additionalInfo ?? [],
      registrationLink: event.registrationLink ?? "/apply",
    })) ?? [];

    return {
      whatAreWorkshops: {
        text: data.whatAreWorkshops?.text ?? "",
      },
      events: events,
    };
  } catch (error) {
    console.error("Error fetching workshops content:", error);
    return null;
  }
}