'use client';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Target, AlertCircle, Code2 } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { getInsights } from '@/lib/api';
import type { Insights } from '@/lib/types';
import { formatDate, formatHours } from '@/lib/utils';

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadInsights = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getInsights();
      setInsights(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load insights.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void loadInsights();
    }, 0);
    return () => window.clearTimeout(id);
  }, [loadInsights]);

  return (
    <PageWrapper
      title="Insights"
      subtitle="Productivity analytics and workload patterns"
    >
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : !insights ? (
        <p className="text-gray-400 text-sm">No data available.</p>
      ) : (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-4 gap-4">
            {[
              {
                label: 'Total Tasks',
                value: insights.totalTasks,
                icon: Target,
                color: 'text-blue-500',
                bg: 'bg-blue-50',
              },
              {
                label: 'Completed',
                value: insights.completedTasks,
                icon: TrendingUp,
                color: 'text-green-500',
                bg: 'bg-green-50',
              },
              {
                label: 'Overdue',
                value: insights.overdueTasks,
                icon: AlertCircle,
                color: insights.overdueTasks > 0 ? 'text-red-500' : 'text-gray-400',
                bg: insights.overdueTasks > 0 ? 'bg-red-50' : 'bg-gray-50',
              },
              {
                label: 'Completion Rate',
                value: `${insights.overallCompletionRate}%`,
                icon: BarChart3,
                color: 'text-purple-500',
                bg: 'bg-purple-50',
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-gray-500">{stat.label}</p>
                  <div className={`w-8 h-8 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Weekly Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-semibold text-gray-800">7-Day Activity</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.weeklyData.map((day, i) => {
                  const maxHours = Math.max(...insights.weeklyData.map(d => d.hours), 1);
                  const completionPct = day.total > 0 ? Math.round((day.completed / day.total) * 100) : 0;
                  return (
                    <motion.div
                      key={day.date}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-center gap-4"
                    >
                      <span className="text-xs text-gray-500 w-20 flex-shrink-0">{formatDate(day.date)}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-400">
                            {day.completed}/{day.total} tasks · {formatHours(day.hours)}
                          </span>
                          <span className="text-xs font-medium text-gray-600">{completionPct}%</span>
                        </div>
                        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                          {/* Total hours bar */}
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(day.hours / maxHours) * 100}%` }}
                            transition={{ duration: 0.6, delay: i * 0.06 }}
                            className="absolute inset-y-0 left-0 bg-blue-100 rounded-full"
                          />
                          {/* Completed hours bar */}
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(day.completedHours / maxHours) * 100}%` }}
                            transition={{ duration: 0.6, delay: i * 0.06 + 0.1 }}
                            className="absolute inset-y-0 left-0 bg-blue-500 rounded-full"
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-xs text-gray-500">Completed hours</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-blue-100" />
                  <span className="text-xs text-gray-500">Total assigned hours</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Priority Breakdown + Technologies */}
          <div className="grid grid-cols-2 gap-6">
            {/* Priority Breakdown */}
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold text-gray-800">Pending by Priority</h3>
              </CardHeader>
              <CardContent>
                {Object.entries(insights.priorityBreakdown).every(([, v]) => v === 0) ? (
                  <p className="text-sm text-gray-400">No pending tasks.</p>
                ) : (
                  <div className="space-y-4">
                    {[
                      { key: 'high', label: 'High Priority', color: 'red' as const, textColor: 'text-red-600' },
                      { key: 'medium', label: 'Medium Priority', color: 'amber' as const, textColor: 'text-amber-600' },
                      { key: 'low', label: 'Low Priority', color: 'green' as const, textColor: 'text-green-600' },
                    ].map(({ key, label, color, textColor }) => {
                      const count = insights.priorityBreakdown[key as keyof typeof insights.priorityBreakdown];
                      const total = Object.values(insights.priorityBreakdown).reduce((a, b) => a + b, 0);
                      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                      return (
                        <div key={key}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className={`text-xs font-medium ${textColor}`}>{label}</span>
                            <span className="text-xs text-gray-500">{count} tasks ({pct}%)</span>
                          </div>
                          <ProgressBar value={pct} color={color} height="sm" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Technologies */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-purple-500" />
                  <h3 className="text-sm font-semibold text-gray-800">Top Technologies</h3>
                </div>
              </CardHeader>
              <CardContent>
                {insights.topTechnologies.length === 0 ? (
                  <p className="text-sm text-gray-400">No technology data yet.</p>
                ) : (
                  <div className="space-y-3">
                    {insights.topTechnologies.map((tech, i) => {
                      const maxCount = insights.topTechnologies[0].count;
                      return (
                        <motion.div
                          key={tech.name}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.07 }}
                          className="flex items-center gap-3"
                        >
                          <span className="text-xs font-medium text-gray-700 w-24 truncate">{tech.name}</span>
                          <div className="flex-1">
                            <ProgressBar
                              value={(tech.count / maxCount) * 100}
                              color="purple"
                              height="sm"
                            />
                          </div>
                          <span className="text-xs text-gray-400 w-8 text-right">{tech.count}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Overall Completion */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-gray-800">Overall Completion Rate</h3>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="relative w-24 h-24">
                    <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3" />
                      <motion.circle
                        cx="18" cy="18" r="15.9"
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${insights.overallCompletionRate} ${100 - insights.overallCompletionRate}`}
                        strokeDashoffset="0"
                        initial={{ strokeDasharray: '0 100' }}
                        animate={{ strokeDasharray: `${insights.overallCompletionRate} ${100 - insights.overallCompletionRate}` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-800">{insights.overallCompletionRate}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Tasks Created</span>
                    <span className="text-sm font-semibold text-gray-800">{insights.totalTasks}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Tasks Completed</span>
                    <span className="text-sm font-semibold text-green-600">{insights.completedTasks}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Overdue Tasks</span>
                    <span className={`text-sm font-semibold ${insights.overdueTasks > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                      {insights.overdueTasks}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PageWrapper>
  );
}
