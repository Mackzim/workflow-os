/** Date / label formatting helpers (German locale). */

const DAY_MS = 86_400_000;

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Human due-date label: "Heute", "Morgen", "Gestern", "Mo 8. Jul". */
export function formatDueDate(iso?: string, ref: Date = new Date()): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const diffDays = Math.round((startOfDay(d) - startOfDay(ref)) / DAY_MS);
  if (diffDays === 0) return 'Heute';
  if (diffDays === 1) return 'Morgen';
  if (diffDays === -1) return 'Gestern';
  return d.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function formatDateInput(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

/** Long date for the top bar, e.g. "Montag, 6. Juli". */
export function formatToday(ref: Date = new Date()): string {
  return ref.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
}
