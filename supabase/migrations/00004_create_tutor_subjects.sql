-- Migration: Create tutor_subjects table
-- Many-to-many relationship between tutors and subjects

CREATE TABLE IF NOT EXISTS public.tutor_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid NOT NULL REFERENCES public.tutor_profiles(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  proficiency_level text CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'native')),
  UNIQUE (tutor_id, subject_id)
);

-- Indexes
CREATE INDEX idx_tutor_subjects_tutor ON public.tutor_subjects (tutor_id);
CREATE INDEX idx_tutor_subjects_subject ON public.tutor_subjects (subject_id);

-- RLS
ALTER TABLE public.tutor_subjects ENABLE ROW LEVEL SECURITY;

-- Everyone can read tutor-subject associations
CREATE POLICY "Tutor subjects are viewable by everyone"
  ON public.tutor_subjects FOR SELECT
  USING (true);

-- Tutors can manage their own subject associations
CREATE POLICY "Tutors can insert own subjects"
  ON public.tutor_subjects FOR INSERT
  WITH CHECK (auth.uid() = tutor_id);

CREATE POLICY "Tutors can delete own subjects"
  ON public.tutor_subjects FOR DELETE
  USING (auth.uid() = tutor_id);
