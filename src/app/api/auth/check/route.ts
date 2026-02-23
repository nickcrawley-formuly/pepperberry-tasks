import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false });
  }

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('is_active')
    .eq('id', session.userId)
    .single();

  if (!user || !user.is_active) {
    return NextResponse.json({ ok: false });
  }

  return NextResponse.json({ ok: true });
}
