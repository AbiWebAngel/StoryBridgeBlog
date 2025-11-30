import Image from "next/image";
import { getInitials } from "@/utils/getInitials";

interface AvatarProps {
  firstName?: string;
  lastName?: string;
  initials?: string;
  size?: number; // diameter in px
  textColor?: string;
  fallbackSrc?: string;
}

const COLORS = [
  "#B23529", "#A3164E", "#771E85", "#4F2E8A",
  "#2F3F8F", "#176FB8", "#027EB5", "#008FA7",
  "#006D60", "#39873C", "#6D943A", "#A6B32C",
  "#BF9405", "#BF7600", "#C2461C", "#5E4039"
];

const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
};

const Avatar = ({
  firstName,
  lastName,
  initials,
  size = 45,
  textColor = "#fff",
  fallbackSrc = "/assets/icons/Profile.svg",
}: AvatarProps) => {
  const displayInitials = initials || getInitials(firstName || "", lastName || "");
  const bgColor = displayInitials ? stringToColor((firstName || "") + (lastName || "")) : undefined;

  return displayInitials ? (
    <div
      className="flex items-center justify-center font-bold text-sm rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      {displayInitials}
    </div>
  ) : (
    <div
      className="relative rounded-md overflow-hidden"
      style={{ width: size, height: size }}
    >
      <Image src={fallbackSrc} alt="Profile" fill className="object-cover" />
    </div>
  );
};

export default Avatar;
