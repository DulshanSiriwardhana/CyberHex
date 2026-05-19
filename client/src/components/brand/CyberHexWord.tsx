/**
 * CyberHex v4.0 — The Word (Release No. 01)
 *
 * Canonical brand wordmark: CYBER + Hex syllable + serial stamp "01".
 */
import { cn } from '@/lib/utils';
import { V4_RELEASE, type WordmarkSize } from '@/lib/design-v4';

export interface CyberHexWordProps {
  size?: WordmarkSize;
  /** Show rotated serial stamp (default true for md+) */
  showSerial?: boolean;
  className?: string;
  /** Render as link wrapper content only (no extra wrapper semantics) */
  as?: 'span' | 'div';
}

const sizeClasses: Record<WordmarkSize, { root: string; cyber: string; hex: string; serial: string }> = {
  sm: {
    root: 'gap-0',
    cyber: 'text-sm tracking-[0.12em]',
    hex: 'text-sm',
    serial: 'text-[10px]',
  },
  md: {
    root: 'gap-0.5',
    cyber: 'text-lg tracking-[0.14em]',
    hex: 'text-lg',
    serial: 'text-[11px]',
  },
  lg: {
    root: 'gap-1',
    cyber: 'text-2xl sm:text-3xl tracking-[0.14em]',
    hex: 'text-2xl sm:text-3xl',
    serial: 'text-xs',
  },
  hero: {
    root: 'gap-2',
    cyber: 'text-[clamp(2.25rem,7vw,4.5rem)] tracking-[0.12em] sm:tracking-[0.14em]',
    hex: 'text-[clamp(2.25rem,7vw,4.5rem)]',
    serial: 'text-sm sm:text-base',
  },
};

export function CyberHexWord({
  size = 'md',
  showSerial = size !== 'sm',
  className,
  as: Tag = 'span',
}: CyberHexWordProps) {
  const s = sizeClasses[size];

  return (
    <Tag
      className={cn(
        'wordmark-v4 relative inline-flex items-baseline font-[family-name:var(--font-wordmark)] select-none',
        s.root,
        className,
      )}
      aria-label={`CyberHex ${V4_RELEASE.version} release ${V4_RELEASE.serial}`}
    >
      {showSerial && (
        <span
          className={cn(
            'wordmark-v4-serial absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 -rotate-90',
            'font-mono font-semibold uppercase tabular-nums text-neutral-600',
            s.serial,
          )}
          aria-hidden
        >
          {V4_RELEASE.serial}
        </span>
      )}

      <span className={cn('wordmark-v4-cyber font-extrabold uppercase text-white', s.cyber)}>
        Cyber
      </span>
      <span className={cn('wordmark-v4-hex relative font-extrabold text-[var(--v4-signal-cyan)]', s.hex)}>
        Hex
        <span
          className="absolute -bottom-0.5 left-0 right-0 h-[2px] rounded-full wordmark-v4-underline opacity-80"
          aria-hidden
        />
      </span>
    </Tag>
  );
}
