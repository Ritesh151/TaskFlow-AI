'use client';

import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(248,113,113,0.14),_transparent_40%),linear-gradient(180deg,_#fff8f8_0%,_#f8fafc_100%)] px-6">
      <div className="max-w-lg rounded-[32px] border border-red-100 bg-white/90 p-8 shadow-[0_24px_80px_rgba(239,68,68,0.08)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-red-500">Application Error</p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-950">Something interrupted the workspace.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {error.message || 'An unexpected error occurred while rendering this route.'}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Retry
          </button>
          <Link
            href="/"
            className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
