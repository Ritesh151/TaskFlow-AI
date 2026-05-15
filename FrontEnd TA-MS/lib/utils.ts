import type { TaskPriority, TaskStatus } from './types';

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function formatDateTime(isoStr: string): string {
  return new Date(isoStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatHours(h: number): string {
  if (h === 0) return '0 hrs';
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  if (mins === 0) return `${hrs} hr${hrs !== 1 ? 's' : ''}`;
  if (hrs === 0) return `${mins} min`;
  return `${hrs}h ${mins}m`;
}

export function priorityColor(priority: TaskPriority): string {
  switch (priority) {
    case 'high': return 'text-red-500';
    case 'medium': return 'text-amber-500';
    case 'low': return 'text-green-500';
  }
}

export function priorityBg(priority: TaskPriority): string {
  switch (priority) {
    case 'high': return 'bg-red-50 text-red-600 border-red-200';
    case 'medium': return 'bg-amber-50 text-amber-600 border-amber-200';
    case 'low': return 'bg-green-50 text-green-600 border-green-200';
  }
}

export function statusBg(status: TaskStatus | string): string {
  if (status === 'completed') return 'bg-green-50 text-green-600 border-green-200';
  if (status === 'in_progress') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-gray-50 text-gray-600 border-gray-200';
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
