import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { CalendarEvent, EventColor } from '@/lib/calendar/calendarTypes';
import { EVENT_COLORS, EVENT_COLOR_KEYS } from '@/lib/calendar/calendarTypes';
import { formatDateInput } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { Icon } from '@/components/ui/Icon';

/** What the modal hands back – parent maps this to add/update. */
export interface EventFormValues {
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  color: EventColor;
  description?: string;
}

export interface EventModalProps {
  open: boolean;
  /** Present => edit mode. */
  event: CalendarEvent | null;
  /** Prefill date for new events. */
  defaultDate: Date;
  onClose: () => void;
  onSubmit: (values: EventFormValues) => void;
  onDelete?: (id: string) => void;
}

function timeInput(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function endOfDayISO(dateStr: string): string {
  const d = new Date(`${dateStr}T23:59`);
  return d.toISOString();
}

export function EventModal({ open, event, defaultDate, onClose, onSubmit, onDelete }: EventModalProps) {
  const [title, setTitle] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [color, setColor] = useState<EventColor>('blue');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(false);

  // (Re)initialise whenever the modal opens.
  useEffect(() => {
    if (!open) return;
    setError(false);
    if (event) {
      setTitle(event.title);
      setAllDay(event.allDay);
      setStartDate(formatDateInput(event.start));
      setEndDate(formatDateInput(event.end));
      setStartTime(timeInput(event.start));
      setEndTime(timeInput(event.end));
      setColor(event.color);
      setDescription(event.description ?? '');
    } else {
      const d = formatDateInput(defaultDate.toISOString());
      setTitle('');
      setAllDay(false);
      setStartDate(d);
      setEndDate(d);
      setStartTime('09:00');
      setEndTime('10:00');
      setColor('blue');
      setDescription('');
    }
  }, [open, event, defaultDate]);

  const submit = () => {
    const t = title.trim();
    if (!t || !startDate) {
      setError(true);
      return;
    }
    const end = endDate || startDate;
    let startISO: string;
    let endISO: string;
    if (allDay) {
      startISO = new Date(`${startDate}T00:00`).toISOString();
      endISO = endOfDayISO(end);
    } else {
      startISO = new Date(`${startDate}T${startTime}`).toISOString();
      endISO = new Date(`${end}T${endTime}`).toISOString();
    }
    if (new Date(endISO) < new Date(startISO)) {
      endISO = allDay ? endOfDayISO(startDate) : new Date(new Date(startISO).getTime() + 3_600_000).toISOString();
    }
    onSubmit({ title: t, start: startISO, end: endISO, allDay, color, description: description.trim() || undefined });
  };

  return (
    <Modal open={open} onClose={onClose} title={event ? 'Termin bearbeiten' : 'Neuer Termin'}>
      <div className="space-y-4">
        <div>
          <FieldLabel>Titel</FieldLabel>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="z. B. Team-Sync"
            autoFocus
            className={cn(error && !title.trim() && 'border-critical/60')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) submit();
            }}
          />
        </div>

        <label className="flex items-center justify-between rounded-xl border border-border bg-surface-elevated/50 px-3.5 py-2.5">
          <span className="text-[13px] text-content">Ganztägig</span>
          <Toggle checked={allDay} onChange={setAllDay} label="Ganztägig" />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Start</FieldLabel>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <FieldLabel>Ende</FieldLabel>
            <Input type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        {!allDay && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Von</FieldLabel>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div>
              <FieldLabel>Bis</FieldLabel>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>
        )}

        <div>
          <FieldLabel>Farbe</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {EVENT_COLOR_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                aria-label={EVENT_COLORS[key].label}
                title={EVENT_COLORS[key].label}
                onClick={() => setColor(key)}
                className={cn(
                  'h-7 w-7 rounded-full transition-transform',
                  color === key
                    ? 'ring-2 ring-offset-2 ring-offset-surface scale-110'
                    : 'hover:scale-105 opacity-80 hover:opacity-100',
                )}
                style={{
                  backgroundColor: EVENT_COLORS[key].hex,
                  boxShadow: color === key ? `0 0 0 2px ${EVENT_COLORS[key].hex}` : undefined,
                }}
              />
            ))}
          </div>
        </div>

        <div>
          <FieldLabel>Notizen</FieldLabel>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Optional …"
          />
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          {event && onDelete ? (
            <Button variant="danger" size="sm" leftIcon={<Icon name="trash" size={15} />} onClick={() => onDelete(event.id)}>
              Löschen
            </Button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Abbrechen
            </Button>
            <Button variant="primary" size="sm" onClick={submit}>
              Speichern
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-content-faint">{children}</p>;
}
