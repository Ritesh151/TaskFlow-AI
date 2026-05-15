'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PageWrapperProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  hideHeader?: boolean;
  className?: string;
  containerClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

export function PageWrapper({
  children,
  title,
  subtitle,
  action,
  hideHeader = false,
  className,
  containerClassName,
  headerClassName,
  titleClassName,
  subtitleClassName,
}: PageWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'min-h-screen bg-[#f5f7fb] md:ml-64 pt-16 md:pt-0',
        className
      )}
    >
      <div className={cn('max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8', containerClassName)}>
        {!hideHeader && (title || subtitle || action) && (
          <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8', headerClassName)}>
            <div>
              {title && <h1 className={cn('text-2xl font-bold text-gray-900', titleClassName)}>{title}</h1>}
              {subtitle && <p className={cn('text-sm text-gray-500 mt-1', subtitleClassName)}>{subtitle}</p>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
          </div>
        )}
        {children}
      </div>
    </motion.div>
  );
}
