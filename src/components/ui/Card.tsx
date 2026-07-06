import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  interactive?: boolean;
  children: ReactNode;
}

export function Card({ elevated, interactive, className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border shadow-card edge-light',
        elevated ? 'bg-surface-elevated' : 'bg-surface',
        interactive && 'transition-colors duration-200 hover:border-border-strong hover:bg-surface-hover',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center justify-between gap-3 px-5 pt-4 pb-3', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-sm font-semibold tracking-tight text-content', className)} {...rest}>
      {children}
    </h3>
  );
}

export function CardBody({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-5 pb-5', className)} {...rest}>
      {children}
    </div>
  );
}
