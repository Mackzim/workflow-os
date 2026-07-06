import { AnimatePresence } from 'framer-motion';
import { useCommand } from '@/hooks/useCommand';
import { cn } from '@/lib/utils/cn';
import { Icon } from '@/components/ui/Icon';
import { EmptyState } from '@/components/ui/EmptyState';
import { CommandInput } from './CommandInput';
import { CommandResult } from './CommandResult';

const SUGGESTIONS = ['open tasks', 'today', 'priority 5', 'summarize', 'help'];

export interface CommandCenterProps {
  compact?: boolean;
  autoFocus?: boolean;
  /** Show the "Claude/MCP coming" note. */
  showNotice?: boolean;
}

export function CommandCenter({ compact, autoFocus, showNotice = true }: CommandCenterProps) {
  const { run, outcomes, clearOutcomes } = useCommand();
  const visible = compact ? outcomes.slice(0, 2) : outcomes;

  return (
    <div className="flex flex-col gap-3">
      <CommandInput onSubmit={run} autoFocus={autoFocus} />

      {/* Suggestion chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => run(s)}
            className="rounded-lg border border-border bg-surface px-2 py-1 font-mono text-[11px] text-content-muted transition-colors hover:border-primary/40 hover:text-primary"
          >
            {s}
          </button>
        ))}
        {outcomes.length > 0 && (
          <button
            type="button"
            onClick={clearOutcomes}
            className="ml-auto rounded-lg px-2 py-1 text-[11px] text-content-faint transition-colors hover:text-content"
          >
            Verlauf leeren
          </button>
        )}
      </div>

      {/* Outcomes */}
      <div className={cn('flex flex-col gap-2', !compact && 'max-h-[46vh] overflow-y-auto pr-1')}>
        <AnimatePresence initial={false}>
          {visible.map((o) => (
            <CommandResult key={o.id} outcome={o} />
          ))}
        </AnimatePresence>
        {outcomes.length === 0 && !compact && (
          <EmptyState
            icon="command"
            title="Steuerzentrale bereit"
            description="Führe Befehle aus – oder tippe „help“ für alle Kommandos."
            compact
          />
        )}
      </div>

      {showNotice && (
        <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary-soft px-3 py-2 text-[12px] text-content-muted">
          <span className="mt-0.5 text-primary">
            <Icon name="sparkle" size={15} />
          </span>
          <p>
            <span className="font-medium text-content">Claude &amp; MCP folgen.</span> Heute laufen Befehle lokal über
            die Action Registry – später interpretiert Claude deine Intents und löst dieselben Actions aus.
          </p>
        </div>
      )}
    </div>
  );
}
