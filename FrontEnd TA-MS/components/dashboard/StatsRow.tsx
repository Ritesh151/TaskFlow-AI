'use client';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import type { WorkloadAnalysis } from '@/lib/types';
import { formatHours } from '@/lib/utils';

interface StatsRowProps {
  workload: WorkloadAnalysis;
  productivityScore?: number;
}

export function StatsRow({ workload, productivityScore }: StatsRowProps) {
  const stats = [
    {
      label: 'Completed Today',
      value: workload.completedCount,
      sub: formatHours(workload.completedHours),
      icon: CheckCircle2,
      color: 'text-green-500',
      bg: 'bg-green-50',
    },
    {
      label: 'Pending Tasks',
      value: workload.pendingCount,
      sub: formatHours(workload.pendingHours),
      icon: Clock,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      label: 'Overdue',
      value: workload.overdueCount,
      sub: 'needs attention',
      icon: AlertCircle,
      color: workload.overdueCount > 0 ? 'text-red-500' : 'text-gray-400',
      bg: workload.overdueCount > 0 ? 'bg-red-50' : 'bg-gray-50',
    },
    {
      label: 'Productivity',
      value: `${productivityScore ?? 0}%`,
      sub: 'today\'s score',
      icon: TrendingUp,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-gray-500">{stat.label}</p>
            <div className={`w-8 h-8 rounded-xl ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
        </motion.div>
      ))}
    </div>
  );
}
