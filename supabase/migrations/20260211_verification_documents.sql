-- Migration: Add verification documents table and profile verification columns

-- Add verification columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'unverified'
  CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cv_url text;

-- Verification documents table
CREATE TABLE IF NOT EXISTS public.verification_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('cnic_front', 'cnic_back', 'passport', 'live_photo', 'cv', 'profile_photo')),
  file_url text NOT NULL,
  file_name text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES public.profiles(id),
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_verification_docs_user ON public.verification_documents(user_id);
CREATE INDEX idx_verification_docs_status ON public.verification_documents(status);

-- Auto-update updated_at
CREATE TRIGGER verification_documents_updated_at
  BEFORE UPDATE ON public.verification_documents
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;

-- Users can view their own documents
CREATE POLICY "Users can view own documents" ON public.verification_documents
  FOR SELECT USING (auth.uid() = user_id);

-- Users can upload their own documents
CREATE POLICY "Users can insert own documents" ON public.verification_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending documents
CREATE POLICY "Users can update own pending documents" ON public.verification_documents
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Admins can view all documents (via service role, no extra policy needed)
-- But for admin users accessing via client, add policy:
CREATE POLICY "Admins can view all documents" ON public.verification_documents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can update any document (approve/reject)
CREATE POLICY "Admins can update all documents" ON public.verification_documents
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Create storage buckets (run via Supabase Dashboard if not supported in migration)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('verification-documents', 'verification-documents', false) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
