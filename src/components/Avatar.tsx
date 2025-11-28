import Image from "next/image";

interface AvatarProps {
  name?: string;
  initials?: string;
  size?: number; // diameter in px
  textColor?: string;
  fallbackSrc?: string;
}

const COLORS = [
  "#F44336", "#E91E63", "#9C27B0", "#673AB7",
  "#3F51B5", "#2196F3", "#03A9F4", "#00BCD4",
  "#009688", "#4CAF50", "#8BC34A", "#CDDC39",
  "#FFC107", "#FF9800", "#FF5722", "#795548"
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
  name,
  initials,
  size = 45,
  textColor = "#fff",
  fallbackSrc = "/assets/icons/Profile.svg",
}: AvatarProps) => {
  const displayInitials =
    initials || name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "";

  const bgColor = displayInitials ? stringToColor(name || initials || "") : undefined;

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
