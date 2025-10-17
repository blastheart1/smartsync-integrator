import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable experimental features that cause permission issues
  experimental: {
    // Disable any features that might create trace files
  },
};

export default nextConfig;
