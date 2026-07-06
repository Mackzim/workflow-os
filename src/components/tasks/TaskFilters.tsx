import { useShallow } from 'zustand/react/shallow';
import type { Priority, TaskStatus } from '@/lib/tasks/taskTypes';
import { PRIORITIES, PRIORITY_META, STATUSES, STATUS_META } from '@/lib/tasks/taskTypes';
import type { SortKey } from '@/lib/tasks/taskFilters';
import { useTaskStore } from '@/store/useTaskStore';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { IconButton } from '@/components/ui/IconButton';
import { Icon } from '@/components/ui/Icon';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'priority', label: 'Priorität' },
  { value: 'dueDate', label: 'Fälligkeit' },
  { value: 'createdAt', label: 'Erstellt' },
  { value: 'status', label: 'Status' },
];

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
    filter.search !== '' || filter.status !== 'all' || filter.priority !== 'all' || filter.scope !== 'all';

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

      <Select
        sizing="sm"
        className="w-auto min-w-[130px]"
        value={filter.status}
        onChange={(e) => setFilter({ status: e.target.value as TaskStatus | 'all' })}
        options={[
          { value: 'all', label: 'Alle Status' },
          ...STATUSES.map((s) => ({ value: s, label: STATUS_META[s].label })),
        ]}
      />

      <Select
        sizing="sm"
        className="w-auto min-w-[130px]"
        value={String(filter.priority)}
        onChange={(e) =>
          setFilter({ priority: e.target.value === 'all' ? 'all' : (Number(e.target.value) as Priority) })
        }
        options={[
          { value: 'all', label: 'Alle Prioritäten' },
          ...PRIORITIES.map((p) => ({ value: String(p), label: PRIORITY_META[p].label })),
        ]}
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

      {isFiltered && (
        <IconButton icon="reset" label="Filter zurücksetzen" onClick={resetFilter} />
      )}
    </div>
  );
}
