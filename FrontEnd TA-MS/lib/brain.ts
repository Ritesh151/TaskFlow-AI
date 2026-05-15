import type { BrainCategory, BrainNote, BrainSort } from './types';

export const BRAIN_CATEGORIES: BrainCategory[] = [
  'idea',
  'bug',
  'learning',
  'snippet',
  'thought',
  'research',
];

const TECH_TAGS = [
  'react',
  'next',
  'next.js',
  'typescript',
  'javascript',
  'tailwind',
  'node',
  'express',
  'api',
  'auth',
  'json',
  'markdown',
  'docker',
  'graphql',
  'performance',
  'ui',
  'ux',
  'testing',
];

export const BRAIN_CATEGORY_META: Record<
  BrainCategory,
  {
    label: string;
    description: string;
    accent: string;
    border: string;
    bg: string;
    text: string;
    glow: string;
    graph: string;
  }
> = {
  idea: {
    label: 'Idea',
    description: 'New features, experiments, product sparks',
    accent: 'from-cyan-400 via-sky-400 to-blue-500',
    border: 'border-cyan-200',
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    glow: 'shadow-cyan-500/10',
    graph: '#0ea5e9',
  },
  bug: {
    label: 'Bug',
    description: 'Defects, regressions, technical hazards',
    accent: 'from-rose-400 via-orange-400 to-amber-400',
    border: 'border-rose-200',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    glow: 'shadow-rose-500/10',
    graph: '#f43f5e',
  },
  learning: {
    label: 'Learning',
    description: 'Docs, tutorials, references worth revisiting',
    accent: 'from-emerald-400 via-lime-400 to-green-500',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    glow: 'shadow-emerald-500/10',
    graph: '#10b981',
  },
  snippet: {
    label: 'Snippet',
    description: 'Code fragments, patterns, terminal recipes',
    accent: 'from-violet-400 via-fuchsia-400 to-pink-500',
    border: 'border-violet-200',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    glow: 'shadow-violet-500/10',
    graph: '#8b5cf6',
  },
  thought: {
    label: 'Thought',
    description: 'Personal reflections and loose captures',
    accent: 'from-slate-300 via-slate-400 to-slate-500',
    border: 'border-slate-200',
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    glow: 'shadow-slate-500/10',
    graph: '#94a3b8',
  },
  research: {
    label: 'Research',
    description: 'Comparisons, investigations, deeper dives',
    accent: 'from-amber-300 via-yellow-300 to-orange-400',
    border: 'border-amber-200',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    glow: 'shadow-amber-500/10',
    graph: '#f59e0b',
  },
};

const CATEGORY_PREFIXES: Record<string, BrainCategory> = {
  idea: 'idea',
  bug: 'bug',
  learning: 'learning',
  learn: 'learning',
  snippet: 'snippet',
  thought: 'thought',
  research: 'research',
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\w\s.#/+:-]/g, ' ')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function noteConnectionCount(note: Pick<BrainNote, 'relatedNotes' | 'relatedTasks'>): number {
  return (note.relatedNotes?.length || 0) + (note.relatedTasks?.length || 0);
}

export function notePreview(note: Pick<BrainNote, 'content'>, maxLength = 220): string {
  const collapsed = note.content.replace(/\s+/g, ' ').trim();
  if (collapsed.length <= maxLength) return collapsed;
  return `${collapsed.slice(0, maxLength - 1).trimEnd()}…`;
}

export function formatRelativeTime(input: string): string {
  const date = new Date(input);
  const diffMs = Date.now() - date.getTime();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return 'Just now';
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`;
  if (diffMs < day * 7) return `${Math.floor(diffMs / day)}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function sortBrainNotes(notes: BrainNote[], sort: BrainSort = 'newest'): BrainNote[] {
  return [...notes].sort((left, right) => {
    const leftConnections = noteConnectionCount(left);
    const rightConnections = noteConnectionCount(right);

    if (sort === 'oldest') {
      return left.createdAt.localeCompare(right.createdAt);
    }

    if (sort === 'favorites') {
      return (
        Number(right.favorite) - Number(left.favorite) ||
        Number(right.pinned) - Number(left.pinned) ||
        right.updatedAt.localeCompare(left.updatedAt)
      );
    }

    if (sort === 'most-linked') {
      return (
        rightConnections - leftConnections ||
        Number(right.pinned) - Number(left.pinned) ||
        right.updatedAt.localeCompare(left.updatedAt)
      );
    }

    return (
      Number(right.pinned) - Number(left.pinned) ||
      right.updatedAt.localeCompare(left.updatedAt)
    );
  });
}

function inferQuickCategory(text: string): BrainCategory {
  const normalized = normalize(text);
  const prefix = normalized.split(':')[0];
  if (CATEGORY_PREFIXES[prefix]) {
    return CATEGORY_PREFIXES[prefix];
  }

  if (/(bug|issue|error|fix|regression)/.test(normalized)) return 'bug';
  if (/(snippet|```|function|component|hook|const|import)/.test(normalized)) return 'snippet';
  if (/(learn|docs|tutorial|article|course|guide)/.test(normalized)) return 'learning';
  if (/(research|investigate|compare|benchmark|analysis)/.test(normalized)) return 'research';
  if (/(idea|feature|experiment|prototype|build)/.test(normalized)) return 'idea';
  return 'thought';
}

function deriveTitleFromCapture(content: string): string {
  const stripped = content
    .replace(/^([a-z]+)\s*:\s*/i, '')
    .replace(/#[a-z0-9-]+/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!stripped) return 'Untitled note';
  if (stripped.length <= 72) return stripped;
  return `${stripped.slice(0, 69).trimEnd()}...`;
}

export function parseQuickCaptureInput(input: string): {
  title: string;
  content: string;
  category: BrainCategory;
  tags: string[];
} {
  const trimmed = input.trim();
  const category = inferQuickCategory(trimmed);
  const tags = [
    ...new Set([
      ...[...trimmed.matchAll(/#([a-z0-9][a-z0-9-]*)/gi)].map(match => match[1].toLowerCase()),
      ...TECH_TAGS.filter(tag => normalize(trimmed).includes(normalize(tag))),
    ]),
  ].slice(0, 8);

  return {
    title: deriveTitleFromCapture(trimmed),
    content: trimmed,
    category,
    tags,
  };
}

export function splitHighlightedText(text: string, query: string): Array<{ text: string; match: boolean }> {
  if (!query.trim()) return [{ text, match: false }];

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'ig');
  const parts = text.split(regex).filter(Boolean);
  return parts.map(part => ({
    text: part,
    match: part.toLowerCase() === query.toLowerCase(),
  }));
}

export function upsertBrainNote(notes: BrainNote[], note: BrainNote, sort: BrainSort = 'newest'): BrainNote[] {
  const next = notes.some(item => item.brainId === note.brainId)
    ? notes.map(item => (item.brainId === note.brainId ? note : item))
    : [note, ...notes];
  return sortBrainNotes(next, sort);
}

export function removeBrainNote(notes: BrainNote[], noteId: string, sort: BrainSort = 'newest'): BrainNote[] {
  return sortBrainNotes(notes.filter(note => note.brainId !== noteId), sort);
}

export function formatClusterLabel(label: string): string {
  return titleCase(label);
}
