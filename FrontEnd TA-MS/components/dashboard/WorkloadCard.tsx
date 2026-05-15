'use client';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Activity, TrendingUp } from 'lucide-react';
import type { WorkloadAnalysis } from '@/lib/types';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface WorkloadCardProps {
  data: WorkloadAnalysis;
}

const statusConfig = {
  empty: { icon: Activity, color: 'text-gray-400', bg: 'bg-gray-50', bar: 'blue' as const },
  normal: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', bar: 'green' as const },
  heavy: { icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-50', bar: 'amber' as const },
  overloaded: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50', bar: 'red' as const },
};

export function WorkloadCard({ data }: WorkloadCardProps) {
  const config = statusConfig[data.status];
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">Workload Status</h3>
          <p className="text-xs text-gray-400 mt-0.5">Today&apos;s capacity</p>
        </div>
        <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>
      </div>

      {/* Hours display */}
      <div className="mb-4">
        <div className="flex items-end justify-between mb-2">
          <span className="text-2xl font-bold text-gray-900">{data.totalHours.toFixed(1)}</span>
          <span className="text-sm text-gray-400 mb-1">/ 8 hrs</span>
        </div>
        <ProgressBar value={data.overloadPercent} color={config.bar} height="md" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 bg-gray-50 rounded-xl">
          <p className="text-lg font-bold text-gray-800">{data.totalTasks}</p>
          <p className="text-xs text-gray-400">Total</p>
        </div>
        <div className="text-center p-2 bg-green-50 rounded-xl">
          <p className="text-lg font-bold text-green-600">{data.completedCount}</p>
          <p className="text-xs text-gray-400">Done</p>
        </div>
        <div className="text-center p-2 bg-blue-50 rounded-xl">
          <p className="text-lg font-bold text-blue-600">{data.pendingCount}</p>
          <p className="text-xs text-gray-400">Pending</p>
        </div>
      </div>

      {/* Status message */}
      <p className={`text-xs font-medium ${config.color} mb-3`}>{data.message}</p>

      {/* Suggestions */}
      {data.suggestions.length > 0 && (
        <div className="space-y-1.5">
          {data.suggestions.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-2 text-xs text-gray-500"
            >
              <span className="text-amber-400 mt-0.5">→</span>
              {s}
            </motion.div>
          ))}
        </div>
      )}

      {data.overdueCount > 0 && (
        <div className="mt-3 px-3 py-2 bg-red-50 rounded-xl border border-red-100">
          <p className="text-xs text-red-600 font-medium">
            ⚠️ {data.overdueCount} overdue task{data.overdueCount > 1 ? 's' : ''} need attention
          </p>
        </div>
      )}
    </div>
  );
}
