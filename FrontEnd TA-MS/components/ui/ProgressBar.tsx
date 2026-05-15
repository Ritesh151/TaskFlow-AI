'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  color?: 'blue' | 'green' | 'red' | 'amber' | 'purple';
  showLabel?: boolean;
  height?: 'sm' | 'md' | 'lg';
}

const colorMap = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  amber: 'bg-amber-500',
  purple: 'bg-purple-500',
};

const heightMap = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export function ProgressBar({
  value,
  className,
  color = 'blue',
  showLabel = false,
  height = 'md',
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full bg-gray-100 rounded-full overflow-hidden', heightMap[height])}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn('h-full rounded-full', colorMap[color])}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-gray-500 mt-1 text-right">{clamped}%</p>
      )}
    </div>
  );
}
