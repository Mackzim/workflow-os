import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { isSyncConfigured } from '@/lib/sync/supabaseClient';
import { startSync, stopSync } from '@/lib/sync/syncEngine';
import { startCalendarSync, stopCalendarSync } from '@/lib/sync/calendarSync';
import { BrandMark } from '@/components/layout/Brand';
import { LoginScreen } from './LoginScreen';

/**
 * Gates the app behind auth WHEN sync is configured.
 * - No Supabase env  -> render app directly (local-only mode, unchanged).
 * - Sync configured  -> loading splash, then login screen or the app.
 * Also starts/stops the sync engine in step with the session.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const userId = useAuthStore((s) => s.user?.id);

  useEffect(() => {
    useAuthStore.getState().init();
  }, []);

  useEffect(() => {
    if (!isSyncConfigured) return;
    if (status === 'signedIn' && userId) {
      startSync(userId);
      startCalendarSync(userId);
    } else if (status === 'signedOut') {
      stopSync();
      stopCalendarSync();
    }
  }, [status, userId]);

  if (!isSyncConfigured) return <>{children}</>;
  if (status === 'loading') return <Splash />;
  if (status === 'signedOut') return <LoginScreen />;
  return <>{children}</>;
}

function Splash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-pulse-ring rounded-2xl">
          <BrandMark size={44} />
        </div>
        <p className="text-[12px] text-content-faint">Lade …</p>
      </div>
    </div>
  );
}
