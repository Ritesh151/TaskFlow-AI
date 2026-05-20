'use client';

import { startTransition, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ApiError, searchBrainNotes } from '@/lib/api';
import type { BrainCategory, BrainNote, BrainSort } from '@/lib/types';
import { removeBrainNote, sortBrainNotes, upsertBrainNote } from '@/lib/brain';
import { useBrainAll, useCreateBrainNote, useUpdateBrainNote, useDeleteBrainNote, useToggleBrainFavorite, useToggleBrainPin } from '@/lib/hooks/use-brain';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { BrainHeader } from './BrainHeader';
import { QuickCapture } from './QuickCapture';
import { BrainSearch } from './BrainSearch';
import { BrainFilters } from './BrainFilters';
import { BrainCard } from './BrainCard';
import { BrainGraph } from './BrainGraph';
import { BrainEditor } from './BrainEditor';
import { BrainInsights } from './BrainInsights';
import { EmptyBrain } from './EmptyBrain';
import { KnowledgeClusters } from './KnowledgeClusters';
import { useQueryClient } from '@tanstack/react-query';
import { brainKeys } from '@/lib/query-keys';

function formatError(error: unknown): string {
  if (error instanceof ApiError || error instanceof Error) return error.message;
  return 'Something went wrong while loading your knowledge vault.';
}

function matchesFilter(note: BrainNote, options: {
  query: string;
  category: BrainCategory | 'all';
  favoritesOnly: boolean;
  pinnedOnly: boolean;
}) {
  const query = options.query.trim().toLowerCase();
  if (options.category !== 'all' && note.category !== options.category) return false;
  if (options.favoritesOnly && !note.favorite) return false;
  if (options.pinnedOnly && !note.pinned) return false;
  if (!query) return true;
  const haystack = [note.title, note.content, note.category, ...note.tags, ...note.keywords].join(' ').toLowerCase();
  return haystack.includes(query);
}

export function BrainWorkspace() {
  const queryClient = useQueryClient();
  const { dashboard, graph, isLoading } = useBrainAll();

  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<BrainCategory | 'all'>('all');
  const [sort, setSort] = useState<BrainSort>('newest');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [searching, setSearching] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<BrainNote | null>(null);
  const [savingEditor, setSavingEditor] = useState(false);
  const [savingCapture, setSavingCapture] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<BrainNote[] | null>(null);
  const deferredQuery = useDeferredValue(query);
  const searchIdRef = useRef(0);

  const createMutation = useCreateBrainNote();
  const updateMutation = useUpdateBrainNote();
  const deleteMutation = useDeleteBrainNote();
  const toggleFavoriteMutation = useToggleBrainFavorite();
  const togglePinMutation = useToggleBrainPin();

  const dashboardNotes = useMemo(() => dashboard?.notes ?? [], [dashboard]);

  const isDefaultView = !deferredQuery.trim() && category === 'all' && !favoritesOnly && !pinnedOnly && sort === 'newest';

  const viewNotes = (isDefaultView || !searchResults) ? dashboardNotes : searchResults;

  const sortedNotes = useMemo(() => sortBrainNotes(viewNotes, sort), [viewNotes, sort]);

  useEffect(() => {
    if (!dashboard || isDefaultView) {
      return;
    }

    const id = ++searchIdRef.current;

    const timeoutId = window.setTimeout(async () => {
      setSearching(true);
      try {
        const result = await searchBrainNotes({
          query: deferredQuery.trim(),
          category,
          sort,
          favorite: favoritesOnly,
          pinned: pinnedOnly,
        });
        if (id === searchIdRef.current) {
          startTransition(() => {
            setSearchResults(result.notes);
          });
        }
      } catch (searchError) {
        console.error('[Brain] search failed:', searchError);
        if (id === searchIdRef.current) {
          setError(formatError(searchError));
        }
      } finally {
        if (id === searchIdRef.current) {
          setSearching(false);
        }
      }
    }, 180);

    return () => window.clearTimeout(timeoutId);
  }, [category, dashboard, deferredQuery, favoritesOnly, isDefaultView, pinnedOnly, sort]);

  useEffect(() => {
    if (!selectedNoteId) return;
    const timeoutId = window.setTimeout(() => {
      document.getElementById(`brain-note-${selectedNoteId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 180);
    return () => window.clearTimeout(timeoutId);
  }, [selectedNoteId, viewNotes]);

  const totalNotes = dashboard?.stats.totalNotes ?? 0;
  const totalMatches = viewNotes.length;
  const isEmpty = !isLoading && totalNotes === 0;
  const noSearchResults = !isLoading && totalNotes > 0 && totalMatches === 0;

  const tagSuggestions = useMemo(() => dashboard?.availableTags ?? [], [dashboard?.availableTags]);

  async function handleQuickCapture(payload: {
    title: string;
    content: string;
    category: BrainCategory;
    tags: string[];
  }) {
    const optimistic: BrainNote = {
      brainId: `temp-${Date.now()}`,
      title: payload.title,
      content: payload.content,
      category: payload.category,
      tags: payload.tags,
      keywords: payload.tags,
      relatedNotes: [],
      relatedTasks: [],
      favorite: false,
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSavingCapture(true);
    setError('');
    if (matchesFilter(optimistic, { query, category, favoritesOnly, pinnedOnly })) {
      setSearchResults(current => current ? upsertBrainNote(current, optimistic, sort) : null);
    }

    try {
      const created = await createMutation.mutateAsync(payload);
      setSearchResults(current => current ? removeBrainNote(current, optimistic.brainId, sort) : null);
      if (matchesFilter(created, { query, category, favoritesOnly, pinnedOnly })) {
        setSearchResults(current => current ? upsertBrainNote(current, created, sort) : null);
      }
      queryClient.invalidateQueries({ queryKey: brainKeys.all });
    } catch (captureError) {
      setSearchResults(current => current ? removeBrainNote(current, optimistic.brainId, sort) : null);
      setError(formatError(captureError));
    } finally {
      setSavingCapture(false);
    }
  }

  async function handleSaveNote(payload: {
    title: string;
    content: string;
    category: BrainCategory;
    tags: string[];
  }) {
    setSavingEditor(true);
    setError('');
    try {
      if (editingNote) {
        await updateMutation.mutateAsync({ id: editingNote.brainId, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setEditorOpen(false);
      setEditingNote(null);
      queryClient.invalidateQueries({ queryKey: brainKeys.all });
    } catch (saveError) {
      setError(formatError(saveError));
    } finally {
      setSavingEditor(false);
    }
  }

  async function handleDelete(note: BrainNote) {
    if (!window.confirm(`Delete "${note.title}"?`)) return;
    const snapshot = searchResults;
    setSearchResults(current => current ? removeBrainNote(current, note.brainId, sort) : null);
    try {
      await deleteMutation.mutateAsync(note.brainId);
      if (selectedNoteId === note.brainId) setSelectedNoteId(null);
      queryClient.invalidateQueries({ queryKey: brainKeys.all });
    } catch (deleteError) {
      setSearchResults(snapshot);
      setError(formatError(deleteError));
    }
  }

  async function handleToggleFavorite(note: BrainNote) {
    const updated = { ...note, favorite: !note.favorite, updatedAt: new Date().toISOString() };
    setSearchResults(current => current ? upsertBrainNote(current, updated, sort) : null);
    try {
      await toggleFavoriteMutation.mutateAsync({ id: note.brainId, value: !note.favorite });
      queryClient.invalidateQueries({ queryKey: brainKeys.all });
    } catch (favoriteError) {
      setError(formatError(favoriteError));
      queryClient.invalidateQueries({ queryKey: brainKeys.all });
    }
  }

  async function handleTogglePin(note: BrainNote) {
    const updated = { ...note, pinned: !note.pinned, updatedAt: new Date().toISOString() };
    setSearchResults(current => current ? upsertBrainNote(current, updated, sort) : null);
    try {
      await togglePinMutation.mutateAsync({ id: note.brainId, value: !note.pinned });
      queryClient.invalidateQueries({ queryKey: brainKeys.all });
    } catch (pinError) {
      setError(formatError(pinError));
      queryClient.invalidateQueries({ queryKey: brainKeys.all });
    }
  }

  function openEditor(note?: BrainNote) {
    setEditingNote(note ?? null);
    setEditorOpen(true);
  }

  function focusNote(noteId: string) {
    if (!viewNotes.some(note => note.brainId === noteId)) {
      setQuery('');
      setCategory('all');
      setFavoritesOnly(false);
      setPinnedOnly(false);
      setSort('newest');
    }
    setSelectedNoteId(noteId);
  }

  return (
    <PageWrapper hideHeader containerClassName="max-w-[96rem] py-6 sm:py-8">
      <div className="space-y-6">
        <BrainHeader stats={dashboard?.stats ?? null} />
        <QuickCapture onCapture={handleQuickCapture} onOpenEditor={() => openEditor()} saving={savingCapture} />

        {error && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </motion.div>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="flex-1">
                <BrainSearch value={query} onChange={setQuery} results={totalMatches} loading={searching} />
              </div>
              <button type="button" onClick={() => openEditor()}
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
              >
                New long-form note
              </button>
            </div>

            <BrainFilters category={category} sort={sort} favoritesOnly={favoritesOnly} pinnedOnly={pinnedOnly}
              onCategoryChange={setCategory} onSortChange={setSort}
              onFavoritesChange={setFavoritesOnly} onPinnedChange={setPinnedOnly}
            />

            {isEmpty ? (
              <EmptyBrain onCreate={() => openEditor()} />
            ) : (
              <>
                <BrainGraph graph={graph} activeNoteId={selectedNoteId} onOpenNote={focusNote} />

                {noSearchResults ? (
                  <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                    <p className="text-lg font-semibold text-gray-900">No notes match this view.</p>
                    <p className="mt-2 text-sm text-gray-500">Try clearing the query, switching categories, or toggling off favorites/pinned filters.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {sortedNotes.map(note => (
                      <BrainCard key={note.brainId} note={note} searchQuery={query}
                        selected={selectedNoteId === note.brainId}
                        onEdit={openEditor} onDelete={handleDelete}
                        onToggleFavorite={handleToggleFavorite} onTogglePin={handleTogglePin}
                        onSelectNote={focusNote}
                      />
                    ))}
                  </div>
                )}

                <KnowledgeClusters clusters={dashboard?.clusters ?? []} onSelectTopic={setQuery} />
              </>
            )}
          </div>

          <BrainInsights stats={dashboard?.stats ?? null} onOpenNote={focusNote} onSelectTopic={setQuery} />
        </div>
      </div>

      <BrainEditor open={editorOpen} note={editingNote} saving={savingEditor}
        tagSuggestions={tagSuggestions}
        onClose={() => { setEditorOpen(false); setEditingNote(null); }}
        onSave={handleSaveNote}
      />
    </PageWrapper>
  );
}
