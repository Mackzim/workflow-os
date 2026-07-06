import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { NavItem } from './navItems';
import { NAV_MODULES, NAV_PRIMARY, NAV_SETTINGS } from './navItems';
import { sidebarIndicator } from '@/lib/motion/motionPresets';
import { cn } from '@/lib/utils/cn';
import { Icon } from '@/components/ui/Icon';

function isActivePath(pathname: string, path: string): boolean {
  return path === '/' ? pathname === '/' : pathname.startsWith(path);
}

function NavRow({ item, active, onNavigate }: { item: NavItem; active: boolean; onNavigate?: () => void }) {
  return (
    <Link
      to={item.path}
      onClick={onNavigate}
      className={cn(
        'group relative flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors duration-150',
        active ? 'text-content' : 'text-content-muted hover:text-content',
      )}
    >
      {active && (
        <motion.span
          layoutId="nav-active"
          transition={sidebarIndicator}
          className="absolute inset-0 -z-0 rounded-xl border border-primary/25 bg-primary-soft"
        />
      )}
      <span
        className={cn(
          'relative z-10 transition-colors',
          active ? 'text-primary' : 'text-content-faint group-hover:text-content-muted',
        )}
      >
        <Icon name={item.icon} size={18} />
      </span>
      <span className="relative z-10 flex-1">{item.label}</span>
      {!item.ready && (
        <span className="relative z-10 h-1.5 w-1.5 rounded-full bg-border-strong" title="In Vorbereitung" />
      )}
    </Link>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="px-3 pb-1.5 pt-4 text-[10px] font-semibold uppercase tracking-wider text-content-faint">
      {children}
    </p>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();

  return (
    <nav className="flex h-full flex-col">
      <div className="flex-1 space-y-0.5 overflow-y-auto px-2">
        {NAV_PRIMARY.map((it) => (
          <NavRow key={it.key} item={it} active={isActivePath(pathname, it.path)} onNavigate={onNavigate} />
        ))}

        <SectionLabel>Module</SectionLabel>
        {NAV_MODULES.map((it) => (
          <NavRow key={it.key} item={it} active={isActivePath(pathname, it.path)} onNavigate={onNavigate} />
        ))}
      </div>

      <div className="mt-2 border-t border-border px-2 pt-2">
        <NavRow item={NAV_SETTINGS} active={isActivePath(pathname, NAV_SETTINGS.path)} onNavigate={onNavigate} />
      </div>
    </nav>
  );
}
