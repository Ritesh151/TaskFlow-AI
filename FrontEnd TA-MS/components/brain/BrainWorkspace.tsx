'use client';

import { startTransition, useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ApiError,
  createBrainNote,
  deleteBrainNote,
  getBrainDashboard,
  getBrainGraph,
  searchBrainNotes,
  toggleBrainFavorite,
  toggleBrainPin,
  updateBrainNote,
} from '@/lib/api';
import type {
  BrainCategory,
  BrainDashboardData,
  BrainGraphData,
  BrainNote,
  BrainSort,
} from '@/lib/types';
import {
  removeBrainNote,
  sortBrainNotes,
  upsertBrainNote,
} from '@/lib/brain';
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
  const haystack = [
    note.title,
    note.content,
    note.category,
    ...note.tags,
    ...note.keywords,
  ].join(' ').toLowerCase();
  return haystack.includes(query);
}

export function BrainWorkspace() {
  const [dashboard, setDashboard] = useState<BrainDashboardData | null>(null);
  const [graph, setGraph] = useState<BrainGraphData | null>(null);
  const [viewNotes, setViewNotes] = useState<BrainNote[]>([]);
  const [loading, setLoading] = useState(true);
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
  const deferredQuery = useDeferredValue(query);

  const refreshAll = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError('');
    }

    const [dashboardResult, graphResult] = await Promise.allSettled([
      getBrainDashboard(),
      getBrainGraph(),
    ]);

    if (dashboardResult.status === 'fulfilled') {
      setDashboard(dashboardResult.value);
    } else {
      console.error('[Brain] dashboard load failed:', dashboardResult.reason);
      setError(formatError(dashboardResult.reason));
    }

    if (graphResult.status === 'fulfilled') {
      setGraph(graphResult.value);
    } else {
      console.error('[Brain] graph load failed:', graphResult.reason);
    }

    if (!silent) {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void refreshAll();
    }, 0);
    return () => window.clearTimeout(id);
  }, [refreshAll]);

  useEffect(() => {
    if (!dashboard) return;

    const isDefaultState =
      !deferredQuery.trim() &&
      category === 'all' &&
      !favoritesOnly &&
      !pinnedOnly &&
      sort === 'newest';

    if (isDefaultState) {
      const id = window.setTimeout(() => {
        setViewNotes(dashboard.notes);
      }, 0);
      return () => window.clearTimeout(id);
    }

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
        startTransition(() => {
          setViewNotes(result.notes);
        });
      } catch (searchError) {
        console.error('[Brain] search failed:', searchError);
        setError(formatError(searchError));
      } finally {
        setSearching(false);
      }
    }, 180);

    return () => window.clearTimeout(timeoutId);
  }, [category, dashboard, deferredQuery, favoritesOnly, pinnedOnly, sort]);

  useEffect(() => {
    if (!selectedNoteId) return;
    const timeoutId = window.setTimeout(() => {
      document.getElementById(`brain-note-${selectedNoteId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 180);

    return () => window.clearTimeout(timeoutId);
  }, [selectedNoteId, viewNotes]);

  const totalNotes = dashboard?.stats.totalNotes ?? 0;
  const totalMatches = viewNotes.length;
  const isEmpty = !loading && totalNotes === 0;
  const noSearchResults = !loading && totalNotes > 0 && totalMatches === 0;

  const tagSuggestions = useMemo(() => dashboard?.availableTags ?? [], [dashboard?.availableTags]);
  const sortedNotes = useMemo(() => sortBrainNotes(viewNotes, sort), [sort, viewNotes]);

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
      setViewNotes(current => upsertBrainNote(current, optimistic, sort));
    }

    try {
      const created = await createBrainNote(payload);
      setViewNotes(current => removeBrainNote(current, optimistic.brainId, sort));
      if (matchesFilter(created, { query, category, favoritesOnly, pinnedOnly })) {
        setViewNotes(current => upsertBrainNote(current, created, sort));
      }
      await refreshAll(true);
    } catch (captureError) {
      setViewNotes(current => removeBrainNote(current, optimistic.brainId, sort));
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
        await updateBrainNote(editingNote.brainId, payload);
      } else {
        await createBrainNote(payload);
      }

      setEditorOpen(false);
      setEditingNote(null);
      await refreshAll(true);
    } catch (saveError) {
      setError(formatError(saveError));
    } finally {
      setSavingEditor(false);
    }
  }

  async function handleDelete(note: BrainNote) {
    if (!window.confirm(`Delete "${note.title}"?`)) return;

    const snapshot = viewNotes;
    setViewNotes(current => removeBrainNote(current, note.brainId, sort));

    try {
      await deleteBrainNote(note.brainId);
      if (selectedNoteId === note.brainId) setSelectedNoteId(null);
      await refreshAll(true);
    } catch (deleteError) {
      setViewNotes(snapshot);
      setError(formatError(deleteError));
    }
  }

  async function handleToggleFavorite(note: BrainNote) {
    setViewNotes(current =>
      upsertBrainNote(current, { ...note, favorite: !note.favorite, updatedAt: new Date().toISOString() }, sort)
    );

    try {
      await toggleBrainFavorite(note.brainId, !note.favorite);
      await refreshAll(true);
    } catch (favoriteError) {
      setError(formatError(favoriteError));
      await refreshAll(true);
    }
  }

  async function handleTogglePin(note: BrainNote) {
    setViewNotes(current =>
      upsertBrainNote(current, { ...note, pinned: !note.pinned, updatedAt: new Date().toISOString() }, sort)
    );

    try {
      await toggleBrainPin(note.brainId, !note.pinned);
      await refreshAll(true);
    } catch (pinError) {
      setError(formatError(pinError));
      await refreshAll(true);
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
    <PageWrapper
      hideHeader
      containerClassName="max-w-[96rem] py-6 sm:py-8"
    >
      <div className="space-y-6">
          <BrainHeader stats={dashboard?.stats ?? null} />

          <QuickCapture onCapture={handleQuickCapture} onOpenEditor={() => openEditor()} saving={savingCapture} />

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </motion.div>
          )}

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="flex-1">
                  <BrainSearch
                    value={query}
                    onChange={setQuery}
                    results={totalMatches}
                    loading={searching}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => openEditor()}
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
                >
                  New long-form note
                </button>
              </div>

              <BrainFilters
                category={category}
                sort={sort}
                favoritesOnly={favoritesOnly}
                pinnedOnly={pinnedOnly}
                onCategoryChange={setCategory}
                onSortChange={setSort}
                onFavoritesChange={setFavoritesOnly}
                onPinnedChange={setPinnedOnly}
              />

              {isEmpty ? (
                <EmptyBrain onCreate={() => openEditor()} />
              ) : (
                <>
                  <BrainGraph graph={graph} activeNoteId={selectedNoteId} onOpenNote={focusNote} />

                  {noSearchResults ? (
                    <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                      <p className="text-lg font-semibold text-gray-900">No notes match this view.</p>
                      <p className="mt-2 text-sm text-gray-500">
                        Try clearing the query, switching categories, or toggling off favorites/pinned filters.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 lg:grid-cols-2">
                      {sortedNotes.map(note => (
                        <BrainCard
                          key={note.brainId}
                          note={note}
                          searchQuery={query}
                          selected={selectedNoteId === note.brainId}
                          onEdit={openEditor}
                          onDelete={handleDelete}
                          onToggleFavorite={handleToggleFavorite}
                          onTogglePin={handleTogglePin}
                          onSelectNote={focusNote}
                        />
                      ))}
                    </div>
                  )}

                  <KnowledgeClusters
                    clusters={dashboard?.clusters ?? []}
                    onSelectTopic={setQuery}
                  />
                </>
              )}
            </div>

            <BrainInsights
              stats={dashboard?.stats ?? null}
              onOpenNote={focusNote}
              onSelectTopic={setQuery}
            />
          </div>
      </div>

      <BrainEditor
        open={editorOpen}
        note={editingNote}
        saving={savingEditor}
        tagSuggestions={tagSuggestions}
        onClose={() => {
          setEditorOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
      />
    </PageWrapper>
  );
}
