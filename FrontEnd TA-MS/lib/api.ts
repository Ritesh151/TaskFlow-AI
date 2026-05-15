import axios, { AxiosError, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import toast from 'react-hot-toast';
import type {
  AttendanceInsights,
  AttendanceRecord,
  AttendanceStats,
  AuthSession,
  BrainCategory,
  BrainDashboardData,
  BrainGraphData,
  BrainNote,
  BrainSort,
  CalendarMonth,
  DailySummary,
  Insights,
  NextBestTask,
  Task,
  WorkloadAnalysis,
} from './types';
import { clearSessionSnapshot, writeSessionSnapshot } from './session-storage';

type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

type ApiErrorResponse = {
  success: false;
  message?: string;
  code?: string;
  details?: unknown;
};

declare module 'axios' {
  interface AxiosRequestConfig {
    _retryCount?: number;
    _retryAuth?: boolean;
    skipAuthRefresh?: boolean;
    skipErrorToast?: boolean;
  }

  interface InternalAxiosRequestConfig {
    _retryCount?: number;
    _retryAuth?: boolean;
    skipAuthRefresh?: boolean;
    skipErrorToast?: boolean;
  }
}

const REQUEST_TIMEOUT_MS = 15_000;
const BROWSER_API_BASE_URL = '/api';

function normalizeUrl(value: string) {
  return value.replace(/\/$/, '');
}

function resolveServerApiBaseUrl() {
  const explicitApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (explicitApiUrl) {
    return normalizeUrl(explicitApiUrl);
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim();

  if (siteUrl) {
    const origin = siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`;
    return `${normalizeUrl(origin)}/api`;
  }

  return BROWSER_API_BASE_URL;
}

const SERVER_API_BASE_URL = resolveServerApiBaseUrl();

function resolveApiBaseUrl() {
  return typeof window === 'undefined' ? SERVER_API_BASE_URL : BROWSER_API_BASE_URL;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status = 0, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const apiClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: REQUEST_TIMEOUT_MS,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

const refreshClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: REQUEST_TIMEOUT_MS,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

function buildApiError(error: AxiosError<ApiErrorResponse>) {
  const message =
    error.response?.data?.message ||
    (error.code === 'ECONNABORTED'
      ? 'Request timed out. Please try again.'
      : error.message || 'Request failed');

  return new ApiError(message, error.response?.status ?? 0, error.response?.data?.code, error.response?.data?.details);
}

function shouldRetry(error: AxiosError<ApiErrorResponse>) {
  const method = error.config?.method?.toLowerCase();
  const isIdempotent = method === 'get' || method === 'head' || method === 'options';
  const status = error.response?.status ?? 0;
  return isIdempotent && (status === 0 || status >= 500);
}

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

let refreshPromise: Promise<AuthSession> | null = null;

async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<ApiSuccessResponse<AuthSession>>('/auth/refresh', undefined, {
        skipAuthRefresh: true,
        skipErrorToast: true,
      })
      .then((response) => {
        writeSessionSnapshot(response.data.data);
        return response.data.data;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

apiClient.interceptors.request.use((config) => {
  config.baseURL = resolveApiBaseUrl();

  if (typeof window !== 'undefined' && !window.navigator.onLine) {
    return Promise.reject(new ApiError('You appear to be offline. Reconnect and try again.', 0, 'OFFLINE'));
  }

  return config;
});

refreshClient.interceptors.request.use((config) => {
  config.baseURL = resolveApiBaseUrl();
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest.skipAuthRefresh &&
      !originalRequest._retryAuth
    ) {
      originalRequest._retryAuth = true;

      try {
        await refreshSession();
        return apiClient(originalRequest);
      } catch {
        clearSessionSnapshot();
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          toast.error('Your session expired. Please sign in again.');
          window.location.assign('/login');
        }
      }
    }

    if (originalRequest && shouldRetry(error)) {
      originalRequest._retryCount = (originalRequest._retryCount ?? 0) + 1;
      if (originalRequest._retryCount <= 2 && typeof window !== 'undefined') {
        await delay(250 * 2 ** (originalRequest._retryCount - 1));
        return apiClient(originalRequest);
      }
    }

    return Promise.reject(buildApiError(error));
  },
);

async function request<T>(config: AxiosRequestConfig) {
  const response = await apiClient.request<ApiSuccessResponse<T>>(config);
  return response.data.data;
}

export const authApi = {
  login: (payload: { email: string; password: string }) =>
    request<AuthSession>({
      url: '/auth/login',
      method: 'POST',
      data: payload,
      skipAuthRefresh: true,
      skipErrorToast: true,
    }),
  refresh: () =>
    refreshSession(),
  logout: () =>
    request<{ loggedOut: true }>({
      url: '/auth/logout',
      method: 'POST',
      skipAuthRefresh: true,
      skipErrorToast: true,
    }),
  me: () =>
    request<AuthSession>({
      url: '/auth/me',
      method: 'GET',
      skipErrorToast: true,
    }),
};

export const getTasks = () => request<Task[]>({ url: '/tasks', method: 'GET' });
export const getTasksByDate = (date: string) => request<Task[]>({ url: `/tasks/by-date/${date}`, method: 'GET' });
export const getTask = (id: string) => request<Task>({ url: `/tasks/${id}`, method: 'GET' });
export const createTask = (data: Omit<Task, 'taskId' | 'createdAt'>) =>
  request<Task>({ url: '/tasks', method: 'POST', data });
export const updateTask = (id: string, data: Partial<Task>) =>
  request<Task>({ url: `/tasks/${id}`, method: 'PUT', data });
export const completeTask = (id: string) =>
  request<Task>({ url: `/tasks/${id}/complete`, method: 'PATCH' });
export const deleteTask = (id: string) =>
  request<{ deleted: true }>({ url: `/tasks/${id}`, method: 'DELETE' });

export const getNextBestTask = () =>
  request<NextBestTask | null>({ url: '/intelligence/next-task', method: 'GET' });
export const getWorkload = (date?: string) =>
  request<WorkloadAnalysis>({
    url: '/intelligence/workload',
    method: 'GET',
    params: date ? { date } : undefined,
  });
export const getDailySummary = (date?: string) =>
  request<DailySummary>({
    url: '/intelligence/summary',
    method: 'GET',
    params: date ? { date } : undefined,
  });
export const getInsights = () =>
  request<Insights>({ url: '/intelligence/insights', method: 'GET' });

export const getBrainDashboard = (params?: {
  sort?: BrainSort;
  category?: BrainCategory | 'all';
  favorite?: boolean;
  pinned?: boolean;
}) =>
  request<BrainDashboardData>({
    url: '/brain',
    method: 'GET',
    params: {
      sort: params?.sort,
      category: params?.category,
      favorite: params?.favorite ? 'true' : undefined,
      pinned: params?.pinned ? 'true' : undefined,
    },
  });

export const getBrainNote = (id: string) =>
  request<BrainNote>({ url: `/brain/${id}`, method: 'GET' });

export const createBrainNote = (
  data: Partial<Pick<BrainNote, 'title' | 'content' | 'category' | 'tags' | 'favorite' | 'pinned'>>,
) =>
  request<BrainNote>({ url: '/brain', method: 'POST', data });

export const updateBrainNote = (
  id: string,
  data: Partial<Pick<BrainNote, 'title' | 'content' | 'category' | 'tags' | 'favorite' | 'pinned'>>,
) =>
  request<BrainNote>({ url: `/brain/${id}`, method: 'PUT', data });

export const deleteBrainNote = (id: string) =>
  request<{ brainId: string }>({ url: `/brain/${id}`, method: 'DELETE' });

export const getBrainGraph = () =>
  request<BrainGraphData>({ url: '/brain/graph', method: 'GET' });

export const searchBrainNotes = (params?: {
  query?: string;
  sort?: BrainSort;
  category?: BrainCategory | 'all';
  favorite?: boolean;
  pinned?: boolean;
}) =>
  request<BrainDashboardData>({
    url: '/brain/search',
    method: 'GET',
    params: {
      q: params?.query,
      sort: params?.sort,
      category: params?.category,
      favorite: params?.favorite ? 'true' : undefined,
      pinned: params?.pinned ? 'true' : undefined,
    },
  });

export const toggleBrainFavorite = (id: string, value?: boolean) =>
  request<BrainNote>({
    url: `/brain/${id}/favorite`,
    method: 'PATCH',
    data: typeof value === 'boolean' ? { value } : undefined,
  });

export const toggleBrainPin = (id: string, value?: boolean) =>
  request<BrainNote>({
    url: `/brain/${id}/pin`,
    method: 'PATCH',
    data: typeof value === 'boolean' ? { value } : undefined,
  });

export const getAttendanceToday = () =>
  request<AttendanceRecord>({ url: '/attendance/today', method: 'GET' });
export const getAttendanceHistory = () =>
  request<AttendanceRecord[]>({ url: '/attendance/history', method: 'GET' });
export const checkIn = () =>
  request<AttendanceRecord>({ url: '/attendance/check-in', method: 'POST' });
export const checkOut = () =>
  request<AttendanceRecord>({ url: '/attendance/check-out', method: 'POST' });
export const startBreak = (type = 'custom') =>
  request<AttendanceRecord>({
    url: '/attendance/break/start',
    method: 'POST',
    data: { type },
  });
export const endBreak = () =>
  request<AttendanceRecord>({ url: '/attendance/break/end', method: 'POST' });
export const startDeepWork = () =>
  request<AttendanceRecord>({ url: '/attendance/deep-work/start', method: 'POST' });
export const endDeepWork = () =>
  request<AttendanceRecord>({ url: '/attendance/deep-work/end', method: 'POST' });
export const getAttendanceStats = () =>
  request<AttendanceStats>({ url: '/attendance/stats', method: 'GET' });
export const getAttendanceCalendar = (months?: number) =>
  request<CalendarMonth[]>({
    url: '/attendance/calendar',
    method: 'GET',
    params: months ? { months } : undefined,
  });
export const getAttendanceInsights = () =>
  request<AttendanceInsights>({ url: '/attendance/insights', method: 'GET' });
