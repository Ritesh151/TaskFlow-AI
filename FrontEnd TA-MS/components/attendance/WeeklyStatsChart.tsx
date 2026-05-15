'use client';
import { motion } from 'framer-motion';
import type { AttendanceWeeklyStats } from '@/lib/types';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface WeeklyStatsChartProps {
  stats: AttendanceWeeklyStats[];
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}

function fmtHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function WeeklyStatsChart({ stats }: WeeklyStatsChartProps) {
  const maxWork = Math.max(...stats.map(s => s.workMinutes), 1);
  const STANDARD = 8 * 60; // 480 min

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-gray-800">7-Day Work Hours</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stats.map((day, i) => {
            const workPct = (day.workMinutes / Math.max(maxWork, STANDARD)) * 100;
            const deepPct = (day.deepWorkMinutes / Math.max(maxWork, STANDARD)) * 100;
            const isToday = day.date === new Date().toISOString().split('T')[0];

            return (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center gap-3"
              >
                <span className={cn(
                  'text-xs w-24 flex-shrink-0',
                  isToday ? 'font-semibold text-blue-600' : 'text-gray-500'
                )}>
                  {fmtDate(day.date)}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">
                      {day.workMinutes > 0 ? fmtHours(day.workMinutes) : '—'}
                    </span>
                    {day.productivityScore > 0 && (
                      <span className="text-xs font-medium text-gray-600">
                        {day.productivityScore}%
                      </span>
                    )}
                  </div>
                  <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                    {/* Work bar */}
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${workPct}%` }}
                      transition={{ duration: 0.6, delay: i * 0.06 }}
                      className="absolute inset-y-0 left-0 bg-blue-200 rounded-full"
                    />
                    {/* Deep work overlay */}
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${deepPct}%` }}
                      transition={{ duration: 0.6, delay: i * 0.06 + 0.1 }}
                      className="absolute inset-y-0 left-0 bg-purple-500 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-200" />
            <span className="text-xs text-gray-500">Work hours</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-xs text-gray-500">Deep work</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
