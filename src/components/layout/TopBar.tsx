import { useNavigate } from 'react-router-dom';
import { useUIStore } from '@/store/useUIStore';
import { APP } from '@/config/app';
import { formatToday } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { ProfileMenu } from './ProfileMenu';
import { BrandMark } from './Brand';

export function TopBar() {
  const openDrawer = useUIStore((s) => s.openDrawer);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-bg/80 px-4 backdrop-blur-md">
      {/* Mobile: menu + brand */}
      <div className="flex items-center gap-2 lg:hidden">
        <IconButton icon="menu" label="Menü öffnen" size={20} onClick={openDrawer} />
        <BrandMark size={26} />
        <span className="text-sm font-semibold text-content">{APP.name}</span>
      </div>

      {/* Command launcher – styled like a palette trigger, not a search box */}
      <button
        type="button"
        onClick={() => navigate('/command')}
        className={cn(
          'group ml-auto flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2',
          'text-content-faint transition-colors hover:border-primary/40 hover:text-content lg:ml-0 lg:w-72',
        )}
      >
        <Icon name="command" size={16} className="text-content-faint group-hover:text-primary" />
        <span className="hidden text-[13px] lg:inline">Befehl ausführen …</span>
        <span className="ml-auto hidden rounded-md border border-border bg-bg-soft px-1.5 py-0.5 font-mono text-[10px] lg:inline">
          ⌘K
        </span>
      </button>

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden text-[12px] text-content-muted md:inline">{formatToday()}</span>
        <ProfileMenu />
      </div>
    </header>
  );
}
