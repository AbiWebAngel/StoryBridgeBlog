import { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 100],
    remotePatterns: [
      // R2 default public URLs
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
    useLightningcss: false, // ✅ Correct property name for Next 16+
  },
};

export default nextConfig;
