'use client';

import { Layers3 } from 'lucide-react';
import type { BrainCluster } from '@/lib/types';
import { formatClusterLabel } from '@/lib/brain';

interface KnowledgeClustersProps {
  clusters: BrainCluster[];
  onSelectTopic: (topic: string) => void;
}

export function KnowledgeClusters({ clusters, onSelectTopic }: KnowledgeClustersProps) {
  if (clusters.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-400">
        <Layers3 className="h-3.5 w-3.5 text-blue-500" />
        Topic clusters
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {clusters.slice(0, 6).map(cluster => (
          <button
            key={cluster.clusterId}
            type="button"
            onClick={() => onSelectTopic(cluster.label)}
            className="rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-base font-semibold text-gray-900">{formatClusterLabel(cluster.label)}</p>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {cluster.noteCount} notes
              </span>
            </div>
            <div className="mt-4 h-2 rounded-full bg-gray-100">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                style={{ width: `${Math.max(12, Math.min(100, cluster.intensity))}%` }}
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {cluster.keywords.slice(0, 4).map(keyword => (
                <span
                  key={keyword}
                  className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-500"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
