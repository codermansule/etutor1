-- Migration: Gamification fixes
-- 1. Add missing "Zenith" badge
-- 2. Add RLS insert/update policies for gamification tables
-- 3. Add RLS insert policy for ai_quiz_attempts

-------------------------------------------------------------------------------
-- 1. Missing badge: Zenith
-------------------------------------------------------------------------------
INSERT INTO public.badges (name, description, icon, category, rarity, criteria, xp_reward, coin_reward) VALUES
  ('Zenith', 'Reach Level 10.', 'gem', 'achievement', 'legendary', '{"level": 10}', 10000, 2000)
ON CONFLICT (name) DO NOTHING;

-------------------------------------------------------------------------------
-- 2. RLS policies for xp_transactions (users can insert their own)
-------------------------------------------------------------------------------
CREATE POLICY "Users can insert their own XP transactions"
  ON public.xp_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-------------------------------------------------------------------------------
-- 3. RLS policies for user_xp (users can update their own)
-------------------------------------------------------------------------------
CREATE POLICY "Users can update their own XP"
  ON public.user_xp FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-------------------------------------------------------------------------------
-- 4. RLS policies for user_streaks (users can update their own)
-------------------------------------------------------------------------------
CREATE POLICY "Users can update their own streaks"
  ON public.user_streaks FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Also allow insert for edge case where trigger didn't fire
CREATE POLICY "Users can insert their own streaks"
  ON public.user_streaks FOR INSERT
  WITH CHECK (auth.uid() = id);

-------------------------------------------------------------------------------
-- 5. RLS policies for user_badges (users can insert their own)
-------------------------------------------------------------------------------
CREATE POLICY "Users can insert their own badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-------------------------------------------------------------------------------
-- 6. RLS policy for ai_quiz_attempts (users can insert their own)
-------------------------------------------------------------------------------
CREATE POLICY "Users can insert their own quiz attempts"
  ON public.ai_quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-------------------------------------------------------------------------------
-- 7. RLS policies for user_challenges (insert + update own)
-------------------------------------------------------------------------------
CREATE POLICY "Users can join challenges"
  ON public.user_challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenge progress"
  ON public.user_challenges FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-------------------------------------------------------------------------------
-- 8. Seed active challenges
-------------------------------------------------------------------------------
INSERT INTO public.challenges (title, description, challenge_type, target_value, xp_reward, coin_reward, starts_at, ends_at, is_active) VALUES
  ('The Marathon Learner', 'Complete 5 tutoring sessions this week.', 'lessons', 5, 500, 100, now(), now() + interval '7 days', true),
  ('Quiz Master', 'Complete 10 quizzes this month.', 'quizzes', 10, 300, 75, now(), now() + interval '30 days', true),
  ('Streak Champion', 'Maintain a 14-day learning streak.', 'streak', 14, 400, 80, now(), now() + interval '30 days', true)
ON CONFLICT DO NOTHING;
