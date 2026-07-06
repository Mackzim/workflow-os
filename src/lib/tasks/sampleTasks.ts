import type { TaskDraft } from './taskTypes';

/** ISO date helper relative to today. */
function inDays(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Onboarding content seeded once on first launch. These are real, editable,
 * deletable tasks (persisted like any other) – not throwaway mock data.
 */
export const SAMPLE_TASK_DRAFTS: TaskDraft[] = [
  {
    title: 'Willkommen im Workflow OS 👋',
    description: 'Klicke die Checkbox, um eine Aufgabe abzuschließen. Bearbeiten & Löschen findest du beim Hover.',
    priority: 2,
    status: 'open',
    category: 'Onboarding',
    dueDate: inDays(0),
  },
  {
    title: 'Command Center ausprobieren',
    description: 'Öffne das Command Center und tippe „create task: Testaufgabe p4 morgen".',
    priority: 3,
    status: 'open',
    category: 'Onboarding',
    dueDate: inDays(0),
  },
  {
    title: 'Sortimentserweiterung mit Jochen klären',
    description: 'Rückruf wegen neuer Lieferantenkonditionen.',
    priority: 4,
    status: 'in_progress',
    category: 'Vertrieb',
    dueDate: inDays(1),
  },
  {
    title: 'Kritischer Shop-Bug: Checkout prüfen',
    description: 'Zahlungsabbruch bei PayPal reproduzieren.',
    priority: 5,
    status: 'open',
    category: 'Shop',
    dueDate: inDays(-1),
  },
  {
    title: 'Wochenrückblick schreiben',
    description: 'Kurzes Review der erledigten Aufgaben.',
    priority: 1,
    status: 'done',
    category: 'Routine',
  },
];
