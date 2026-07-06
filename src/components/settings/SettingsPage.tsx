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

export function SettingsPage() {
  const { tasks, replaceAll, clearAll } = useTaskStore(
    useShallow((s) => ({ tasks: s.tasks, replaceAll: s.replaceAll, clearAll: s.clearAll })),
  );
  const resetWidgets = useWidgetStore((s) => s.resetWidgets);
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
        <Card>
          <CardHeader>
            <CardTitle>Über</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2 text-[13px] text-content-muted">
            <Row label="Produkt" value={APP.name} />
            <Row label="Version" value={APP.version} />
            <Row label="Speicherung" value="Lokal (localStorage)" />
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
              <Button size="sm" variant="secondary" leftIcon={<Icon name="reset" size={15} />} onClick={resetWidgets}>
                Widgets zurücksetzen
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
          <CardBody className="text-[13px] text-content-muted">
            Die App nutzt konsequent Dark Mode und respektiert deine System-Einstellung für{' '}
            <span className="text-content">reduzierte Bewegung</span> – Animationen werden dann automatisch
            deaktiviert. Theme-Optionen folgen in einer späteren Version.
          </CardBody>
        </Card>
      </div>
    </Page>
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
