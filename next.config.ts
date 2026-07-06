import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    dangerouslyAllowSVG: true,
    unoptimized: process.env.STORAGE_ENABLED !== "true",
  },
};

export default nextConfig;
