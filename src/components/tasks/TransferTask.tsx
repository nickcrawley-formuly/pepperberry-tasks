'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TransferUser {
  id: string;
  name: string;
}

interface TransferTaskProps {
  taskId: string;
  currentAssignedTo: string | null;
  users: TransferUser[];
}

export default function TransferTask({ taskId, currentAssignedTo, users }: TransferTaskProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availableUsers = users.filter((u) => u.id !== currentAssignedTo);

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser || !comment.trim() || loading) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/tasks/${taskId}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigned_to: selectedUser, comment: comment.trim() }),
      });

      if (res.ok) {
        setOpen(false);
        setSelectedUser('');
        setComment('');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Transfer failed');
      }
    } catch {
      setError('Transfer failed');
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-2 text-xs text-amber-700 hover:text-amber-600 font-medium transition"
      >
        Transfer task
      </button>
    );
  }

  return (
    <form onSubmit={handleTransfer} className="mt-3 space-y-3">
      <div>
        <label className="block text-xs text-stone-500 mb-1">Transfer to</label>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-transparent transition"
        >
          <option value="">Select a user...</option>
          {availableUsers.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-stone-500 mb-1">Reason for transfer</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Why is this task being transferred?"
          rows={2}
          className="w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-transparent transition resize-none"
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!selectedUser || !comment.trim() || loading}
          className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Transferring...' : 'Transfer'}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setSelectedUser('');
            setComment('');
            setError('');
          }}
          className="px-4 py-2 rounded-lg border border-stone-200 text-sm font-medium text-stone-700 hover:bg-stone-100 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
