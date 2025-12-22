// @/types/team.ts
export type TeamMember = {
  id: number;
  name: string;
  role: string;
  description: string;
  image: string;
};

export type TeamContent = {
  joinTeamText: string;
  matchesCount: number;
  workshopsCount: number;
  teamMembers: TeamMember[];
};