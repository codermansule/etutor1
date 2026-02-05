-- Migration: Create tutor_profiles table
-- Tutor-specific data extending the profiles table

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

-- Indexes for marketplace queries
CREATE INDEX idx_tutor_profiles_approved_active ON public.tutor_profiles (is_approved, id)
  WHERE is_approved = true;
CREATE INDEX idx_tutor_profiles_rating ON public.tutor_profiles (average_rating DESC);
CREATE INDEX idx_tutor_profiles_rate ON public.tutor_profiles (hourly_rate);
CREATE INDEX idx_tutor_profiles_featured ON public.tutor_profiles (is_featured)
  WHERE is_featured = true;

-- GIN index for language filter
CREATE INDEX idx_tutor_profiles_languages ON public.tutor_profiles USING GIN (languages_spoken);

-- Full-text search on headline + about
CREATE INDEX idx_tutor_profiles_fts ON public.tutor_profiles
  USING GIN (to_tsvector('english', COALESCE(headline, '') || ' ' || COALESCE(about, '')));

-- Auto-update updated_at
CREATE TRIGGER tutor_profiles_updated_at
  BEFORE UPDATE ON public.tutor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.tutor_profiles ENABLE ROW LEVEL SECURITY;

-- Approved tutor profiles are publicly readable
CREATE POLICY "Approved tutor profiles are viewable by everyone"
  ON public.tutor_profiles FOR SELECT
  USING (is_approved = true);

-- Tutors can view their own profile regardless of approval status
CREATE POLICY "Tutors can view own profile"
  ON public.tutor_profiles FOR SELECT
  USING (auth.uid() = id);

-- Tutors can update their own profile
CREATE POLICY "Tutors can update own profile"
  ON public.tutor_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Tutors can insert their own profile
CREATE POLICY "Tutors can insert own profile"
  ON public.tutor_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
