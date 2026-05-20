export const taskKeys = {
  all: ['tasks'] as const,
  byDate: (date: string) => ['tasks', 'date', date] as const,
  detail: (id: string) => ['tasks', id] as const,
}

export const intelligenceKeys = {
  all: ['intelligence'] as const,
  summary: (date?: string) => ['intelligence', 'summary', date] as const,
  workload: (date?: string) => ['intelligence', 'workload', date] as const,
  nextTask: ['intelligence', 'next-task'] as const,
  insights: ['intelligence', 'insights'] as const,
}

export const attendanceKeys = {
  all: ['attendance'] as const,
  today: ['attendance', 'today'] as const,
  history: ['attendance', 'history'] as const,
  stats: ['attendance', 'stats'] as const,
  calendar: (months?: number) => ['attendance', 'calendar', months] as const,
  insights: ['attendance', 'insights'] as const,
}

export const brainKeys = {
  all: ['brain'] as const,
  dashboard: (params?: Record<string, unknown>) => ['brain', 'dashboard', params] as const,
  graph: ['brain', 'graph'] as const,
  search: (params?: Record<string, unknown>) => ['brain', 'search', params] as const,
  detail: (id: string) => ['brain', id] as const,
}

export const authKeys = {
  me: ['auth', 'me'] as const,
}
