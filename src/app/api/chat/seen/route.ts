import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { type } = await request.json();

  if (type !== 'board' && type !== 'dm') {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  const column = type === 'board' ? 'board_last_seen_at' : 'dm_last_seen_at';

  const { error } = await supabaseAdmin
    .from('users')
    .update({ [column]: new Date().toISOString() })
    .eq('id', session.userId);

  if (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
