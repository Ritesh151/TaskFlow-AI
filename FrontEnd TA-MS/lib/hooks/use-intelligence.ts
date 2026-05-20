'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getNextBestTask,
  getWorkload,
  getDailySummary,
  getInsights,
} from '@/lib/api';
import { intelligenceKeys } from '@/lib/query-keys';

export function useNextBestTask() {
  return useQuery({
    queryKey: intelligenceKeys.nextTask,
    queryFn: getNextBestTask,
    staleTime: 1000 * 60 * 2,
  });
}

export function useWorkload(date?: string) {
  return useQuery({
    queryKey: intelligenceKeys.workload(date),
    queryFn: () => getWorkload(date),
    staleTime: 1000 * 60 * 2,
  });
}

export function useDailySummary(date?: string) {
  return useQuery({
    queryKey: intelligenceKeys.summary(date),
    queryFn: () => getDailySummary(date),
    staleTime: 1000 * 60 * 5,
  });
}

export function useInsights() {
  return useQuery({
    queryKey: intelligenceKeys.insights,
    queryFn: getInsights,
    staleTime: 1000 * 60 * 5,
  });
}
