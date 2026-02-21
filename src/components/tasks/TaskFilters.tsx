'use client';

import { STATUS_LABELS } from '@/lib/constants';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'todo', label: STATUS_LABELS.todo },
  { key: 'in_progress', label: STATUS_LABELS.in_progress },
  { key: 'done', label: STATUS_LABELS.done },
] as const;

interface TaskFiltersProps {
  activeStatus: string;
  onStatusChange: (status: string) => void;
  counts: Record<string, number>;
}

export default function TaskFilters({
  activeStatus,
  onStatusChange,
  counts,
}: TaskFiltersProps) {
  return (
    <div className="flex gap-1 bg-stone-100 rounded-lg p-1">
      {TABS.map((tab) => {
        const isActive = activeStatus === tab.key;
        const count = tab.key === 'all' ? counts.all : counts[tab.key] ?? 0;
        return (
          <button
            key={tab.key}
            onClick={() => onStatusChange(tab.key)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition
              ${isActive
                ? 'bg-white text-stone-800 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
              }
            `}
          >
            {tab.label}
            <span
              className={`
                text-[10px] tabular-nums
                ${isActive ? 'text-stone-400' : 'text-stone-400'}
              `}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
