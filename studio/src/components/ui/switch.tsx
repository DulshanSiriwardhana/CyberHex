import React, { forwardRef } from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@/utils/cn';

interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'neon' | 'glass';
}

const Switch = forwardRef<React.ElementRef<typeof SwitchPrimitive.Root>, SwitchProps>(
  ({ className, size = 'md', variant = 'default', ...props }, ref) => {
    const sizes = {
      sm: 'w-8 h-4 [&_[data-part=thumb]]:h-3 [&_[data-part=thumb]]:w-3',
      md: 'w-10 h-5 [&_[data-part=thumb]]:h-4 [&_[data-part=thumb]]:w-4',
      lg: 'w-12 h-6 [&_[data-part=thumb]]:h-5 [&_[data-part=thumb]]:w-5',
    };
    const variants = {
      default: 'data-[state=checked]:bg-neon-cyan/60',
      neon: 'data-[state=checked]:bg-neon-cyan data-[state=checked]:shadow-glow',
      glass: 'data-[state=checked]:bg-glass-heavy',
    };

    return (
      <SwitchPrimitive.Root
        ref={ref}
        className={cn(
          'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border border-glass-border bg-white/5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/50 focus-visible:ring-offset-1 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-40',
          sizes[size],
          variants[variant],
          '[&_[data-part=thumb]]:pointer-events-none [&_[data-part=thumb]]:block [&_[data-part=thumb]]:rounded-full [&_[data-part=thumb]]:bg-white [&_[data-part=thumb]]:shadow-lg [&_[data-part=thumb]]:transition-transform [&_[data-part=thumb]]:duration-200',
          '[&_[data-part=thumb]]:data-[state=checked]:translate-x-4 [&_[data-part=thumb]]:data-[state=unchecked]:translate-x-0.5',
          className
        )}
        {...props}
      >
        <SwitchPrimitive.Thumb data-part="thumb" />
      </SwitchPrimitive.Root>
    );
  }
);
Switch.displayName = 'Switch';

export { Switch };
export type { SwitchProps };