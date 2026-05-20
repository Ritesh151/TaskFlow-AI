'use client';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { CheckInCard } from '@/components/attendance/CheckInCard';
import { LiveTimerCard } from '@/components/attendance/LiveTimerCard';
import { ProductivityCard } from '@/components/attendance/ProductivityCard';
import { BurnoutWarning } from '@/components/attendance/BurnoutWarning';
import { SessionTimeline } from '@/components/attendance/SessionTimeline';
import { InsightsPanel } from '@/components/attendance/InsightsPanel';
import { IdleModal } from '@/components/attendance/IdleModal';
import { useAttendanceAll, useAttendanceActions } from '@/lib/hooks/use-attendance';
import type { BreakType } from '@/lib/types';
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
  const today = todayStr();
  const {
    today: { data: record },
    stats: { data: stats },
    insights: { data: insights },
    calendar: { data: calendar },
    isLoading,
  } = useAttendanceAll();
  const actions = useAttendanceActions();

  const isSessionActive = !!(record?.checkIn && !record.checkOut);

  return (
    <PageWrapper
      title="Attendance"
      subtitle={`${formatDate(today)} — Work session tracker`}
    >
      {record && (
        <IdleModal
          active={isSessionActive}
          onStartBreak={() => { actions.startBreak('idle'); }}
          onDismiss={() => {}}
        />
      )}

      {isLoading ? (
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
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-4">
              <CheckInCard
                record={record}
                onCheckIn={async () => { await actions.checkIn(); }}
                onCheckOut={async () => { await actions.checkOut(); }}
                onBreakStart={async (type: BreakType) => { await actions.startBreak(type); }}
                onBreakEnd={async () => { await actions.endBreak(); }}
                onDeepWorkStart={async () => { await actions.startDeepWork(); }}
                onDeepWorkEnd={async () => { await actions.endDeepWork(); }}
              />
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

          <div className="grid grid-cols-3 gap-6">
            <ProductivityCard record={record} />
            <div className="col-span-2">
              <SessionTimeline timeline={record.timeline} />
            </div>
          </div>

          {stats && insights && (
            <div className="grid grid-cols-2 gap-6">
              <WeeklyStatsChart stats={stats.weeklyStats} />
              <InsightsPanel insights={insights} />
            </div>
          )}

          {calendar && calendar.length > 0 && (
            <AttendanceCalendar months={calendar} />
          )}
        </div>
      )}
    </PageWrapper>
  );
}
