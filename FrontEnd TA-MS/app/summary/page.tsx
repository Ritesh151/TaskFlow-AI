'use client';
import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, FileText, Sparkles, Calendar } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { getDailySummary } from '@/lib/api';
import type { DailySummary } from '@/lib/types';
import { todayStr, formatDate, formatHours, priorityBg } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

export default function SummaryPage() {
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getDailySummary(selectedDate);
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load the summary.');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void loadSummary();
    }, 0);
    return () => window.clearTimeout(id);
  }, [loadSummary]);

  return (
    <PageWrapper
      title="Daily Summary"
      subtitle="Auto-generated end-of-day productivity report"
      action={
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
        </div>
      }
    >
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : !summary ? (
        <p className="text-gray-400 text-sm">No data available.</p>
      ) : (
        <div className="space-y-6">
          {/* Header Banner */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-blue-100" />
              <span className="text-sm font-semibold text-blue-100">📅 Daily Report Generated Automatically</span>
            </div>
            <h2 className="text-xl font-bold">{formatDate(summary.date)}</h2>
            <p className="text-blue-100 text-sm mt-1">Generated at {new Date(summary.generatedAt).toLocaleTimeString()}</p>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Total Tasks', value: summary.completed.length + summary.pending.length, color: 'text-gray-800', bg: 'bg-gray-50' },
              { label: 'Completed', value: summary.completed.length, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Pending', value: summary.pending.length, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Productivity', value: `${summary.productivityScore}%`, color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`${stat.bg} rounded-2xl p-5 border border-gray-100`}
              >
                <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Completion Progress */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-gray-800">Completion Rate</h3>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-bold text-gray-900">{summary.completionRate}%</span>
                <span className="text-sm text-gray-400">{formatHours(summary.completedTime)} / {formatHours(summary.totalTime)}</span>
              </div>
              <ProgressBar
                value={summary.completionRate}
                color={summary.completionRate >= 75 ? 'green' : summary.completionRate >= 50 ? 'blue' : 'amber'}
                height="lg"
              />
            </CardContent>
          </Card>

          {/* Smart Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <h3 className="text-sm font-semibold text-gray-800">📌 Smart Summary</h3>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 leading-relaxed bg-purple-50 rounded-xl p-4 border border-purple-100">
                &ldquo;{summary.smartSummary}&rdquo;
              </p>
            </CardContent>
          </Card>

          {/* Completed Tasks */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <h3 className="text-sm font-semibold text-gray-800">✔ Completed Tasks</h3>
                <span className="px-2 py-0.5 bg-green-50 text-green-600 text-xs rounded-lg font-medium">
                  {summary.completed.length}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {summary.completed.length === 0 ? (
                <p className="text-sm text-gray-400">No completed tasks for this day.</p>
              ) : (
                <div className="space-y-2">
                  {summary.completed.map((task, i) => (
                    <motion.div
                      key={task.taskId}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between py-2.5 px-3 bg-green-50 rounded-xl border border-green-100"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{task.taskName}</span>
                        {task.client && <span className="text-xs text-gray-400">· {task.client}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={priorityBg(task.priority)}>{task.priority}</Badge>
                        <span className="text-xs text-gray-500 font-medium">{formatHours(task.duration)}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Tasks */}
          {summary.pending.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-semibold text-gray-800">⏳ Pending Tasks</h3>
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-xs rounded-lg font-medium">
                    {summary.pending.length}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {summary.pending.map((task, i) => (
                    <motion.div
                      key={task.taskId}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between py-2.5 px-3 bg-amber-50 rounded-xl border border-amber-100"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{task.taskName}</span>
                        {task.client && <span className="text-xs text-gray-400">· {task.client}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={priorityBg(task.priority)}>{task.priority}</Badge>
                        <span className="text-xs text-gray-500 font-medium">{formatHours(task.duration)}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Time Summary */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-gray-800">⏱ Time Summary</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-xl font-bold text-gray-800">{formatHours(summary.totalTime)}</p>
                  <p className="text-xs text-gray-400 mt-1">Total Assigned</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <p className="text-xl font-bold text-green-600">{formatHours(summary.completedTime)}</p>
                  <p className="text-xs text-gray-400 mt-1">Completed</p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-xl">
                  <p className="text-xl font-bold text-amber-600">{formatHours(summary.totalTime - summary.completedTime)}</p>
                  <p className="text-xs text-gray-400 mt-1">Remaining</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PageWrapper>
  );
}
