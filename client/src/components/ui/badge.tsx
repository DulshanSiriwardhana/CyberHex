import { cn } from '@/lib/utils';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'neutral';
  children: React.ReactNode;
  className?: string;
}

const variants = {
  default: 'bg-[rgba(220,38,38,0.12)] text-red-400 border-[rgba(220,38,38,0.2)]',
  success: 'bg-[rgba(34,197,94,0.1)] text-green-400 border-[rgba(34,197,94,0.2)]',
  warning: 'bg-[rgba(234,179,8,0.1)] text-yellow-400 border-[rgba(234,179,8,0.2)]',
  danger: 'bg-[rgba(220,38,38,0.15)] text-red-400 border-[rgba(220,38,38,0.25)]',
  neutral: 'bg-[rgba(255,255,255,0.06)] text-[#8a8a8a] border-[rgba(255,255,255,0.1)]',
};

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}