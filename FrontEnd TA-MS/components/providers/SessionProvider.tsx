'use client';

import {
  createContext,
  useContext,
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
  const session = useSyncExternalStore(subscribeToSessionSnapshot, readSessionSnapshot, () => null);

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      ready: true,
      isAuthenticated: Boolean(session),
      signIn: async (email: string, password: string) => {
        return login(email, password);
      },
      signOut: async () => {
        await logout();
      },
      sync: () => syncSession(),
    }),
    [session],
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
