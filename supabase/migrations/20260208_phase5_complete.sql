-- Phase 5 Complete Migration
-- All new tables for: Rewards Store, Subscriptions/AI Usage, Courses, Push Notifications, Tutor Gamification

-------------------------------------------------------------------------------
-- 1. REWARDS STORE
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  reward_type text NOT NULL CHECK (reward_type IN ('discount', 'free_lesson', 'profile_theme', 'profile_frame', 'badge', 'streak_freeze')),
  coin_cost integer NOT NULL,
  value jsonb DEFAULT '{}'::jsonb,
  stock integer,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rewards are viewable by everyone" ON public.rewards FOR SELECT USING (true);

-- Seed reward items
INSERT INTO public.rewards (name, description, reward_type, coin_cost, value, stock) VALUES
  ('10% Discount', 'Get 10% off your next lesson booking.', 'discount', 50, '{"percent": 10}', NULL),
  ('25% Discount', 'Get 25% off your next lesson booking.', 'discount', 100, '{"percent": 25}', NULL),
  ('Free Trial Lesson', 'Redeem a free 30-minute trial lesson with any tutor.', 'free_lesson', 200, '{"minutes": 30}', NULL),
  ('Gold Frame', 'A prestigious gold frame for your profile avatar.', 'profile_frame', 150, '{"frame": "gold"}', NULL),
  ('Diamond Frame', 'An exclusive diamond frame for your profile avatar.', 'profile_frame', 300, '{"frame": "diamond"}', NULL),
  ('Neon Theme', 'Unlock the neon glow theme for your dashboard.', 'profile_theme', 100, '{"theme": "neon"}', NULL),
  ('Aurora Theme', 'Unlock the aurora borealis theme for your dashboard.', 'profile_theme', 200, '{"theme": "aurora"}', NULL),
  ('Streak Freeze', 'Protect your streak for one day if you miss a login.', 'streak_freeze', 75, '{"days": 1}', NULL)
ON CONFLICT DO NOTHING;

-------------------------------------------------------------------------------
-- 2. USER_REWARDS
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reward_id uuid NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
  redeemed_at timestamptz DEFAULT now(),
  used boolean DEFAULT false,
  used_at timestamptz,
  expires_at timestamptz
);

CREATE INDEX idx_user_rewards_user_id ON public.user_rewards (user_id);

ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own rewards" ON public.user_rewards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can redeem rewards" ON public.user_rewards FOR INSERT WITH CHECK (auth.uid() = user_id);

-------------------------------------------------------------------------------
-- 3. SUBSCRIPTIONS
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'premium')),
  stripe_subscription_id text,
  stripe_customer_id text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Auto-insert free subscription on profile creation
CREATE OR REPLACE FUNCTION public.init_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, status) VALUES (NEW.id, 'free', 'active') ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profile_created_subscription
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.init_user_subscription();

-------------------------------------------------------------------------------
-- 4. AI_USAGE
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  usage_date date NOT NULL DEFAULT CURRENT_DATE,
  message_count integer DEFAULT 0,
  quiz_count integer DEFAULT 0,
  UNIQUE (user_id, usage_date)
);

ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own AI usage" ON public.ai_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own AI usage" ON public.ai_usage FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own AI usage" ON public.ai_usage FOR UPDATE USING (auth.uid() = user_id);

-------------------------------------------------------------------------------
-- 5. TUTOR GAMIFICATION: ALTER xp_transactions CHECK + seed tutor badges
-------------------------------------------------------------------------------
-- Drop and re-add the CHECK constraint to include new tutor events
ALTER TABLE public.xp_transactions DROP CONSTRAINT IF EXISTS xp_transactions_event_type_check;
ALTER TABLE public.xp_transactions ADD CONSTRAINT xp_transactions_event_type_check
  CHECK (event_type IN (
    'lesson_completed', 'quiz_completed', 'streak_bonus', 'review_written',
    'referral', 'challenge_completed', 'badge_earned', 'daily_login', 'system',
    'lesson_delivered', 'student_review_received', 'tutor_milestone'
  ));

-- Seed tutor badges
INSERT INTO public.badges (name, description, icon, category, rarity, criteria, xp_reward, coin_reward) VALUES
  ('First Lesson Taught', 'Deliver your first tutoring lesson.', 'presentation', 'achievement', 'common', '{"lessons_taught": 1}', 50, 10),
  ('Popular Tutor', 'Receive 10 student reviews.', 'users', 'social', 'uncommon', '{"reviews_received": 10}', 200, 50),
  ('Star Tutor', 'Achieve an average rating of 4.5 or higher.', 'star', 'achievement', 'rare', '{"avg_rating": 4.5}', 500, 100),
  ('Veteran', 'Deliver 50 tutoring lessons.', 'medal', 'achievement', 'epic', '{"lessons_taught": 50}', 1000, 200)
ON CONFLICT (name) DO NOTHING;

-- Also seed the Zenith badge if it's missing from original migration
INSERT INTO public.badges (name, description, icon, category, rarity, criteria, xp_reward, coin_reward) VALUES
  ('Zenith', 'Reach Level 10 — the pinnacle of achievement.', 'gem', 'achievement', 'legendary', '{"level": 10}', 2000, 500)
ON CONFLICT (name) DO NOTHING;

-------------------------------------------------------------------------------
-- 6. COURSES
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid NOT NULL REFERENCES public.tutor_profiles(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  thumbnail_url text,
  price numeric(10,2),
  is_free boolean DEFAULT false,
  level text NOT NULL DEFAULT 'all_levels' CHECK (level IN ('beginner', 'intermediate', 'advanced', 'all_levels')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  enrolled_count integer DEFAULT 0,
  lesson_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_courses_tutor_id ON public.courses (tutor_id);
CREATE INDEX idx_courses_slug ON public.courses (slug);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published courses are viewable by everyone" ON public.courses FOR SELECT USING (status = 'published' OR tutor_id = auth.uid());
CREATE POLICY "Tutors can create courses" ON public.courses FOR INSERT WITH CHECK (tutor_id = auth.uid());
CREATE POLICY "Tutors can update their own courses" ON public.courses FOR UPDATE USING (tutor_id = auth.uid());
CREATE POLICY "Tutors can delete their own draft courses" ON public.courses FOR DELETE USING (tutor_id = auth.uid() AND status = 'draft');

-------------------------------------------------------------------------------
-- 7. COURSE_LESSONS
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.course_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  content text,
  video_url text,
  sort_order integer NOT NULL DEFAULT 0,
  duration_minutes integer,
  is_free_preview boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_course_lessons_course_id ON public.course_lessons (course_id);

ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Course lessons viewable by enrolled students or tutor" ON public.course_lessons FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = course_lessons.course_id
    AND (
      c.tutor_id = auth.uid()
      OR c.status = 'published'
    )
  )
);
CREATE POLICY "Tutors can manage course lessons" ON public.course_lessons FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND tutor_id = auth.uid())
);
CREATE POLICY "Tutors can update course lessons" ON public.course_lessons FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND tutor_id = auth.uid())
);
CREATE POLICY "Tutors can delete course lessons" ON public.course_lessons FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND tutor_id = auth.uid())
);

-------------------------------------------------------------------------------
-- 8. COURSE_ENROLLMENTS
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  progress numeric(5,2) DEFAULT 0,
  completed_lessons jsonb DEFAULT '[]'::jsonb,
  enrolled_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (student_id, course_id)
);

CREATE INDEX idx_course_enrollments_student_id ON public.course_enrollments (student_id);

ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own enrollments" ON public.course_enrollments FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Users can enroll in courses" ON public.course_enrollments FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Users can update their own enrollments" ON public.course_enrollments FOR UPDATE USING (auth.uid() = student_id);

-------------------------------------------------------------------------------
-- 9. PUSH_SUBSCRIPTIONS
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_push_subscriptions_user_id ON public.push_subscriptions (user_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own push subscriptions" ON public.push_subscriptions FOR ALL USING (auth.uid() = user_id);

-- Allow service role to insert ai_usage (for API routes)
CREATE POLICY "Service role can manage AI usage" ON public.ai_usage FOR ALL USING (true) WITH CHECK (true);
