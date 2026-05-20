'use client';

import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/lib/api';
import { authKeys } from '@/lib/query-keys';
import { writeSessionSnapshot } from '@/lib/session-storage';

export function useAuthMe() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      const session = await authApi.me();
      writeSessionSnapshot(session);
      return session;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
