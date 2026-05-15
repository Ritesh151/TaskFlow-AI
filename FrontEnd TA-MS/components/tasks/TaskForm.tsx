'use client';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Clock } from 'lucide-react';
import type { Task, TaskPriority, TaskStatus } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { todayStr, cn } from '@/lib/utils';
import {
  buildNormalizedTaskPayload,
  toDatetimeLocalInputValue,
  validateTaskTimeInputs,
} from '@/lib/taskTimeTracking';
import { isInstantOutsideWorkWindow } from '@/lib/workSchedule';

interface TaskFormProps {
  initial?: Partial<Task>;
  onSubmit: (data: Omit<Task, 'taskId' | 'createdAt'>) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

const DEFAULT_CREATE_DURATION_HOURS = 1;

function durationForSubmit(initial?: Partial<Task>): number {
  if (initial?.taskId) {
    const d = initial.duration;
    if (typeof d === 'number' && !Number.isNaN(d) && d > 0) return d;
    const p = parseFloat(String(d ?? '1'));
    return !Number.isNaN(p) && p > 0 ? p : 1;
  }
  return DEFAULT_CREATE_DURATION_HOURS;
}

export function TaskForm({ initial, onSubmit, onCancel, submitLabel = 'Create Task' }: TaskFormProps) {
  const [taskName, setTaskName] = useState(initial?.taskName || '');
  const [date, setDate] = useState(initial?.date || todayStr());
  const [priority, setPriority] = useState<TaskPriority>(initial?.priority || 'medium');
  const [status, setStatus] = useState<TaskStatus>(initial?.status || 'pending');
  const [client, setClient] = useState(initial?.client || '');
  const [startTimeLocal, setStartTimeLocal] = useState(() => toDatetimeLocalInputValue(initial?.startTime));
  const [techInput, setTechInput] = useState('');
  const [technologies, setTechnologies] = useState<string[]>(initial?.technologies || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function addTech() {
    const t = techInput.trim();
    if (t && !technologies.includes(t)) {
      setTechnologies(prev => [...prev, t]);
    }
    setTechInput('');
  }

  function removeTech(tech: string) {
    setTechnologies(prev => prev.filter(t => t !== tech));
  }

  const scheduleWarning = useMemo(() => {
    /* End time entry lives on the task list only; warn from start instant only here */
    if (startTimeLocal && isInstantOutsideWorkWindow(startTimeLocal) === true) {
      return 'Start time is outside the standard work window (9:00 AM–6:00 PM). Saving is allowed.';
    }
    return undefined;
  }, [startTimeLocal]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!taskName.trim()) return setError('Task name is required');
    if (!date) return setError('Date is required');
    const timeErr = validateTaskTimeInputs(startTimeLocal.trim(), '');
    if (timeErr) return setError(timeErr);
    const draft: Omit<Task, 'taskId' | 'createdAt'> = {
      taskName: taskName.trim(),
      date,
      duration: durationForSubmit(initial),
      priority,
      status,
      client: client.trim(),
      technologies,
      startTime: startTimeLocal.trim() || undefined,
    };
    if (initial?.taskId) {
      const e = initial.endTime;
      draft.endTime =
        e != null && e !== ''
          ? typeof e === 'string'
            ? e
            : e instanceof Date && !Number.isNaN(e.getTime())
              ? e.toISOString()
              : null
          : null;
    }
    const payload = buildNormalizedTaskPayload(draft);
    setLoading(true);
    try {
      await onSubmit(payload);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all';
  const labelClass = 'block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide';

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}
      {scheduleWarning && !error && (
        <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 flex items-start gap-2">
          <span className="flex-shrink-0" aria-hidden>⚠️</span>
          <span>{scheduleWarning}</span>
        </div>
      )}

      {/* Task Name */}
      <div>
        <label className={labelClass}>Task Name *</label>
        <input
          type="text"
          value={taskName}
          onChange={e => setTaskName(e.target.value)}
          placeholder="e.g. Fix payment gateway bug"
          className={inputClass}
          required
        />
      </div>

      {/* Date */}
      <div>
        <DatePicker
          label="Date"
          required
          value={date}
          onChange={setDate}
          placeholder="Pick a date"
        />
      </div>

      {/* Priority + Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Priority *</label>
          <select
            value={priority}
            onChange={e => setPriority(e.target.value as TaskPriority)}
            className={inputClass}
          >
            <option value="low">🟢 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🔴 High</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as TaskStatus)}
            className={inputClass}
          >
            <option value="pending">⚪ Pending</option>
            <option value="in_progress">🟡 In Progress</option>
            <option value="completed">🟢 Completed</option>
          </select>
        </div>
      </div>

      {/* Optional start only — end time is shown and derived on the task list */}
      <div>
        <label className={labelClass}>Start Time</label>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="datetime-local"
            value={startTimeLocal}
            onChange={e => setStartTimeLocal(e.target.value)}
            title={startTimeLocal ? new Date(startTimeLocal).toLocaleString() : 'Optional start time'}
            className={cn(inputClass, 'pl-10')}
          />
        </div>
      </div>

      {/* Client */}
      <div>
        <label className={labelClass}>Client / Project</label>
        <input
          type="text"
          value={client}
          onChange={e => setClient(e.target.value)}
          placeholder="e.g. Acme Corp"
          className={inputClass}
        />
      </div>

      {/* Technologies */}
      <div>
        <label className={labelClass}>Technologies</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={techInput}
            onChange={e => setTechInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTech(); } }}
            placeholder="e.g. React, Node.js"
            className={inputClass}
          />
          <Button type="button" variant="secondary" size="md" onClick={addTech} icon={<Plus className="w-4 h-4" />}>
            Add
          </Button>
        </div>
        {technologies.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {technologies.map(tech => (
              <span
                key={tech}
                className="flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-600 text-xs rounded-lg border border-purple-100"
              >
                {tech}
                <button
                  type="button"
                  onClick={() => removeTech(tech)}
                  className="hover:text-purple-800 ml-0.5"
                  aria-label={`Remove ${tech}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" variant="primary" size="lg" loading={loading} className="flex-1">
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" size="lg" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </motion.form>
  );
}
