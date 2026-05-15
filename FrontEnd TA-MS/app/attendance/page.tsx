'use client';
import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { RefreshCw, CalendarDays } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { CheckInCard } from '@/components/attendance/CheckInCard';
import { LiveTimerCard } from '@/components/attendance/LiveTimerCard';
import { ProductivityCard } from '@/components/attendance/ProductivityCard';
import { BurnoutWarning } from '@/components/attendance/BurnoutWarning';
import { SessionTimeline } from '@/components/attendance/SessionTimeline';
import { InsightsPanel } from '@/components/attendance/InsightsPanel';
import { IdleModal } from '@/components/attendance/IdleModal';
import {
  getAttendanceToday,
  getAttendanceStats,
  getAttendanceCalendar,
  getAttendanceInsights,
  checkIn,
  checkOut,
  startBreak,
  endBreak,
  startDeepWork,
  endDeepWork,
  ApiError,
} from '@/lib/api';
import type {
  AttendanceRecord,
  AttendanceStats,
  AttendanceInsights,
  CalendarMonth,
  BreakType,
} from '@/lib/types';
import { formatDate, todayStr } from '@/lib/utils';

const AttendanceCalendar = dynamic(
  () => import('@/components/attendance/AttendanceCalendar').then((module) => module.AttendanceCalendar),
  {
    ssr: false,
    loading: () => <SkeletonCard />,
  },
);

const WeeklyStatsChart = dynamic(
  () => import('@/components/attendance/WeeklyStatsChart').then((module) => module.WeeklyStatsChart),
  {
    ssr: false,
    loading: () => <SkeletonCard />,
  },
);

export default function AttendancePage() {
  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [insights, setInsights] = useState<AttendanceInsights | null>(null);
  const [calendar, setCalendar] = useState<CalendarMonth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const today = todayStr();

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');

    const results = await Promise.allSettled([
      getAttendanceToday(),
      getAttendanceStats(),
      getAttendanceCalendar(2),
      getAttendanceInsights(),
    ]);

    const [recResult, stResult, calResult, insResult] = results;

    if (recResult.status === 'fulfilled') {
      setRecord(recResult.value);
    } else {
      console.error('[Attendance] getAttendanceToday failed:', recResult.reason);
    }

    if (stResult.status === 'fulfilled') {
      setStats(stResult.value);
    } else {
      console.error('[Attendance] getAttendanceStats failed:', stResult.reason);
    }

    if (calResult.status === 'fulfilled') {
      setCalendar(calResult.value);
    } else {
      console.error('[Attendance] getAttendanceCalendar failed:', calResult.reason);
    }

    if (insResult.status === 'fulfilled') {
      setInsights(insResult.value);
    } else {
      console.error('[Attendance] getAttendanceInsights failed:', insResult.reason);
    }

    const allFailed = results.every(r => r.status === 'rejected');
    if (allFailed) {
      const reasons = results
        .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
        .map(r => r.reason?.message || 'Unknown error')
        .join('; ');
      setError(`Could not load attendance data.\n${reasons}`);
    } else if (recResult.status === 'rejected') {
      setError('Could not load today\'s attendance record. Refresh to try again.');
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void loadAll();
    }, 0);
    return () => window.clearTimeout(id);
  }, [loadAll]);

  // Refresh computed fields every 60s while session is active
  useEffect(() => {
    if (!record?.checkIn || record.checkOut) return;
    const id = setInterval(async () => {
      try {
        const rec = await getAttendanceToday();
        setRecord(rec);
      } catch (err) {
        console.error('[Attendance] Polling refresh failed:', err);
      }
    }, 60_000);
    return () => clearInterval(id);
  }, [record?.checkIn, record?.checkOut]);

  async function handleAction(fn: () => Promise<AttendanceRecord>) {
    try {
      const updated = await fn();
      setRecord(updated);
      // Refresh stats + insights after any action
      const [stResult, insResult] = await Promise.allSettled([
        getAttendanceStats(),
        getAttendanceInsights(),
      ]);
      if (stResult.status === 'fulfilled') setStats(stResult.value);
      if (insResult.status === 'fulfilled') setInsights(insResult.value);
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message
        : err instanceof Error ? err.message
        : 'Action failed';
      setError(msg);
    }
  }

  const isSessionActive = !!(record?.checkIn && !record.checkOut);

  return (
    <PageWrapper
      title="Attendance"
      subtitle={`${formatDate(today)} — Work session tracker`}
      action={
        <Button
          variant="ghost"
          size="sm"
          onClick={loadAll}
          icon={<RefreshCw className="w-4 h-4" />}
        >
          Refresh
        </Button>
      }
    >
      {/* Idle detection modal */}
      {record && (
        <IdleModal
          active={isSessionActive}
          onStartBreak={() => handleAction(() => startBreak('idle'))}
          onDismiss={() => {}}
        />
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 whitespace-pre-line"
        >
          ⚠️ {error}
        </motion.div>
      )}

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <SkeletonCard />
            <div className="col-span-2"><SkeletonCard /></div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
          <SkeletonCard />
        </div>
      ) : !record ? null : (
        <div className="space-y-6">
          {/* ── Row 1: Controls + Live Timer ── */}
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-4">
              <CheckInCard
                record={record}
                onCheckIn={() => handleAction(checkIn)}
                onCheckOut={() => handleAction(checkOut)}
                onBreakStart={(type: BreakType) => handleAction(() => startBreak(type))}
                onBreakEnd={() => handleAction(endBreak)}
                onDeepWorkStart={() => handleAction(startDeepWork)}
                onDeepWorkEnd={() => handleAction(endDeepWork)}
              />
              {/* Burnout warning */}
              {insights && (
                <BurnoutWarning
                  risk={insights.burnoutRisk}
                  recommendations={insights.recommendations}
                />
              )}
            </div>

            <div className="col-span-2 space-y-4">
              {record.checkIn && <LiveTimerCard record={record} />}
              {!record.checkIn && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="h-full flex items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12"
                >
                  <div className="text-center">
                    <CalendarDays className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-base font-semibold text-gray-400">No work session started today</p>
                    <p className="text-sm text-gray-300 mt-1">
                      Click &ldquo;Check In&rdquo; to begin tracking your work day
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* ── Row 2: Productivity + Timeline ── */}
          <div className="grid grid-cols-3 gap-6">
            <ProductivityCard record={record} />
            <div className="col-span-2">
              <SessionTimeline timeline={record.timeline} />
            </div>
          </div>

          {/* ── Row 3: Weekly chart + Insights ── */}
          {stats && insights && (
            <div className="grid grid-cols-2 gap-6">
              <WeeklyStatsChart stats={stats.weeklyStats} />
              <InsightsPanel insights={insights} />
            </div>
          )}

          {/* ── Row 4: Calendar ── */}
          {calendar.length > 0 && (
            <AttendanceCalendar months={calendar} />
          )}
        </div>
      )}
    </PageWrapper>
  );
}
