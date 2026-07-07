import { useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useTaskStore } from '@/store/useTaskStore';
import { useWidgetStore } from '@/store/useWidgetStore';
import type { Task } from '@/lib/tasks/taskTypes';
import { APP } from '@/config/app';
import { Page, PageHeader } from '@/components/common/Page';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useAuthStore } from '@/store/useAuthStore';
import { isSyncConfigured } from '@/lib/sync/supabaseClient';
import { useThemeStore, type Theme } from '@/store/useThemeStore';
import { cn } from '@/lib/utils/cn';

export function SettingsPage() {
  const { tasks, replaceAll, clearAll } = useTaskStore(
    useShallow((s) => ({ tasks: s.tasks, replaceAll: s.replaceAll, clearAll: s.clearAll })),
  );
  const resetDashboard = useWidgetStore((s) => s.resetDashboard);
  const { user, signOut } = useAuthStore(useShallow((s) => ({ user: s.user, signOut: s.signOut })));
  const fileRef = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState<string | null>(null);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-os-tasks-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setNote('Aufgaben exportiert.');
  };

  const importData = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Task[];
        if (!Array.isArray(parsed)) throw new Error('Falsches Format');
        replaceAll(parsed);
        setNote(`${parsed.length} Aufgaben importiert.`);
      } catch {
        setNote('Import fehlgeschlagen – ungültige Datei.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <Page>
      <PageHeader title="Settings" subtitle="App, Daten & Darstellung" icon={<Icon name="settings" size={20} />} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {isSyncConfigured && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Konto</CardTitle>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" /> Sync aktiv
              </span>
            </CardHeader>
            <CardBody className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-[13px]">
                <p className="text-content-faint">Angemeldet als</p>
                <p className="text-content">{user?.email ?? '—'}</p>
              </div>
              <Button size="sm" variant="secondary" leftIcon={<Icon name="close" size={15} />} onClick={() => signOut()}>
                Abmelden
              </Button>
            </CardBody>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Über</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2 text-[13px] text-content-muted">
            <Row label="Produkt" value={APP.name} />
            <Row label="Version" value={APP.version} />
            <Row label="Speicherung" value={isSyncConfigured ? 'Cloud-Sync (Supabase)' : 'Lokal (localStorage)'} />
            <Row label="Aufgaben" value={String(tasks.length)} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daten</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            <p className="text-[13px] text-content-muted">
              Alle Daten liegen lokal in deinem Browser. Exportiere sie als JSON, um sie zu sichern oder auf ein
              anderes Gerät zu übertragen.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" leftIcon={<Icon name="arrowRight" size={15} />} onClick={exportData}>
                Export JSON
              </Button>
              <Button
                size="sm"
                variant="secondary"
                leftIcon={<Icon name="plus" size={15} />}
                onClick={() => fileRef.current?.click()}
              >
                Import JSON
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) importData(f);
                  e.target.value = '';
                }}
              />
              <Button size="sm" variant="secondary" leftIcon={<Icon name="reset" size={15} />} onClick={resetDashboard}>
                Dashboard zurücksetzen
              </Button>
              <Button
                size="sm"
                variant="danger"
                leftIcon={<Icon name="trash" size={15} />}
                onClick={() => {
                  if (confirm('Wirklich alle Aufgaben löschen?')) {
                    clearAll();
                    setNote('Alle Aufgaben gelöscht.');
                  }
                }}
              >
                Aufgaben löschen
              </Button>
            </div>
            {note && <p className="text-[12px] text-primary">{note}</p>}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Darstellung</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-[13px]">
                <p className="text-content">Design</p>
                <p className="text-content-faint">Dark oder Light – jederzeit auch oben rechts umschaltbar.</p>
              </div>
              <ThemeSegmented />
            </div>
            <p className="text-[13px] text-content-muted">
              Die App respektiert deine System-Einstellung für{' '}
              <span className="text-content">reduzierte Bewegung</span> – Animationen werden dann automatisch
              deaktiviert.
            </p>
          </CardBody>
        </Card>
      </div>
    </Page>
  );
}

function ThemeSegmented() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const options: { value: Theme; label: string; icon: 'moon' | 'sun' }[] = [
    { value: 'dark', label: 'Dark', icon: 'moon' },
    { value: 'light', label: 'Light', icon: 'sun' },
  ];
  return (
    <div className="inline-flex rounded-xl border border-border-strong bg-surface-elevated p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => setTheme(o.value)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors',
            theme === o.value
              ? 'bg-primary text-white shadow-card'
              : 'text-content-muted hover:text-content',
          )}
        >
          <Icon name={o.icon} size={15} />
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0 last:pb-0">
      <span className="text-content-faint">{label}</span>
      <span className="text-content">{value}</span>
    </div>
  );
}
