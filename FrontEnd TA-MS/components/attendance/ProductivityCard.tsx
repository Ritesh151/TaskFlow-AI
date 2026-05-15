'use client';
import { motion } from 'framer-motion';
import { TrendingUp, CheckCircle2, Clock, Brain } from 'lucide-react';
import type { AttendanceRecord } from '@/lib/types';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/utils';

interface ProductivityCardProps {
  record: AttendanceRecord;
}

function fmtMin(minutes: number): string {
  if (minutes === 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function ProductivityCard({ record }: ProductivityCardProps) {
  const score = record.productivityScore;
  const scoreColor =
    score >= 75 ? 'text-green-600' :
    score >= 50 ? 'text-blue-600' :
    score >= 25 ? 'text-amber-600' :
    'text-red-500';

  const barColor =
    score >= 75 ? 'green' :
    score >= 50 ? 'blue' :
    score >= 25 ? 'amber' :
    'red';

  const stats = [
    {
      label: 'Work time',
      value: fmtMin(record.totalWorkMinutes),
      icon: Clock,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      label: 'Deep work',
      value: fmtMin(record.deepWorkMinutes),
      icon: Brain,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
    },
    {
      label: 'Tasks done',
      value: String(record.tasksCompleted),
      icon: CheckCircle2,
      color: 'text-green-500',
      bg: 'bg-green-50',
    },
    {
      label: 'Overtime',
      value: fmtMin(record.overtimeMinutes),
      icon: TrendingUp,
      color: record.overtimeMinutes > 0 ? 'text-red-500' : 'text-gray-400',
      bg: record.overtimeMinutes > 0 ? 'bg-red-50' : 'bg-gray-50',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-semibold text-gray-800">Productivity</h3>
          </div>
          <span className={cn('text-2xl font-bold', scoreColor)}>{score}</span>
        </div>
      </CardHeader>
      <CardContent>
        <ProgressBar
          value={score}
          color={barColor as 'green' | 'blue' | 'amber' | 'red'}
          height="md"
          className="mb-5"
        />
        <div className="grid grid-cols-2 gap-3">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl"
            >
              <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', bg)}>
                <Icon className={cn('w-3.5 h-3.5', color)} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
