import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth';
import { STATUS_LABELS, PRIORITY_LABELS } from '@/lib/constants';

function escapeCSV(value: string | null | undefined): string {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { data: tasks, error } = await supabaseAdmin
    .from('tasks')
    .select('*, assigned_user:users!tasks_assigned_to_fkey(name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export tasks' }, { status: 500 });
  }

  const headers = [
    'Title',
    'Description',
    'Status',
    'Priority',
    'Category',
    'Location',
    'Assigned To',
    'Due Date',
    'Created',
    'Completed',
  ];

  const rows = (tasks || []).map((t) => [
    escapeCSV(t.title),
    escapeCSV(t.description),
    escapeCSV(STATUS_LABELS[t.status] || t.status),
    escapeCSV(PRIORITY_LABELS[t.priority] || t.priority),
    escapeCSV(t.category),
    escapeCSV(t.location),
    escapeCSV(t.assigned_user?.name),
    escapeCSV(t.due_date),
    escapeCSV(t.created_at?.split('T')[0]),
    escapeCSV(t.completed_at?.split('T')[0]),
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const today = new Date().toISOString().split('T')[0];

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="pepperberry-tasks-${today}.csv"`,
    },
  });
}
