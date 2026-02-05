---
name: Phase 2 – Marketplace & Booking
about: Build the tutor marketplace, availability editor, and booking/payment workflows with reviews/reminders.
title: "[Phase 2] Marketplace & Booking"
labels: phase2, marketplace, booking
---

## Status: IN PROGRESS

## Objective
Deliver a fully featured tutor marketplace: tutor onboarding, searchable listings, availability, Stripe Checkout booking flow, and the review/cancellation reminder lifecycle.

## Prerequisites (from Phase 1)
- [x] Supabase tables: `profiles`, `subjects`, `tutor_profiles`, `tutor_subjects` with RLS
- [x] 54 subjects seeded across 6 categories
- [x] Auth flows with role selection (student/tutor)
- [x] Dashboard skeleton with sidebar navigation
- [x] Subject directory pages (`/subjects`, `/subjects/[slug]`)

## Requirements

### Database (new tables + migrations)
- [ ] `availability` table — tutor weekly schedule + date overrides, timezone-aware
- [ ] `bookings` table — lesson bookings with status lifecycle
- [ ] `lesson_packages` table — multi-lesson bundles with discount
- [ ] `reviews` table — student reviews of tutors, 1-per-booking
- [ ] `payments` table — transaction records with Stripe references
- [ ] RLS policies for all new tables
- [ ] Indexes for booking queries and review sorting

### Tutor Onboarding
- [ ] Multi-step onboarding wizard (profile, subjects, rate, intro video, availability)
- [ ] Store tutor profile data in `tutor_profiles` + `tutor_subjects`
- [ ] Set `onboarding_completed = true` on profile after wizard
- [ ] Approval workflow placeholder (admin reviews later in Phase 5)

### Marketplace
- [ ] Search/filter UI (subject, price range, rating, availability, language)
- [ ] Full-text search with trigram indexes
- [ ] Public tutor profile pages (`/tutors/[username]`) with ISR + JSON-LD Person schema
- [ ] Featured/verified tutor badges in listings
- [ ] Trial lesson offering display

### Availability
- [ ] Timezone-aware weekly availability editor (recurring + one-off overrides)
- [ ] Conflict detection for overlapping slots
- [ ] Calendar slot picker for students (respects tutor timezone)

### Booking Flow
- [ ] Calendar view showing available slots per tutor
- [ ] Slot selection + Stripe Checkout payment
- [ ] Booking confirmation page + email via Resend
- [ ] Reminder emails/push (24h and 1h before lesson)
- [ ] Cancellation (free >24h, 50% 12-24h, none <12h) and rescheduling (free >12h)

### Reviews
- [ ] Post-lesson review submission (1-5 stars + comment)
- [ ] Display reviews on tutor profile
- [ ] Tutor response to reviews
- [ ] Auto-update `average_rating` and `rating_count` on `tutor_profiles`

## Required Services
- Supabase (Auth, Postgres, Realtime for bookings/availability)
- Stripe (Checkout for payments)
- Resend (email reminders/confirmations)

## Acceptance Criteria
- [ ] Students can filter/search tutors and land on ISR tutor profile pages
- [ ] Tutors can complete onboarding wizard and set availability
- [ ] Availability editor prevents overlapping slots and respects timezone offsets
- [ ] Booking flow charges via Stripe Checkout, records booking + payment, triggers reminders
- [ ] Reviews can be submitted per booking and appear on tutor profiles
- [ ] All booking-related data respects RLS policies

## Verification
- [ ] `npm run build`
- [ ] `npx tsc --noEmit`
- [ ] `npm run lint`
- [ ] Manual booking flow test (search, select slot, Stripe Checkout simulation)
- [ ] Reminder email display via Resend logs
- [ ] Review submission and display on tutor profile
