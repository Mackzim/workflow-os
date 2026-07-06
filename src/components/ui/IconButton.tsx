import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
import { Icon, type IconName } from './Icon';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  label: string;
  size?: number;
  tone?: 'default' | 'danger' | 'primary';
}

const TONES = {
  default: 'text-content-muted hover:text-content hover:bg-surface-hover',
  danger: 'text-content-faint hover:text-critical hover:bg-critical/10',
  primary: 'text-content-muted hover:text-primary hover:bg-primary-soft',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, size = 18, tone = 'default', className, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex items-center justify-center rounded-lg p-1.5 transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
        'disabled:opacity-40 disabled:pointer-events-none',
        TONES[tone],
        className,
      )}
      {...rest}
    >
      <Icon name={icon} size={size} />
    </button>
  );
});
