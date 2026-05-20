'use client';

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { login, logout, syncSession } from '@/lib/auth';
import { readSessionSnapshot, subscribeToSessionSnapshot } from '@/lib/session-storage';
import type { AuthSession } from '@/lib/types';

type SessionContextValue = {
  session: AuthSession | null;
  ready: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => ReturnType<typeof login>;
  signOut: () => Promise<void>;
  sync: () => Promise<AuthSession>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  // Memoize getSnapshot to ensure useSyncExternalStore gets a stable function ref
  const getSnapshot = useCallback(() => readSessionSnapshot(), []);

  const session = useSyncExternalStore(subscribeToSessionSnapshot, getSnapshot, () => null);

  // Stable callback refs — these don't depend on `session`, so they never change,
  // preventing downstream effects from re-running unnecessarily.
  const signIn = useCallback(async (email: string, password: string) => {
    return login(email, password);
  }, []);

  const signOut = useCallback(async () => {
    await logout();
  }, []);

  const sync = useCallback(() => syncSession(), []);

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      ready: true,
      isAuthenticated: Boolean(session),
      signIn,
      signOut,
      sync,
    }),
    [session, signIn, signOut, sync],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}
