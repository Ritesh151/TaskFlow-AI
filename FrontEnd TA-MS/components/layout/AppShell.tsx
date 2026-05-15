'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Zap } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useSession } from '@/components/providers/SessionProvider';
import { ApiError } from '@/lib/api';

interface AppShellProps {
  children: React.ReactNode;
}

// Routes that should NOT show the sidebar or run the session guard
const NO_SIDEBAR_PATHS = ['/login'];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isPublicPage = NO_SIDEBAR_PATHS.includes(pathname);
  const { ready, session, signOut, sync } = useSession();

  useEffect(() => {
    if (isPublicPage) return;
    if (!ready) return;

    let mounted = true;

    const verifySession = async () => {
      try {
        await sync();
      } catch (error) {
        if (error instanceof ApiError && error.status !== 401 && error.status !== 403) {
          return;
        }
        if (!mounted) return;
        await signOut();
        router.push('/login');
        router.refresh();
      }
    };

    void verifySession();

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void verifySession();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      mounted = false;
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [isPublicPage, ready, router, signOut, sync]);

  useEffect(() => {
    if (isPublicPage || !ready || !session?.refreshTokenExpiresAt) return;

    const remainingMs = Math.max(0, new Date(session.refreshTokenExpiresAt).getTime() - Date.now());
    if (remainingMs <= 0) return;

    const timerId = window.setTimeout(async () => {
      await signOut();
      router.push('/login');
      router.refresh();
    }, remainingMs);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [isPublicPage, ready, router, session?.refreshTokenExpiresAt, signOut]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setMobileOpen(false);
    }, 0);
    return () => window.clearTimeout(id);
  }, [pathname]);

  const showSidebar = !isPublicPage;

  return (
    <>
      {showSidebar && (
        <>
          <div className="md:hidden fixed inset-x-0 top-0 z-40 h-16 border-b border-gray-200/80 bg-white/85 backdrop-blur-xl">
            <div className="flex h-full items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">TaskFlow AI</p>
                  <p className="text-xs text-gray-500">Productivity Assistant</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>

          <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        </>
      )}
      <main>{children}</main>
    </>
  );
}
