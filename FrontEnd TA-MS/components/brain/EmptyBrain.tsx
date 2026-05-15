'use client';

import { ArrowRight, Sparkles } from 'lucide-react';

interface EmptyBrainProps {
  onCreate: () => void;
}

export function EmptyBrain({ onCreate }: EmptyBrainProps) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto max-w-2xl">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-50">
          <svg viewBox="0 0 160 160" className="h-16 w-16 text-blue-400">
            <circle cx="42" cy="50" r="10" fill="currentColor" fillOpacity="0.8" />
            <circle cx="118" cy="44" r="8" fill="currentColor" fillOpacity="0.6" />
            <circle cx="82" cy="104" r="12" fill="currentColor" fillOpacity="0.9" />
            <circle cx="122" cy="116" r="9" fill="currentColor" fillOpacity="0.5" />
            <path d="M42 50L82 104L118 44M82 104L122 116" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeOpacity="0.8" fill="none" />
          </svg>
        </div>

        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          <Sparkles className="h-3.5 w-3.5" />
          Your vault is waiting
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Your second brain is empty.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-gray-500">
          Start capturing ideas before they disappear. Bugs, snippets, research, and random sparks all become reusable context once they land here.
        </p>

        <button
          type="button"
          onClick={onCreate}
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
        >
          Create first note
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
