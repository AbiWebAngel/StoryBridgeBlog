export async function loadImageAsBuffer(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to load image: " + url);
  }
  return await res.arrayBuffer();
}
