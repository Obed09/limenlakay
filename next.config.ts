import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration for Next.js 16
  reactStrictMode: false,
  typescript: {
    // Dangerously allow production builds even with type errors
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wevgwiuodiknxgzjderd.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
    unoptimized: true, // For placeholder images during development
  },
};

export default nextConfig;
