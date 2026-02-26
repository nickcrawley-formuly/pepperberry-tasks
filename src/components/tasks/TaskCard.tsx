import Link from 'next/link';
import { Task } from '@/lib/types';
import {
  LOCATION_LABELS,
  AREA_LABELS,
} from '@/lib/constants';

const PRIORITY_DOT: Record<string, string> = {
  low: 'bg-stone-500',
  medium: 'bg-stone-400',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
};

const AREA_STRIPE: Record<string, string> = {
  garden: 'bg-emerald-500',
  paddocks: 'bg-amber-600',
  house: 'bg-sky-500',
  animals: 'bg-purple-500',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
  });
}

function isOverdue(task: Task): boolean {
  if (!task.due_date || task.status === 'done') return false;
  return new Date(task.due_date) < new Date(new Date().toDateString());
}

export default function TaskCard({ task }: { task: Task }) {
  const overdue = isOverdue(task);
  const isUrgent = task.priority === 'urgent';
  const stripe = task.area ? AREA_STRIPE[task.area] || 'bg-fw-text/20' : 'bg-fw-text/20';

  return (
    <Link
      href={`/tasks/${task.id}`}
      className={`block rounded-xl border transition overflow-hidden ${
        isUrgent
          ? 'bg-red-900/30 border-red-500/30 hover:border-red-400'
          : 'bg-fw-surface border-fw-surface hover:border-fw-text/30'
      }`}
    >
      <div className="flex">
        {/* Area color stripe */}
        <div className={`w-1.5 shrink-0 ${stripe}`} />

        <div className="flex-1 min-w-0 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-medium leading-snug ${task.status === 'done' ? 'line-through text-fw-text/50' : 'text-fw-text'}`}>
                {isUrgent && (
                  <span className="inline-block bg-red-500 text-white text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded mr-1.5 align-middle">
                    Urgent
                  </span>
                )}
                {task.title}
              </h3>
            </div>
            {/* Priority dot */}
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${PRIORITY_DOT[task.priority]}`} />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-fw-text/50">
            {task.area && (
              <span>{AREA_LABELS[task.area]}</span>
            )}
            <span>{LOCATION_LABELS[task.location] || task.location}</span>
            {task.assigned_user?.name && (
              <span>{task.assigned_user.name}</span>
            )}
            {task.due_date && (
              <span className={overdue ? 'text-red-500 font-medium' : ''}>
                {task.recurrence_pattern && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-0.5 -mt-0.5">
                    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                  </svg>
                )}
                {formatDate(task.due_date)}
              </span>
            )}
            {(task.subtask_total ?? 0) > 0 && (
              <span className="text-fw-accent font-medium">
                {task.subtask_done ?? 0}/{task.subtask_total}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
