import { cloneElement, useEffect } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useTaskStore } from '@/store/useTaskStore';
import { useCalendarStore } from '@/store/useCalendarStore';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileDrawer } from './MobileDrawer';

/**
 * Root layout: fixed sidebar (desktop) / drawer (mobile), sticky top bar, and
 * an animated outlet for route transitions. AppShell itself stays mounted so
 * the sidebar doesn't re-animate on navigation.
 */
export function AppShell() {
  const outlet = useOutlet();
  const location = useLocation();
  const ensureSeeded = useTaskStore((s) => s.ensureSeeded);
  const ensureEventsSeeded = useCalendarStore((s) => s.ensureSeeded);

  // Seed onboarding content once, after the persisted stores have rehydrated.
  useEffect(() => {
    ensureSeeded();
    ensureEventsSeeded();
  }, [ensureSeeded, ensureEventsSeeded]);

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-content">
      <Sidebar />
      <MobileDrawer />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait" initial={false}>
            {outlet ? cloneElement(outlet, { key: location.pathname }) : null}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
