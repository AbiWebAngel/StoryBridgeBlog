// lib/articles/findUnusedAssets.ts
export function findUnusedAssets(allUploaded: string[], usedAssets: string[]) {
  const used = new Set(usedAssets || []);
  return (allUploaded || []).filter((url) => !used.has(url));
}
