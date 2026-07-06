import { APP } from '@/config/app';
import { Brand } from './Brand';
import { SidebarNav } from './SidebarNav';

/** Fixed desktop sidebar (hidden below lg – MobileDrawer takes over). */
export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-bg-soft/60 lg:flex">
      <div className="flex h-16 items-center px-4">
        <Brand />
      </div>
      <div className="flex-1 overflow-hidden py-2">
        <SidebarNav />
      </div>
      <div className="px-4 py-3 text-[10px] text-content-faint">v{APP.version} · local-first</div>
    </aside>
  );
}
