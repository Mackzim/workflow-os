import { AnimatePresence, motion } from 'framer-motion';
import { useUIStore } from '@/store/useUIStore';
import { drawerTransition } from '@/lib/motion/motionPresets';
import { Brand } from './Brand';
import { SidebarNav } from './SidebarNav';
import { IconButton } from '@/components/ui/IconButton';

export function MobileDrawer() {
  const open = useUIStore((s) => s.mobileDrawerOpen);
  const close = useUIStore((s) => s.closeDrawer);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            variants={drawerTransition.overlay}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={close}
          />
          <motion.aside
            className="absolute inset-y-0 left-0 flex w-72 max-w-[82%] flex-col border-r border-border bg-bg"
            variants={drawerTransition.panel}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="flex h-16 items-center justify-between px-4">
              <Brand onClick={close} />
              <IconButton icon="close" label="Menü schließen" onClick={close} />
            </div>
            <div className="flex-1 overflow-hidden py-2">
              <SidebarNav onNavigate={close} />
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
