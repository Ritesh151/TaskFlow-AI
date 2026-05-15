'use client';

import { Toaster } from 'react-hot-toast';
import { PwaProvider } from './PwaProvider';
import { SessionProvider } from './SessionProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PwaProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: '18px',
              background: '#0f172a',
              color: '#f8fafc',
              boxShadow: '0 18px 48px rgba(15, 23, 42, 0.22)',
            },
          }}
        />
      </PwaProvider>
    </SessionProvider>
  );
}
