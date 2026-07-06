import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/motion/motionPresets';
import { cn } from '@/lib/utils/cn';

export interface PageProps {
  children: ReactNode;
  className?: string;
}

export function Page({ children, className }: PageProps) {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn('mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8', className)}
    >
      {children}
    </motion.div>
  );
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  icon?: ReactNode;
}

export function PageHeader({ title, subtitle, actions, icon }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-elevated text-primary">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-content">{title}</h1>
          {subtitle && <p className="mt-0.5 text-[13px] text-content-muted">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
