export const getInitials = (firstName: string, lastName: string) => {
  const first = firstName?.[0] ?? "";
  const last = lastName?.[0] ?? "";
  return (first + last).toUpperCase();
};

