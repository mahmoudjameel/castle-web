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
  // إعدادات المنفذ
  env: {
    PORT: '3001',
  },
  // إعدادات الصور - استخدام remotePatterns بدلاً من domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material', 'lucide-react'],
  },
  // إضافة allowedDevOrigins لحل مشكلة Cross origin request
  allowedDevOrigins: [
    'localhost:3001',
    '127.0.0.1:3001',
    '10.5.50.197:3001',
    '10.5.50.197:*',
  ],
  headers: async () => {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
  // إعدادات PWA
  async rewrites() {
    return [
      {
        source: '/sw.js',
        destination: '/sw.js',
      },
    ];
  },
};

export default nextConfig;
