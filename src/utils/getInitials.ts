export const getInitials = (name: string) => {
  const parts = name.trim().split(" ");
  const first = parts[0]?.[0] ?? "";
  const last = parts[1]?.[0] ?? "";
  return (first + last).toUpperCase();
};
