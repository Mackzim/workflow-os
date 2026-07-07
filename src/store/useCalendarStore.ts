/**
 * Calendar State (persisted)
 * --------------------------
 * Authoritative store for native calendar events. Mirrors the task store so a
 * Supabase sync engine can be attached later exactly the same way (write-through
 * `_sync` seam + `applyRemote*`). Local-first today; the cloud is source of
 * truth once sync is configured (so we never seed over synced data).
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CalendarEvent, EventDraft, EventPatch } from '@/lib/calendar/calendarTypes';
import { applyEventPatch, createEvent } from '@/lib/calendar/calendarUtils';
import { zustandStorage } from '@/lib/storage/storage';
import { STORAGE_PREFIX } from '@/config/app';
import { SAMPLE_EVENT_DRAFTS } from '@/lib/calendar/sampleEvents';
import { isSyncConfigured } from '@/lib/sync/supabaseClient';

/** Write-through hooks installed by a future sync engine. */
export interface CalendarSyncHandler {
  onCreate: (event: CalendarEvent) => void;
  onUpdate: (event: CalendarEvent) => void;
  onDelete: (id: string) => void;
}

interface CalendarState {
  events: CalendarEvent[];
  seeded: boolean;
  /** User preference: also show completed task deadlines on the calendar. */
  showDoneTasks: boolean;
  _sync: CalendarSyncHandler | null;

  setShowDoneTasks: (value: boolean) => void;
  addEvent: (draft: EventDraft) => CalendarEvent;
  updateEvent: (id: string, patch: EventPatch) => CalendarEvent | undefined;
  deleteEvent: (id: string) => boolean;

  replaceAll: (events: CalendarEvent[]) => void;
  clearAll: () => void;
  ensureSeeded: () => void;

  // Sync integration (do NOT trigger write-through)
  setSyncHandler: (handler: CalendarSyncHandler | null) => void;
  hydrate: (events: CalendarEvent[]) => void;
  applyRemoteUpsert: (event: CalendarEvent) => void;
  applyRemoteDelete: (id: string) => void;

  getEvents: () => CalendarEvent[];
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      events: [],
      seeded: false,
      showDoneTasks: false,
      _sync: null,

      setShowDoneTasks: (value) => set({ showDoneTasks: value }),

      addEvent: (draft) => {
        const event = createEvent(draft);
        set((s) => ({ events: [...s.events, event] }));
        get()._sync?.onCreate(event);
        return event;
      },

      updateEvent: (id, patch) => {
        let updated: CalendarEvent | undefined;
        set((s) => ({
          events: s.events.map((e) => {
            if (e.id !== id) return e;
            updated = applyEventPatch(e, patch);
            return updated;
          }),
        }));
        if (updated) get()._sync?.onUpdate(updated);
        return updated;
      },

      deleteEvent: (id) => {
        const exists = get().events.some((e) => e.id === id);
        if (exists) {
          set((s) => ({ events: s.events.filter((e) => e.id !== id) }));
          get()._sync?.onDelete(id);
        }
        return exists;
      },

      replaceAll: (events) => set({ events }),
      clearAll: () => set({ events: [] }),

      ensureSeeded: () => {
        if (isSyncConfigured) return; // cloud is source of truth
        const { seeded, events } = get();
        if (seeded || events.length > 0) {
          if (!seeded) set({ seeded: true });
          return;
        }
        set({ events: SAMPLE_EVENT_DRAFTS.map((d) => createEvent(d)), seeded: true });
      },

      setSyncHandler: (handler) => set({ _sync: handler }),
      hydrate: (events) => set({ events }),
      applyRemoteUpsert: (event) =>
        set((s) => {
          const idx = s.events.findIndex((e) => e.id === event.id);
          if (idx === -1) return { events: [...s.events, event] };
          const next = [...s.events];
          next[idx] = event;
          return { events: next };
        }),
      applyRemoteDelete: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),

      getEvents: () => get().events,
    }),
    {
      name: `${STORAGE_PREFIX}.calendar`,
      version: 1,
      storage: createJSONStorage(() => zustandStorage),
      partialize: (s) => ({ events: s.events, seeded: s.seeded, showDoneTasks: s.showDoneTasks }),
    },
  ),
);
