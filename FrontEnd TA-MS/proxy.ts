import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login'];
const API_PREFIX = '/api';

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const isPublicAsset = /\.(?:svg|png|jpg|jpeg|webp|gif|ico|txt|xml|webmanifest)$/i.test(pathname);

  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith(API_PREFIX) ||
    pathname.startsWith('/_next') ||
    isPublicAsset ||
    pathname.startsWith('/favicon') ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/sw.js' ||
    pathname === '/offline.html' ||
    pathname.startsWith('/icon') ||
    pathname.startsWith('/apple-icon') ||
    pathname.startsWith('/maskable-icon')
  ) {
    return NextResponse.next();
  }

  const auth = request.cookies.get('tf_refresh');

  if (!auth?.value) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml|sw.js).*)'],
};
