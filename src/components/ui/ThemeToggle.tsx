import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useThemeStore } from '@/store/useThemeStore';
import { cn } from '@/lib/utils/cn';
import { Icon } from './Icon';

export interface ThemeToggleProps {
  className?: string;
}

/** Round icon button that flips the app between dark and light. */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const reduced = useReducedMotion();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Zu hellem Design wechseln' : 'Zu dunklem Design wechseln'}
      title={isDark ? 'Light Mode' : 'Dark Mode'}
      className={cn(
        'relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-border-strong',
        'bg-surface-elevated text-content-muted transition-colors hover:text-content hover:bg-surface-hover',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
        className,
      )}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={theme}
          initial={reduced ? false : { y: 10, opacity: 0, rotate: -30 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={reduced ? { opacity: 0 } : { y: -10, opacity: 0, rotate: 30 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center"
        >
          <Icon name={isDark ? 'sun' : 'moon'} size={17} />
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
