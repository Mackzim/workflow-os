import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardPage } from '@/components/dashboard/DashboardPage';
import { TasksPage } from '@/components/tasks/TasksPage';
import { CalendarPage } from '@/components/calendar/CalendarPage';
import { SeoPage } from '@/components/seo/SeoPage';
import { CommandCenterPage } from '@/components/command/CommandCenterPage';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { PlaceholderPage } from '@/components/common/PlaceholderPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="command" element={<CommandCenterPage />} />

        {/* Prepared modules – architecture in place, UI later. */}
        <Route
          path="projects"
          element={
            <PlaceholderPage
              title="Projects"
              description="Projekte & Workflows organisieren."
              icon="projects"
              targetVersion="v0.3"
              planned={[
                'Projekte mit Aufgaben verknüpfen',
                'Projekt-Status & Fortschritt',
                'Board- und Listenansicht',
                'Verknüpfung mit Objekten',
              ]}
            />
          }
        />
        <Route
          path="notes"
          element={
            <PlaceholderPage
              title="Notes"
              description="Notizen & Pages – block-basiert."
              icon="notes"
              targetVersion="v0.4"
              planned={['Block-Editor', 'Backlinks & Verlinkung', 'Tags & Volltextsuche', 'Tägliche Notizen']}
            />
          }
        />
        <Route
          path="objects"
          element={
            <PlaceholderPage
              title="Objects"
              description="Strukturierte Objekte – inspiriert von Capacities."
              icon="objects"
              targetVersion="v0.5"
              planned={[
                'Objekttypen (Kunde, Produkt, Lieferant …)',
                'Eigenschaften & Relationen',
                'Graph-Verknüpfungen',
                'Objekt-Referenzen in Notizen',
              ]}
            />
          }
        />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="seo" element={<SeoPage />} />
        <Route
          path="automations"
          element={
            <PlaceholderPage
              title="Automations"
              description="Wiederkehrende Workflows automatisieren."
              icon="automations"
              targetVersion="v0.6"
              planned={[
                'Trigger → Actions',
                'Zeit- und Ereignis-Trigger',
                'Anbindung an die Action Registry',
                'Claude-gesteuerte Automationen',
              ]}
            />
          }
        />
        <Route
          path="integrations"
          element={
            <PlaceholderPage
              title="Integrations"
              description="APIs, MCP & externe Dienste."
              icon="integrations"
              targetVersion="v0.6"
              planned={['Claude API', 'MCP Server', 'REST & Webhooks', 'JTL / Shop / Support Workflows']}
            />
          }
        />

        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
