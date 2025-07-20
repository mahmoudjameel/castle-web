import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'encrypted-tbn0.gstatic.com',
      // أضف دومينات أخرى إذا احتجت
    ],
  },
};

export default nextConfig;
