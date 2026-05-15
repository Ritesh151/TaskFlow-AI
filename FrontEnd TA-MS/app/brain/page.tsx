import { Suspense } from 'react';
import { BrainWorkspace } from '@/components/brain/BrainWorkspace';

export default function BrainPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="h-56 animate-pulse rounded-[28px] bg-white shadow-sm" />
        </div>
      }
    >
      <BrainWorkspace />
    </Suspense>
  );
}
