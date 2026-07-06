/**
 * Command Parser
 * --------------
 * Turns a raw command string into a typed `ParseResult`.
 *
 * This is a deliberately small, deterministic rule parser for the MVP – NOT a
 * fake AI. It handles a handful of natural-ish commands so the Command Center
 * is genuinely useful today. Later, Claude replaces (or augments) this step:
 * it will emit `ActionInvocation`s directly, reusing the same registry.
 */

import type { Priority } from '@/lib/tasks/taskTypes';
import { PRIORITIES } from '@/lib/tasks/taskTypes';
import { resolveModule } from '@/lib/navigation/navigation';
import type { ParseResult } from './commandTypes';

/** Extract a priority token like "p4", "prio 4", "priority 4", "!4" and strip it. */
function extractPriority(text: string): { text: string; priority?: Priority } {
  const patterns = [
    /\b(?:priorit(?:y|ät)|prio|p)\s*[:=]?\s*([1-5])\b/i,
    /!\s*([1-5])\b/,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m) {
      const p = Number(m[1]) as Priority;
      if (PRIORITIES.includes(p)) {
        return { text: text.replace(m[0], '').replace(/\s{2,}/g, ' ').trim(), priority: p };
      }
    }
  }
  return { text };
}

/** Extract simple relative dates (today/tomorrow, de/en) into an ISO date. */
function extractDueDate(text: string): { text: string; dueDate?: string } {
  const map: Record<string, number> = {
    today: 0,
    heute: 0,
    tomorrow: 1,
    morgen: 1,
  };
  const m = text.match(/\b(today|heute|tomorrow|morgen)\b/i);
  if (!m) return { text };
  const offset = map[m[1].toLowerCase()];
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { text: text.replace(m[0], '').replace(/\s{2,}/g, ' ').trim(), dueDate: iso };
}

export function parseCommand(raw: string): ParseResult {
  const input = raw.trim();
  if (!input) return { kind: 'empty' };

  const lower = input.toLowerCase();

  // help
  if (lower === 'help' || lower === '?' || lower === 'hilfe' || lower === 'commands') {
    return { kind: 'help', raw: input };
  }

  // create task: "create task: X" | "add task X" | "neue aufgabe: X" | "task: X"
  const createMatch = input.match(
    /^(?:create\s+task|add\s+task|new\s+task|neue?\s+aufgabe|aufgabe|task|todo)\s*[:\-]?\s*(.+)$/i,
  );
  if (createMatch) {
    let title = createMatch[1].trim();
    const prio = extractPriority(title);
    title = prio.text;
    const due = extractDueDate(title);
    title = due.text;
    if (!title) return { kind: 'unknown', raw: input };
    return {
      kind: 'action',
      actionId: 'createTask',
      input: { title, priority: prio.priority, dueDate: due.dueDate },
      raw: input,
    };
  }

  // priority query: "show priority 5" | "priority 5" | "p5" | "prio 3"
  const prioQuery = lower.match(/^(?:show\s+)?(?:priorit(?:y|ät)|prio|p)\s*[:=]?\s*([1-5])$/i);
  if (prioQuery) {
    return {
      kind: 'action',
      actionId: 'getOpenTasks',
      input: { priority: Number(prioQuery[1]) as Priority },
      raw: input,
    };
  }

  // open tasks
  if (/^(?:show\s+)?open(\s+tasks)?$/i.test(lower) || lower === 'offene' || lower === 'offene aufgaben') {
    return { kind: 'action', actionId: 'getOpenTasks', input: {}, raw: input };
  }

  // today
  if (/^(?:show\s+)?(today|heute)(\s+tasks)?$/i.test(lower)) {
    return { kind: 'action', actionId: 'getTodayTasks', input: {}, raw: input };
  }

  // summary
  if (/^(summari[sz]e|summary|zusammenfassung|status|standup)(\s+today)?$/i.test(lower)) {
    return { kind: 'action', actionId: 'summarizeToday', input: {}, raw: input };
  }

  // navigation: "open X" | "go to X" | "goto X" | "öffne X" | bare module name
  const navMatch = input.match(/^(?:open|go\s*to|goto|öffne|zeige)\s+(.+)$/i);
  if (navMatch) {
    const mod = resolveModule(navMatch[1]);
    if (mod) return { kind: 'navigate', module: mod, raw: input };
  }
  const bareModule = resolveModule(input);
  if (bareModule) return { kind: 'navigate', module: bareModule, raw: input };

  return { kind: 'unknown', raw: input };
}

/** Human-readable command reference shown by the `help` command. */
export const COMMAND_HELP: { command: string; example: string; description: string }[] = [
  { command: 'create task: …', example: 'create task: Jochen anrufen p4 morgen', description: 'Neue Aufgabe (Priorität via p1–p5, Datum via heute/morgen).' },
  { command: 'open tasks', example: 'open tasks', description: 'Alle offenen Aufgaben anzeigen.' },
  { command: 'priority N', example: 'priority 5', description: 'Offene Aufgaben einer Priorität.' },
  { command: 'today', example: 'today', description: 'Heute fällige Aufgaben.' },
  { command: 'summarize', example: 'summarize', description: 'Tages-Zusammenfassung.' },
  { command: 'open <modul>', example: 'open dashboard', description: 'Zu einem Modul navigieren.' },
  { command: 'help', example: 'help', description: 'Diese Übersicht.' },
];
