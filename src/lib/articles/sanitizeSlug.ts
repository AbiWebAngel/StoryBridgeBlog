export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-") // remove junk like ^ + | $
    .replace(/-+/g, "-")         // collapse multiple dashes
    .replace(/^-+|-+$/g, "");    // trim dashes
}
