import type { NextConfig } from "next";

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const externalApiBase = rawApiUrl && /^https?:\/\//.test(rawApiUrl)
  ? rawApiUrl.replace(/\/$/, '')
  : null;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  output: 'standalone',
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    remotePatterns: externalApiBase
      ? [
          {
            protocol: externalApiBase.startsWith('https://') ? 'https' : 'http',
            hostname: new URL(externalApiBase).hostname,
            pathname: '/**',
          },
        ]
      : [],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-hot-toast'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
      {
        source: '/(icon|maskable-icon|og-card).:ext*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
  async rewrites() {
    if (!externalApiBase) {
      return [];
    }

    return [
      {
        source: '/api/:path*',
        destination: `${externalApiBase}/:path*`,
      },
    ];
  },
};

export default nextConfig;
