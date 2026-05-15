'use client';

import { motion } from 'framer-motion';
import { Code2, Lightbulb, Link2, NotebookTabs } from 'lucide-react';
import type { BrainInsights } from '@/lib/types';

interface BrainStatsProps {
  stats: BrainInsights | null;
}

export function BrainStats({ stats }: BrainStatsProps) {
  const items = [
    {
      label: 'Total Notes',
      value: stats?.totalNotes ?? 0,
      icon: NotebookTabs,
      gradient: 'from-blue-500 to-indigo-600',
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Linked Notes',
      value: stats?.linkedNotes ?? 0,
      icon: Link2,
      gradient: 'from-violet-500 to-fuchsia-600',
      bg: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
    {
      label: 'Ideas Captured',
      value: stats?.ideasCaptured ?? 0,
      icon: Lightbulb,
      gradient: 'from-amber-400 to-orange-500',
      bg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      label: 'Coding Snippets',
      value: stats?.codingSnippets ?? 0,
      icon: Code2,
      gradient: 'from-emerald-500 to-cyan-500',
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
        >
          <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${item.bg}`}>
            <item.icon className={`h-5 w-5 ${item.iconColor}`} />
          </div>
          <p className="text-2xl font-semibold tracking-tight text-gray-900">{item.value}</p>
          <p className="mt-1 text-sm text-gray-500">{item.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
