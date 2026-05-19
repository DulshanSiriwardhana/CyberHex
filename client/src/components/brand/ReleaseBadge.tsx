/**
 * CyberHex v4.0 — Release badge (No. 01)
 */
import { cn } from '@/lib/utils';
import { V4_BADGE_COPY, V4_RELEASE } from '@/lib/design-v4';

export interface ReleaseBadgeProps {
  variant?: 'hero' | 'compact' | 'live';
  className?: string;
  pulse?: boolean;
}

const copy: Record<NonNullable<ReleaseBadgeProps['variant']>, string> = {
  hero: V4_BADGE_COPY.hero,
  compact: V4_BADGE_COPY.short,
  live: V4_BADGE_COPY.live,
};

export function ReleaseBadge({
  variant = 'compact',
  className,
  pulse = variant === 'hero' || variant === 'live',
}: ReleaseBadgeProps) {
  return (
    <div
      className={cn(
        'badge-v4-release inline-flex items-center gap-2 rounded-full border px-4 py-1.5',
        'text-sm font-medium backdrop-blur-sm',
        className,
      )}
      title={V4_RELEASE.fullLabel}
    >
      {pulse && (
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--v4-signal-green)] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--v4-signal-green)]" />
        </span>
      )}
      <span className="font-mono text-[var(--v4-signal-green)] tabular-nums">{copy[variant]}</span>
    </div>
  );
}
