'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BrainCircuit,
  LayoutDashboard,
  PlusCircle,
  ListTodo,
  FileText,
  BarChart3,
  Zap,
  LogOut,
  CalendarDays,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from '@/components/providers/SessionProvider';
import { InstallAppButton } from '@/components/pwa/InstallAppButton';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tasks/add', label: 'Add Task', icon: PlusCircle },
  { href: '/tasks', label: 'Task List', icon: ListTodo },
  { href: '/summary', label: 'Daily Summary', icon: FileText },
  { href: '/insights', label: 'Insights', icon: BarChart3 },
  { href: '/brain', label: 'Second Brain', icon: BrainCircuit },
  { href: '/attendance', label: 'Attendance', icon: CalendarDays },
];

// ---------------------------------------------------------------------------
// Session countdown hook
// Updates every minute. Returns a human-readable string like "7h 42m".
// ---------------------------------------------------------------------------
function useSessionCountdown(expiresAt?: string) {
  const [state, setState] = useState({ label: '', isLow: false });

  useEffect(() => {
    function compute() {
      const expiryMs = expiresAt ? new Date(expiresAt).getTime() : 0;
      const ms = Math.max(0, expiryMs - Date.now());
      if (ms <= 0) {
        setState({ label: 'Session expired', isLow: false });
        return;
      }
      const totalMinutes = Math.ceil(ms / 60_000);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const isLow = ms < 30 * 60_000;

      if (hours > 0 && minutes > 0) {
        setState({ label: `${hours}h ${minutes}m left`, isLow });
      } else if (hours > 0) {
        setState({ label: `${hours}h left`, isLow });
      } else {
        setState({ label: `${minutes}m left`, isLow });
      }
    }

    compute();
    // Refresh the label every 60 seconds
    const id = window.setInterval(compute, 60_000);
    return () => window.clearInterval(id);
  }, [expiresAt]);

  return state;
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------
interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, signOut } = useSession();
  const { label: sessionLabel, isLow } = useSessionCountdown(session?.refreshTokenExpiresAt);

  async function handleLogout() {
    await signOut();
    router.push('/login');
    router.refresh();
  }

  const userName = session?.user.name || 'Authenticated User';
  const userRole = session?.user.role || 'workspace member';

  return (
    <>
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-100">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md shadow-blue-200">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 leading-tight">TaskFlow AI</h1>
              <p className="text-xs text-gray-400">Productivity Assistant</p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} onClick={onClose}>
              <motion.div
                whileHover={{ x: 2 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  active
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                )}
              >
                <Icon className={cn('w-4 h-4', active ? 'text-blue-500' : 'text-gray-400')} />
                {label}
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer — session info + logout */}
      <div className="px-4 py-4 border-t border-gray-100 space-y-3">
        <div className="px-2 space-y-1">
          <p className="text-xs font-medium text-gray-700 leading-tight">{userName}</p>
          <p className="text-[11px] uppercase tracking-wide text-gray-400">{userRole}</p>
          {sessionLabel && (
            <p className={cn('text-xs', isLow ? 'text-amber-600' : 'text-gray-400')}>
              {sessionLabel}
            </p>
          )}
        </div>

        <InstallAppButton />

        <motion.button
          onClick={() => {
            void handleLogout();
          }}
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.15 }}
          aria-label="Sign out"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors group"
        >
          <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
          Sign out
        </motion.button>
      </div>
    </>
  );
}

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  return (
    <>
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 flex-col z-40 shadow-sm">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 z-50"
          >
            <button
              type="button"
              aria-label="Close navigation overlay"
              className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm"
              onClick={onClose}
            />

            <motion.aside
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative flex h-full w-[86vw] max-w-xs flex-col bg-white shadow-2xl"
            >
              <SidebarContent onClose={onClose} />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
