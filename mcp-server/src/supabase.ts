import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Config } from './config.js';

/** Service-role client (local only). Bypasses RLS – we scope by user_id ourselves. */
export function createSupabase(cfg: Config): SupabaseClient {
  return createClient(cfg.supabaseUrl, cfg.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Resolve the user id from the configured email (or use the explicit id). */
export async function resolveUserId(sb: SupabaseClient, cfg: Config): Promise<string> {
  if (cfg.userId) return cfg.userId;
  const email = cfg.userEmail!.toLowerCase();
  const perPage = 200;
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw new Error(
        `Could not list users (admin API): ${error.message}. ` +
          `Make sure SUPABASE_SERVICE_ROLE_KEY is the service_role key (not the anon key).`,
      );
    }
    const user = data.users.find((u) => u.email?.toLowerCase() === email);
    if (user) return user.id;
    if (data.users.length < perPage) break;
  }
  throw new Error(
    `No Supabase user found with email "${cfg.userEmail}". Log in to the app at least once first.`,
  );
}
