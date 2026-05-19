import React, { forwardRef } from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/utils/cn';

interface SliderProps extends Omit<React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>, 'children'> {
  variant?: 'default' | 'neon' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  formatValue?: (value: number) => string;
}

const Slider = forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  ({ className, variant = 'default', size = 'md', showValue, formatValue, value, defaultValue, max = 100, ...props }, ref) => {
    const currentValue = value ?? defaultValue;
    const displayValue = Array.isArray(currentValue) ? currentValue : [currentValue ?? 0];

    const sizeClasses = {
      sm: 'h-4 [&_[data-part=thumb]]:h-3 [&_[data-part=thumb]]:w-3 [&_[data-part=track]]:h-1',
      md: 'h-5 [&_[data-part=thumb]]:h-4 [&_[data-part=thumb]]:w-4 [&_[data-part=track]]:h-1.5',
      lg: 'h-6 [&_[data-part=thumb]]:h-5 [&_[data-part=thumb]]:w-5 [&_[data-part=track]]:h-2',
    };

    const variantClasses = {
      default: '[&_[data-part=range]]:bg-neon-cyan/60 [&_[data-part=thumb]]:bg-white [&_[data-part=thumb]]:border-neon-cyan/40',
      neon: '[&_[data-part=range]]:bg-gradient-to-r from-neon-cyan to-neon-magenta [&_[data-part=thumb]]:bg-neon-cyan [&_[data-part=thumb]]:border-neon-cyan/60 [&_[data-part=thumb]]:shadow-glow',
      glass: '[&_[data-part=range]]:bg-white/20 [&_[data-part=thumb]]:bg-glass-heavy [&_[data-part=thumb]]:border-glass-border',
    };

    return (
      <div className="flex items-center gap-3">
        <SliderPrimitive.Root
          ref={ref}
          value={value}
          defaultValue={defaultValue}
          max={max}
          className={cn(
            'relative flex w-full touch-none select-none items-center',
            sizeClasses[size],
            '[&_[data-part=track]]:relative [&_[data-part=track]]:grow [&_[data-part=track]]:rounded-full [&_[data-part=track]]:bg-white/10',
            '[&_[data-part=range]]:absolute [&_[data-part=range]]:rounded-full [&_[data-part=range]]:h-full',
            '[&_[data-part=thumb]]:block [&_[data-part=thumb]]:rounded-full [&_[data-part=thumb]]:border [&_[data-part=thumb]]:transition-colors [&_[data-part=thumb]]:focus-visible:outline-none [&_[data-part=thumb]]:focus-visible:ring-2 [&_[data-part=thumb]]:focus-visible:ring-neon-cyan/50 [&_[data-part=thumb]]:disabled:opacity-40',
            variantClasses[variant],
            className
          )}
          {...props}
        >
          <SliderPrimitive.Track data-part="track">
            <SliderPrimitive.Range data-part="range" />
          </SliderPrimitive.Track>
          {displayValue.map((_, i) => (
            <SliderPrimitive.Thumb key={i} data-part="thumb" />
          ))}
        </SliderPrimitive.Root>
        {showValue && (
          <span className="text-xs font-mono text-white/60 min-w-[36px] text-right">
            {formatValue ? formatValue(displayValue[0]) : displayValue[0]}
          </span>
        )}
      </div>
    );
  }
);
Slider.displayName = 'Slider';

export { Slider };
export type { SliderProps };