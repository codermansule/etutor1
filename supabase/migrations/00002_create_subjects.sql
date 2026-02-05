-- Migration: Create subjects table
-- Hierarchical subject categories for the tutoring marketplace

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

-- Indexes
CREATE INDEX idx_subjects_slug ON public.subjects (slug);
CREATE INDEX idx_subjects_category ON public.subjects (category);
CREATE INDEX idx_subjects_parent ON public.subjects (parent_id);
CREATE INDEX idx_subjects_active_sort ON public.subjects (is_active, sort_order);

-- RLS
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Everyone can read active subjects
CREATE POLICY "Active subjects are viewable by everyone"
  ON public.subjects FOR SELECT
  USING (is_active = true);

-- Only admins can manage subjects (via service role key)
CREATE POLICY "Admins can manage subjects"
  ON public.subjects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
