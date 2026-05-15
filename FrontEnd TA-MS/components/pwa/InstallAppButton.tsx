'use client';

import { Download } from 'lucide-react';
import { usePwa } from '@/components/providers/PwaProvider';

export function InstallAppButton() {
  const { canInstall, promptInstall } = usePwa();

  if (!canInstall) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => {
        void promptInstall();
      }}
      className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
    >
      <Download className="h-3.5 w-3.5" />
      Install App
    </button>
  );
}
