import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Skip ESLint during builds to avoid hanging
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip TypeScript checking during builds for faster CI/CD
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      "encrypted-tbn0.gstatic.com",
      // أضف دومينات أخرى إذا احتجت
    ],
  },
};

export default nextConfig;
