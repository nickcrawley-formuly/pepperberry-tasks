import webpush from 'web-push';
import { supabaseAdmin } from '@/lib/supabase/admin';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
}

/**
 * Send a push notification to all devices registered to a user.
 * Silently cleans up expired/invalid subscriptions.
 */
export async function sendPushToUser(userId: string, payload: NotificationPayload) {
  const { data: subscriptions, error } = await supabaseAdmin
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', userId);

  if (error || !subscriptions || subscriptions.length === 0) return;

  const jsonPayload = JSON.stringify(payload);

  const results = await Promise.allSettled(
    subscriptions.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        jsonPayload
      )
    )
  );

  // Clean up expired subscriptions (410 Gone or 404)
  const expiredIds: string[] = [];
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      const statusCode = (result.reason as { statusCode?: number })?.statusCode;
      if (statusCode === 410 || statusCode === 404) {
        expiredIds.push(subscriptions[index].id);
      }
    }
  });

  if (expiredIds.length > 0) {
    await supabaseAdmin
      .from('push_subscriptions')
      .delete()
      .in('id', expiredIds);
  }
}

/**
 * Send a push notification to multiple users, excluding one (the actor).
 */
export async function notifyUsersExcluding(
  userIds: string[],
  excludeUserId: string,
  payload: NotificationPayload
) {
  const recipients = Array.from(new Set(userIds.filter((id) => id && id !== excludeUserId)));
  await Promise.allSettled(
    recipients.map((userId) => sendPushToUser(userId, payload))
  );
}
