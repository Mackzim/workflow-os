import { useState } from 'react';
import type { FormEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { Icon } from '@/components/ui/Icon';

export interface CommandInputProps {
  onSubmit: (raw: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

/**
 * The command entry field. Deliberately styled as a "control surface", not a
 * search box: monospace prompt glyph, animated focus glow, send affordance.
 */
export function CommandInput({ onSubmit, placeholder, autoFocus }: CommandInputProps) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const reduced = useReducedMotion();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit(value);
    setValue('');
  };

  return (
    <motion.form
      onSubmit={submit}
      animate={{
        boxShadow: focused
          ? '0 0 0 1px rgba(76,141,255,0.55), 0 0 28px -6px rgba(76,141,255,0.4)'
          : '0 0 0 1px var(--color-border)',
      }}
      transition={{ duration: reduced ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-2.5 rounded-xl bg-bg-soft px-3 py-2.5"
    >
      <span className={cn('font-mono text-sm transition-colors', focused ? 'text-primary' : 'text-content-faint')}>
        {'>'}
      </span>
      <input
        value={value}
        autoFocus={autoFocus}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder ?? 'Befehl eingeben … (z. B. „create task: …" oder „help")'}
        className="min-w-0 flex-1 bg-transparent font-mono text-[13px] text-content placeholder:text-content-faint focus:outline-none"
        spellCheck={false}
        autoComplete="off"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        aria-label="Befehl ausführen"
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
          value.trim() ? 'bg-primary text-white hover:bg-primary-strong' : 'bg-surface-elevated text-content-faint',
        )}
      >
        <Icon name="send" size={15} />
      </button>
    </motion.form>
  );
}
