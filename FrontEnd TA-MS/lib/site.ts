const fallbackSiteUrl = 'https://taskflow.invalid';

export function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return explicit.startsWith('http') ? explicit : `https://${explicit}`;
  }

  const productionUrl =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || process.env.VERCEL_URL?.trim();
  if (productionUrl) {
    return productionUrl.startsWith('http') ? productionUrl : `https://${productionUrl}`;
  }

  return fallbackSiteUrl;
}

export const siteConfig = {
  name: 'TaskFlow AI',
  title: 'TaskFlow AI',
  description:
    'TaskFlow AI is a production-ready productivity workspace for task planning, attendance tracking, and connected knowledge management.',
  shortDescription: 'Startup-grade productivity workspace with tasks, attendance, and second-brain tooling.',
  url: getSiteUrl(),
  ogImage: '/og-card.svg',
};
