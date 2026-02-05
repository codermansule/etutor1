-- Migration: Phase 4 AI Tutor & Gamification
-- Gamification Engine (XP, Levels, Badges, Streaks, Leaderboards)
-- AI Tutor (Chat, RAG, Quizzes, Study Plans, Knowledge State)

-- Enable vector extension for RAG
CREATE EXTENSION IF NOT EXISTS vector;

-------------------------------------------------------------------------------
-- 1. levels
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number integer NOT NULL UNIQUE,
  title text NOT NULL,
  xp_threshold integer NOT NULL,
  perks jsonb DEFAULT '[]'::jsonb,
  icon text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Levels are viewable by everyone" ON public.levels FOR SELECT USING (true);

-- Seed initial levels
INSERT INTO public.levels (number, title, xp_threshold, icon) VALUES
  (1, 'Novice Learner', 0, 'baby'),
  (2, 'Dedicated Student', 500, 'pencil'),
  (3, 'Knowledge Seeker', 1200, 'search'),
  (4, 'Scholar in Training', 2500, 'book'),
  (5, 'Academic Pioneer', 5000, 'map'),
  (6, 'Sage Initiate', 10000, 'sparkles'),
  (7, 'Master of Thought', 20000, 'brain'),
  (8, 'Global Educator', 40000, 'globe'),
  (9, 'Legendary Mentor', 75000, 'crown'),
  (10, 'Zenith of Wisdom', 150000, 'gem')
ON CONFLICT (number) DO NOTHING;

-------------------------------------------------------------------------------
-- 2. user_xp
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_xp (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_xp integer DEFAULT 0,
  current_level integer DEFAULT 1,
  coins integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_user_xp_total_xp ON public.user_xp (total_xp DESC);

ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own XP" ON public.user_xp FOR SELECT USING (auth.uid() = id);
CREATE POLICY "XP is public for leaderboards" ON public.user_xp FOR SELECT USING (true);

-------------------------------------------------------------------------------
-- 3. xp_transactions
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.xp_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN (
    'lesson_completed', 'quiz_completed', 'streak_bonus', 'review_written', 
    'referral', 'challenge_completed', 'badge_earned', 'daily_login', 'system'
  )),
  xp_amount integer NOT NULL,
  coins_amount integer DEFAULT 0,
  reference_id uuid,
  reference_type text,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_xp_transactions_user_id ON public.xp_transactions (user_id);
CREATE INDEX idx_xp_transactions_created_at ON public.xp_transactions (created_at DESC);

ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own XP transactions" ON public.xp_transactions FOR SELECT USING (auth.uid() = user_id);

-------------------------------------------------------------------------------
-- 4. badges
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  icon text NOT NULL,
  category text NOT NULL CHECK (category IN ('learning', 'social', 'achievement', 'streak', 'special')),
  rarity text NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  criteria jsonb NOT NULL,
  xp_reward integer DEFAULT 0,
  coin_reward integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Badges are viewable by everyone" ON public.badges FOR SELECT USING (true);

-- Seed some initial badges
INSERT INTO public.badges (name, description, icon, category, rarity, criteria, xp_reward, coin_reward) VALUES
  ('First Step', 'Complete your first tutoring session.', 'star', 'learning', 'common', '{"lessons": 1}', 50, 10),
  ('Quick Learner', 'Complete 5 lessons.', 'zap', 'learning', 'common', '{"lessons": 5}', 200, 50),
  ('Dedicated Learner', 'Complete 25 lessons.', 'award', 'learning', 'uncommon', '{"lessons": 25}', 1000, 250),
  ('Knowledge Master', 'Complete 100 lessons.', 'crown', 'learning', 'rare', '{"lessons": 100}', 5000, 1000),
  ('Social Butterfly', 'Write 5 tutor reviews.', 'message-circle', 'social', 'common', '{"reviews": 5}', 100, 25),
  ('Week on Fire', 'Maintain a 7-day learning streak.', 'flame', 'streak', 'uncommon', '{"streak": 7}', 150, 40),
  ('Persistence Pays', 'Maintain a 30-day learning streak.', 'ice-cube', 'streak', 'rare', '{"streak": 30}', 1000, 200)
ON CONFLICT (name) DO NOTHING;

-------------------------------------------------------------------------------
-- 5. user_badges
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  UNIQUE (user_id, badge_id)
);

CREATE INDEX idx_user_badges_user_id ON public.user_badges (user_id);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User badges are public" ON public.user_badges FOR SELECT USING (true);

-------------------------------------------------------------------------------
-- 6. user_streaks
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_streaks (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_activity_date date,
  freeze_count integer DEFAULT 2,
  freeze_used_this_month integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own streaks" ON public.user_streaks FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Streaks are public for leaderboards" ON public.user_streaks FOR SELECT USING (true);

-------------------------------------------------------------------------------
-- 7. leaderboard_entries
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leaderboard_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  period_type text NOT NULL CHECK (period_type IN ('weekly', 'monthly', 'all_time')),
  period_start date,
  xp_earned integer DEFAULT 0,
  rank integer,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, period_type, period_start, subject_id)
);

CREATE INDEX idx_leaderboard_query ON public.leaderboard_entries (period_type, period_start, xp_earned DESC);

ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leaderboards are viewable by everyone" ON public.leaderboard_entries FOR SELECT USING (true);

-------------------------------------------------------------------------------
-- 8. challenges
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  challenge_type text NOT NULL CHECK (challenge_type IN ('lessons', 'quizzes', 'streak', 'xp', 'custom')),
  target_value integer NOT NULL,
  xp_reward integer DEFAULT 0,
  coin_reward integer DEFAULT 0,
  badge_reward_id uuid REFERENCES public.badges(id) ON DELETE SET NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Challenges are viewable by everyone" ON public.challenges FOR SELECT USING (true);

-------------------------------------------------------------------------------
-- 9. user_challenges
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  current_value integer DEFAULT 0,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  joined_at timestamptz DEFAULT now(),
  UNIQUE (user_id, challenge_id)
);

ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own challenges" ON public.user_challenges FOR SELECT USING (auth.uid() = user_id);

-------------------------------------------------------------------------------
-- 10. ai_conversations
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  title text,
  mode text NOT NULL DEFAULT 'chat' CHECK (mode IN ('chat', 'socratic', 'quiz', 'study_plan')),
  is_active boolean DEFAULT true,
  message_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_ai_conversations_user_id ON public.ai_conversations (user_id);

ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their AI conversations" ON public.ai_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create AI conversations" ON public.ai_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);

-------------------------------------------------------------------------------
-- 11. ai_messages
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  tokens_used integer,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_ai_messages_conversation_id ON public.ai_messages (conversation_id);

ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their AI messages" ON public.ai_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.ai_conversations WHERE id = ai_messages.conversation_id AND user_id = auth.uid())
);
CREATE POLICY "Users can send AI messages" ON public.ai_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.ai_conversations WHERE id = conversation_id AND user_id = auth.uid())
);

-------------------------------------------------------------------------------
-- 12. ai_quizzes
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  title text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'adaptive')),
  questions jsonb NOT NULL,
  question_count integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.ai_quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their AI quizzes" ON public.ai_quizzes FOR SELECT USING (auth.uid() = user_id);

-------------------------------------------------------------------------------
-- 13. ai_quiz_attempts
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.ai_quizzes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  answers jsonb NOT NULL,
  score numeric(5,2) NOT NULL,
  correct_count integer NOT NULL,
  total_count integer NOT NULL,
  time_spent_seconds integer,
  completed_at timestamptz DEFAULT now()
);

ALTER TABLE public.ai_quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their quiz attempts" ON public.ai_quiz_attempts FOR SELECT USING (auth.uid() = user_id);

-------------------------------------------------------------------------------
-- 14. user_knowledge_state
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_knowledge_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  topic text NOT NULL,
  mastery_level numeric(5,2) DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 100),
  questions_attempted integer DEFAULT 0,
  questions_correct integer DEFAULT 0,
  last_assessed_at timestamptz,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, subject_id, topic)
);

ALTER TABLE public.user_knowledge_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their knowledge state" ON public.user_knowledge_state FOR SELECT USING (auth.uid() = user_id);

-------------------------------------------------------------------------------
-- 15. study_plans
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.study_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  title text NOT NULL,
  plan jsonb NOT NULL,
  duration_weeks integer,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  progress numeric(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their study plans" ON public.study_plans FOR SELECT USING (auth.uid() = user_id);

-------------------------------------------------------------------------------
-- 16. knowledge_documents (RAG)
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.knowledge_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  title text NOT NULL,
  content text NOT NULL,
  embedding vector(1536),
  metadata jsonb DEFAULT '{}'::jsonb,
  chunk_index integer,
  source_url text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_knowledge_docs_embedding ON public.knowledge_documents USING ivfflat (embedding vector_cosine_ops);

ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can read knowledge documents for AI context" ON public.knowledge_documents FOR SELECT USING (true);

-------------------------------------------------------------------------------
-- Triggers and Functions
-------------------------------------------------------------------------------

-- Function to handle level up when XP changes
CREATE OR REPLACE FUNCTION public.calculate_level()
RETURNS TRIGGER AS $$
DECLARE
  new_level integer;
BEGIN
  SELECT number INTO new_level
  FROM public.levels
  WHERE xp_threshold <= NEW.total_xp
  ORDER BY xp_threshold DESC
  LIMIT 1;

  NEW.current_level := COALESCE(new_level, 1);
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_xp_change
  BEFORE UPDATE OF total_xp ON public.user_xp
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_level();

-- Function to initialize user_xp and user_streaks on profile creation
CREATE OR REPLACE FUNCTION public.init_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_xp (id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO public.user_streaks (id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profile_created_stats
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.init_user_stats();

-- Enable Realtime for Gamification
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_xp;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_badges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_streaks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_challenges;
