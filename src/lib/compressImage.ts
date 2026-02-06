import imageCompression from "browser-image-compression";

export async function compressImageClient(file: File): Promise<File> {
  // SVGs should never be touched
  if (file.type === "image/svg+xml") return file;

  const options = {
    maxWidthOrHeight: 1600,
    maxSizeMB: 1.2,           // soft cap
    useWebWorker: true,
    initialQuality: 0.8,
    fileType: "image/jpeg",   // predictable, server will re-encode anyway
  };

  try {
    const compressed = await imageCompression(file, options);

    // Safety: if compression made it bigger (rare, but real)
    if (compressed.size >= file.size) {
      return file;
    }

    return compressed;
  } catch (err) {
    console.warn("Client image compression failed, using original", err);
    return file; // fallback to original
  }
}
