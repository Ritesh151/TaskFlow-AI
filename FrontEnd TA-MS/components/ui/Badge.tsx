import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
  variant?: 'default' | 'outline';
}

export function Badge({ children, className, variant = 'outline', ...props }: BadgeProps) {
  return (
    <span
      {...props}
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium border',
        variant === 'outline' ? 'bg-transparent' : 'border-transparent',
        className
      )}
    >
      {children}
    </span>
  );
}
