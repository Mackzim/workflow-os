import { useShallow } from 'zustand/react/shallow';
import type { Priority, TaskStatus } from '@/lib/tasks/taskTypes';
import { PRIORITIES, PRIORITY_META, STATUSES, STATUS_META } from '@/lib/tasks/taskTypes';
import type { SortKey } from '@/lib/tasks/taskFilters';
import { useTaskStore } from '@/store/useTaskStore';
import { cn } from '@/lib/utils/cn';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { IconButton } from '@/components/ui/IconButton';
import { Icon } from '@/components/ui/Icon';
import { Popover } from '@/components/ui/Popover';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'priority', label: 'Priorität' },
  { value: 'dueDate', label: 'Fälligkeit' },
  { value: 'createdAt', label: 'Erstellt' },
  { value: 'status', label: 'Status' },
];

interface FilterOption {
  value: string;
  label: string;
  color: string;
}

/** Multi-select checkbox filter in a popover. Empty selection = "all". */
function CheckboxFilter({
  label,
  options,
  selected,
  onToggle,
  onClear,
}: {
  label: string;
  options: FilterOption[];
  selected: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
}) {
  const count = selected.length;
  return (
    <Popover
      trigger={(open) => (
        <span
          className={cn(
            'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border px-3 text-[13px] transition-colors',
            count > 0
              ? 'border-primary/40 bg-primary-soft text-primary'
              : 'border-border bg-surface text-content-muted hover:text-content',
          )}
        >
          {label}
          {count > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white">
              {count}
            </span>
          )}
          <Icon name={open ? 'chevronUp' : 'chevronDown'} size={14} />
        </span>
      )}
    >
      {() => (
        <div className="min-w-[11rem]">
          <div className="flex items-center justify-between px-2 pb-1 pt-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-content-faint">{label}</p>
            {count > 0 && (
              <button type="button" onClick={onClear} className="text-[11px] text-content-faint transition-colors hover:text-primary">
                Zurücksetzen
              </button>
            )}
          </div>
          {options.map((o) => {
            const checked = selected.includes(o.value);
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => onToggle(o.value)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] text-content-muted transition-colors hover:bg-surface-hover hover:text-content"
              >
                <span
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded border transition-colors',
                    checked ? 'border-primary bg-primary text-white' : 'border-border-strong',
                  )}
                >
                  {checked && <Icon name="check" size={11} strokeWidth={3} />}
                </span>
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: o.color }} />
                {o.label}
              </button>
            );
          })}
        </div>
      )}
    </Popover>
  );
}

export function TaskFilters() {
  const { filter, sort, setFilter, setSort, resetFilter } = useTaskStore(
    useShallow((s) => ({
      filter: s.filter,
      sort: s.sort,
      setFilter: s.setFilter,
      setSort: s.setSort,
      resetFilter: s.resetFilter,
    })),
  );

  const isFiltered =
    filter.search !== '' || filter.status.length > 0 || filter.priority.length > 0 || filter.scope !== 'all';

  const toggleStatus = (value: string) => {
    const s = value as TaskStatus;
    setFilter({ status: filter.status.includes(s) ? filter.status.filter((x) => x !== s) : [...filter.status, s] });
  };
  const togglePriority = (value: string) => {
    const p = Number(value) as Priority;
    setFilter({ priority: filter.priority.includes(p) ? filter.priority.filter((x) => x !== p) : [...filter.priority, p] });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="min-w-[180px] flex-1">
        <Input
          sizing="sm"
          leftIcon={<Icon name="search" size={16} />}
          value={filter.search}
          onChange={(e) => setFilter({ search: e.target.value })}
          placeholder="Aufgaben suchen …"
        />
      </div>

      <CheckboxFilter
        label="Status"
        options={STATUSES.map((s) => ({ value: s, label: STATUS_META[s].label, color: STATUS_META[s].color }))}
        selected={filter.status}
        onToggle={toggleStatus}
        onClear={() => setFilter({ status: [] })}
      />

      <CheckboxFilter
        label="Priorität"
        options={PRIORITIES.map((p) => ({ value: String(p), label: PRIORITY_META[p].label, color: PRIORITY_META[p].color }))}
        selected={filter.priority.map(String)}
        onToggle={togglePriority}
        onClear={() => setFilter({ priority: [] })}
      />

      <div className="flex items-center gap-1">
        <Select
          sizing="sm"
          className="w-auto min-w-[120px]"
          value={sort.key}
          onChange={(e) => setSort({ key: e.target.value as SortKey, dir: sort.dir })}
          options={SORT_OPTIONS}
        />
        <IconButton
          icon={sort.dir === 'desc' ? 'chevronDown' : 'chevronUp'}
          label={sort.dir === 'desc' ? 'Absteigend' : 'Aufsteigend'}
          onClick={() => setSort({ key: sort.key, dir: sort.dir === 'desc' ? 'asc' : 'desc' })}
        />
      </div>

      {isFiltered && <IconButton icon="reset" label="Filter zurücksetzen" onClick={resetFilter} />}
    </div>
  );
}
