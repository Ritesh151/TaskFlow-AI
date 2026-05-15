// ─── Task types ──────────────────────────────────────────────────────────────

export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  taskId: string;
  taskName: string;
  date: string;
  duration: number;
  status: TaskStatus;
  priority: TaskPriority;
  client: string;
  technologies: string[];
  createdAt: string;
  /** Optional time tracking — ISO strings when stored/displayed via API */
  startTime?: string | Date | null;
  endTime?: string | Date | null;
  /** Minutes between start and end when both set */
  totalTimeSpent?: number | null;
  /** Extra labels alongside technologies for future analytics */
  tags?: string[];
  isTimeTracked?: boolean;
  manualTimeOverride?: boolean;
}

export interface NextBestTask {
  task: Task;
  reason: string;
}

export interface WorkloadAnalysis {
  date: string;
  totalHours: number;
  pendingHours: number;
  completedHours: number;
  totalTasks: number;
  pendingCount: number;
  completedCount: number;
  overdueCount: number;
  isOverloaded: boolean;
  overloadPercent: number;
  status: 'empty' | 'normal' | 'heavy' | 'overloaded';
  message: string;
  suggestions: string[];
}

export interface DailySummary {
  date: string;
  completed: Task[];
  pending: Task[];
  totalTime: number;
  completedTime: number;
  completionRate: number;
  productivityScore: number;
  smartSummary: string;
  generatedAt: string;
}

export interface WeeklyDataPoint {
  date: string;
  total: number;
  completed: number;
  hours: number;
  completedHours: number;
}

export interface Insights {
  weeklyData: WeeklyDataPoint[];
  priorityBreakdown: { high: number; medium: number; low: number };
  topTechnologies: { name: string; count: number }[];
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  overallCompletionRate: number;
}

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthSession {
  user: ApiUser;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}

// ─── Second Brain types ──────────────────────────────────────────────────────

export type BrainCategory = 'idea' | 'bug' | 'learning' | 'snippet' | 'thought' | 'research';
export type BrainSort = 'newest' | 'oldest' | 'favorites' | 'most-linked';

export interface BrainRelatedNote {
  brainId: string;
  title: string;
  category: BrainCategory;
  score: number;
  sharedKeywords: string[];
  sharedTags: string[];
  reason: string;
}

export interface BrainRelatedTask {
  taskId: string;
  taskName: string;
  date: string;
  status: TaskStatus;
  score: number;
  sharedKeywords: string[];
  technologies: string[];
  reason: string;
}

export interface BrainNote {
  brainId: string;
  title: string;
  content: string;
  category: BrainCategory;
  tags: string[];
  keywords: string[];
  relatedNotes: BrainRelatedNote[];
  relatedTasks: BrainRelatedTask[];
  favorite: boolean;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BrainCluster {
  clusterId: string;
  label: string;
  noteCount: number;
  categories: BrainCategory[];
  noteIds: string[];
  keywords: string[];
  intensity: number;
}

export interface BrainGrowthPoint {
  date: string;
  count: number;
}

export interface BrainStreak {
  current: number;
  longest: number;
}

export interface BrainInsights {
  totalNotes: number;
  linkedNotes: number;
  ideasCaptured: number;
  codingSnippets: number;
  favorites: number;
  pinned: number;
  mostConnectedNote: BrainNote | null;
  topTechnologies: { name: string; count: number }[];
  recentTopics: string[];
  streak: BrainStreak;
  growth: BrainGrowthPoint[];
}

export interface BrainDashboardData {
  notes: BrainNote[];
  totalMatches: number;
  stats: BrainInsights;
  clusters: BrainCluster[];
  availableTags: string[];
  availableKeywords: string[];
}

export interface BrainGraphNode {
  id: string;
  entityId: string;
  type: 'note' | 'task';
  label: string;
  category: BrainCategory | 'task';
  favorite: boolean;
  pinned: boolean;
  weight: number;
  linkCount: number;
  keywords: string[];
  status?: TaskStatus;
  date?: string;
}

export interface BrainGraphLink {
  id: string;
  source: string;
  target: string;
  strength: number;
  kind: 'note' | 'task';
}

export interface BrainGraphData {
  nodes: BrainGraphNode[];
  links: BrainGraphLink[];
  clusters: BrainCluster[];
}

// ─── Attendance types ─────────────────────────────────────────────────────────

export type AttendanceStatus = 'present' | 'absent' | 'half-day' | 'no-data';
export type BurnoutRisk = 'low' | 'medium' | 'high';
export type BreakType = 'lunch' | 'tea' | 'idle' | 'custom';
export type TimelineAction =
  | 'check-in'
  | 'check-out'
  | 'break-start'
  | 'break-end'
  | 'task-completed'
  | 'deep-work-start'
  | 'deep-work-end';

export interface AttendanceBreak {
  breakId: string;
  start: string;
  end: string | null;
  type: BreakType;
}

export interface DeepWorkSession {
  sessionId: string;
  start: string;
  end: string | null;
}

export interface TimelineEntry {
  time: string;
  action: TimelineAction;
}

export interface AttendanceRecord {
  attendanceId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  breaks: AttendanceBreak[];
  deepWorkSessions: DeepWorkSession[];
  timeline: TimelineEntry[];
  totalWorkMinutes: number;
  totalBreakMinutes: number;
  deepWorkMinutes: number;
  overtimeMinutes: number;
  tasksCompleted: number;
  productivityScore: number;
  burnoutRisk: BurnoutRisk;
  createdAt: string;
}

export interface AttendanceWeeklyStats {
  date: string;
  workMinutes: number;
  breakMinutes: number;
  deepWorkMinutes: number;
  overtimeMinutes: number;
  productivityScore: number;
  status: AttendanceStatus;
}

export interface AttendanceInsights {
  avgCheckInTime: string | null;
  avgWorkDuration: number;
  avgBreakDuration: number;
  mostProductiveWindow: string | null;
  currentStreak: number;
  longestStreak: number;
  overtimeFrequency: number;
  consistencyScore: number;
  totalDaysTracked: number;
  totalWorkHours: number;
  burnoutRisk: BurnoutRisk;
  recommendations: string[];
}

export interface CalendarDay {
  date: string;
  status: AttendanceStatus;
}

export interface CalendarMonth {
  year: number;
  month: number;
  monthName: string;
  days: CalendarDay[];
}

export interface AttendanceStats {
  weeklyStats: AttendanceWeeklyStats[];
  insights: Omit<AttendanceInsights, 'burnoutRisk' | 'recommendations'>;
}
