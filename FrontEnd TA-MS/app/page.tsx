'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Plus, Calendar, Zap } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { NextTaskCard } from '@/components/dashboard/NextTaskCard';
import { WorkloadCard } from '@/components/dashboard/WorkloadCard';
import { StatsRow } from '@/components/dashboard/StatsRow';
import { TaskCard } from '@/components/tasks/TaskCard';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { useTasks, useCompleteTask } from '@/lib/hooks/use-tasks';
import { useNextBestTask, useWorkload, useDailySummary } from '@/lib/hooks/use-intelligence';
import { todayStr, formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const today = todayStr();

  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: nextTask, isLoading: nextTaskLoading } = useNextBestTask();
  const { data: workload, isLoading: workloadLoading } = useWorkload(today);
  const { data: summary, isLoading: summaryLoading } = useDailySummary(today);
  const completeMutation = useCompleteTask();

  const loading = tasksLoading || nextTaskLoading || workloadLoading || summaryLoading;

  async function handleComplete(id: string) {
    try {
      await completeMutation.mutateAsync(id);
    } catch {
      /* error handled by mutation onError */
    }
  }

  const todayTasks = tasks.filter(t => t.date === today);

  return (
    <PageWrapper
      title="Dashboard"
      subtitle={`${formatDate(today)} — Your AI productivity assistant`}
      action={
        <div className="flex items-center gap-2">
          <Link href="/tasks/add">
            <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
              Add Task
            </Button>
          </Link>
        </div>
      }
    >
      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2"><SkeletonCard /></div>
            <SkeletonCard />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {workload && (
            <StatsRow workload={workload} productivityScore={summary?.productivityScore} />
          )}

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <NextTaskCard data={nextTask ?? null} onComplete={handleComplete} />

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <h2 className="text-sm font-semibold text-gray-800">Today&apos;s Tasks</h2>
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-lg font-medium">
                        {todayTasks.length}
                      </span>
                    </div>
                    <Link href="/tasks" className="text-xs text-blue-500 hover:text-blue-600 font-medium">
                      View all →
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {todayTasks.length === 0 ? (
                    <div className="text-center py-8">
                      <Zap className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No tasks for today.</p>
                      <Link href="/tasks/add">
                        <Button variant="primary" size="sm" className="mt-3">
                          Add your first task
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <AnimatePresence>
                      <div className="space-y-3">
                        {todayTasks.map(task => (
                          <TaskCard
                            key={task.taskId}
                            task={task}
                            onComplete={handleComplete}
                            compact
                          />
                        ))}
                      </div>
                    </AnimatePresence>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {workload && <WorkloadCard data={workload} />}

              {summary && (
                <Card>
                  <CardHeader>
                    <h2 className="text-sm font-semibold text-gray-800">📅 Daily Summary</h2>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Completion</span>
                        <span className="text-sm font-bold text-gray-800">{summary.completionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${summary.completionRate}%` }}
                          transition={{ duration: 0.8 }}
                          className="h-2 bg-green-500 rounded-full"
                        />
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{summary.smartSummary}</p>
                      <Link href="/summary">
                        <Button variant="ghost" size="sm" className="w-full text-blue-500 hover:bg-blue-50">
                          View Full Report →
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
