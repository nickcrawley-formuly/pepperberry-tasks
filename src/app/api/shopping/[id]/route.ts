import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  if (session.role !== 'admin' && !session.allowedSections?.includes('cart')) {
    return NextResponse.json({ error: 'Not authorised' }, { status: 403 });
  }

  const { id } = await params;
  const { is_bought } = await request.json();

  if (typeof is_bought !== 'boolean') {
    return NextResponse.json({ error: 'is_bought must be a boolean' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('shopping_items')
    .update({ is_bought })
    .eq('id', id)
    .select('*, adder:users!added_by(name), assignee:users!assigned_to(name)')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Only admins can delete shopping items
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorised' }, { status: 403 });
  }

  const { id } = await params;

  const { error } = await supabaseAdmin
    .from('shopping_items')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
