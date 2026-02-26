'use client';

import { useState } from 'react';
import { TaskSubtask } from '@/lib/types';

interface SubtaskChecklistProps {
  taskId: string;
  subtasks: TaskSubtask[];
}

export default function SubtaskChecklist({ taskId, subtasks: initial }: SubtaskChecklistProps) {
  const [subtasks, setSubtasks] = useState(initial);
  const [updating, setUpdating] = useState<string | null>(null);

  if (subtasks.length === 0) return null;

  const doneCount = subtasks.filter((s) => s.is_done).length;

  async function toggleSubtask(subtaskId: string, currentDone: boolean) {
    setUpdating(subtaskId);
    try {
      const res = await fetch(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_done: !currentDone }),
      });

      if (res.ok) {
        setSubtasks((prev) =>
          prev.map((s) =>
            s.id === subtaskId ? { ...s, is_done: !currentDone } : s
          )
        );
      }
    } catch {
      // silently fail
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-fw-text/50">Sub-tasks</p>
        <span className="text-xs text-fw-text/40">{doneCount}/{subtasks.length}</span>
      </div>
      {/* Progress bar */}
      <div className="w-full h-1.5 bg-fw-bg rounded-full mb-3">
        <div
          className="h-1.5 bg-fw-accent rounded-full transition-all"
          style={{ width: `${(doneCount / subtasks.length) * 100}%` }}
        />
      </div>
      <div className="space-y-2">
        {subtasks.map((st) => (
          <button
            key={st.id}
            type="button"
            onClick={() => toggleSubtask(st.id, st.is_done)}
            disabled={updating === st.id}
            className="flex items-center gap-3 w-full text-left py-1.5 group disabled:opacity-50"
          >
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition ${
                st.is_done
                  ? 'bg-fw-accent border-fw-accent'
                  : 'border-fw-text/30 group-hover:border-fw-accent'
              }`}
            >
              {st.is_done && (
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </div>
            <span className={`text-sm ${st.is_done ? 'text-fw-text/40 line-through' : 'text-fw-text'}`}>
              {st.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
