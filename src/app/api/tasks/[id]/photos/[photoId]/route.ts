import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth';

type Params = { params: Promise<{ id: string; photoId: string }> };

export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { id, photoId } = await params;

  // Fetch the photo record
  const { data: photo, error: fetchError } = await supabaseAdmin
    .from('task_photos')
    .select('id, task_id, storage_path, uploaded_by')
    .eq('id', photoId)
    .eq('task_id', id)
    .single();

  if (fetchError || !photo) {
    return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
  }

  // Permission: admin can delete any, others can only delete their own
  if (session.role !== 'admin' && photo.uploaded_by !== session.userId) {
    return NextResponse.json({ error: 'Not authorised' }, { status: 403 });
  }

  // Delete from storage
  await supabaseAdmin.storage.from('task-photos').remove([photo.storage_path]);

  // Delete database record
  const { error: deleteError } = await supabaseAdmin
    .from('task_photos')
    .delete()
    .eq('id', photoId);

  if (deleteError) {
    console.error('Error deleting photo:', deleteError);
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
