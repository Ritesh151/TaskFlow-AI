'use client';

import { useMemo } from 'react';
import { ArrowUpRight, Flame, Network, Sparkles, TrendingUp } from 'lucide-react';
import type { BrainInsights as BrainInsightsData } from '@/lib/types';
import { noteConnectionCount } from '@/lib/brain';

interface BrainInsightsProps {
  stats: BrainInsightsData | null;
  onOpenNote: (noteId: string) => void;
  onSelectTopic: (topic: string) => void;
}

export function BrainInsights({ stats, onOpenNote, onSelectTopic }: BrainInsightsProps) {
  const sparkline = useMemo(() => {
    const growth = stats?.growth ?? [];
    if (growth.length === 0) return '';

    const max = Math.max(...growth.map(point => point.count), 1);
    return growth
      .map((point, index) => {
        const x = (index / Math.max(growth.length - 1, 1)) * 100;
        const y = 100 - (point.count / max) * 92;
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }, [stats?.growth]);

  return (
    <aside className="space-y-4 xl:sticky xl:top-6">
      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-400">
          <Network className="h-3.5 w-3.5 text-blue-500" />
          Intelligence rail
        </div>

        {stats?.mostConnectedNote ? (
          <button
            type="button"
            onClick={() => onOpenNote(stats.mostConnectedNote!.brainId)}
            className="mt-4 block w-full rounded-xl border border-blue-200 bg-blue-50 p-4 text-left transition hover:bg-blue-100"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-blue-600">Most connected note</p>
            <p className="mt-2 text-base font-semibold text-gray-900">{stats.mostConnectedNote.title}</p>
            <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
              <span>{noteConnectionCount(stats.mostConnectedNote)} live connections</span>
              <ArrowUpRight className="h-4 w-4 text-blue-400" />
            </div>
          </button>
        ) : (
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-400">
            Your most connected note will appear here once the graph starts linking.
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-400">
          <Flame className="h-3.5 w-3.5 text-orange-400" />
          Streak
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-3xl font-semibold text-gray-900">{stats?.streak.current ?? 0} days</p>
            <p className="mt-1 text-sm text-gray-500">Current knowledge streak</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-3xl font-semibold text-gray-900">{stats?.streak.longest ?? 0} days</p>
            <p className="mt-1 text-sm text-gray-500">Longest streak so far</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-400">
          <Sparkles className="h-3.5 w-3.5 text-violet-400" />
          Recent topics
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {(stats?.recentTopics ?? []).slice(0, 8).map(topic => (
            <button
              key={topic}
              type="button"
              onClick={() => onSelectTopic(topic)}
              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
            >
              {topic}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-400">
          <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          Growth analytics
        </div>

        {stats?.growth.length ? (
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <svg viewBox="0 0 100 100" className="h-28 w-full overflow-visible">
              <path d={sparkline} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
              <span>{stats.growth[0]?.date}</span>
              <span>{stats.growth[stats.growth.length - 1]?.date}</span>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-400">
            Growth analytics begin once notes start landing in your vault.
          </div>
        )}

        <div className="mt-4 space-y-2">
          {(stats?.topTechnologies ?? []).slice(0, 5).map(item => (
            <div key={item.name} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
              <span className="text-gray-600">{item.name}</span>
              <span className="text-gray-400">{item.count}</span>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}
