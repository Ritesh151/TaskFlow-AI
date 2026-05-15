import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TaskFlow AI',
    short_name: 'TaskFlow',
    description: 'Secure SaaS workspace for tasks, attendance, and second-brain knowledge capture.',
    start_url: '/',
    display: 'standalone',
    background_color: '#edf4ff',
    theme_color: '#1d4ed8',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/maskable-icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
