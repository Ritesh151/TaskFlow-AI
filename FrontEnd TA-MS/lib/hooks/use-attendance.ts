'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAttendanceToday,
  getAttendanceHistory,
  getAttendanceStats,
  getAttendanceCalendar,
  getAttendanceInsights,
  checkIn,
  checkOut,
  startBreak,
  endBreak,
  startDeepWork,
  endDeepWork,
} from '@/lib/api';
import { attendanceKeys } from '@/lib/query-keys';
export function useAttendanceToday() {
  return useQuery({
    queryKey: attendanceKeys.today,
    queryFn: getAttendanceToday,
    staleTime: 1000 * 15,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data?.checkIn || data.checkOut) return false;
      return 60_000;
    },
  });
}

export function useAttendanceHistory() {
  return useQuery({
    queryKey: attendanceKeys.history,
    queryFn: getAttendanceHistory,
    staleTime: 1000 * 60 * 2,
  });
}

export function useAttendanceStats() {
  return useQuery({
    queryKey: attendanceKeys.stats,
    queryFn: getAttendanceStats,
    staleTime: 1000 * 60 * 2,
  });
}

export function useAttendanceCalendar(months?: number) {
  return useQuery({
    queryKey: attendanceKeys.calendar(months),
    queryFn: () => getAttendanceCalendar(months),
    staleTime: 1000 * 60 * 5,
  });
}

export function useAttendanceInsights() {
  return useQuery({
    queryKey: attendanceKeys.insights,
    queryFn: getAttendanceInsights,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAttendanceAll() {
  const today = useAttendanceToday();
  const stats = useAttendanceStats();
  const calendar = useAttendanceCalendar(2);
  const insights = useAttendanceInsights();

  return {
    today,
    stats,
    calendar,
    insights,
    isLoading: today.isLoading || stats.isLoading || calendar.isLoading || insights.isLoading,
  };
}

export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: checkIn,
    onSuccess(data) {
      queryClient.setQueryData(attendanceKeys.today, data);
      queryClient.invalidateQueries({ queryKey: attendanceKeys.stats });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.insights });
    },
  });
}

export function useCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: checkOut,
    onSuccess(data) {
      queryClient.setQueryData(attendanceKeys.today, data);
      queryClient.invalidateQueries({ queryKey: attendanceKeys.stats });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.insights });
    },
  });
}

export function useStartBreak() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (type?: string) => startBreak(type ?? 'custom'),
    onSuccess(data) {
      queryClient.setQueryData(attendanceKeys.today, data);
    },
  });
}

export function useEndBreak() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: endBreak,
    onSuccess(data) {
      queryClient.setQueryData(attendanceKeys.today, data);
    },
  });
}

export function useStartDeepWork() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startDeepWork,
    onSuccess(data) {
      queryClient.setQueryData(attendanceKeys.today, data);
    },
  });
}

export function useEndDeepWork() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: endDeepWork,
    onSuccess(data) {
      queryClient.setQueryData(attendanceKeys.today, data);
    },
  });
}

export function useAttendanceActions() {
  const checkInMut = useCheckIn();
  const checkOutMut = useCheckOut();
  const startBreakMut = useStartBreak();
  const endBreakMut = useEndBreak();
  const startDeepWorkMut = useStartDeepWork();
  const endDeepWorkMut = useEndDeepWork();

  return {
    checkIn: () => checkInMut.mutateAsync(),
    checkOut: () => checkOutMut.mutateAsync(),
    startBreak: (type = 'custom') => startBreakMut.mutateAsync(type),
    endBreak: () => endBreakMut.mutateAsync(),
    startDeepWork: () => startDeepWorkMut.mutateAsync(),
    endDeepWork: () => endDeepWorkMut.mutateAsync(),
    isLoading:
      checkInMut.isPending ||
      checkOutMut.isPending ||
      startBreakMut.isPending ||
      endBreakMut.isPending ||
      startDeepWorkMut.isPending ||
      endDeepWorkMut.isPending,
  };
}
