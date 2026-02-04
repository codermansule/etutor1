---
name: Phase 2 – Marketplace & Booking
about: Build the tutor marketplace, availability editor, and booking/payment workflows with reviews/reminders.
title: "[Phase 2] Marketplace & Booking"
labels: phase2, marketplace, booking
---

## Objective
Deliver a fully featured tutor marketplace: tutor onboarding, searchable listings, availability, Stripe Checkout booking flow, and the review/cancellation reminder lifecycle.

## Requirements
- Onboard tutors with profile setup (subjects, rates, intro video, availability) and store in Supabase.
- Marketplace search/filter UI (subject, price, rating, availability, language) + ISR public tutor pages with JSON-LD + subject directory.
- Timezone-aware availability editor (recurring + overrides) with conflict detection.
- Booking checkout: calendar, slot selection, Stripe Checkout payment, confirmation, and reminder emails/push (24h & 1h).
- Review system, cancellations/rescheduling rules, and booking status updates.
- Seed data for subjects/availability and ensure RLS keeps tutors/students scoped to their records.

## Required Services
- Supabase (Auth, Postgres, Realtime rules for bookings & availability)
- Stripe (Checkout + Billing for handling payments)
- Resend (email reminders/confirmations)

## Acceptance Criteria
- [ ] Students can filter/search tutors and land on ISR tutor pages.
- [ ] Availability editor prevents overlapping slots and respects timezone offsets.
- [ ] Booking flow charges via Stripe Checkout, records booking + payment intent, and triggers reminders.
- [ ] Reviews can be submitted/visible per booking and match cancellation/refund policies.
- [ ] All booking-related data respects the RLS policies described in `PROJECT.md`.

## Verification
- [ ] npm run build
- [ ] npx tsc --noEmit
- [ ] npm run lint
- [ ] Manual booking flow test (search, select slot, Stripe Checkout simulation)
- [ ] Reminder email/push display via Resend logs
