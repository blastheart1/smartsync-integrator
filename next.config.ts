import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.stickpng.com",
        pathname: "/img/icons-logos-emojis/tech-companies/billcom-app-logo*",
      },
    ],
  },
};

export default nextConfig;
