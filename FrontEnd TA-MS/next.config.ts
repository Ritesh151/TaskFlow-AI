import type { NextConfig } from "next";

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const externalApiBase = rawApiUrl && /^https?:\/\//.test(rawApiUrl)
  ? rawApiUrl.replace(/\/$/, '')
  : null;

const nextConfig: NextConfig = {
  // Allow HMR connections from LAN IPs (e.g., mobile devices testing on same network).
  // Without this, Next.js 16 blocks cross-origin WebSocket connections to /_next/webpack-hmr.
  allowedDevOrigins: ['10.118.227.119'],
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
