/**
 * Supabase client – the sync backend behind the storage layer.
 *
 * If the env vars are absent (e.g. the current Netlify deploy before secrets
 * are added), `supabase` is null and the app runs in LOCAL-ONLY mode exactly
 * as before – no login, localStorage only. Sync is purely additive.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSyncConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSyncConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // Implicit flow keeps magic links working even when opened on a
        // different device than the one that requested them.
        flowType: 'implicit',
      },
    })
  : null;
