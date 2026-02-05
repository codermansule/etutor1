-- Migration: Phase 2 Tables
-- Availability, Lesson Packages, Bookings, Reviews, Payments

-------------------------------------------------------------------------------
-- 1. availability
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid NOT NULL REFERENCES public.tutor_profiles(id) ON DELETE CASCADE,
  day_of_week integer CHECK (day_of_week BETWEEN 0 AND 6),
  specific_date date,
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_available boolean DEFAULT true,
  timezone text NOT NULL,
  created_at timestamptz DEFAULT now(),
  -- Ensure either day_of_week or specific_date is set, but not necessarily both
  -- Actually, the spec says "NULL for date overrides" and "NULL for recurring slots"
  CONSTRAINT availability_check CHECK (
    (day_of_week IS NOT NULL AND specific_date IS NULL) OR
    (day_of_week IS NULL AND specific_date IS NOT NULL)
  )
);

CREATE INDEX idx_availability_tutor_id ON public.availability (tutor_id);
CREATE INDEX idx_availability_day_of_week ON public.availability (day_of_week);
CREATE INDEX idx_availability_specific_date ON public.availability (specific_date);

ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Availability items are viewable by everyone"
  ON public.availability FOR SELECT
  USING (true);

CREATE POLICY "Tutors can manage their own availability"
  ON public.availability FOR ALL
  USING (auth.uid() = tutor_id)
  WITH CHECK (auth.uid() = tutor_id);


-------------------------------------------------------------------------------
-- 2. lesson_packages
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lesson_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid NOT NULL REFERENCES public.tutor_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  lesson_count integer NOT NULL CHECK (lesson_count > 0),
  discount_percent numeric(5,2) DEFAULT 0 CHECK (discount_percent BETWEEN 0 AND 100),
  price_per_lesson numeric(10,2) NOT NULL,
  total_price numeric(10,2) NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_lesson_packages_tutor_id ON public.lesson_packages (tutor_id);

ALTER TABLE public.lesson_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lesson packages are viewable by everyone"
  ON public.lesson_packages FOR SELECT
  USING (true);

CREATE POLICY "Tutors can manage their own lesson packages"
  ON public.lesson_packages FOR ALL
  USING (auth.uid() = tutor_id)
  WITH CHECK (auth.uid() = tutor_id);


-------------------------------------------------------------------------------
-- 3. bookings
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id),
  tutor_id uuid NOT NULL REFERENCES public.tutor_profiles(id),
  subject_id uuid NOT NULL REFERENCES public.subjects(id),
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer DEFAULT 60 CHECK (duration_minutes > 0),
  status text NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  price numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  is_trial boolean DEFAULT false,
  package_id uuid REFERENCES public.lesson_packages(id) ON DELETE SET NULL,
  cancellation_reason text,
  cancelled_by uuid REFERENCES public.profiles(id),
  cancelled_at timestamptz,
  notes text,
  stripe_payment_intent_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_bookings_student_id ON public.bookings (student_id);
CREATE INDEX idx_bookings_tutor_id ON public.bookings (tutor_id);
CREATE INDEX idx_bookings_scheduled_at ON public.bookings (scheduled_at);
CREATE INDEX idx_bookings_status ON public.bookings (status);

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = student_id OR auth.uid() = tutor_id);

CREATE POLICY "Students can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Involved parties can update bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = student_id OR auth.uid() = tutor_id)
  WITH CHECK (auth.uid() = student_id OR auth.uid() = tutor_id);


-------------------------------------------------------------------------------
-- 4. reviews
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id),
  tutor_id uuid NOT NULL REFERENCES public.tutor_profiles(id),
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  is_visible boolean DEFAULT true,
  tutor_response text,
  tutor_responded_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_reviews_tutor_id ON public.reviews (tutor_id);
CREATE INDEX idx_reviews_student_id ON public.reviews (student_id);
CREATE INDEX idx_reviews_rating ON public.reviews (rating);

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT
  USING (is_visible = true);

CREATE POLICY "Students can create reviews for their bookings"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Tutors can respond to their reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = tutor_id);


-------------------------------------------------------------------------------
-- 5. payments
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  student_id uuid NOT NULL REFERENCES public.profiles(id),
  tutor_id uuid NOT NULL REFERENCES public.profiles(id),
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  platform_fee numeric(10,2) NOT NULL,
  tutor_amount numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'refunded', 'failed')),
  stripe_payment_intent_id text,
  stripe_charge_id text,
  refund_amount numeric(10,2),
  refunded_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_payments_booking_id ON public.payments (booking_id);
CREATE INDEX idx_payments_student_id ON public.payments (student_id);
CREATE INDEX idx_payments_tutor_id ON public.payments (tutor_id);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = student_id OR auth.uid() = tutor_id);

-- Additional Trigger for updating tutor average rating
CREATE OR REPLACE FUNCTION public.update_tutor_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE' OR TG_OP = 'DELETE') THEN
    UPDATE public.tutor_profiles
    SET 
      average_rating = (SELECT COALESCE(AVG(rating), 0) FROM public.reviews WHERE tutor_id = COALESCE(NEW.tutor_id, OLD.tutor_id) AND is_visible = true),
      rating_count = (SELECT COUNT(*) FROM public.reviews WHERE tutor_id = COALESCE(NEW.tutor_id, OLD.tutor_id) AND is_visible = true)
    WHERE id = COALESCE(NEW.tutor_id, OLD.tutor_id);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_tutor_rating();
