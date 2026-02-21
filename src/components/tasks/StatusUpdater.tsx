'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { STATUS_LABELS } from '@/lib/constants';

const STATUSES = ['todo', 'in_progress', 'done'] as const;

const STATUS_STYLES: Record<string, string> = {
  todo: 'border-stone-600 text-stone-300 hover:bg-stone-800',
  in_progress: 'border-amber-700 text-amber-400 hover:bg-amber-900/30',
  done: 'border-emerald-700 text-emerald-400 hover:bg-emerald-900/30',
};

const ACTIVE_STYLES: Record<string, string> = {
  todo: 'bg-stone-800 border-stone-600 text-stone-200',
  in_progress: 'bg-amber-900/30 border-amber-600 text-amber-300',
  done: 'bg-emerald-900/30 border-emerald-600 text-emerald-300',
};

interface StatusUpdaterProps {
  taskId: string;
  currentStatus: string;
}

export default function StatusUpdater({ taskId, currentStatus }: StatusUpdaterProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  async function handleStatusChange(newStatus: string) {
    if (newStatus === status || loading) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setStatus(newStatus);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      {STATUSES.map((s) => (
        <button
          key={s}
          onClick={() => handleStatusChange(s)}
          disabled={loading}
          className={`
            px-3 py-1.5 rounded-lg border text-xs font-medium transition
            ${s === status ? ACTIVE_STYLES[s] : STATUS_STYLES[s]}
            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {STATUS_LABELS[s]}
        </button>
      ))}
    </div>
  );
}
