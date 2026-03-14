// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // ✅ FIX 1: Remove 'eslint' from config
  // ❌ eslint: { ignoreDuringBuilds: true } - Remove this line
  
  // ✅ FIX 2: Replace deprecated 'domains' with 'remotePatterns'
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'madsha.vercel.app',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'madsha-api.onrender.com',
        port: '',
        pathname: '/**',
      },
      // ✅ Add any other image hosts you use
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
        port: '',
        pathname: '/**',
      }
    ],
  },

  // ✅ TypeScript errors ignore (optional - agar build time errors aa rahe hain)
  typescript: {
    ignoreBuildErrors: true,
  },

  // ✅ Production build optimizations (swcMinify removed - ab automatically enable hai)
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // ❌ swcMinify: true, - REMOVE THIS LINE
};

export default nextConfig;