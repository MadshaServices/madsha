// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['localhost', 'madsha.vercel.app'],
  },
  // ⚠️ This allows production builds to complete even with TypeScript errors
  typescript: {
    ignoreBuildErrors: true,
  },
  // ⚠️ This allows production builds to complete even with ESLint errors
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;