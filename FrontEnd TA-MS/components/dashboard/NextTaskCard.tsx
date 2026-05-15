'use client';
import { motion } from 'framer-motion';
import { Sparkles, Clock, ArrowRight } from 'lucide-react';
import type { NextBestTask } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { formatHours } from '@/lib/utils';

interface NextTaskCardProps {
  data: NextBestTask | null;
  onComplete?: (id: string) => void;
}

export function NextTaskCard({ data, onComplete }: NextTaskCardProps) {
  if (!data) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center">
        <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-400">No pending tasks. Great work! 🎉</p>
      </div>
    );
  }

  const { task, reason } = data;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg shadow-blue-200"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-semibold text-blue-100 uppercase tracking-wider">
            Suggested Next Task
          </span>
        </div>

        <h3 className="text-lg font-bold text-white mb-1 leading-snug">{task.taskName}</h3>

        <p className="text-sm text-blue-100 mb-4 flex items-center gap-1.5">
          <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
          {reason}
        </p>

        <div className="flex items-center gap-3 mb-5">
          <span className="flex items-center gap-1.5 text-xs text-blue-100">
            <Clock className="w-3.5 h-3.5" />
            {formatHours(task.duration)}
          </span>
          <span className="px-2.5 py-0.5 rounded-lg bg-white/20 text-white text-xs font-medium border border-white/20">
            {task.priority} priority
          </span>
          {task.client && (
            <span className="text-xs text-blue-100">📁 {task.client}</span>
          )}
        </div>

        {onComplete && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onComplete(task.taskId)}
            className="bg-white text-blue-600 hover:bg-blue-50 border-0"
          >
            Mark Complete
          </Button>
        )}
      </div>
    </motion.div>
  );
}
