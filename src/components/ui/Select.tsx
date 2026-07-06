import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
import { Icon } from './Icon';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  sizing?: 'sm' | 'md';
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { options, sizing = 'md', className, ...rest },
  ref,
) {
  const h = sizing === 'sm' ? 'h-9 text-[13px]' : 'h-11 text-sm';
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          'w-full appearance-none bg-surface border border-border rounded-xl pl-3.5 pr-9 text-content',
          'transition-colors duration-150 focus:outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/20',
          'cursor-pointer',
          h,
          className,
        )}
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-surface-elevated text-content">
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-content-faint">
        <Icon name="chevronDown" size={16} />
      </span>
    </div>
  );
});
