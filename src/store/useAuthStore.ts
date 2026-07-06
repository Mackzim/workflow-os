/**
 * Auth state (Supabase). Only meaningful when sync is configured.
 * Magic-link (passwordless) login – no passwords to manage.
 */

import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSyncConfigured } from '@/lib/sync/supabaseClient';

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

interface AuthState {
  session: Session | null;
  user: User | null;
  status: AuthStatus;
  initialized: boolean;
  init: () => void;
  signInWithEmail: (email: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  status: isSyncConfigured ? 'loading' : 'signedOut',
  initialized: false,

  init: () => {
    if (get().initialized) return;
    set({ initialized: true });
    if (!supabase) {
      set({ status: 'signedOut' });
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      set({
        session: data.session,
        user: data.session?.user ?? null,
        status: data.session ? 'signedIn' : 'signedOut',
      });
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        user: session?.user ?? null,
        status: session ? 'signedIn' : 'signedOut',
      });
    });
  },

  signInWithEmail: async (email) => {
    if (!supabase) return { ok: false, error: 'Sync ist nicht konfiguriert.' };
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    return error ? { ok: false, error: error.message } : { ok: true };
  },

  signOut: async () => {
    if (supabase) await supabase.auth.signOut();
    set({ session: null, user: null, status: 'signedOut' });
  },
}));
