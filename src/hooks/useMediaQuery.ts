import { useEffect, useState } from 'react';

/** Subscribe to a CSS media query. SSR-safe-ish (defaults to false). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/** Tailwind `lg` breakpoint (1024px). */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}
