/**
 * useCommand
 * ----------
 * Ties the parser -> registry -> outcome pipeline together for the UI.
 * The Command Center page and the Command widget both use this, sharing one
 * outcome history via the UI store.
 */

import { useCallback } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { useActionContext } from './useActionContext';
import { parseCommand } from '@/lib/command/commandParser';
import { runAction } from '@/lib/command/actionRegistry';
import { MODULE_LABELS, MODULE_ROUTES } from '@/lib/navigation/navigation';
import { newId } from '@/lib/tasks/taskUtils';
import type { CommandOutcome } from '@/lib/command/commandTypes';

export function useCommand() {
  const ctx = useActionContext();
  const pushOutcome = useUIStore((s) => s.pushOutcome);
  const outcomes = useUIStore((s) => s.commandOutcomes);
  const clearOutcomes = useUIStore((s) => s.clearOutcomes);

  const run = useCallback(
    (raw: string): CommandOutcome | undefined => {
      const parsed = parseCommand(raw);
      const base = { id: newId(), input: raw.trim(), timestamp: new Date().toISOString() };
      let outcome: CommandOutcome;

      switch (parsed.kind) {
        case 'empty':
          return undefined;

        case 'help':
          outcome = { ...base, status: 'help', message: 'Verfügbare Befehle:' };
          break;

        case 'navigate': {
          const path = MODULE_ROUTES[parsed.module];
          ctx.navigate?.(path);
          outcome = { ...base, status: 'info', message: `Öffne ${MODULE_LABELS[parsed.module]} …` };
          break;
        }

        case 'action': {
          const result = runAction(parsed.actionId, parsed.input, ctx);
          if (result.navigateTo) ctx.navigate?.(result.navigateTo);
          outcome = {
            ...base,
            status: result.notImplemented ? 'info' : result.ok ? 'success' : 'error',
            message: result.message,
            tasks: result.tasks,
            actionId: parsed.actionId,
            notImplemented: result.notImplemented,
          };
          break;
        }

        case 'unknown':
        default:
          outcome = {
            ...base,
            status: 'error',
            message: `Unbekannter Befehl. Tippe „help" für eine Übersicht.`,
          };
          break;
      }

      pushOutcome(outcome);
      return outcome;
    },
    [ctx, pushOutcome],
  );

  return { run, outcomes, clearOutcomes };
}
