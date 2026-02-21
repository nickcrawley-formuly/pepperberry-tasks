'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { STATUS_LABELS } from '@/lib/constants';

const STATUSES = ['todo', 'in_progress', 'done'] as const;

const STATUS_STYLES: Record<string, string> = {
  todo: 'border-stone-200 text-stone-600 hover:bg-stone-50',
  in_progress: 'border-amber-200 text-amber-700 hover:bg-amber-50',
  done: 'border-emerald-200 text-emerald-700 hover:bg-emerald-50',
};

const ACTIVE_STYLES: Record<string, string> = {
  todo: 'bg-stone-100 border-stone-300 text-stone-700',
  in_progress: 'bg-amber-50 border-amber-300 text-amber-800',
  done: 'bg-emerald-50 border-emerald-300 text-emerald-800',
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
