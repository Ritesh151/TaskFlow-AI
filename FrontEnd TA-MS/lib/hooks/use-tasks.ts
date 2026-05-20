'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  completeTask,
  deleteTask,
} from '@/lib/api';
import { taskKeys, intelligenceKeys } from '@/lib/query-keys';
import type { Task } from '@/lib/types';

export function useTasks() {
  return useQuery({
    queryKey: taskKeys.all,
    queryFn: getTasks,
    staleTime: 1000 * 30,
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => getTask(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Task, 'taskId' | 'createdAt'>) => createTask(data),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: intelligenceKeys.all });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) =>
      updateTask(id, data),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: intelligenceKeys.all });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeTask,
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });
      const previous = queryClient.getQueryData<Task[]>(taskKeys.all);
      queryClient.setQueryData<Task[]>(taskKeys.all, (old) =>
        old?.map((t) =>
          t.taskId === taskId ? { ...t, status: 'completed' as const } : t,
        ),
      );
      return { previous };
    },
    onError(_err, _taskId, context) {
      if (context?.previous) {
        queryClient.setQueryData(taskKeys.all, context.previous);
      }
    },
    onSettled() {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: intelligenceKeys.all });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: intelligenceKeys.all });
    },
  });
}
