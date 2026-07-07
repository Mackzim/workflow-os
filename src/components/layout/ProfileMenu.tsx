import { Link } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore, type Theme } from '@/store/useThemeStore';
import { isSyncConfigured } from '@/lib/sync/supabaseClient';
import { cn } from '@/lib/utils/cn';
import { Popover } from '@/components/ui/Popover';
import { Icon } from '@/components/ui/Icon';
import { BrandMark } from './Brand';

// TODO(profile): editable display name + avatar upload land with the profile store.
const USER_NAME = 'Felix';

function ThemeSwitch() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const opts: { value: Theme; label: string; icon: 'moon' | 'sun' }[] = [
    { value: 'dark', label: 'Dark', icon: 'moon' },
    { value: 'light', label: 'Light', icon: 'sun' },
  ];
  return (
    <div className="flex rounded-lg border border-border-strong bg-surface p-0.5">
      {opts.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => setTheme(o.value)}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-medium transition-colors',
            theme === o.value ? 'bg-primary text-white' : 'text-content-muted hover:text-content',
          )}
        >
          <Icon name={o.icon} size={13} />
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function ProfileMenu() {
  const { user } = useAuthStore(useShallow((s) => ({ user: s.user })));
  const secondary = isSyncConfigured ? (user?.email ?? 'Nicht angemeldet') : 'Lokaler Modus';

  return (
    <Popover
      align="right"
      panelClassName="w-64"
      trigger={() => (
        <span className="block rounded-full ring-1 ring-border-strong transition-shadow hover:ring-primary/50">
          <BrandMark size={32} />
        </span>
      )}
    >
      {(close) => (
        <div>
          <div className="flex items-center gap-3 px-1.5 pb-2.5 pt-1">
            <BrandMark size={40} />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-content">{USER_NAME}</p>
              <p className="truncate text-[11px] text-content-faint">{secondary}</p>
            </div>
          </div>

          <div className="my-1 border-t border-border" />

          <div className="px-1.5 py-1.5">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-content-faint">Design</p>
            <ThemeSwitch />
          </div>

          <div className="my-1 border-t border-border" />

          <div className="space-y-0.5">
            <Link
              to="/settings"
              onClick={close}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-content-muted transition-colors hover:bg-surface-hover hover:text-content"
            >
              <Icon name="settings" size={15} />
              Einstellungen
            </Link>
            <div
              className="flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-content-faint"
              title="Kommt mit den Profil-Einstellungen"
            >
              <span className="flex items-center gap-2.5">
                <Icon name="edit" size={15} />
                Profilbild ändern
              </span>
              <span className="rounded border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-wide">bald</span>
            </div>
          </div>
        </div>
      )}
    </Popover>
  );
}
