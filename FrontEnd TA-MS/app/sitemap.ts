import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site';

const routes = ['/', '/login', '/tasks', '/tasks/add', '/summary', '/insights', '/brain', '/attendance'];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/' ? 'daily' : 'weekly',
    priority: route === '/' ? 1 : 0.7,
  }));
}
