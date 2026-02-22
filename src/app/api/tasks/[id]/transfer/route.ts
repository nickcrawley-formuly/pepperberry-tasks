import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth';
import { logActivity } from '@/lib/activity';
import { sendPushToUser } from '@/lib/notifications';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { assigned_to, comment } = body;

  if (!assigned_to || typeof assigned_to !== 'string') {
    return NextResponse.json({ error: 'assigned_to is required' }, { status: 400 });
  }
  if (!comment || !comment.trim()) {
    return NextResponse.json({ error: 'A comment explaining the transfer is required' }, { status: 400 });
  }

  // Verify the user has access to this task
  const { data: task, error: fetchError } = await supabaseAdmin
    .from('tasks')
    .select('id, title, assigned_to, category')
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

  // Look up new assignee name
  const { data: newUser, error: userError } = await supabaseAdmin
    .from('users')
    .select('id, name')
    .eq('id', assigned_to)
    .eq('is_active', true)
    .single();

  if (userError || !newUser) {
    return NextResponse.json({ error: 'Target user not found' }, { status: 400 });
  }

  // Update task assigned_to
  const { error: updateError } = await supabaseAdmin
    .from('tasks')
    .update({ assigned_to })
    .eq('id', id);

  if (updateError) {
    return NextResponse.json({ error: 'Failed to transfer task' }, { status: 500 });
  }

  // Insert transfer comment
  await supabaseAdmin
    .from('task_comments')
    .insert({
      task_id: id,
      user_id: session.userId,
      content: `Transferred to ${newUser.name}: ${comment.trim()}`,
    });

  // Log activity
  logActivity(id, session.userId, 'transferred', `Transferred to ${newUser.name}`);

  // Notify new assignee
  sendPushToUser(assigned_to, {
    title: 'Task transferred to you',
    body: `"${task.title}" — ${comment.trim()}`,
    url: `/tasks/${id}`,
  });

  return NextResponse.json({ ok: true });
}
