'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bug,
  ChevronDown,
  ChevronUp,
  Code2,
  FlaskConical,
  GraduationCap,
  Lightbulb,
  Pencil,
  Pin,
  Sparkles,
  Star,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import type { BrainCategory, BrainNote } from '@/lib/types';
import {
  BRAIN_CATEGORY_META,
  formatRelativeTime,
  noteConnectionCount,
  notePreview,
  splitHighlightedText,
} from '@/lib/brain';
import { cn } from '@/lib/utils';
import { BrainMarkdown } from './BrainMarkdown';
import { RelatedLinks } from './RelatedLinks';

interface BrainCardProps {
  note: BrainNote;
  searchQuery: string;
  selected?: boolean;
  onEdit: (note: BrainNote) => void;
  onDelete: (note: BrainNote) => void;
  onToggleFavorite: (note: BrainNote) => void;
  onTogglePin: (note: BrainNote) => void;
  onSelectNote: (noteId: string) => void;
}

const CATEGORY_ICONS: Record<BrainCategory, LucideIcon> = {
  idea: Lightbulb,
  bug: Bug,
  learning: GraduationCap,
  snippet: Code2,
  research: FlaskConical,
  thought: Sparkles,
};

function Highlight({ text, query }: { text: string; query: string }) {
  return (
    <>
      {splitHighlightedText(text, query).map((part, index) =>
        part.match ? (
          <mark
            key={`${part.text}-${index}`}
            className="rounded bg-blue-100 px-0.5 text-blue-800"
          >
            {part.text}
          </mark>
        ) : (
          <span key={`${part.text}-${index}`}>{part.text}</span>
        )
      )}
    </>
  );
}

export function BrainCard({
  note,
  searchQuery,
  selected = false,
  onEdit,
  onDelete,
  onToggleFavorite,
  onTogglePin,
  onSelectNote,
}: BrainCardProps) {
  const [expanded, setExpanded] = useState(selected);
  const meta = BRAIN_CATEGORY_META[note.category];
  const CategoryIcon = CATEGORY_ICONS[note.category];
  const isExpanded = selected || expanded;

  return (
    <motion.article
      id={`brain-note-${note.brainId}`}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={cn(
        'rounded-2xl border p-5 shadow-sm transition-all duration-200',
        selected
          ? 'border-blue-300 bg-blue-50/60 shadow-md'
          : 'border-gray-100 bg-white hover:shadow-md'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${meta.border} ${meta.bg} ${meta.text}`}>
              <CategoryIcon className="h-3.5 w-3.5" />
              {meta.label}
            </span>
            {note.pinned && (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-700">
                Pinned
              </span>
            )}
            {note.favorite && (
              <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs text-violet-700">
                Favorite
              </span>
            )}
          </div>

          <button type="button" onClick={() => onSelectNote(note.brainId)} className="text-left">
            <h3 className="text-lg font-semibold text-gray-900">
              <Highlight text={note.title} query={searchQuery} />
            </h3>
          </button>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
            <span>{formatRelativeTime(note.updatedAt)}</span>
            <span>{noteConnectionCount(note)} links</span>
            <span>{note.keywords.length} keywords</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onToggleFavorite(note)}
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-xl border transition',
              note.favorite
                ? 'border-violet-200 bg-violet-50 text-violet-600'
                : 'border-gray-200 bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-600'
            )}
            aria-label="Toggle favorite"
          >
            <Star className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onTogglePin(note)}
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-xl border transition',
              note.pinned
                ? 'border-amber-200 bg-amber-50 text-amber-600'
                : 'border-gray-200 bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-600'
            )}
            aria-label="Toggle pin"
          >
            <Pin className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(note)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 transition hover:bg-gray-50 hover:text-gray-600"
            aria-label="Edit note"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(note)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 transition hover:bg-red-50 hover:text-red-500"
            aria-label="Delete note"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setExpanded(current => !current)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 transition hover:bg-gray-50 hover:text-gray-600"
            aria-label={isExpanded ? 'Collapse note' : 'Expand note'}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {note.tags.map(tag => (
          <span
            key={tag}
            className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-500"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
        {isExpanded ? (
          <BrainMarkdown content={note.content} />
        ) : (
          <p className="leading-7 text-gray-600">
            <Highlight text={notePreview(note)} query={searchQuery} />
          </p>
        )}
      </div>

      <div className="mt-4">
        <RelatedLinks note={note} onSelectNote={onSelectNote} />
      </div>
    </motion.article>
  );
}
