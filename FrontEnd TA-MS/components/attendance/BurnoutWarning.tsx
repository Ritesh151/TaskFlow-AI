'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldCheck, AlertCircle } from 'lucide-react';
import type { BurnoutRisk } from '@/lib/types';
import { cn } from '@/lib/utils';

interface BurnoutWarningProps {
  risk: BurnoutRisk;
  recommendations: string[];
}

const config = {
  low: {
    icon: ShieldCheck,
    bg: 'bg-green-50',
    border: 'border-green-200',
    iconColor: 'text-green-500',
    titleColor: 'text-green-700',
    title: 'Healthy Work Rhythm',
  },
  medium: {
    icon: AlertCircle,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconColor: 'text-amber-500',
    titleColor: 'text-amber-700',
    title: 'Moderate Burnout Risk',
  },
  high: {
    icon: AlertTriangle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconColor: 'text-red-500',
    titleColor: 'text-red-700',
    title: 'High Burnout Risk',
  },
};

export function BurnoutWarning({ risk, recommendations }: BurnoutWarningProps) {
  const c = config[risk];
  const Icon = c.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn('rounded-2xl border p-4', c.bg, c.border)}
      >
        <div className="flex items-start gap-3">
          <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/60')}>
            <Icon className={cn('w-4 h-4', c.iconColor)} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn('text-sm font-semibold', c.titleColor)}>{c.title}</p>
            {recommendations.length > 0 && (
              <ul className="mt-2 space-y-1">
                {recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                    <span className={cn('mt-0.5 flex-shrink-0', c.iconColor)}>→</span>
                    {r}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
