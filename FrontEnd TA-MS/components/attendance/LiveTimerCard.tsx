'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Timer, Coffee, Brain } from 'lucide-react';
import type { AttendanceRecord } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface LiveTimerCardProps {
  record: AttendanceRecord;
}

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
}

function elapsedSeconds(isoStart: string, isoEnd?: string | null): number {
  const start = new Date(isoStart).getTime();
  const end = isoEnd ? new Date(isoEnd).getTime() : Date.now();
  return Math.max(0, Math.floor((end - start) / 1000));
}

export function LiveTimerCard({ record }: LiveTimerCardProps) {
  const [tick, setTick] = useState(0);

  // Tick every second while session is active
  useEffect(() => {
    if (!record.checkIn || record.checkOut) return;
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [record.checkIn, record.checkOut]);

  if (!record.checkIn) return null;

  // Compute live work seconds (elapsed - break time)
  const totalElapsed = elapsedSeconds(record.checkIn, record.checkOut);
  const breakSeconds = record.breaks.reduce((sum, b) => {
    return sum + elapsedSeconds(b.start, b.end);
  }, 0);
  const workSeconds = Math.max(0, totalElapsed - breakSeconds);

  const isOnBreak = record.breaks.some(b => !b.end);
  const isDeepWork = record.deepWorkSessions.some(d => !d.end);
  const isCheckedOut = !!record.checkOut;

  const statusLabel = isCheckedOut
    ? 'Session ended'
    : isOnBreak
    ? 'On break'
    : isDeepWork
    ? 'Deep work'
    : 'Working';

  const statusColor = isCheckedOut
    ? 'text-gray-400'
    : isOnBreak
    ? 'text-amber-500'
    : isDeepWork
    ? 'text-purple-500'
    : 'text-green-500';

  const dotColor = isCheckedOut
    ? 'bg-gray-300'
    : isOnBreak
    ? 'bg-amber-400'
    : isDeepWork
    ? 'bg-purple-500'
    : 'bg-green-500';

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 px-6 py-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={cn('w-2 h-2 rounded-full', dotColor, !isCheckedOut && 'animate-pulse')} />
            <span className={cn('text-xs font-semibold uppercase tracking-wider', statusColor)}>
              {statusLabel}
            </span>
          </div>
          {isDeepWork && !isCheckedOut && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/20 rounded-lg border border-purple-500/30">
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs text-purple-300 font-medium">Deep Focus</span>
            </div>
          )}
          {isOnBreak && !isCheckedOut && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 rounded-lg border border-amber-500/30">
              <Coffee className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-amber-300 font-medium">Break</span>
            </div>
          )}
        </div>

        {/* Main timer */}
        <div className="text-center py-2">
          <motion.p
            key={tick}
            className="text-4xl font-bold text-white font-mono tracking-tight"
          >
            {formatDuration(workSeconds)}
          </motion.p>
          <p className="text-xs text-gray-400 mt-1.5">Net work time</p>
        </div>

        {/* Sub-stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            {
              label: 'Check-in',
              value: new Date(record.checkIn).toLocaleTimeString('en-US', {
                hour: '2-digit', minute: '2-digit',
              }),
              icon: Timer,
              color: 'text-blue-400',
            },
            {
              label: 'Break time',
              value: formatDuration(breakSeconds).replace(/00s$/, '').trim() || '0m 00s',
              icon: Coffee,
              color: 'text-amber-400',
            },
            {
              label: 'Deep work',
              value: formatDuration(
                record.deepWorkSessions.reduce((s, d) => s + elapsedSeconds(d.start, d.end), 0)
              ).replace(/00s$/, '').trim() || '0m 00s',
              icon: Brain,
              color: 'text-purple-400',
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="text-center p-2.5 bg-white/5 rounded-xl">
              <Icon className={cn('w-4 h-4 mx-auto mb-1', color)} />
              <p className="text-sm font-semibold text-white">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
