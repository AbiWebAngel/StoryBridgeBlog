import { adminDb } from "@/lib/firebaseAdmin";

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  description: string;
  image: {
    src: string;
    alt: string;
  };
}


export type TeamContent = {
  joinTeamText: string;
  matchesCount: number;
  workshopsCount: number;
  teamMembers: TeamMember[];
};

export async function getTeamContent(): Promise<TeamContent | null> {
  try {
    const ref = adminDb.collection("siteContent").doc("team");
    const snap = await ref.get();

    if (!snap.exists) {
      return null;
    }

    const data = snap.data();

    // Return null if document exists but has no meaningful data
    const hasContent = data?.joinTeamText || 
                      data?.matchesCount || 
                      data?.workshopsCount || 
                      (data?.teamMembers && data.teamMembers.length > 0);
    
    if (!hasContent) {
      return null;
    }

    return {
      joinTeamText: data?.joinTeamText ?? "",
      matchesCount: data?.matchesCount ?? 0,
      workshopsCount: data?.workshopsCount ?? 0,
      teamMembers: data?.teamMembers ?? [],
    };
  } catch (error) {
    console.error("Error fetching team content:", error);
    return null;
  }
}