import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration for Next.js 16
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wevgwiuodiknxgzjderd.supabase.co',
      },
    ],
  },
};

export default nextConfig;
