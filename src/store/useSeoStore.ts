/**
 * SEO State — fetches the real Search Console report from the Netlify function
 * and caches it. No demo data; when nothing is connected the report carries a
 * `connected: false` + reason that the UI turns into a setup hint.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { SeoReport } from '@/lib/seo/seoTypes';
import { zustandStorage } from '@/lib/storage/storage';
import { STORAGE_PREFIX } from '@/config/app';

interface SeoState {
  report: SeoReport | null;
  loading: boolean;
  fetchedAt: number | null;
  days: number;
  fetchReport: (days?: number, force?: boolean) => Promise<void>;
}

const FRESH_MS = 5 * 60 * 1000;

export const useSeoStore = create<SeoState>()(
  persist(
    (set, get) => ({
      report: null,
      loading: false,
      fetchedAt: null,
      days: 28,

      fetchReport: async (days, force = false) => {
        const d = days ?? get().days;
        const s = get();
        if (s.loading) return;
        if (!force && s.report && s.fetchedAt && d === s.days && Date.now() - s.fetchedAt < FRESH_MS) return;

        set({ loading: true, days: d });
        try {
          const res = await fetch(`/api/seo?days=${d}`, { headers: { accept: 'application/json' } });
          const report = (await res.json()) as SeoReport;
          set({ report, fetchedAt: Date.now(), loading: false });
        } catch (e) {
          set({
            report: { connected: false, reason: 'unreachable', error: String((e as Error)?.message ?? e) },
            fetchedAt: Date.now(),
            loading: false,
          });
        }
      },
    }),
    {
      name: `${STORAGE_PREFIX}.seo`,
      version: 2,
      storage: createJSONStorage(() => zustandStorage),
      partialize: (s) => ({ report: s.report, fetchedAt: s.fetchedAt, days: s.days }),
    },
  ),
);
