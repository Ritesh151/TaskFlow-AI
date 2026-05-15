'use client';

import { Orbit, Sparkles } from 'lucide-react';
import type { BrainInsights } from '@/lib/types';
import { BrainStats } from './BrainStats';

interface BrainHeaderProps {
  stats: BrainInsights | null;
}

export function BrainHeader({ stats }: BrainHeaderProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            <Sparkles className="h-3.5 w-3.5" />
            Knowledge operating system
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Second Brain
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
            Capture ideas, bugs, snippets, and research the moment they appear. The local
            intelligence engine continuously maps related notes and tasks so your context stays connected.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <Orbit className="h-5 w-5 text-blue-500" />
          <div>
            <p className="text-sm font-medium text-gray-900">Knowledge graph live</p>
            <p className="text-xs text-gray-400">
              {stats?.linkedNotes ?? 0} connected note{stats && stats.linkedNotes !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      <BrainStats stats={stats} />
    </section>
  );
}
