import { Link } from 'react-router-dom';
import { APP } from '@/config/app';
import { cn } from '@/lib/utils/cn';

export function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="var(--color-surface-elevated)" />
      <rect x="0.5" y="0.5" width="63" height="63" rx="15.5" stroke="var(--color-border-strong)" />
      <path
        d="M32 16 L32 32 L43 37"
        stroke="var(--color-primary)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="32" r="4.5" fill="var(--color-primary)" />
      <circle cx="43" cy="37" r="3" fill="var(--color-secondary)" />
    </svg>
  );
}

export function Brand({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Link to="/" onClick={onClick} className={cn('flex items-center gap-2.5', className)}>
      <BrandMark />
      <div className="leading-tight">
        <p className="text-[15px] font-semibold tracking-tight text-content">{APP.name}</p>
        <p className="text-[10px] uppercase tracking-wider text-content-faint">{APP.tagline}</p>
      </div>
    </Link>
  );
}
