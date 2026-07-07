import { useId } from 'react';
import type { SeoSeriesPoint } from '@/lib/seo/seoTypes';

export interface SeoTrendChartProps {
  series: SeoSeriesPoint[];
  metric?: 'clicks' | 'impressions';
  className?: string;
}

/** Dependency-free responsive area chart. Stretches to its container width. */
export function SeoTrendChart({ series, metric = 'clicks', className }: SeoTrendChartProps) {
  const gradId = useId();
  const values = series.map((p) => p[metric]);
  const n = values.length;

  if (n < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const W = 100;
  const H = 40;
  const pad = 3;

  const x = (i: number) => (i / (n - 1)) * W;
  const y = (v: number) => H - pad - ((v - min) / span) * (H - pad * 2);

  const line = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(2)},${y(v).toFixed(2)}`).join(' ');
  const area = `${line} L${W},${H} L0,${H} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className={className}
      role="img"
      aria-label={`Verlauf ${metric} (Demo)`}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path
        d={line}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth={1.6}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
