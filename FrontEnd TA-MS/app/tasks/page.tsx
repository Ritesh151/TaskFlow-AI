'use client';
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Plus, Search, Filter, X } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Card, CardContent } from '@/components/ui/Card';
import { getTasks, completeTask, deleteTask, updateTask } from '@/lib/api';
import type { Task, TaskPriority, TaskStatus } from '@/lib/types';
import { getTotalMinutesBetween } from '@/lib/taskTimeTracking';

type FilterPriority = TaskPriority | 'all';
type FilterStatus = TaskStatus | 'all';

function sortTasks(a: Task, b: Task): number {
  const rank = (s: TaskStatus) => {
    if (s === 'pending') return 0;
    if (s === 'in_progress') return 1;
    return 2;
  };
  const r = rank(a.status) - rank(b.status);
  if (r !== 0) return r;
  return b.date.localeCompare(a.date);
}

export default function TaskListPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [listError, setListError] = useState('');

  const replaceSortedTasks = useCallback((data: Task[]) => {
    const copy = [...data];
    copy.sort(sortTasks);
    setTasks(copy);
  }, []);

  const loadTasks = useCallback(
    async (opts?: { silent?: boolean }) => {
      const silent = opts?.silent === true;
      if (!silent) {
        setLoading(true);
        setListError('');
      }
      try {
        const data = await getTasks();
        replaceSortedTasks(data);
      } catch (e: unknown) {
        if (!silent) setListError(e instanceof Error ? e.message : 'Could not load tasks');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [replaceSortedTasks],
  );

  useEffect(() => {
    const id = window.setTimeout(() => {
      void loadTasks();
    }, 0);
    return () => window.clearTimeout(id);
  }, [loadTasks]);

  /** Re-fetch periodically while tab is visible (same GET /tasks — no WebSocket dependency) */
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const sync = () => {
      void loadTasks({ silent: true });
    };
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        if (!intervalId) intervalId = setInterval(sync, 10_000);
        sync();
      } else if (intervalId) {
        clearInterval(intervalId);
        intervalId = undefined;
      }
    };
    onVis();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      if (intervalId) clearInterval(intervalId);
    };
  }, [loadTasks]);

  async function handleComplete(id: string) {
    const stamp = new Date().toISOString();
    const previous = [...tasks];
    replaceSortedTasks(
      tasks.map(t => {
        if (t.taskId !== id) return t;
        const endIso =
          t.endTime != null
            ? typeof t.endTime === 'string'
              ? t.endTime
              : t.endTime instanceof Date
                ? t.endTime.toISOString()
                : stamp
            : stamp;
        const startNorm =
          typeof t.startTime === 'string'
            ? t.startTime
            : t.startTime instanceof Date
              ? t.startTime.toISOString()
              : undefined;
        const totalTimeSpent = getTotalMinutesBetween(startNorm ?? null, endIso);
        return {
          ...t,
          status: 'completed' as TaskStatus,
          endTime: endIso,
          totalTimeSpent: totalTimeSpent != null ? totalTimeSpent : null,
          isTimeTracked: Boolean(startNorm ?? endIso),
        };
      })
    );
    try {
      const updated = await completeTask(id);
      setTasks(curr => {
        const next = curr.map(t => (t.taskId === id ? updated : t));
        next.sort(sortTasks);
        return next;
      });
    } catch {
      replaceSortedTasks(previous);
      setListError('Could not mark task complete.');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this task?')) return;
    const prev = [...tasks];
    replaceSortedTasks(tasks.filter(t => t.taskId !== id));
    try {
      await deleteTask(id);
    } catch {
      replaceSortedTasks(prev);
      setListError('Could not delete task.');
    }
  }

  async function handleEdit(data: Omit<Task, 'taskId' | 'createdAt'>) {
    if (!editingTask) return;
    const editorRef = editingTask;
    const id = editorRef.taskId;
    const optimistic: Task = {
      ...editorRef,
      ...data,
      taskId: id,
      createdAt: editorRef.createdAt,
    };
    const prevSnap = [...tasks];
    replaceSortedTasks(tasks.map(t => (t.taskId === id ? optimistic : t)));
    setEditingTask(null);
    try {
      const refreshed = await updateTask(id, data);
      setTasks(curr => {
        const next = curr.map(t => (t.taskId === id ? refreshed : t));
        next.sort(sortTasks);
        return next;
      });
    } catch {
      replaceSortedTasks(prevSnap);
      setEditingTask(editorRef);
      setListError('Could not update task.');
    }
  }

  const filtered = tasks.filter(t => {
    const matchSearch =
      t.taskName.toLowerCase().includes(search.toLowerCase()) ||
      (t.client || '').toLowerCase().includes(search.toLowerCase());
    const matchPriority = filterPriority === 'all' || t.priority === filterPriority;
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchSearch && matchPriority && matchStatus;
  });

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;

  return (
    <PageWrapper
      title="Task List"
      subtitle={`${tasks.length} total tasks · ${pendingCount} pending · ${inProgressCount} in progress · ${completedCount} completed`}
      action={
        <Link href="/tasks/add">
          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
            Add Task
          </Button>
        </Link>
      }
    >
      {listError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600"
        >
          {listError}
        </motion.div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editingTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => {
              if (e.target === e.currentTarget) setEditingTask(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-gray-800">Edit Task</h2>
                <button type="button" onClick={() => setEditingTask(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <TaskForm
                key={editingTask.taskId}
                initial={editingTask}
                onSubmit={handleEdit}
                onCancel={() => setEditingTask(null)}
                submitLabel="Save Changes"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              />
            </div>

            {/* Priority filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Filter className="w-4 h-4 text-gray-400" />
              {(['all', 'high', 'medium', 'low'] as FilterPriority[]).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFilterPriority(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    filterPriority === p
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['all', 'pending', 'in_progress', 'completed'] as FilterStatus[]).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    filterStatus === s
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s === 'all'
                    ? 'All Status'
                    : s === 'in_progress'
                      ? 'In progress'
                      : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm">No tasks found.</p>
          {tasks.length === 0 && (
            <Link href="/tasks/add">
              <Button variant="primary" size="sm" className="mt-3">
                Create your first task
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-3">
            {filtered.map(task => (
              <TaskCard
                key={task.taskId}
                task={task}
                onComplete={handleComplete}
                onDelete={handleDelete}
                onEdit={setEditingTask}
              />
            ))}
          </div>
        </AnimatePresence>
      )}
    </PageWrapper>
  );
}
