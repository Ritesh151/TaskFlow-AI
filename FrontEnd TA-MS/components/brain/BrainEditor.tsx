'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Save, WandSparkles, X } from 'lucide-react';
import type { BrainCategory, BrainNote } from '@/lib/types';
import { BRAIN_CATEGORIES, BRAIN_CATEGORY_META } from '@/lib/brain';
import { cn } from '@/lib/utils';
import { BrainMarkdown } from './BrainMarkdown';

interface BrainEditorProps {
  open: boolean;
  note: BrainNote | null;
  saving?: boolean;
  tagSuggestions: string[];
  onClose: () => void;
  onSave: (payload: {
    title: string;
    content: string;
    category: BrainCategory;
    tags: string[];
  }) => Promise<void> | void;
}

function stringifyTags(tags: string[]) {
  return tags.join(', ');
}

function parseTags(value: string) {
  return [...new Set(
    value
      .split(/[,#\n]/)
      .map(tag => tag.trim().toLowerCase())
      .filter(Boolean)
  )].slice(0, 10);
}

export function BrainEditor({
  open,
  note,
  saving = false,
  tagSuggestions,
  onClose,
  onSave,
}: BrainEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<BrainCategory>('thought');
  const [tagsInput, setTagsInput] = useState('');
  const [autosavedAt, setAutosavedAt] = useState<string | null>(null);
  const [error, setError] = useState('');

  const storageKey = note ? `brain-draft-${note.brainId}` : 'brain-draft-new';

  useEffect(() => {
    if (!open) return;

    const fallback = {
      title: note?.title ?? '',
      content: note?.content ?? '',
      category: note?.category ?? 'thought',
      tagsInput: stringifyTags(note?.tags ?? []),
    };

    const draft = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null;
    const timeoutId = window.setTimeout(() => {
      if (draft) {
        try {
          const parsed = JSON.parse(draft) as typeof fallback & { autosavedAt?: string };
          setTitle(parsed.title ?? fallback.title);
          setContent(parsed.content ?? fallback.content);
          setCategory((parsed.category as BrainCategory) ?? fallback.category);
          setTagsInput(parsed.tagsInput ?? fallback.tagsInput);
          setAutosavedAt(parsed.autosavedAt ?? null);
          setError('');
          return;
        } catch {
          window.localStorage.removeItem(storageKey);
        }
      }

      setTitle(fallback.title);
      setContent(fallback.content);
      setCategory(fallback.category as BrainCategory);
      setTagsInput(fallback.tagsInput);
      setAutosavedAt(null);
      setError('');
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [note, open, storageKey]);

  useEffect(() => {
    if (!open) return;
    const timeoutId = window.setTimeout(() => {
      const nextAutosave = new Date().toISOString();
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ title, content, category, tagsInput, autosavedAt: nextAutosave })
      );
      setAutosavedAt(nextAutosave);
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [category, content, open, storageKey, tagsInput, title]);

  const tags = useMemo(() => parseTags(tagsInput), [tagsInput]);
  const filteredSuggestions = tagSuggestions.filter(
    tag => !tags.includes(tag) && tag.includes(tagsInput.toLowerCase().replace(/,\s*$/, ''))
  );

  async function handleSave() {
    if (!title.trim() && !content.trim()) {
      setError('Title or content is required.');
      return;
    }

    setError('');
    await onSave({
      title: title.trim(),
      content: content.trim(),
      category,
      tags,
    });

    window.localStorage.removeItem(storageKey);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm"
          onClick={event => {
            if (event.target === event.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  {note ? 'Edit note' : 'New note'}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-gray-900">Brain Editor</h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save note'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:bg-gray-50 hover:text-gray-600"
                  aria-label="Close editor"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid flex-1 overflow-hidden lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
              <div className="overflow-y-auto border-b border-gray-200 p-6 lg:border-b-0 lg:border-r">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wider text-gray-400">
                      Title
                    </label>
                    <input
                      value={title}
                      onChange={event => setTitle(event.target.value)}
                      placeholder="Name the idea clearly..."
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wider text-gray-400">
                      Category
                    </label>
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      {BRAIN_CATEGORIES.map(option => {
                        const meta = BRAIN_CATEGORY_META[option];
                        const active = option === category;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setCategory(option)}
                            className={cn(
                              'rounded-xl border p-3 text-left transition',
                              active
                                ? `${meta.border} ${meta.bg}`
                                : 'border-gray-200 bg-white hover:bg-gray-50'
                            )}
                          >
                            <p className={cn('text-sm font-medium', active ? meta.text : 'text-gray-700')}>
                              {meta.label}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">{meta.description}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium uppercase tracking-wider text-gray-400">
                      Tags
                    </label>
                    <input
                      value={tagsInput}
                      onChange={event => setTagsInput(event.target.value)}
                      placeholder="react, search, graph, auth..."
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                    <div className="flex flex-wrap gap-2">
                      {filteredSuggestions.slice(0, 8).map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setTagsInput(current => stringifyTags([...parseTags(current), tag]))}
                          className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium uppercase tracking-wider text-gray-400">
                        Content
                      </label>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <WandSparkles className="h-3.5 w-3.5 text-blue-400" />
                        Autosaved {autosavedAt ? new Date(autosavedAt).toLocaleTimeString() : 'locally'}
                      </div>
                    </div>
                    <textarea
                      value={content}
                      onChange={event => setContent(event.target.value)}
                      onKeyDown={event => {
                        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                          event.preventDefault();
                          void handleSave();
                        }
                      }}
                      placeholder="Write in markdown, paste code blocks, or sketch the idea in plain text..."
                      className="min-h-[360px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm leading-7 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{content.length} characters</span>
                      <span>Press Ctrl/Cmd + Enter to save</span>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}
                </div>
              </div>

              <div className="overflow-y-auto p-6">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Live preview
                </p>
                <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-5">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${BRAIN_CATEGORY_META[category].border} ${BRAIN_CATEGORY_META[category].bg} ${BRAIN_CATEGORY_META[category].text}`}>
                      {BRAIN_CATEGORY_META[category].label}
                    </span>
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-500"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="mb-4 text-2xl font-semibold text-gray-900">
                    {title.trim() || 'Untitled note'}
                  </h3>
                  {content.trim() ? (
                    <BrainMarkdown content={content} />
                  ) : (
                    <p className="text-sm text-gray-400">
                      Your preview appears here as you write.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
