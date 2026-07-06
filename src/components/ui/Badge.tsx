import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Inline CSS color (used for the dot + tint). Falls back to muted. */
  color?: string;
  dot?: boolean;
  children: ReactNode;
}

export function Badge({ color, dot = true, className, children, style, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium',
        'border border-border bg-surface-elevated/60 text-content-muted',
        className,
      )}
      style={{ ...style, ...(color ? { color, borderColor: `${color}33` } : {}) }}
      {...rest}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color ?? 'currentColor' }}
        />
      )}
      {children}
    </span>
  );
}
