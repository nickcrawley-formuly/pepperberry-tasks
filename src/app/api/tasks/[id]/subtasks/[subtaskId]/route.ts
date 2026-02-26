import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth';

type Params = { params: Promise<{ id: string; subtaskId: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { id, subtaskId } = await params;
  const body = await request.json();

  // Verify the task exists and user has access
  const { data: task, error: taskError } = await supabaseAdmin
    .from('tasks')
    .select('id, assigned_to, category')
    .eq('id', id)
    .single();

  if (taskError || !task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  if (session.role === 'tradesperson' && task.assigned_to !== session.userId) {
    return NextResponse.json({ error: 'Not authorised' }, { status: 403 });
  }
  if (session.role === 'riding_school' && task.category !== 'riding_school') {
    return NextResponse.json({ error: 'Not authorised' }, { status: 403 });
  }

  // Verify subtask belongs to the task
  const { data: subtask, error: subtaskError } = await supabaseAdmin
    .from('task_subtasks')
    .select('id, task_id')
    .eq('id', subtaskId)
    .eq('task_id', id)
    .single();

  if (subtaskError || !subtask) {
    return NextResponse.json({ error: 'Sub-task not found' }, { status: 404 });
  }

  if (typeof body.is_done !== 'boolean') {
    return NextResponse.json({ error: 'is_done must be a boolean' }, { status: 400 });
  }

  const { error: updateError } = await supabaseAdmin
    .from('task_subtasks')
    .update({ is_done: body.is_done })
    .eq('id', subtaskId);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update sub-task' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
