import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration for Next.js 16
  reactStrictMode: false,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
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
