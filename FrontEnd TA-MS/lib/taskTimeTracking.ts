import type { Task, TaskStatus } from './types';
import { isInstantOutsideWorkWindow, isTaskTimeWithinWorkWindow } from './workSchedule';

export function calculateDuration(startTime: string | Date | null | undefined, endTime: string | Date | null | undefined): string | null {
  if (!startTime || !endTime) return null;

  const diff = new Date(endTime).getTime() - new Date(startTime).getTime();
  if (diff < 0) return null;

  const minutes = Math.floor(diff / 60000);
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hrs}h ${mins}m`;
}

export function getTotalMinutesBetween(
  startTime: string | Date | null | undefined,
  endTime: string | Date | null | undefined,
): number | null {
  if (!startTime || !endTime) return null;
  const diff = new Date(endTime).getTime() - new Date(startTime).getTime();
  if (diff < 0) return null;
  return Math.floor(diff / 60000);
}

export function formatTimeSpent(mins: number | null | undefined): string {
  if (mins === null || mins === undefined || Number.isNaN(mins)) return '0h 0m';

  const h = Math.floor(mins / 60);
  const m = mins % 60;

  return `${h}h ${m}m`;
}

export function toDatetimeLocalInputValue(iso: string | Date | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function normalizeIncomingTime(v: unknown): string | null {
  if (v == null) return null;
  if (typeof v === 'string' && !v.trim()) return null;
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v.toISOString();
  if (typeof v === 'string') {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }
  return null;
}

/**
 * Applies time-tracking rules before create/update API calls.
 */
export function buildNormalizedTaskPayload(
  base: Omit<Task, 'taskId' | 'createdAt'> | Partial<Task>,
): Omit<Task, 'taskId' | 'createdAt'> {
  const nowIso = new Date().toISOString();

  const startTime = normalizeIncomingTime(base.startTime);
  let endTime = normalizeIncomingTime(base.endTime);

  let status: TaskStatus = ((base.status as TaskStatus) || 'pending');

  /* Orphan end with no start */
  if (!startTime && endTime) endTime = null;

  if (startTime && endTime && new Date(endTime).getTime() < new Date(startTime).getTime()) {
    endTime = null;
  }

  const hasOrderedRange =
    !!(startTime && endTime && new Date(endTime).getTime() >= new Date(startTime).getTime());

  if (hasOrderedRange) {
    status = 'completed';
  } else if (startTime && !endTime) {
    status = 'in_progress';
  }

  if (status === 'completed' && !endTime) {
    endTime = nowIso;
  }

  const totalMinutes = getTotalMinutesBetween(startTime, endTime);
  const isTimeTracked = Boolean(startTime || endTime);

  return {
    taskName: typeof base.taskName === 'string' ? base.taskName : '',
    date: typeof base.date === 'string' ? base.date : '',
    duration:
      typeof base.duration === 'number' ? base.duration : parseFloat(String(base.duration ?? 0)) || 0,
    status,
    priority: (base.priority ?? 'medium') as Task['priority'],
    client: typeof base.client === 'string' ? base.client : '',
    technologies: Array.isArray(base.technologies) ? base.technologies : [],
    /* null clears persisted values on PUT */
    startTime: startTime ?? null,
    endTime: endTime ?? null,
    totalTimeSpent: totalMinutes != null ? totalMinutes : null,
    tags: Array.isArray(base.tags) ? base.tags : undefined,
    isTimeTracked,
    manualTimeOverride: typeof base.manualTimeOverride === 'boolean' ? base.manualTimeOverride : undefined,
  };
}

export function getTimeTrackingDisplayLabel(task: Task): string {
  const hasStart = Boolean(task.startTime);
  const hasEnd = Boolean(task.endTime);
  const ordered = task.startTime && task.endTime && new Date(task.endTime) >= new Date(task.startTime);
  if (hasStart && !hasEnd) return 'In Progress ⏳';
  if (hasStart && hasEnd && ordered) {
    const dur = calculateDuration(task.startTime!, task.endTime!);
    return dur ? `Completed + Duration (${dur})` : 'Completed';
  }
  return 'Not Tracked';
}


/** Status badge keyed by effective time-tracking state when possible */
export function deriveTimeTrackingBadge(task: Task): { label: string; tone: 'completed' | 'progress' | 'pending' } {
  const hasStart = Boolean(task.startTime);
  const hasEnd = Boolean(task.endTime);
  const ordered =
    task.startTime && task.endTime && new Date(task.endTime).getTime() >= new Date(task.startTime).getTime();

  if (ordered) return { label: 'Completed', tone: 'completed' };
  if (hasStart && !hasEnd) return { label: 'In Progress', tone: 'progress' };
  if (task.status === 'completed') return { label: 'Completed', tone: 'completed' };
  return { label: 'Pending', tone: 'pending' };
}

export function shouldWarnOutsideWorkHours(task: Task): boolean {
  const s = task.startTime as string | undefined;
  const e = task.endTime as string | undefined;
  if (!s) return false;
  if (e) return isTaskTimeWithinWorkWindow(s, e) === false;
  return isInstantOutsideWorkWindow(s) === true;
}

export function validateTaskTimeInputs(startLocal: string, endLocal: string): string | undefined {
  if (!startLocal && !endLocal) return undefined;
  if (startLocal && endLocal) {
    const a = new Date(startLocal).getTime();
    const b = new Date(endLocal).getTime();
    if (Number.isNaN(a) || Number.isNaN(b)) return 'Invalid start or end time';
    if (b < a) return 'End time cannot be earlier than start time';
  }
  if (startLocal) {
    const a = new Date(startLocal).getTime();
    if (!Number.isNaN(a) && a > Date.now() + 60 * 1000) return 'Start time cannot be in the future';
  }
  if (!startLocal && endLocal) return 'End time requires a start time';
  return undefined;
}
