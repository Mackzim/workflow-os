import { Link } from 'react-router-dom';
import { APP } from '@/config/app';
import { cn } from '@/lib/utils/cn';

export function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <img
      src="/logo.png"
      width={size}
      height={size}
      alt={`${APP.name} Logo`}
      className="rounded-xl object-cover ring-1 ring-border-strong"
      style={{ width: size, height: size }}
      draggable={false}
    />
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
