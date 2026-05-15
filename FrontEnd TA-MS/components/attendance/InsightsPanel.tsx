'use client';
import { motion } from 'framer-motion';
import {
  Clock, Flame, Trophy, TrendingUp, BarChart3, Sun, Target,
} from 'lucide-react';
import type { AttendanceInsights } from '@/lib/types';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface InsightsPanelProps {
  insights: AttendanceInsights;
}

function fmtMin(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function InsightsPanel({ insights }: InsightsPanelProps) {
  const items = [
    {
      icon: Clock,
      label: 'Avg check-in',
      value: insights.avgCheckInTime ?? '—',
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      icon: BarChart3,
      label: 'Avg work day',
      value: insights.avgWorkDuration > 0 ? fmtMin(insights.avgWorkDuration) : '—',
      color: 'text-green-500',
      bg: 'bg-green-50',
    },
    {
      icon: Sun,
      label: 'Peak window',
      value: insights.mostProductiveWindow ?? '—',
      color: 'text-amber-500',
      bg: 'bg-amber-50',
    },
    {
      icon: Flame,
      label: 'Current streak',
      value: `${insights.currentStreak} day${insights.currentStreak !== 1 ? 's' : ''}`,
      color: 'text-orange-500',
      bg: 'bg-orange-50',
    },
    {
      icon: Trophy,
      label: 'Longest streak',
      value: `${insights.longestStreak} day${insights.longestStreak !== 1 ? 's' : ''}`,
      color: 'text-purple-500',
      bg: 'bg-purple-50',
    },
    {
      icon: TrendingUp,
      label: 'Overtime freq.',
      value: `${insights.overtimeFrequency}%`,
      color: insights.overtimeFrequency > 30 ? 'text-red-500' : 'text-gray-500',
      bg: insights.overtimeFrequency > 30 ? 'bg-red-50' : 'bg-gray-50',
    },
    {
      icon: Target,
      label: 'Consistency',
      value: `${insights.consistencyScore}%`,
      color: insights.consistencyScore >= 70 ? 'text-green-500' : 'text-amber-500',
      bg: insights.consistencyScore >= 70 ? 'bg-green-50' : 'bg-amber-50',
    },
    {
      icon: BarChart3,
      label: 'Total hours',
      value: `${insights.totalWorkHours}h`,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-gray-800">Smart Insights</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Based on {insights.totalDaysTracked} tracked day{insights.totalDaysTracked !== 1 ? 's' : ''}
        </p>
      </CardHeader>
      <CardContent>
        {insights.totalDaysTracked === 0 ? (
          <div className="text-center py-6">
            <BarChart3 className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Start tracking to see insights.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map(({ icon: Icon, label, value, color, bg }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2.5 p-3 bg-gray-50 rounded-xl"
              >
                <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', bg)}>
                  <Icon className={cn('w-3.5 h-3.5', color)} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
