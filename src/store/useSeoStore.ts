/**
 * SEO State (persisted)
 * ---------------------
 * Holds the currently displayed SEO dataset + its source. v1 defaults to the
 * clearly-labelled DEMO dataset; a manual JSON import can replace it. A future
 * Google Search Console / MCP connector will set source to 'gsc' the same way.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { SeoDataset, SeoSource } from '@/lib/seo/seoTypes';
import { DEMO_SEO, parseSeoJson } from '@/lib/seo/seoData';
import { zustandStorage } from '@/lib/storage/storage';
import { STORAGE_PREFIX } from '@/config/app';

interface SeoState {
  source: SeoSource;
  dataset: SeoDataset;
  /** Try to load a manual JSON export. Returns true on success. */
  importJson: (text: string) => boolean;
  /** Back to the demo state. */
  resetToDemo: () => void;
}

export const useSeoStore = create<SeoState>()(
  persist(
    (set) => ({
      source: 'demo',
      dataset: DEMO_SEO,
      importJson: (text) => {
        const parsed = parseSeoJson(text);
        if (!parsed) return false;
        set({ dataset: parsed, source: 'import' });
        return true;
      },
      resetToDemo: () => set({ source: 'demo', dataset: DEMO_SEO }),
    }),
    {
      name: `${STORAGE_PREFIX}.seo`,
      version: 1,
      storage: createJSONStorage(() => zustandStorage),
      // Only persist a real import; demo always comes from code.
      partialize: (s) => (s.source === 'demo' ? { source: 'demo' } : { source: s.source, dataset: s.dataset }),
    },
  ),
);
