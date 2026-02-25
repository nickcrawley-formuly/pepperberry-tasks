import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Conversation } from '@/lib/types';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  if (session.role !== 'admin' && !session.allowedSections?.includes('chat')) {
    return NextResponse.json({ error: 'Not authorised' }, { status: 403 });
  }

  // Get all DMs involving this user, with sender and recipient names
  const { data: dms, error } = await supabaseAdmin
    .from('direct_messages')
    .select('id, sender_id, recipient_id, content, created_at, sender:users!sender_id(name), recipient:users!recipient_id(name)')
    .or(`sender_id.eq.${session.userId},recipient_id.eq.${session.userId}`)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }

  // Group by conversation partner, keep only latest message per partner
  const conversationMap = new Map<string, Conversation>();

  for (const dm of dms || []) {
    const isMe = dm.sender_id === session.userId;
    const partnerId = isMe ? dm.recipient_id : dm.sender_id;
    const partnerName = isMe
      ? (dm.recipient as unknown as { name: string } | null)?.name || 'Unknown'
      : (dm.sender as unknown as { name: string } | null)?.name || 'Unknown';

    if (!conversationMap.has(partnerId)) {
      conversationMap.set(partnerId, {
        user_id: partnerId,
        user_name: partnerName,
        last_message: dm.content,
        last_message_at: dm.created_at,
      });
    }
  }

  const conversations = Array.from(conversationMap.values())
    .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());

  return NextResponse.json(conversations);
}
