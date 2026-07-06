/**
 * UI / Navigation + Command state (ephemeral, not persisted).
 * Mobile drawer visibility and the shared Command Center outcome history.
 */

import { create } from 'zustand';
import type { CommandOutcome } from '@/lib/command/commandTypes';

const MAX_OUTCOMES = 30;

interface UIState {
  mobileDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;

  /** Shared so the Command widget and the Command page show one history. */
  commandOutcomes: CommandOutcome[];
  pushOutcome: (outcome: CommandOutcome) => void;
  clearOutcomes: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  mobileDrawerOpen: false,
  openDrawer: () => set({ mobileDrawerOpen: true }),
  closeDrawer: () => set({ mobileDrawerOpen: false }),
  toggleDrawer: () => set((s) => ({ mobileDrawerOpen: !s.mobileDrawerOpen })),

  commandOutcomes: [],
  pushOutcome: (outcome) =>
    set((s) => ({ commandOutcomes: [outcome, ...s.commandOutcomes].slice(0, MAX_OUTCOMES) })),
  clearOutcomes: () => set({ commandOutcomes: [] }),
}));
