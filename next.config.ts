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
    PORT: '3000',
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
  // إعدادات تجريبية
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material', 'lucide-react'],
    // إزالة bodySizeLimit لإزالة القيود تماماً
    serverComponentsExternalPackages: [],
  },
  // إعدادات API routes بدون قيود
  api: {
    bodyParser: {
      sizeLimit: '1000gb', // حد كبير جداً لإزالة القيود الفعلية
    },
    responseLimit: false,
  },
  // إعدادات خارجية للخادم
  serverExternalPackages: ['sharp'],
  // إضافة allowedDevOrigins لحل مشكلة Cross origin request
  allowedDevOrigins: [
    'localhost:3000',
    '127.0.0.1:3000',
    '10.5.50.197:3000',
    '10.5.50.197:*',
  ],
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },

};

export default nextConfig;
