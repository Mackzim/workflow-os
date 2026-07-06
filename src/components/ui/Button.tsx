import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'subtle' | 'danger';
type Size = 'sm' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  block?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-strong shadow-[0_6px_20px_-8px_rgba(76,141,255,0.7)] border border-primary/40',
  secondary:
    'bg-surface-elevated text-content hover:bg-surface-hover border border-border-strong',
  ghost: 'bg-transparent text-content-muted hover:text-content hover:bg-surface-hover',
  subtle: 'bg-primary-soft text-primary hover:bg-primary/20 border border-primary/20',
  danger: 'bg-transparent text-critical hover:bg-critical/10 border border-critical/25',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', leftIcon, rightIcon, block, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center font-medium select-none',
        'transition-colors duration-150 ease-smooth',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
        'disabled:opacity-45 disabled:pointer-events-none active:scale-[0.98]',
        SIZES[size],
        VARIANTS[variant],
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
});
