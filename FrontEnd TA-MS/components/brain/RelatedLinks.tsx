'use client';

import { ArrowUpRight, Link2, ListTodo } from 'lucide-react';
import type { BrainNote } from '@/lib/types';
import { BRAIN_CATEGORY_META } from '@/lib/brain';

interface RelatedLinksProps {
  note: BrainNote;
  onSelectNote?: (noteId: string) => void;
}

export function RelatedLinks({ note, onSelectNote }: RelatedLinksProps) {
  if (note.relatedNotes.length === 0 && note.relatedTasks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-400">
        No intelligent connections yet. Add more notes or tasks to strengthen the graph.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {note.relatedNotes.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-400">
            <Link2 className="h-3.5 w-3.5" />
            Related notes
          </div>
          <div className="flex flex-wrap gap-2">
            {note.relatedNotes.map(related => {
              const meta = BRAIN_CATEGORY_META[related.category];
              return (
                <button
                  key={related.brainId}
                  type="button"
                  onClick={() => onSelectNote?.(related.brainId)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${meta.border} ${meta.bg} ${meta.text}`}
                >
                  {related.title}
                  <ArrowUpRight className="h-3 w-3" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {note.relatedTasks.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-400">
            <ListTodo className="h-3.5 w-3.5" />
            Related tasks
          </div>
          <div className="space-y-2">
            {note.relatedTasks.map(task => (
              <div
                key={task.taskId}
                className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-gray-900">{task.taskName}</span>
                  <span className="text-xs text-gray-400">{task.status.replace('_', ' ')}</span>
                </div>
                <p className="mt-1 text-xs text-gray-400">{task.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
