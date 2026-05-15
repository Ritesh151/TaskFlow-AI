'use client';
import { motion } from 'framer-motion';
import type { CalendarMonth, AttendanceStatus } from '@/lib/types';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface AttendanceCalendarProps {
  months: CalendarMonth[];
}



const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const statusStyle: Record<AttendanceStatus, string> = {
  present: 'bg-green-500 text-white',
  'half-day': 'bg-amber-400 text-white',
  absent: 'bg-red-100 text-red-400',
  'no-data': 'bg-gray-50 text-gray-300',
};

const legendItems: { status: AttendanceStatus; label: string }[] = [
  { status: 'present', label: 'Present' },
  { status: 'half-day', label: 'Half day' },
  { status: 'absent', label: 'Absent' },
  { status: 'no-data', label: 'Future' },
];

export function AttendanceCalendar({ months }: AttendanceCalendarProps) {
  const today = new Date().toISOString().split('T')[0];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">Attendance Calendar</h3>
          <div className="flex items-center gap-3">
            {legendItems.map(({ status, label }) => (
              <div key={status} className="flex items-center gap-1.5">
                <div className={cn('w-3 h-3 rounded-md', statusStyle[status])} />
                <span className="text-xs text-gray-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          {months.map((month, mi) => {
            // Compute leading empty cells
            const firstDay = new Date(month.year, month.month, 1).getDay();
            const cells: (typeof month.days[0] | null)[] = [
              ...Array(firstDay).fill(null),
              ...month.days,
            ];

            return (
              <div key={`${month.year}-${month.month}`}>
                <p className="text-xs font-semibold text-gray-600 mb-3">
                  {month.monthName} {month.year}
                </p>
                {/* Day headers */}
                <div className="grid grid-cols-7 mb-1">
                  {DAY_HEADERS.map(d => (
                    <div key={d} className="text-center text-xs text-gray-400 py-1">{d}</div>
                  ))}
                </div>
                {/* Day cells */}
                <div className="grid grid-cols-7 gap-y-1">
                  {cells.map((cell, idx) => {
                    if (!cell) return <div key={`e-${idx}`} />;
                    const isToday = cell.date === today;
                    return (
                      <motion.div
                        key={cell.date}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: mi * 0.05 + idx * 0.005 }}
                        title={`${cell.date}: ${cell.status}`}
                        className={cn(
                          'mx-auto w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium transition-transform hover:scale-110 cursor-default',
                          statusStyle[cell.status],
                          isToday && 'ring-2 ring-blue-500 ring-offset-1',
                        )}
                      >
                        {new Date(cell.date + 'T00:00:00').getDate()}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
