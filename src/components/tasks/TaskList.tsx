'use client';

import { useState } from 'react';
import { Task } from '@/lib/types';
import TaskCard from './TaskCard';
import TaskFilters from './TaskFilters';

interface TaskListProps {
  tasks: Task[];
}

export default function TaskList({ tasks }: TaskListProps) {
  const [activeStatus, setActiveStatus] = useState('all');

  const counts = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  const filtered =
    activeStatus === 'all'
      ? tasks
      : tasks.filter((t) => t.status === activeStatus);

  return (
    <div>
      <TaskFilters
        activeStatus={activeStatus}
        onStatusChange={setActiveStatus}
        counts={counts}
      />

      <div className="mt-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-stone-500">No tasks found</p>
          </div>
        ) : (
          filtered.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}
