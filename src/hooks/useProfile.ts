/**
 * Resolves the user's display name for the greeting + profile menu, and lets
 * them set a nickname. Priority: account nickname (Supabase user_metadata) →
 * local nickname → name derived from the login email → none.
 */

import { useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useProfileStore } from '@/store/useProfileStore';
import { supabase } from '@/lib/sync/supabaseClient';

export function nameFromEmail(email?: string | null): string | null {
  if (!email) return null;
  const local = email.split('@')[0]?.split(/[._+\-]/)[0];
  if (!local) return null;
  return local.charAt(0).toUpperCase() + local.slice(1).toLowerCase();
}

export function useProfile() {
  const user = useAuthStore((s) => s.user);
  const localNickname = useProfileStore((s) => s.nickname);
  const setLocalNickname = useProfileStore((s) => s.setNickname);

  const metaNickname = (user?.user_metadata?.nickname as string | undefined)?.trim() || null;
  const nickname = metaNickname || localNickname || '';
  const displayName = nickname || nameFromEmail(user?.email) || '';

  const setNickname = useCallback(
    async (value: string) => {
      const v = value.trim();
      setLocalNickname(v || null);
      if (supabase && user) {
        try {
          await supabase.auth.updateUser({ data: { nickname: v || null } });
        } catch {
          /* metadata write is best-effort; local value still applies */
        }
      }
    },
    [setLocalNickname, user],
  );

  return { displayName, nickname, email: user?.email ?? null, setNickname };
}
