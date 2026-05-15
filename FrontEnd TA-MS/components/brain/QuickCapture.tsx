'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Hash, Sparkles } from 'lucide-react';
import type { BrainCategory } from '@/lib/types';
import { BRAIN_CATEGORY_META, parseQuickCaptureInput } from '@/lib/brain';

interface QuickCaptureProps {
  onCapture: (payload: { title: string; content: string; category: BrainCategory; tags: string[] }) => Promise<void> | void;
  onOpenEditor?: () => void;
  saving?: boolean;
}

export function QuickCapture({ onCapture, onOpenEditor, saving = false }: QuickCaptureProps) {
  const [value, setValue] = useState('');
  const capture = useMemo(() => parseQuickCaptureInput(value), [value]);
  const meta = BRAIN_CATEGORY_META[capture.category];

  async function handleSubmit() {
    if (!value.trim() || saving) return;
    const payload = parseQuickCaptureInput(value);
    await onCapture(payload);
    setValue('');
  }

  return (
    <div className="sticky top-20 md:top-6 z-20">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-400">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              Quick capture
            </div>
            <div className="relative">
              <input
                value={value}
                onChange={event => setValue(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    void handleSubmit();
                  }
                }}
                placeholder="Capture an idea instantly..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-28 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={saving || !value.trim()}
                className="absolute right-1.5 top-1.5 inline-flex h-9 items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-3.5 text-sm font-medium text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:max-w-sm">
            {onOpenEditor && (
              <button
                type="button"
                onClick={onOpenEditor}
                className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
              >
                Open editor
              </button>
            )}
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${meta.border} ${meta.bg} ${meta.text}`}>
              <span className={`h-2 w-2 rounded-full bg-gradient-to-r ${meta.accent}`} />
              {meta.label}
            </span>
            {capture.tags.slice(0, 4).map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-500"
              >
                <Hash className="h-3 w-3 text-gray-400" />
                {tag}
              </span>
            ))}
            <span className="text-xs text-gray-400">Press Enter to save</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
