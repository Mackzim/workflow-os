import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CalendarEvent, CalendarItem } from '@/lib/calendar/calendarTypes';
import { useCalendar } from '@/hooks/useCalendar';
import { addMonths, monthTitle } from '@/lib/calendar/calendarUtils';
import { Page } from '@/components/common/Page';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';
import { Toggle } from '@/components/ui/Toggle';
import { MonthGrid } from './MonthGrid';
import { DayPanel } from './DayPanel';
import { EventModal, type EventFormValues } from './EventModal';

export function CalendarPage() {
  const { events, itemsForDay, dayChips, addEvent, updateEvent, deleteEvent, showDoneTasks, setShowDoneTasks } =
    useCalendar();
  const navigate = useNavigate();

  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState(() => new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [createDate, setCreateDate] = useState(() => new Date());

  const selectDay = (day: Date) => {
    setSelected(day);
    if (day.getMonth() !== cursor.getMonth() || day.getFullYear() !== cursor.getFullYear()) {
      setCursor(day);
    }
  };

  const goToday = () => {
    const t = new Date();
    setCursor(t);
    setSelected(t);
  };

  const openCreate = (date: Date) => {
    setEditing(null);
    setCreateDate(date);
    setModalOpen(true);
  };

  const openItem = (item: CalendarItem) => {
    if (item.kind === 'event' && item.eventId) {
      const ev = events.find((e) => e.id === item.eventId);
      if (ev) {
        setEditing(ev);
        setModalOpen(true);
      }
    } else if (item.kind === 'task') {
      navigate('/tasks');
    }
  };

  const handleSubmit = (values: EventFormValues) => {
    if (editing) updateEvent(editing.id, values);
    else addEvent(values);
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteEvent(id);
    setModalOpen(false);
  };

  return (
    <Page>
      {/* Toolbar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="min-w-[9.5rem] text-xl font-semibold tracking-tight text-content">{monthTitle(cursor)}</h1>
          <div className="flex items-center gap-1">
            <IconButton icon="chevronLeft" label="Voriger Monat" onClick={() => setCursor(addMonths(cursor, -1))} />
            <IconButton icon="chevronRight" label="Nächster Monat" onClick={() => setCursor(addMonths(cursor, 1))} />
          </div>
          <Button size="sm" variant="secondary" onClick={goToday}>
            Heute
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-[12px] text-content-muted">
            <span>Erledigte</span>
            <Toggle checked={showDoneTasks} onChange={setShowDoneTasks} label="Erledigte Aufgaben anzeigen" />
          </label>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Icon name="plus" size={15} />}
            onClick={() => openCreate(selected)}
          >
            Termin
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <MonthGrid
          cursor={cursor}
          selected={selected}
          events={events}
          dayChips={dayChips}
          onSelectDay={selectDay}
          onOpenItem={openItem}
          onOpenEvent={(ev) => {
            setEditing(ev);
            setModalOpen(true);
          }}
        />
        <DayPanel
          day={selected}
          items={itemsForDay(selected)}
          onCreate={() => openCreate(selected)}
          onOpenItem={openItem}
        />
      </div>

      <EventModal
        open={modalOpen}
        event={editing}
        defaultDate={createDate}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
    </Page>
  );
}
