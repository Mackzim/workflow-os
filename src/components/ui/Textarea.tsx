import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, rows = 3, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        'w-full resize-none bg-surface border border-border rounded-xl px-3.5 py-2.5 text-sm text-content',
        'placeholder:text-content-faint transition-colors duration-150',
        'focus:outline-none focus:border-primary/70 focus:ring-2 focus:ring-primary/20',
        className,
      )}
      {...rest}
    />
  );
});
