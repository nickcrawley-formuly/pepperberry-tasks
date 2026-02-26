import { supabaseAdmin } from '@/lib/supabase/admin';
import { SessionPayload } from '@/lib/auth';
import { Task } from '@/lib/types';

export async function fetchTasks(session: SessionPayload): Promise<Task[]> {
  let query = supabaseAdmin
    .from('tasks')
    .select(`
      *,
      assigned_user:users!tasks_assigned_to_fkey(name),
      created_user:users!tasks_created_by_fkey(name)
    `)
    .order('created_at', { ascending: false });

  // Role-based filtering
  if (session.role === 'tradesperson') {
    query = query.eq('assigned_to', session.userId);
  } else if (session.role === 'riding_school') {
    query = query.eq('category', 'riding_school');
  }
  // Admins see everything — no filter

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }

  const tasks = data as Task[];

  // Fetch subtask counts for all tasks
  if (tasks.length > 0) {
    const taskIds = tasks.map((t) => t.id);
    const { data: subtaskData } = await supabaseAdmin
      .from('task_subtasks')
      .select('task_id, is_done')
      .in('task_id', taskIds);

    if (subtaskData) {
      const countMap: Record<string, { total: number; done: number }> = {};
      for (const s of subtaskData) {
        if (!countMap[s.task_id]) {
          countMap[s.task_id] = { total: 0, done: 0 };
        }
        countMap[s.task_id].total++;
        if (s.is_done) countMap[s.task_id].done++;
      }
      for (const t of tasks) {
        const counts = countMap[t.id];
        if (counts) {
          t.subtask_total = counts.total;
          t.subtask_done = counts.done;
        }
      }
    }
  }

  return tasks;
}
