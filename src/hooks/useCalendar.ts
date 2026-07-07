/**
 * Primary calendar hook – composes the calendar store (native events) with the
 * task store (derived deadlines) so the UI works against one merged surface.
 */

import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useCalendarStore } from '@/store/useCalendarStore';
import { useTaskStore } from '@/store/useTaskStore';
import { collectDayItems, collectUpcoming } from '@/lib/calendar/calendarUtils';
import type { CalendarItem } from '@/lib/calendar/calendarTypes';

export function useCalendar() {
  const events = useCalendarStore((s) => s.events);
  const tasks = useTaskStore((s) => s.tasks);
  const showDoneTasks = useCalendarStore((s) => s.showDoneTasks);

  const actions = useCalendarStore(
    useShallow((s) => ({
      addEvent: s.addEvent,
      updateEvent: s.updateEvent,
      deleteEvent: s.deleteEvent,
      setShowDoneTasks: s.setShowDoneTasks,
    })),
  );

  const itemsForDay = useCallback(
    (day: Date): CalendarItem[] => collectDayItems(events, tasks, day, showDoneTasks),
    [events, tasks, showDoneTasks],
  );

  const upcoming = useCallback(
    (from: Date, limit?: number): CalendarItem[] => collectUpcoming(events, tasks, from, limit),
    [events, tasks],
  );

  return { events, tasks, showDoneTasks, itemsForDay, upcoming, ...actions };
}
