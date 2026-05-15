'use client';

import { Search, X } from 'lucide-react';

interface BrainSearchProps {
  value: string;
  onChange: (value: string) => void;
  results: number;
  loading?: boolean;
}

export function BrainSearch({ value, onChange, results, loading = false }: BrainSearchProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder="Search notes, tags, keywords, technologies..."
        className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-24 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-14 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
        {loading ? 'Searching...' : `${results} result${results === 1 ? '' : 's'}`}
      </div>
    </div>
  );
}
