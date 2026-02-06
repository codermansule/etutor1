-- Migration: Referral system
-- Tracks referral codes, invites, and completed referrals

-------------------------------------------------------------------------------
-- 1. referrals table
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code text NOT NULL UNIQUE,
  referred_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  xp_awarded boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX idx_referrals_referrer ON public.referrals (referrer_id);
CREATE INDEX idx_referrals_code ON public.referrals (referral_code);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Users can insert their own referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Referrals can be read by code for signup"
  ON public.referrals FOR SELECT
  USING (true);

-------------------------------------------------------------------------------
-- 2. Add referral_code column to profiles (optional, for quick lookup)
-------------------------------------------------------------------------------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;

-------------------------------------------------------------------------------
-- 3. Function to generate a user's referral code on profile creation
-------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.referral_code := upper(substr(md5(NEW.id::text || now()::text), 1, 8));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only add trigger if not exists (safe for re-runs)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_profile_create_referral_code'
  ) THEN
    CREATE TRIGGER on_profile_create_referral_code
      BEFORE INSERT ON public.profiles
      FOR EACH ROW
      WHEN (NEW.referral_code IS NULL)
      EXECUTE FUNCTION public.generate_referral_code();
  END IF;
END
$$;

-- Backfill existing profiles without referral codes
UPDATE public.profiles
SET referral_code = upper(substr(md5(id::text || created_at::text), 1, 8))
WHERE referral_code IS NULL;
