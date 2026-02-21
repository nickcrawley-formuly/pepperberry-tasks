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

  return data as Task[];
}
