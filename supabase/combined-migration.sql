-- ============================================================
-- ETUTOR Combined Migration + Seed
-- Paste this entire file into Supabase Dashboard > SQL Editor > Run
-- ============================================================

-- ============================================================
-- MIGRATION 1: PROFILES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'tutor', 'admin')),
  timezone text DEFAULT 'UTC',
  bio text,
  phone text,
  country text,
  preferred_language text DEFAULT 'en',
  onboarding_completed boolean DEFAULT false,
  is_active boolean DEFAULT true,
  last_seen_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_fts ON public.profiles USING GIN (to_tsvector('english', full_name));

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public profiles are viewable by everyone' AND tablename = 'profiles') THEN
    CREATE POLICY "Public profiles are viewable by everyone"
      ON public.profiles FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile' AND tablename = 'profiles') THEN
    CREATE POLICY "Users can update own profile"
      ON public.profiles FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own profile' AND tablename = 'profiles') THEN
    CREATE POLICY "Users can insert own profile"
      ON public.profiles FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- MIGRATION 2: SUBJECTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  parent_id uuid REFERENCES public.subjects(id),
  category text CHECK (category IN ('languages', 'academics', 'professional', 'test-prep', 'arts', 'technology')),
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subjects_slug ON public.subjects (slug);
CREATE INDEX IF NOT EXISTS idx_subjects_category ON public.subjects (category);
CREATE INDEX IF NOT EXISTS idx_subjects_parent ON public.subjects (parent_id);
CREATE INDEX IF NOT EXISTS idx_subjects_active_sort ON public.subjects (is_active, sort_order);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Active subjects are viewable by everyone' AND tablename = 'subjects') THEN
    CREATE POLICY "Active subjects are viewable by everyone"
      ON public.subjects FOR SELECT
      USING (is_active = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage subjects' AND tablename = 'subjects') THEN
    CREATE POLICY "Admins can manage subjects"
      ON public.subjects FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;

-- ============================================================
-- MIGRATION 3: TUTOR PROFILES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.tutor_profiles (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  headline text,
  about text,
  intro_video_url text,
  hourly_rate numeric(10,2) NOT NULL,
  trial_rate numeric(10,2),
  currency text DEFAULT 'USD',
  experience_years integer,
  education jsonb DEFAULT '[]',
  certifications jsonb DEFAULT '[]',
  languages_spoken jsonb DEFAULT '[]',
  teaching_style text,
  is_verified boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  is_approved boolean DEFAULT false,
  approval_status text DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  stripe_account_id text,
  stripe_onboarded boolean DEFAULT false,
  total_lessons integer DEFAULT 0,
  total_students integer DEFAULT 0,
  average_rating numeric(3,2) DEFAULT 0,
  rating_count integer DEFAULT 0,
  response_time_hours numeric(5,2),
  completion_rate numeric(5,2) DEFAULT 100,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tutor_profiles_approved_active ON public.tutor_profiles (is_approved, id)
  WHERE is_approved = true;
CREATE INDEX IF NOT EXISTS idx_tutor_profiles_rating ON public.tutor_profiles (average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_tutor_profiles_rate ON public.tutor_profiles (hourly_rate);
CREATE INDEX IF NOT EXISTS idx_tutor_profiles_featured ON public.tutor_profiles (is_featured)
  WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_tutor_profiles_languages ON public.tutor_profiles USING GIN (languages_spoken);
CREATE INDEX IF NOT EXISTS idx_tutor_profiles_fts ON public.tutor_profiles
  USING GIN (to_tsvector('english', COALESCE(headline, '') || ' ' || COALESCE(about, '')));

DROP TRIGGER IF EXISTS tutor_profiles_updated_at ON public.tutor_profiles;
CREATE TRIGGER tutor_profiles_updated_at
  BEFORE UPDATE ON public.tutor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.tutor_profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Approved tutor profiles are viewable by everyone' AND tablename = 'tutor_profiles') THEN
    CREATE POLICY "Approved tutor profiles are viewable by everyone"
      ON public.tutor_profiles FOR SELECT
      USING (is_approved = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Tutors can view own profile' AND tablename = 'tutor_profiles') THEN
    CREATE POLICY "Tutors can view own profile"
      ON public.tutor_profiles FOR SELECT
      USING (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Tutors can update own profile' AND tablename = 'tutor_profiles') THEN
    CREATE POLICY "Tutors can update own profile"
      ON public.tutor_profiles FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Tutors can insert own profile' AND tablename = 'tutor_profiles') THEN
    CREATE POLICY "Tutors can insert own profile"
      ON public.tutor_profiles FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- ============================================================
-- MIGRATION 4: TUTOR SUBJECTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.tutor_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid NOT NULL REFERENCES public.tutor_profiles(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  proficiency_level text CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'native')),
  UNIQUE (tutor_id, subject_id)
);

CREATE INDEX IF NOT EXISTS idx_tutor_subjects_tutor ON public.tutor_subjects (tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_subjects_subject ON public.tutor_subjects (subject_id);

ALTER TABLE public.tutor_subjects ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Tutor subjects are viewable by everyone' AND tablename = 'tutor_subjects') THEN
    CREATE POLICY "Tutor subjects are viewable by everyone"
      ON public.tutor_subjects FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Tutors can insert own subjects' AND tablename = 'tutor_subjects') THEN
    CREATE POLICY "Tutors can insert own subjects"
      ON public.tutor_subjects FOR INSERT
      WITH CHECK (auth.uid() = tutor_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Tutors can delete own subjects' AND tablename = 'tutor_subjects') THEN
    CREATE POLICY "Tutors can delete own subjects"
      ON public.tutor_subjects FOR DELETE
      USING (auth.uid() = tutor_id);
  END IF;
END $$;

-- ============================================================
-- SEED DATA: SUBJECTS
-- ============================================================

-- Languages
INSERT INTO public.subjects (name, slug, description, icon, category, sort_order) VALUES
  ('English', 'english', 'General English conversation, grammar, vocabulary, and fluency practice with native and certified tutors.', 'languages', 'languages', 1),
  ('Business English', 'business-english', 'Professional English for meetings, presentations, emails, and workplace communication.', 'briefcase', 'languages', 2),
  ('Spanish', 'spanish', 'Learn Spanish from beginner to advanced — Latin American and European dialects covered.', 'languages', 'languages', 3),
  ('French', 'french', 'French language lessons for travel, work, or academic goals with native-speaking tutors.', 'languages', 'languages', 4),
  ('German', 'german', 'German language tutoring for all levels, from Goethe certificates to casual conversation.', 'languages', 'languages', 5),
  ('Mandarin Chinese', 'mandarin-chinese', 'Mandarin lessons covering speaking, reading, writing, and HSK exam preparation.', 'languages', 'languages', 6),
  ('Japanese', 'japanese', 'Japanese language learning from hiragana basics to JLPT-level grammar and conversation.', 'languages', 'languages', 7),
  ('Arabic', 'arabic', 'Modern Standard Arabic and dialect-specific tutoring for all proficiency levels.', 'languages', 'languages', 8),
  ('Korean', 'korean', 'Korean language lessons covering hangul, grammar, TOPIK prep, and conversational practice.', 'languages', 'languages', 9),
  ('Portuguese', 'portuguese', 'Brazilian and European Portuguese tutoring for beginners through advanced speakers.', 'languages', 'languages', 10),
  ('Italian', 'italian', 'Italian language lessons for travel, culture, and professional development.', 'languages', 'languages', 11),
  ('Russian', 'russian', 'Russian language tutoring covering Cyrillic script, grammar, and conversation skills.', 'languages', 'languages', 12)
ON CONFLICT (slug) DO NOTHING;

-- Academics
INSERT INTO public.subjects (name, slug, description, icon, category, sort_order) VALUES
  ('Mathematics', 'mathematics', 'Algebra, calculus, geometry, statistics, and discrete math for school and university students.', 'calculator', 'academics', 20),
  ('Physics', 'physics', 'Classical mechanics, electromagnetism, thermodynamics, and quantum physics tutoring.', 'atom', 'academics', 21),
  ('Chemistry', 'chemistry', 'Organic, inorganic, and physical chemistry with lab concept explanations.', 'flask', 'academics', 22),
  ('Biology', 'biology', 'Cell biology, genetics, ecology, anatomy, and physiology for all academic levels.', 'leaf', 'academics', 23),
  ('History', 'history', 'World history, US history, European history, and historical analysis skills.', 'book-open', 'academics', 24),
  ('Geography', 'geography', 'Physical and human geography, GIS concepts, and environmental studies.', 'globe', 'academics', 25),
  ('Economics', 'economics', 'Microeconomics, macroeconomics, and econometrics for high school and university.', 'trending-up', 'academics', 26),
  ('Psychology', 'psychology', 'Introduction to psychology, cognitive science, developmental and clinical psychology.', 'brain', 'academics', 27),
  ('Literature', 'literature', 'English literature analysis, essay writing, creative writing, and literary criticism.', 'book', 'academics', 28),
  ('Philosophy', 'philosophy', 'Ethics, logic, metaphysics, epistemology, and history of philosophy.', 'lightbulb', 'academics', 29)
ON CONFLICT (slug) DO NOTHING;

-- Professional
INSERT INTO public.subjects (name, slug, description, icon, category, sort_order) VALUES
  ('Public Speaking', 'public-speaking', 'Presentation skills, speech delivery, confidence building, and audience engagement.', 'mic', 'professional', 40),
  ('Interview Preparation', 'interview-preparation', 'Behavioral and technical interview coaching for career transitions and job seekers.', 'users', 'professional', 41),
  ('Resume Writing', 'resume-writing', 'Professional resume, CV, and cover letter writing with industry-specific guidance.', 'file-text', 'professional', 42),
  ('Project Management', 'project-management', 'PMP, Agile, Scrum, and project planning fundamentals for aspiring project managers.', 'clipboard', 'professional', 43),
  ('Data Analysis', 'data-analysis', 'Excel, SQL, Tableau, and Python for data-driven decision making and analytics.', 'bar-chart', 'professional', 44),
  ('Financial Literacy', 'financial-literacy', 'Personal finance, budgeting, investing basics, and financial planning education.', 'dollar-sign', 'professional', 45)
ON CONFLICT (slug) DO NOTHING;

-- Test Prep
INSERT INTO public.subjects (name, slug, description, icon, category, sort_order) VALUES
  ('SAT Prep', 'sat-prep', 'Comprehensive SAT preparation covering math, reading, and writing sections with practice tests.', 'target', 'test-prep', 60),
  ('ACT Prep', 'act-prep', 'ACT test preparation with section-by-section strategies and timed practice.', 'target', 'test-prep', 61),
  ('GRE Prep', 'gre-prep', 'GRE verbal reasoning, quantitative reasoning, and analytical writing preparation.', 'award', 'test-prep', 62),
  ('GMAT Prep', 'gmat-prep', 'GMAT preparation for business school applications — quant, verbal, IR, and AWA.', 'award', 'test-prep', 63),
  ('IELTS Prep', 'ielts-prep', 'IELTS Academic and General preparation for listening, reading, writing, and speaking.', 'globe', 'test-prep', 64),
  ('TOEFL Prep', 'toefl-prep', 'TOEFL iBT preparation covering all four sections with practice tests and feedback.', 'globe', 'test-prep', 65),
  ('AP Exam Prep', 'ap-exam-prep', 'Advanced Placement exam preparation across multiple subjects and scoring strategies.', 'target', 'test-prep', 66)
ON CONFLICT (slug) DO NOTHING;

-- Arts
INSERT INTO public.subjects (name, slug, description, icon, category, sort_order) VALUES
  ('Music Theory', 'music-theory', 'Fundamentals of music theory, harmony, composition, and ear training.', 'music', 'arts', 80),
  ('Piano', 'piano', 'Piano lessons for beginners through advanced — classical, jazz, and contemporary styles.', 'music', 'arts', 81),
  ('Guitar', 'guitar', 'Acoustic and electric guitar lessons covering technique, theory, and song learning.', 'music', 'arts', 82),
  ('Drawing & Illustration', 'drawing-illustration', 'Pencil, charcoal, and digital illustration techniques for all skill levels.', 'pen-tool', 'arts', 83),
  ('Photography', 'photography', 'Camera technique, composition, lighting, and photo editing fundamentals.', 'camera', 'arts', 84),
  ('Creative Writing', 'creative-writing', 'Fiction, poetry, screenwriting, and narrative craft with workshop-style feedback.', 'edit', 'arts', 85)
ON CONFLICT (slug) DO NOTHING;

-- Technology
INSERT INTO public.subjects (name, slug, description, icon, category, sort_order) VALUES
  ('Web Development', 'web-development', 'HTML, CSS, JavaScript, React, Next.js, and full-stack web development tutoring.', 'code', 'technology', 100),
  ('Python Programming', 'python-programming', 'Python fundamentals, data science, automation, and web development with Django/Flask.', 'code', 'technology', 101),
  ('JavaScript', 'javascript', 'Modern JavaScript (ES6+), TypeScript, Node.js, and frontend framework tutoring.', 'code', 'technology', 102),
  ('Mobile Development', 'mobile-development', 'iOS (Swift), Android (Kotlin), and cross-platform (React Native, Flutter) app development.', 'smartphone', 'technology', 103),
  ('Data Science', 'data-science', 'Machine learning, statistics, pandas, scikit-learn, and data visualization with Python.', 'database', 'technology', 104),
  ('Cybersecurity', 'cybersecurity', 'Network security, ethical hacking, cryptography, and security best practices.', 'shield', 'technology', 105),
  ('Cloud Computing', 'cloud-computing', 'AWS, Azure, GCP fundamentals, DevOps practices, and cloud architecture.', 'cloud', 'technology', 106),
  ('UI/UX Design', 'ui-ux-design', 'User interface design, user experience research, Figma, and design systems.', 'layout', 'technology', 107)
ON CONFLICT (slug) DO NOTHING;

-- Child subjects (hierarchy)
INSERT INTO public.subjects (name, slug, description, icon, parent_id, category, sort_order)
SELECT 'IELTS English', 'ielts-english', 'Focused IELTS preparation within English tutoring.', 'globe', id, 'languages', 1
FROM public.subjects WHERE slug = 'english'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.subjects (name, slug, description, icon, parent_id, category, sort_order)
SELECT 'Conversational English', 'conversational-english', 'Casual conversation practice for daily fluency.', 'message-circle', id, 'languages', 2
FROM public.subjects WHERE slug = 'english'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.subjects (name, slug, description, icon, parent_id, category, sort_order)
SELECT 'Calculus', 'calculus', 'Differential and integral calculus for university students.', 'calculator', id, 'academics', 1
FROM public.subjects WHERE slug = 'mathematics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.subjects (name, slug, description, icon, parent_id, category, sort_order)
SELECT 'Statistics', 'statistics', 'Probability, statistical inference, and data analysis methods.', 'bar-chart', id, 'academics', 2
FROM public.subjects WHERE slug = 'mathematics'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.subjects (name, slug, description, icon, parent_id, category, sort_order)
SELECT 'Linear Algebra', 'linear-algebra', 'Vectors, matrices, linear transformations, and eigenvalues.', 'calculator', id, 'academics', 3
FROM public.subjects WHERE slug = 'mathematics'
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- DONE! Verify by running:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- SELECT COUNT(*) FROM public.subjects;
-- ============================================================
