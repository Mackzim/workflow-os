#!/usr/bin/env node
/**
 * Workflow OS MCP server.
 *
 * Exposes the user's Workflow OS tasks as MCP tools. Writes go to Supabase and
 * therefore sync live to the web/desktop dashboard via its realtime subscription.
 * Runs locally over stdio – driven by Claude Desktop or Claude Code (your
 * existing subscription, no API costs).
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { loadConfig } from './config.js';
import { createSupabase, resolveUserId } from './supabase.js';
import * as T from './tasks.js';

const statusEnum = z.enum(['open', 'in_progress', 'paused', 'done']);
const priority = z.number().int().min(1).max(5);

/** Resolve relative date keywords to YYYY-MM-DD; pass through explicit dates. */
function resolveDue(v?: string): string | undefined {
  if (!v) return undefined;
  const map: Record<string, number> = { today: 0, heute: 0, tomorrow: 1, morgen: 1 };
  const key = v.trim().toLowerCase();
  if (key in map) {
    const d = new Date();
    d.setDate(d.getDate() + map[key]);
    return d.toISOString().slice(0, 10);
  }
  return v;
}

type ToolResult = {
  content: { type: 'text'; text: string }[];
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
};

function ok(message: string, data?: Record<string, unknown>): ToolResult {
  const text = data ? `${message}\n\n${JSON.stringify(data, null, 2)}` : message;
  return { content: [{ type: 'text', text }], ...(data ? { structuredContent: data } : {}) };
}
function fail(e: unknown): ToolResult {
  return {
    content: [{ type: 'text', text: `Error: ${e instanceof Error ? e.message : String(e)}` }],
    isError: true,
  };
}

function registerTools(server: McpServer, sb: SupabaseClient, userId: string): void {
  server.registerTool(
    'workflow_create_task',
    {
      title: 'Create task',
      description: `Create a new task in Workflow OS. It syncs to the dashboard (web + phone) immediately.

Args:
  - title (string, required)
  - priority (1-5): 1=low … 5=critical (default 3)
  - status ('open'|'in_progress'|'paused'|'done'): default 'open'
  - due_date (string): 'YYYY-MM-DD', or the keywords 'today'/'tomorrow'
  - category (string), description (string)

Example: "Call Jochen tomorrow, priority 4" -> { title:"Call Jochen", priority:4, due_date:"tomorrow" }`,
      inputSchema: {
        title: z.string().min(1).describe('Task title'),
        priority: priority.optional().describe('1=low … 5=critical (default 3)'),
        status: statusEnum.optional(),
        due_date: z.string().optional().describe("'YYYY-MM-DD' or 'today'/'tomorrow'"),
        category: z.string().optional(),
        description: z.string().optional(),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
    async (args) => {
      try {
        const task = await T.createTask(sb, userId, { ...args, due_date: resolveDue(args.due_date) });
        return ok(
          `✓ Task "${task.title}" erstellt (${T.PRIORITY_LABEL[task.priority]}, ${T.STATUS_LABEL[task.status]}).`,
          { task: task as unknown as Record<string, unknown> },
        );
      } catch (e) {
        return fail(e);
      }
    },
  );

  server.registerTool(
    'workflow_list_tasks',
    {
      title: 'List / search tasks',
      description: `List the user's tasks, optionally filtered. Read-only.

Args (all optional):
  - status ('open'|'in_progress'|'paused'|'done')
  - priority (1-5)
  - search (string): matches title/description/category
  - limit (1-500, default 100)

Returns: { count, tasks: [{ id, title, priority, status, dueDate, category, ... }] }`,
      inputSchema: {
        status: statusEnum.optional(),
        priority: priority.optional(),
        search: z.string().optional(),
        limit: z.number().int().min(1).max(500).optional(),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const tasks = await T.listTasks(sb, userId, args);
        return ok(`${tasks.length} Aufgabe(n) gefunden.`, { count: tasks.length, tasks: tasks as unknown as Record<string, unknown>[] });
      } catch (e) {
        return fail(e);
      }
    },
  );

  server.registerTool(
    'workflow_update_task',
    {
      title: 'Update task',
      description: `Update fields of an existing task by id (get the id from workflow_list_tasks). Syncs to the dashboard.

Args:
  - id (string, required)
  - any of: title, description, priority (1-5), status, due_date ('YYYY-MM-DD'/'today'/'tomorrow'), category`,
      inputSchema: {
        id: z.string().min(1).describe('Task id'),
        title: z.string().optional(),
        description: z.string().optional(),
        priority: priority.optional(),
        status: statusEnum.optional(),
        due_date: z.string().optional(),
        category: z.string().optional(),
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const { id, ...patch } = args;
        const task = await T.updateTask(sb, userId, id, {
          ...patch,
          due_date: patch.due_date !== undefined ? resolveDue(patch.due_date) : undefined,
        });
        if (!task) return ok(`Task ${id} nicht gefunden.`);
        return ok(`✓ Task "${task.title}" aktualisiert.`, { task: task as unknown as Record<string, unknown> });
      } catch (e) {
        return fail(e);
      }
    },
  );

  server.registerTool(
    'workflow_complete_task',
    {
      title: 'Complete task',
      description: 'Mark a task as done by id. Shortcut for setting status="done". Syncs to the dashboard.',
      inputSchema: { id: z.string().min(1).describe('Task id') },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const task = await T.updateTask(sb, userId, args.id, { status: 'done' });
        if (!task) return ok(`Task ${args.id} nicht gefunden.`);
        return ok(`✓ "${task.title}" als erledigt markiert.`, { task: task as unknown as Record<string, unknown> });
      } catch (e) {
        return fail(e);
      }
    },
  );

  server.registerTool(
    'workflow_delete_task',
    {
      title: 'Delete task',
      description: 'Permanently delete a task by id. This cannot be undone.',
      inputSchema: { id: z.string().min(1).describe('Task id') },
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    },
    async (args) => {
      try {
        const removed = await T.deleteTask(sb, userId, args.id);
        return ok(removed ? `✓ Task ${args.id} gelöscht.` : `Task ${args.id} nicht gefunden.`);
      } catch (e) {
        return fail(e);
      }
    },
  );

  server.registerTool(
    'workflow_summary',
    {
      title: "Today's summary",
      description: `A quick status overview: counts by status, high-priority/overdue counts, and today's focus list (due today or overdue, not done). Read-only.`,
      inputSchema: {},
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    async () => {
      try {
        const { summary, today } = await T.summarize(sb, userId);
        return ok('Tages-Zusammenfassung:', {
          summary: summary as unknown as Record<string, unknown>,
          today: today as unknown as Record<string, unknown>[],
        });
      } catch (e) {
        return fail(e);
      }
    },
  );
}

async function main(): Promise<void> {
  const cfg = loadConfig();
  const sb = createSupabase(cfg);
  const userId = await resolveUserId(sb, cfg);

  // Self-test mode: verify connection + auth, print status, exit.
  if (process.argv.includes('--check')) {
    const { summary } = await T.summarize(sb, userId);
    // stdout is fine here (not running the stdio protocol)
    console.log(`OK – connected to Supabase. User: ${userId}`);
    console.log(`Tasks: ${summary.total} total, ${summary.active} active, ${summary.overdue} overdue.`);
    process.exit(0);
  }

  const server = new McpServer({ name: 'workflow-os-mcp-server', version: '0.1.0' });
  registerTools(server, sb, userId);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Logs MUST go to stderr – stdout is the MCP protocol channel.
  console.error('workflow-os-mcp-server running (stdio)');
}

main().catch((e) => {
  console.error('Fatal:', e instanceof Error ? e.message : String(e));
  process.exit(1);
});
