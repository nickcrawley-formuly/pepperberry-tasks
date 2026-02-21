import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth';
import { CATEGORIES, LOCATIONS, PRIORITIES } from '@/lib/constants';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Only admins can create tasks' }, { status: 403 });
  }

  const body = await request.json();
  const { title, description, priority, category, location, assigned_to, due_date } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }
  if (!category || !CATEGORIES.includes(category)) {
    return NextResponse.json({ error: 'Valid category is required' }, { status: 400 });
  }
  if (!location || !LOCATIONS.includes(location)) {
    return NextResponse.json({ error: 'Valid location is required' }, { status: 400 });
  }
  if (priority && !PRIORITIES.includes(priority)) {
    return NextResponse.json({ error: 'Invalid priority' }, { status: 400 });
  }

  const { data: task, error } = await supabaseAdmin
    .from('tasks')
    .insert({
      title: title.trim(),
      description: description?.trim() || null,
      priority: priority || 'medium',
      category,
      location,
      assigned_to: assigned_to || null,
      created_by: session.userId,
      due_date: due_date || null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }

  return NextResponse.json({ task }, { status: 201 });
}
