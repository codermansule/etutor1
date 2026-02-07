import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { captureError } from '@/lib/monitoring/sentry';
import { pushSubscribeSchema, pushUnsubscribeSchema, parseBody } from '@/lib/validations/api-schemas';

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const parsed = parseBody(pushSubscribeSchema, await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const { subscription } = parsed.data;

    // Upsert subscription
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
        { onConflict: 'user_id,endpoint' }
      );

    if (error) {
      // If upsert fails due to no unique constraint on endpoint, try insert
      await supabase.from('push_subscriptions').insert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    captureError(error, { route: 'POST /api/notifications/subscribe' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const parsed = parseBody(pushUnsubscribeSchema, await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const { endpoint } = parsed.data;

    await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .eq('endpoint', endpoint);

    return NextResponse.json({ success: true });
  } catch (error) {
    captureError(error, { route: 'DELETE /api/notifications/subscribe' });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
