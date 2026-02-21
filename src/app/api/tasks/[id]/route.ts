import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status } = body;

  if (!status || !['todo', 'in_progress', 'done'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  // Verify the user has access to this task
  const { data: task, error: fetchError } = await supabaseAdmin
    .from('tasks')
    .select('id, assigned_to, category')
    .eq('id', id)
    .single();

  if (fetchError || !task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  // Permission check
  if (session.role === 'tradesperson' && task.assigned_to !== session.userId) {
    return NextResponse.json({ error: 'Not authorised' }, { status: 403 });
  }
  if (session.role === 'riding_school' && task.category !== 'riding_school') {
    return NextResponse.json({ error: 'Not authorised' }, { status: 403 });
  }

  const { error: updateError } = await supabaseAdmin
    .from('tasks')
    .update({ status })
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
