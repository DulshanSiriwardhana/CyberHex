import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

/* ─── Button Variants ───────────────────── */

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/50 focus-visible:ring-offset-1 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-40 select-none',
  {
    variants: {
      variant: {
        primary:
          'bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/25 hover:border-neon-cyan/50 hover:shadow-glow active:bg-neon-cyan/35',
        secondary:
          'bg-neon-magenta/15 text-neon-magenta border border-neon-magenta/30 hover:bg-neon-magenta/25 hover:shadow-glow-magenta active:bg-neon-magenta/35',
        ghost:
          'text-white/60 hover:text-white hover:bg-white/5 active:bg-white/10',
        destructive:
          'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 hover:text-red-300 active:bg-red-500/35',
        outline:
          'border border-glass-border text-white/70 hover:text-white hover:border-white/20 hover:bg-glass-light active:bg-glass-medium',
        neon:
          'text-neon-cyan border border-neon-cyan/40 bg-transparent hover:bg-neon-cyan/10 hover:shadow-glow hover:border-neon-cyan/60 transition-shadow',
        glass:
          'glass-panel text-white/80 hover:text-white hover:bg-glass-heavy',
      },
      size: {
        xs: 'h-7 px-2.5 text-xs rounded-md gap-1',
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-6 text-sm',
        xl: 'h-12 px-8 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

/* ─── Props ──────────────────────────────── */

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  shortcut?: string;
}

/* ─── Button Component ──────────────────── */

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, leftIcon, rightIcon, shortcut, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {loading ? (
          <Loader2 size={size === 'xs' || size === 'sm' ? 14 : 16} className="animate-spin" />
        ) : leftIcon ? (
          <span className="shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
        {shortcut && (
          <kbd className="ml-auto pl-3 text-[10px] text-current/40 font-mono tracking-wider">
            {shortcut}
          </kbd>
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';

/* ─── IconButton ─────────────────────────── */

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: VariantProps<typeof buttonVariants>['variant'];
  size?: VariantProps<typeof buttonVariants>['size'];
  loading?: boolean;
  label: string;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant = 'ghost', size = 'md', loading, label, children, ...props }, ref) => {
    const sizeMap = { xs: 28, sm: 32, md: 40, lg: 44, xl: 48 };
    const dim = sizeMap[size ?? 'md'];

    return (
      <button
        ref={ref}
        disabled={loading}
        aria-label={label}
        className={cn(
          'inline-flex items-center justify-center rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/50 disabled:pointer-events-none disabled:opacity-40',
          variant === 'primary' && 'bg-neon-cyan/15 text-neon-cyan hover:bg-neon-cyan/25 hover:shadow-glow',
          variant === 'secondary' && 'bg-neon-magenta/15 text-neon-magenta hover:bg-neon-magenta/25',
          variant === 'ghost' && 'text-white/50 hover:text-white hover:bg-white/5',
          variant === 'neon' && 'text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/10 hover:shadow-glow',
          variant === 'glass' && 'glass-panel text-white/70 hover:text-white',
          className
        )}
        style={{ width: dim, height: dim }}
        {...props}
      >
        {loading ? <Loader2 size={dim * 0.4} className="animate-spin" /> : children}
      </button>
    );
  }
);
IconButton.displayName = 'IconButton';

/* ─── ButtonGroup ────────────────────────── */

interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  vertical?: boolean;
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({ children, className, vertical }) => (
  <div
    className={cn(
      'inline-flex',
      vertical ? 'flex-col' : 'flex-row',
      '[&>button]:rounded-none [&>button:first-child]:rounded-l-lg [&>button:last-child]:rounded-r-lg [&>button:not(:first-child)]:-ml-px',
      vertical &&
        '[&>button]:rounded-none [&>button:first-child]:rounded-t-lg [&>button:last-child]:rounded-b-lg [&>button:not(:first-child)]:-mt-px [&>button:not(:first-child)]:ml-0',
      className
    )}
  >
    {children}
  </div>
);

export { Button, IconButton, ButtonGroup, buttonVariants };
export type { ButtonProps, IconButtonProps, ButtonGroupProps };