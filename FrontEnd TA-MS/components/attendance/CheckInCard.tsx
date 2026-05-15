'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, LogOut, Coffee, Brain, Zap } from 'lucide-react';
import type { AttendanceRecord, BreakType } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { getLateCheckInMinutes, isEarlyCheckout } from '@/lib/workSchedule';

interface CheckInCardProps {
  record: AttendanceRecord;
  onCheckIn: () => Promise<void>;
  onCheckOut: () => Promise<void>;
  onBreakStart: (type: BreakType) => Promise<void>;
  onBreakEnd: () => Promise<void>;
  onDeepWorkStart: () => Promise<void>;
  onDeepWorkEnd: () => Promise<void>;
}

const BREAK_TYPES: { type: BreakType; label: string; emoji: string }[] = [
  { type: 'lunch', label: 'Lunch', emoji: '🍽️' },
  { type: 'tea', label: 'Tea', emoji: '☕' },
  { type: 'idle', label: 'Idle', emoji: '💤' },
  { type: 'custom', label: 'Other', emoji: '⏸️' },
];

export function CheckInCard({
  record,
  onCheckIn,
  onCheckOut,
  onBreakStart,
  onBreakEnd,
  onDeepWorkStart,
  onDeepWorkEnd,
}: CheckInCardProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [showBreakMenu, setShowBreakMenu] = useState(false);

  const isCheckedIn = !!record.checkIn;
  const isCheckedOut = !!record.checkOut;
  const isOnBreak = record.breaks.some(b => !b.end);
  const isDeepWork = record.deepWorkSessions.some(d => !d.end);

  const lateMin = record.checkIn ? getLateCheckInMinutes(record.checkIn) : null;
  const partialDay = !!(record.checkOut && isEarlyCheckout(record.checkOut));

  async function handle(key: string, fn: () => Promise<void>) {
    setLoading(key);
    try { await fn(); } finally { setLoading(null); setShowBreakMenu(false); }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
            <Zap className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Session Control</h3>
            <p className="text-xs text-gray-400">
              {!isCheckedIn
                ? 'Start your work day'
                : isCheckedOut
                ? 'Session complete'
                : isOnBreak
                ? 'Currently on break'
                : isDeepWork
                ? 'Deep focus mode active'
                : 'Session in progress'}
            </p>
          </div>
        </div>

        {(lateMin !== null || partialDay) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {lateMin !== null && (
              <Badge className="bg-amber-50 text-amber-800 border-amber-200" title="Based on 9:00 AM local start">
                Late ({lateMin} min)
              </Badge>
            )}
            {partialDay && (
              <Badge className="bg-violet-50 text-violet-700 border-violet-200" title="Check-out before 6:00 PM local">
                Partial Day
              </Badge>
            )}
          </div>
        )}

        {/* Primary action */}
        {!isCheckedIn && (
          <Button
            variant="success"
            size="lg"
            className="w-full"
            loading={loading === 'checkin'}
            icon={<LogIn className="w-4 h-4" />}
            onClick={() => handle('checkin', onCheckIn)}
          >
            Check In
          </Button>
        )}

        {isCheckedIn && !isCheckedOut && (
          <div className="space-y-3">
            {/* Break controls */}
            {!isOnBreak ? (
              <div className="relative">
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full"
                  loading={loading === 'break'}
                  icon={<Coffee className="w-4 h-4" />}
                  onClick={() => setShowBreakMenu(v => !v)}
                >
                  Start Break
                </Button>
                {showBreakMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-100 shadow-lg z-10 p-2"
                  >
                    {BREAK_TYPES.map(({ type, label, emoji }) => (
                      <button
                        key={type}
                        onClick={() => handle('break', () => onBreakStart(type))}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <span>{emoji}</span>
                        {label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            ) : (
              <Button
                variant="primary"
                size="md"
                className="w-full bg-amber-500 hover:bg-amber-600 shadow-amber-200"
                loading={loading === 'breakend'}
                icon={<Coffee className="w-4 h-4" />}
                onClick={() => handle('breakend', onBreakEnd)}
              >
                End Break
              </Button>
            )}

            {/* Deep work controls */}
            {!isDeepWork ? (
              <Button
                variant="ghost"
                size="md"
                className="w-full border border-purple-200 text-purple-600 hover:bg-purple-50"
                loading={loading === 'dw'}
                icon={<Brain className="w-4 h-4" />}
                onClick={() => handle('dw', onDeepWorkStart)}
              >
                Start Deep Work
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="md"
                className="w-full border border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100"
                loading={loading === 'dwend'}
                icon={<Brain className="w-4 h-4" />}
                onClick={() => handle('dwend', onDeepWorkEnd)}
              >
                End Deep Work
              </Button>
            )}

            {/* Check out */}
            <Button
              variant="danger"
              size="md"
              className="w-full"
              loading={loading === 'checkout'}
              icon={<LogOut className="w-4 h-4" />}
              onClick={() => handle('checkout', onCheckOut)}
            >
              Check Out
            </Button>
          </div>
        )}

        {isCheckedOut && (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-3">
              <LogOut className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-sm font-semibold text-gray-700">Session Complete</p>
            <p className="text-xs text-gray-400 mt-1">
              Checked out at{' '}
              {new Date(record.checkOut!).toLocaleTimeString('en-US', {
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
