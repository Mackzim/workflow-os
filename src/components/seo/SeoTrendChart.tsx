import { useId } from 'react';
import type { SeoMetric, SeoSeriesPoint } from '@/lib/seo/seoTypes';

export interface SeoTrendChartProps {
  series: SeoSeriesPoint[];
  metric: SeoMetric;
  /** Optional previous-period overlay (dashed). */
  prevSeries?: SeoSeriesPoint[];
  className?: string;
}

/** Dependency-free responsive area/line chart. Stretches to its container width. */
export function SeoTrendChart({ series, metric, prevSeries, className }: SeoTrendChartProps) {
  const gradId = useId();
  const cur = series.map((p) => p[metric]);
  const prev = prevSeries?.map((p) => p[metric]) ?? [];
  const n = cur.length;
  if (n < 2) return null;

  const all = [...cur, ...prev];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const span = max - min || 1;
  const W = 100;
  const H = 40;
  const pad = 3;

  const path = (vals: number[]) => {
    const m = vals.length;
    if (m < 2) return '';
    const x = (i: number) => (i / (m - 1)) * W;
    const y = (v: number) => H - pad - ((v - min) / span) * (H - pad * 2);
    return vals.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(2)},${y(v).toFixed(2)}`).join(' ');
  };

  const line = path(cur);
  const area = `${line} L${W},${H} L0,${H} Z`;
  const prevLine = prev.length >= 2 ? path(prev) : '';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className={className} role="img" aria-label={`Verlauf ${metric}`}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.26" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {prevLine && (
        <path
          d={prevLine}
          fill="none"
          stroke="var(--color-text-faint)"
          strokeWidth={1.2}
          strokeDasharray="2 2"
          vectorEffect="non-scaling-stroke"
        />
      )}
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
