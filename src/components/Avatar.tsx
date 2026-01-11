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
  "#C53E32", "#B51D5A", "#8A2798", "#5E3A9E",
  "#3A4FA3", "#1F82D4", "#028FD0", "#00A3BC",
  "#008171", "#46A04A", "#7FAE45", "#B9C93A",
  "#D3A61A", "#D38A12", "#D95A2A", "#70514A"
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
  textColor = "white",
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
