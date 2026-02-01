// @/types/team.ts
export type TeamMember = {
  id: number;
  name: string;
  role: string;
  description: string;
    image: { 
    src: string; 
    alt: string; 
  };
};

export type TeamContent = {
  joinTeamText: string;
  joinUrl: string; // Add this line
  matchesCount: number;
  workshopsCount: number;
  teamMembers: TeamMember[];
};