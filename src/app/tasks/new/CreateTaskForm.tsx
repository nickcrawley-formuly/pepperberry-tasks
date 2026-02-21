'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CATEGORIES,
  LOCATIONS,
  PRIORITIES,
  CATEGORY_LABELS,
  LOCATION_LABELS,
  PRIORITY_LABELS,
} from '@/lib/constants';

interface UserOption {
  id: string;
  name: string;
  role: string;
  trade_type: string | null;
}

interface CreateTaskFormProps {
  users: UserOption[];
}

export default function CreateTaskForm({ users }: CreateTaskFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          priority,
          category,
          location,
          assigned_to: assignedTo || null,
          due_date: dueDate || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create task');
        return;
      }

      router.push(`/tasks/${data.task.id}`);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const selectClass =
    'w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-transparent transition';
  const inputClass =
    'w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-transparent transition';
  const labelClass = 'block text-xs font-medium text-stone-500 mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-5">
        {/* Title */}
        <div>
          <label htmlFor="title" className={labelClass}>
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            required
            className={inputClass}
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className={labelClass}>
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details, notes, or instructions..."
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-5">
        {/* Priority & Category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="priority" className={labelClass}>
              Priority
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className={selectClass}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="category" className={labelClass}>
              Category *
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className={selectClass}
            >
              <option value="">Select...</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Location & Assign to */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="location" className={labelClass}>
              Location *
            </label>
            <select
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className={selectClass}
            >
              <option value="">Select...</option>
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>
                  {LOCATION_LABELS[l]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="assigned_to" className={labelClass}>
              Assign to
            </label>
            <select
              id="assigned_to"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className={selectClass}
            >
              <option value="">Unassigned</option>
              {users
                .filter((u) => u.role !== 'admin')
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                    {u.trade_type ? ` (${u.trade_type})` : ''}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Due date */}
        <div className="max-w-[50%]">
          <label htmlFor="due_date" className={labelClass}>
            Due date
          </label>
          <input
            id="due_date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-lg bg-stone-800 py-2.5 text-sm font-medium text-white hover:bg-stone-700 active:bg-stone-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Task'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="px-5 py-2.5 rounded-lg border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
