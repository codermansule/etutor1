-- Migration: Notifications System
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL CHECK (type IN ('lesson_reminder', 'booking_confirmed', 'badge_earned', 'xp_milestone', 'system', 'message')),
    link text,
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Index for performance
CREATE INDEX idx_notifications_user_id_unread ON public.notifications (user_id) WHERE is_read = false;
CREATE INDEX idx_notifications_created_at ON public.notifications (created_at DESC);

-- RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
