'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBrainDashboard,
  getBrainGraph,
  getBrainNote,
  createBrainNote,
  updateBrainNote,
  deleteBrainNote,
  toggleBrainFavorite,
  toggleBrainPin,
  searchBrainNotes,
} from '@/lib/api';
import { brainKeys } from '@/lib/query-keys';
import type { BrainCategory, BrainNote, BrainSort } from '@/lib/types';

export function useBrainDashboard(params?: {
  sort?: BrainSort;
  category?: BrainCategory | 'all';
  favorite?: boolean;
  pinned?: boolean;
}) {
  return useQuery({
    queryKey: brainKeys.dashboard(params as Record<string, unknown>),
    queryFn: () => getBrainDashboard(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function useBrainGraph() {
  return useQuery({
    queryKey: brainKeys.graph,
    queryFn: getBrainGraph,
    staleTime: 1000 * 60 * 5,
  });
}

export function useBrainNote(id: string) {
  return useQuery({
    queryKey: brainKeys.detail(id),
    queryFn: () => getBrainNote(id),
    enabled: !!id,
  });
}

export function useBrainSearch(params?: {
  query?: string;
  sort?: BrainSort;
  category?: BrainCategory | 'all';
  favorite?: boolean;
  pinned?: boolean;
}) {
  return useQuery({
    queryKey: brainKeys.search(params as Record<string, unknown>),
    queryFn: () => searchBrainNotes(params),
    staleTime: 1000 * 30,
    enabled: !!params?.query?.trim(),
  });
}

export function useBrainAll() {
  const dashboardQuery = useBrainDashboard();
  const graphQuery = useBrainGraph();

  return {
    dashboard: dashboardQuery.data ?? null,
    graph: graphQuery.data ?? null,
    isLoading: dashboardQuery.isLoading || graphQuery.isLoading,
  };
}

export function useCreateBrainNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: Partial<Pick<BrainNote, 'title' | 'content' | 'category' | 'tags' | 'favorite' | 'pinned'>>,
    ) => createBrainNote(data),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: brainKeys.all });
    },
  });
}

export function useUpdateBrainNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Pick<BrainNote, 'title' | 'content' | 'category' | 'tags' | 'favorite' | 'pinned'>>;
    }) => updateBrainNote(id, data),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: brainKeys.all });
    },
  });
}

export function useDeleteBrainNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBrainNote,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: brainKeys.all });
    },
  });
}

export function useToggleBrainFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, value }: { id: string; value?: boolean }) =>
      toggleBrainFavorite(id, value),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: brainKeys.all });
    },
  });
}

export function useToggleBrainPin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, value }: { id: string; value?: boolean }) =>
      toggleBrainPin(id, value),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: brainKeys.all });
    },
  });
}
