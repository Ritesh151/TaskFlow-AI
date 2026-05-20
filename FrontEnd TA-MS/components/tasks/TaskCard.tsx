'use client';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Trash2, Edit2, Circle } from 'lucide-react';
import type { Task } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, formatHours, priorityBg, statusBg, formatDateTime, cn } from '@/lib/utils';
import {
  calculateDuration,
  deriveTimeTrackingBadge,
  formatTimeSpent,
  getTimeTrackingDisplayLabel,
  shouldWarnOutsideWorkHours,
} from '@/lib/taskTimeTracking';

interface TaskCardProps {
  task: Task;
  onComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (task: Task) => void;
  compact?: boolean;
}

function timeCell(iso?: string | Date | null) {
  const s = typeof iso === 'string' ? iso : iso instanceof Date ? iso.toISOString() : '';
  if (!s)
    return <span className="text-xs text-gray-400">—</span>;
  return (
    <span
      className="flex items-center gap-1 text-xs text-gray-600 whitespace-nowrap"
      title={new Date(s).toLocaleString()}
    >
      <Clock className="w-3 h-3 flex-shrink-0 text-gray-400" aria-hidden />
      {formatDateTime(s)}
    </span>
  );
}

export function TaskCard({ task, onComplete, onDelete, onEdit, compact = false }: TaskCardProps) {
  const isCompleted = task.status === 'completed';
  const trackingBadge = deriveTimeTrackingBadge(task);
  const durationStr =
    calculateDuration(task.startTime, task.endTime) ??
    (task.totalTimeSpent != null ? formatTimeSpent(task.totalTimeSpent) : null);
  const outsideHours = shouldWarnOutsideWorkHours(task);
  const completedTime = isCompleted && task.endTime
    ? typeof task.endTime === 'string'
      ? task.endTime
      : task.endTime instanceof Date
        ? task.endTime.toISOString()
        : null
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row sm:items-start gap-4',
        isCompleted && 'opacity-70'
      )}
    >
      {/* Status icon */}
      <button
        onClick={() => !isCompleted && onComplete?.(task.taskId)}
        className={cn(
          'mt-0.5 flex-shrink-0 transition-colors self-start sm:self-auto',
          isCompleted ? 'text-green-500 cursor-default' : 'text-gray-300 hover:text-blue-400'
        )}
        aria-label={isCompleted ? 'Completed' : 'Mark complete'}
      >
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : (
          <Circle className="w-5 h-5" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0 grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_repeat(4,minmax(0,0.95fr))] gap-x-4 gap-y-3">
        <div className="lg:col-span-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <p
              className={cn(
                'text-sm font-semibold text-gray-800 leading-snug',
                isCompleted && 'line-through text-gray-400'
              )}
            >
              {task.taskName}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge className={priorityBg(task.priority)}>{task.priority}</Badge>
            <Badge
              className={statusBg(
                trackingBadge.tone === 'completed'
                  ? 'completed'
                  : trackingBadge.tone === 'progress'
                    ? 'in_progress'
                    : 'pending'
              )}
            >
              {trackingBadge.tone === 'completed'
                ? `✅ Completed${completedTime ? ` at ${formatDateTime(completedTime)}` : ''}`
                : trackingBadge.tone === 'progress'
                  ? '🟡 In Progress'
                  : '⚪ Pending'}
            </Badge>
            {isCompleted && completedTime && (
              <span className="text-[10px] text-gray-400 whitespace-nowrap">
                {new Date(completedTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            {outsideHours && (
              <Badge className="bg-amber-50 text-amber-800 border-amber-200">⚠ Task outside work hours</Badge>
            )}
          </div>
        </div>

        {!compact && (
          <>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Start Time</span>
              {timeCell(task.startTime)}
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">End Time</span>
              {timeCell(task.endTime)}
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Duration</span>
              <span className="flex items-center gap-1 text-xs text-gray-600">
                <Clock className="w-3 h-3 text-gray-400" aria-hidden />
                {durationStr ?? '—'}
              </span>
            </div>
            <div className="flex flex-col gap-2 min-w-0">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Tracked</span>
              <span className="text-xs text-gray-600 leading-snug" title={getTimeTrackingDisplayLabel(task)}>
                {getTimeTrackingDisplayLabel(task)}
              </span>
            </div>
          </>
        )}

        {!compact && (
          <div className="lg:col-span-full flex flex-wrap items-center gap-3 mt-1 pt-1 border-t border-gray-50">
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              Est. {formatHours(task.duration)}
            </span>
            <span className="text-xs text-gray-400">{formatDate(task.date)}</span>
            {task.client && (
              <span className="text-xs text-gray-400">📁 {task.client}</span>
            )}
          </div>
        )}

        {!compact && task.technologies.length > 0 && (
          <div className="lg:col-span-full flex flex-wrap gap-1 mt-1">
            {task.technologies.map(tech => (
              <span
                key={tech}
                className="px-2 py-0.5 bg-purple-50 text-purple-600 text-xs rounded-lg border border-purple-100"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 flex-shrink-0 self-end sm:self-start">
        {!isCompleted && onComplete && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onComplete(task.taskId)}
            className="px-3 py-1.5 text-xs font-semibold bg-green-500 hover:bg-green-600 text-white shadow-sm border-0"
            aria-label="Mark complete"
          >
            Complete
          </Button>
        )}
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(task)}
            className="p-1.5 text-gray-400 hover:text-blue-500"
            aria-label="Edit task"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(task.taskId)}
            className="p-1.5 text-gray-400 hover:text-red-500"
            aria-label="Delete task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
