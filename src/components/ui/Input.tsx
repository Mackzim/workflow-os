import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode;
  sizing?: 'sm' | 'md';
}

const baseField =
  'w-full bg-surface border border-border rounded-xl text-content placeholder:text-content-faint ' +
  'transition-colors duration-150 focus:outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/20';

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { leftIcon, sizing = 'md', className, ...rest },
  ref,
) {
  const pad = sizing === 'sm' ? 'h-9 text-[13px]' : 'h-11 text-sm';
  if (leftIcon) {
    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-content-faint">
          {leftIcon}
        </span>
        <input
          ref={ref}
          className={cn(baseField, pad, 'pl-10 pr-3', className)}
          {...rest}
        />
      </div>
    );
  }
  return <input ref={ref} className={cn(baseField, pad, 'px-3.5', className)} {...rest} />;
});
