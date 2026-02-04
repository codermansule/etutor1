---
name: Phase 5 – Payments V2, Content & Notifications
about: Implement Stripe Connect/tutor payouts, subscriptions, course content, notifications, and PWA/admin basics.
title: "[Phase 5] Payments V2 & Content"
labels: phase5, payments, notifications
---

## Objective
Complete the monetization, content, and notification pillars: Stripe Connect payouts, subscriptions/packages, tutor materials, notification channels, and PWA/admin foundation.

## Requirements
- Stripe Connect Express onboarding + automated payouts (weekly, $10 threshold) for tutors.
- Subscription tiers (Free/Basic/Premium), lesson packages, promo codes, and refund handling per business rules.
- Course creation/upload flow, material uploads (PDF/slides/recordings) stored in Supabase Storage.
- Notification system (in-app, email via Resend, web push) for bookings, AI updates, payments, achievements; preference toggles per user.
- PWA manifest/service worker (Serwist) with offline fallback, install prompt, background sync basics.
- Admin dashboard v1: user/tutor management, basic analytics, settings, gamification controls.

## Required Services
- Stripe (Connect + Billing + webhooks)
- Supabase (Storage, Realtime, Edge Functions for payouts/reminders)
- Resend/Web Push for notifications

## Acceptance Criteria
- [ ] Stripe Connect onboarding and payouts run automatically, respecting thresholds and commissions.
- [ ] Subscriptions and packages charge correctly, apply promo codes, and record refunds/cancellations.
- [ ] Courses/material uploads accessible to enrolled students.
- [ ] Notifications reach students/tutors through chosen channels with preference toggles.
- [ ] PWA install prompt appears and offline/resume flows work.
- [ ] Admin dashboard gives basic oversight + controls without exposing sensitive actions.

## Verification
- [ ] npm run build
- [ ] npx tsc --noEmit
- [ ] npm run lint
- [ ] npm run test
- [ ] Manual notification + payout + PWA install smoke test
