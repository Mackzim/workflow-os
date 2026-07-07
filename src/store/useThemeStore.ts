/**
 * Theme State (persisted)
 * -----------------------
 * Dark is the product's native look; light is a full alternate token set.
 * The chosen theme is applied to <html data-theme> — CSS variables in
 * globals.css do the rest. index.html applies the saved value pre-paint to
 * avoid a flash, this store keeps it in sync at runtime.
 *
 * Persist name is 'theme' → real localStorage key `wos:theme` (the storage
 * adapter adds the `wos:` prefix). index.html reads that exact key.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage/storage';

export type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const BG: Record<Theme, string> = {
  dark: '#0a0b0e',
  light: '#eef1f7',
};

/** Reflect the theme onto <html> + the mobile browser chrome color. */
export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.backgroundColor = BG[theme];
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', BG[theme]);
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      toggleTheme: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),
    }),
    {
      name: 'theme',
      version: 1,
      storage: createJSONStorage(() => zustandStorage),
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme);
      },
    },
  ),
);
