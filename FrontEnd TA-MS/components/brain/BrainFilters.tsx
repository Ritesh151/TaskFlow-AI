'use client';

import type { BrainCategory, BrainSort } from '@/lib/types';
import { BRAIN_CATEGORIES, BRAIN_CATEGORY_META } from '@/lib/brain';
import { cn } from '@/lib/utils';

interface BrainFiltersProps {
  category: BrainCategory | 'all';
  sort: BrainSort;
  favoritesOnly: boolean;
  pinnedOnly: boolean;
  onCategoryChange: (category: BrainCategory | 'all') => void;
  onSortChange: (sort: BrainSort) => void;
  onFavoritesChange: (value: boolean) => void;
  onPinnedChange: (value: boolean) => void;
}

export function BrainFilters({
  category,
  sort,
  favoritesOnly,
  pinnedOnly,
  onCategoryChange,
  onSortChange,
  onFavoritesChange,
  onPinnedChange,
}: BrainFiltersProps) {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onCategoryChange('all')}
          className={cn(
            'rounded-full border px-3 py-1.5 text-xs font-medium transition',
            category === 'all'
              ? 'border-blue-200 bg-blue-50 text-blue-700'
              : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700'
          )}
        >
          All
        </button>
        {BRAIN_CATEGORIES.map(item => {
          const meta = BRAIN_CATEGORY_META[item];
          const active = category === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onCategoryChange(item)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition',
                active
                  ? `${meta.border} ${meta.bg} ${meta.text}`
                  : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              )}
            >
              {meta.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className={cn(
          'inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition',
          favoritesOnly
            ? 'border-violet-200 bg-violet-50 text-violet-700'
            : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
        )}>
          <input
            type="checkbox"
            checked={favoritesOnly}
            onChange={event => onFavoritesChange(event.target.checked)}
            className="h-3.5 w-3.5 rounded border-gray-300 text-violet-600 accent-violet-600"
          />
          Favorites
        </label>
        <label className={cn(
          'inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition',
          pinnedOnly
            ? 'border-amber-200 bg-amber-50 text-amber-700'
            : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
        )}>
          <input
            type="checkbox"
            checked={pinnedOnly}
            onChange={event => onPinnedChange(event.target.checked)}
            className="h-3.5 w-3.5 rounded border-gray-300 text-amber-500 accent-amber-500"
          />
          Pinned
        </label>
        <select
          value={sort}
          onChange={event => onSortChange(event.target.value as BrainSort)}
          className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 outline-none"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="favorites">Favorites</option>
          <option value="most-linked">Most linked</option>
        </select>
      </div>
    </div>
  );
}
