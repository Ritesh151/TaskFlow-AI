'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover = false, glass = false, onClick }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover={hover ? { y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.10)' } : undefined}
      onClick={onClick}
      className={cn(
        'rounded-2xl border border-gray-100 bg-white shadow-sm',
        glass && 'backdrop-blur-sm bg-white/80',
        hover && 'cursor-pointer transition-shadow',
        className
      )}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-6 pt-6 pb-3', className)}>{children}</div>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-6 pb-6', className)}>{children}</div>;
}
