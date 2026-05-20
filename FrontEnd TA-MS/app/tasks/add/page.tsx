'use client';
import { useRouter } from 'next/navigation';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Card, CardContent } from '@/components/ui/Card';
import { useCreateTask } from '@/lib/hooks/use-tasks';
import type { Task } from '@/lib/types';

export default function AddTaskPage() {
  const router = useRouter();
  const createMutation = useCreateTask();

  async function handleSubmit(data: Omit<Task, 'taskId' | 'createdAt'>) {
    await createMutation.mutateAsync(data);
    router.push('/tasks');
  }

  return (
    <PageWrapper
      title="Add New Task"
      subtitle="Create a task and let the AI engine prioritize it for you"
    >
      <div className="max-w-2xl">
        <Card>
          <CardContent className="pt-6">
            <TaskForm
              onSubmit={handleSubmit}
              onCancel={() => router.back()}
            />
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
