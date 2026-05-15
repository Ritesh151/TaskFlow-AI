'use client';
import { useRouter } from 'next/navigation';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Card, CardContent } from '@/components/ui/Card';
import { createTask } from '@/lib/api';
import type { Task } from '@/lib/types';

export default function AddTaskPage() {
  const router = useRouter();

  async function handleSubmit(data: Omit<Task, 'taskId' | 'createdAt'>) {
    await createTask(data);
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
            <TaskForm onSubmit={handleSubmit} onCancel={() => router.back()} />
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
