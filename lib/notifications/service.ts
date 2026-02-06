import { createServerClient } from '@/lib/supabase/server';

export type NotificationType =
    | 'lesson_reminder'
    | 'booking_confirmed'
    | 'badge_earned'
    | 'xp_milestone'
    | 'system'
    | 'message';

interface SendNotificationOptions {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    link?: string;
}

/**
 * Sends an internal notification to a user.
 * In a production app, this would also trigger push/email via Brevo SMTP/WebPush.
 */
export async function sendNotification({
    userId,
    title,
    message,
    type,
    link
}: SendNotificationOptions) {
    const supabase = await createServerClient();

    const { data, error } = await supabase
        .from('notifications')
        .insert({
            user_id: userId,
            title,
            message,
            type,
            link,
            is_read: false
        })
        .select()
        .single();

    if (error) {
        console.error('Failed to send notification:', error);
        return null;
    }

    // Best-effort push notification
    try {
        const { sendPushNotification } = await import('./web-push');
        await sendPushNotification(userId, title, message, link);
    } catch {
        // Push notification is best-effort
    }

    return data;
}

/**
 * Marks a notification as read.
 */
export async function markAsRead(notificationId: string) {
    const supabase = await createServerClient();
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

    return !error;
}
