import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Minimal .env loader (dev convenience). When launched by an MCP client
 * (Claude Desktop / Claude Code), env vars are passed directly via the client
 * config, so this is a no-op in that case.
 */
function loadDotEnv(): void {
  try {
    const here = dirname(fileURLToPath(import.meta.url)); // dist/
    const candidates = [join(here, '..', '.env'), join(process.cwd(), '.env')];
    for (const path of candidates) {
      if (!existsSync(path)) continue;
      for (const line of readFileSync(path, 'utf8').split('\n')) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
        if (m && !(m[1] in process.env)) {
          process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
        }
      }
      break;
    }
  } catch {
    /* ignore – env may be provided directly */
  }
}
loadDotEnv();

export interface Config {
  supabaseUrl: string;
  serviceRoleKey: string;
  userEmail?: string;
  userId?: string;
}

export function loadConfig(): Config {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const userEmail = process.env.WORKFLOW_USER_EMAIL?.trim();
  const userId = process.env.WORKFLOW_USER_ID?.trim();

  const missing: string[] = [];
  if (!supabaseUrl) missing.push('SUPABASE_URL');
  if (!serviceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (!userEmail && !userId) missing.push('WORKFLOW_USER_EMAIL (or WORKFLOW_USER_ID)');

  if (missing.length) {
    throw new Error(`Missing required env: ${missing.join(', ')}. See mcp-server/.env.example.`);
  }

  return { supabaseUrl: supabaseUrl!, serviceRoleKey: serviceRoleKey!, userEmail, userId };
}
