# SBETUTOR - Complete Project Specification

**Version:** 1.0
**Created:** 2026-02-04
**Status:** Planning Complete - Ready for Phase 1

---

## Overview

Preply-style online tutoring marketplace with hybrid monetization (marketplace + subscription), full gamification, LiveKit video classrooms, AI tutor with adaptive learning, and PWA support. Built as a Next.js 14+ App Router project deployed on Vercel with Supabase backend.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router), TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| State | Zustand (client), React Server Components (server) |
| Forms | React Hook Form + Zod |
| Backend/DB | Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions) |
| Video | LiveKit (self-hosted) + `@livekit/components-react` |
| Payments | Stripe Connect (Express) + Stripe Billing |
| AI | OpenAI GPT-4o + LangChain.js + Supabase pgvector |
| Email | Resend |
| PWA | Serwist |
| Analytics | PostHog |
| Errors | Sentry |
| Whiteboard | tldraw |
| Charts | Recharts |
| Deployment | Vercel |

---

## Directory Structure

```
src/
  app/
    (auth)/           # Login, register, forgot-password, verify-email
    (marketing)/      # Landing, about, pricing, how-it-works, subjects/[slug], tutors/[username], blog/[slug]
    (dashboard)/      # Authenticated area
      student/        # Student dashboard, find-tutors, my-lessons, ai-tutor, achievements, etc.
      tutor/          # Tutor dashboard, profile, availability, bookings, earnings, etc.
      admin/          # Admin dashboard, users, moderation, analytics, settings
    classroom/[sessionId]/  # LiveKit video room
    api/
      auth/callback/
      webhooks/stripe/, webhooks/livekit/
      livekit/token/
      ai/chat/, ai/quiz/, ai/study-plan/
      bookings/, stripe/checkout/, stripe/connect/, stripe/subscription/
      cron/streaks/, cron/reminders/
    layout.tsx, middleware.ts, sitemap.ts, robots.ts, globals.css, sw.ts
  components/
    ui/               # shadcn/ui primitives (button, card, dialog, etc.)
    layout/           # header, footer, sidebar, topbar, mobile-nav
    features/         # auth/, marketplace/, booking/, classroom/, messaging/, gamification/, ai-tutor/, dashboard/, payments/, notifications/
    shared/           # star-rating, timezone-selector, search-input, pagination, json-ld
  lib/
    supabase/         # client.ts, server.ts, middleware.ts, admin.ts
    stripe/           # client.ts, checkout.ts, connect.ts, subscriptions.ts
    livekit/          # server.ts, client.ts
    ai/               # openai.ts, prompts.ts, quiz-generator.ts, study-plan.ts, embeddings.ts, knowledge-base.ts
    gamification/     # engine.ts, events.ts, badges.ts, streaks.ts, leaderboard.ts
    notifications/    # push.ts, email.ts, in-app.ts
    utils/            # dates.ts, currency.ts, slugify.ts, validators.ts
    constants/        # subjects.ts, levels.ts, badges.ts, plans.ts
    seo/              # schemas.ts, metadata.ts
  hooks/              # use-user, use-realtime, use-notifications, use-gamification, etc.
  stores/             # auth-store, notification-store, booking-store, classroom-store, gamification-store
  types/              # database.ts, api.ts, stripe.ts, livekit.ts, gamification.ts, ai.ts
supabase/
  migrations/         # 19+ SQL migration files
  functions/          # Edge Functions (stripe-webhook, send-reminder, calculate-streaks, generate-payout)
  seed.sql, config.toml
tests/
  unit/, integration/, e2e/
```

---

## Database Schema (~35 tables)

### Core

#### `profiles`
Extends `auth.users`. Central user table.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, references auth.users(id) ON DELETE CASCADE |
| email | text | NOT NULL |
| full_name | text | NOT NULL |
| avatar_url | text | |
| role | text | NOT NULL, CHECK (role IN ('student', 'tutor', 'admin')), DEFAULT 'student' |
| timezone | text | DEFAULT 'UTC' |
| bio | text | |
| phone | text | |
| country | text | |
| preferred_language | text | DEFAULT 'en' |
| onboarding_completed | boolean | DEFAULT false |
| is_active | boolean | DEFAULT true |
| last_seen_at | timestamptz | |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

#### `subjects`
Hierarchical subject categories.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| name | text | NOT NULL |
| slug | text | NOT NULL, UNIQUE |
| description | text | |
| icon | text | |
| parent_id | uuid | FK references subjects(id) |
| category | text | CHECK (category IN ('languages', 'academics', 'professional', 'test-prep', 'arts', 'technology')) |
| is_active | boolean | DEFAULT true |
| sort_order | integer | DEFAULT 0 |
| created_at | timestamptz | DEFAULT now() |

#### `tutor_profiles`
Tutor-specific data.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, references profiles(id) ON DELETE CASCADE |
| headline | text | |
| about | text | |
| intro_video_url | text | |
| hourly_rate | numeric(10,2) | NOT NULL |
| trial_rate | numeric(10,2) | |
| currency | text | DEFAULT 'USD' |
| experience_years | integer | |
| education | jsonb | DEFAULT '[]' |
| certifications | jsonb | DEFAULT '[]' |
| languages_spoken | jsonb | DEFAULT '[]' |
| teaching_style | text | |
| is_verified | boolean | DEFAULT false |
| is_featured | boolean | DEFAULT false |
| is_approved | boolean | DEFAULT false |
| approval_status | text | CHECK (approval_status IN ('pending', 'approved', 'rejected')), DEFAULT 'pending' |
| stripe_account_id | text | |
| stripe_onboarded | boolean | DEFAULT false |
| total_lessons | integer | DEFAULT 0 |
| total_students | integer | DEFAULT 0 |
| average_rating | numeric(3,2) | DEFAULT 0 |
| rating_count | integer | DEFAULT 0 |
| response_time_hours | numeric(5,2) | |
| completion_rate | numeric(5,2) | DEFAULT 100 |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

#### `tutor_subjects`
Many-to-many: tutors <-> subjects.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| tutor_id | uuid | FK references tutor_profiles(id) ON DELETE CASCADE |
| subject_id | uuid | FK references subjects(id) ON DELETE CASCADE |
| proficiency_level | text | CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'native')) |
| UNIQUE | | (tutor_id, subject_id) |

### Booking & Scheduling

#### `availability`
Tutor weekly schedule + one-off overrides, timezone-aware.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| tutor_id | uuid | FK references tutor_profiles(id) ON DELETE CASCADE |
| day_of_week | integer | CHECK (day_of_week BETWEEN 0 AND 6), NULL for date overrides |
| specific_date | date | NULL for recurring slots |
| start_time | time | NOT NULL |
| end_time | time | NOT NULL |
| is_available | boolean | DEFAULT true |
| timezone | text | NOT NULL |
| created_at | timestamptz | DEFAULT now() |

#### `bookings`
Lesson bookings.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| student_id | uuid | FK references profiles(id) |
| tutor_id | uuid | FK references tutor_profiles(id) |
| subject_id | uuid | FK references subjects(id) |
| scheduled_at | timestamptz | NOT NULL |
| duration_minutes | integer | DEFAULT 60 |
| status | text | CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')), DEFAULT 'pending' |
| price | numeric(10,2) | NOT NULL |
| currency | text | DEFAULT 'USD' |
| is_trial | boolean | DEFAULT false |
| package_id | uuid | FK references lesson_packages(id), nullable |
| cancellation_reason | text | |
| cancelled_by | uuid | FK references profiles(id), nullable |
| cancelled_at | timestamptz | |
| notes | text | |
| stripe_payment_intent_id | text | |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

#### `lesson_packages`
Multi-lesson bundles with discount.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| tutor_id | uuid | FK references tutor_profiles(id) ON DELETE CASCADE |
| title | text | NOT NULL |
| lesson_count | integer | NOT NULL |
| discount_percent | numeric(5,2) | DEFAULT 0 |
| price_per_lesson | numeric(10,2) | NOT NULL |
| total_price | numeric(10,2) | NOT NULL |
| is_active | boolean | DEFAULT true |
| created_at | timestamptz | DEFAULT now() |

#### `sessions`
LiveKit room data.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| booking_id | uuid | FK references bookings(id) ON DELETE CASCADE, UNIQUE |
| livekit_room_name | text | NOT NULL, UNIQUE |
| recording_url | text | |
| whiteboard_state | jsonb | |
| started_at | timestamptz | |
| ended_at | timestamptz | |
| duration_seconds | integer | |
| status | text | CHECK (status IN ('waiting', 'active', 'ended')), DEFAULT 'waiting' |
| created_at | timestamptz | DEFAULT now() |

#### `session_chat_messages`
In-classroom text chat.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| session_id | uuid | FK references sessions(id) ON DELETE CASCADE |
| sender_id | uuid | FK references profiles(id) |
| content | text | NOT NULL |
| created_at | timestamptz | DEFAULT now() |

### Reviews & Messaging

#### `reviews`
Student reviews of tutors.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| booking_id | uuid | FK references bookings(id), UNIQUE |
| student_id | uuid | FK references profiles(id) |
| tutor_id | uuid | FK references tutor_profiles(id) |
| rating | integer | NOT NULL, CHECK (rating BETWEEN 1 AND 5) |
| comment | text | |
| is_visible | boolean | DEFAULT true |
| tutor_response | text | |
| tutor_responded_at | timestamptz | |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

#### `conversations`
1-on-1 chat threads.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| participant_1_id | uuid | FK references profiles(id) |
| participant_2_id | uuid | FK references profiles(id) |
| last_message_at | timestamptz | |
| created_at | timestamptz | DEFAULT now() |
| UNIQUE | | (participant_1_id, participant_2_id) |

#### `messages`
Real-time chat messages.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| conversation_id | uuid | FK references conversations(id) ON DELETE CASCADE |
| sender_id | uuid | FK references profiles(id) |
| content | text | |
| message_type | text | CHECK (message_type IN ('text', 'image', 'file', 'system')), DEFAULT 'text' |
| file_url | text | |
| file_name | text | |
| is_read | boolean | DEFAULT false |
| read_at | timestamptz | |
| created_at | timestamptz | DEFAULT now() |

### Gamification

#### `levels`
Level definitions.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| number | integer | NOT NULL, UNIQUE |
| title | text | NOT NULL |
| xp_threshold | integer | NOT NULL |
| perks | jsonb | DEFAULT '[]' |
| icon | text | |

#### `user_xp`
User's total XP, current level, coins.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, references profiles(id) ON DELETE CASCADE |
| total_xp | integer | DEFAULT 0 |
| current_level | integer | DEFAULT 1 |
| coins | integer | DEFAULT 0 |
| updated_at | timestamptz | DEFAULT now() |

#### `xp_transactions`
XP earn log.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| user_id | uuid | FK references profiles(id) ON DELETE CASCADE |
| event_type | text | NOT NULL, CHECK (event_type IN ('lesson_completed', 'quiz_completed', 'streak_bonus', 'review_written', 'referral', 'challenge_completed', 'badge_earned', 'daily_login')) |
| xp_amount | integer | NOT NULL |
| coins_amount | integer | DEFAULT 0 |
| reference_id | uuid | |
| reference_type | text | |
| description | text | |
| created_at | timestamptz | DEFAULT now() |

#### `badges`
Badge definitions.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| name | text | NOT NULL, UNIQUE |
| description | text | NOT NULL |
| icon | text | NOT NULL |
| category | text | CHECK (category IN ('learning', 'social', 'achievement', 'streak', 'special')) |
| rarity | text | CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')) |
| criteria | jsonb | NOT NULL |
| xp_reward | integer | DEFAULT 0 |
| coin_reward | integer | DEFAULT 0 |
| is_active | boolean | DEFAULT true |
| created_at | timestamptz | DEFAULT now() |

#### `user_badges`
Earned badges per user.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| user_id | uuid | FK references profiles(id) ON DELETE CASCADE |
| badge_id | uuid | FK references badges(id) ON DELETE CASCADE |
| earned_at | timestamptz | DEFAULT now() |
| UNIQUE | | (user_id, badge_id) |

#### `user_streaks`
Current/longest streak, freeze count.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, references profiles(id) ON DELETE CASCADE |
| current_streak | integer | DEFAULT 0 |
| longest_streak | integer | DEFAULT 0 |
| last_activity_date | date | |
| freeze_count | integer | DEFAULT 2 |
| freeze_used_this_month | integer | DEFAULT 0 |
| updated_at | timestamptz | DEFAULT now() |

#### `leaderboard_entries`
Weekly/monthly/all-time rankings.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| user_id | uuid | FK references profiles(id) ON DELETE CASCADE |
| period_type | text | CHECK (period_type IN ('weekly', 'monthly', 'all_time')) |
| period_start | date | |
| xp_earned | integer | DEFAULT 0 |
| rank | integer | |
| subject_id | uuid | FK references subjects(id), nullable (NULL = global) |
| updated_at | timestamptz | DEFAULT now() |
| UNIQUE | | (user_id, period_type, period_start, subject_id) |

#### `challenges`
Time-limited challenges with rewards.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| title | text | NOT NULL |
| description | text | NOT NULL |
| challenge_type | text | CHECK (challenge_type IN ('lessons', 'quizzes', 'streak', 'xp', 'custom')) |
| target_value | integer | NOT NULL |
| xp_reward | integer | DEFAULT 0 |
| coin_reward | integer | DEFAULT 0 |
| badge_reward_id | uuid | FK references badges(id), nullable |
| starts_at | timestamptz | NOT NULL |
| ends_at | timestamptz | NOT NULL |
| is_active | boolean | DEFAULT true |
| created_at | timestamptz | DEFAULT now() |

#### `user_challenges`
User progress on challenges.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| user_id | uuid | FK references profiles(id) ON DELETE CASCADE |
| challenge_id | uuid | FK references challenges(id) ON DELETE CASCADE |
| current_value | integer | DEFAULT 0 |
| completed | boolean | DEFAULT false |
| completed_at | timestamptz | |
| joined_at | timestamptz | DEFAULT now() |
| UNIQUE | | (user_id, challenge_id) |

#### `rewards`
Reward store items.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| name | text | NOT NULL |
| description | text | NOT NULL |
| reward_type | text | CHECK (reward_type IN ('discount', 'free_lesson', 'profile_theme', 'profile_frame', 'badge', 'custom')) |
| coin_cost | integer | NOT NULL |
| value | jsonb | |
| stock | integer | |
| is_active | boolean | DEFAULT true |
| created_at | timestamptz | DEFAULT now() |

#### `user_rewards`
Redeemed rewards.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| user_id | uuid | FK references profiles(id) ON DELETE CASCADE |
| reward_id | uuid | FK references rewards(id) |
| redeemed_at | timestamptz | DEFAULT now() |
| used | boolean | DEFAULT false |
| used_at | timestamptz | |
| expires_at | timestamptz | |

### AI Tutor

#### `ai_conversations`
AI chat sessions per user per subject.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| user_id | uuid | FK references profiles(id) ON DELETE CASCADE |
| subject_id | uuid | FK references subjects(id) |
| title | text | |
| mode | text | CHECK (mode IN ('chat', 'socratic', 'quiz', 'study_plan')), DEFAULT 'chat' |
| is_active | boolean | DEFAULT true |
| message_count | integer | DEFAULT 0 |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

#### `ai_messages`
Chat messages (user/assistant/system roles).

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| conversation_id | uuid | FK references ai_conversations(id) ON DELETE CASCADE |
| role | text | NOT NULL, CHECK (role IN ('user', 'assistant', 'system')) |
| content | text | NOT NULL |
| tokens_used | integer | |
| created_at | timestamptz | DEFAULT now() |

#### `ai_quizzes`
Generated quizzes.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| user_id | uuid | FK references profiles(id) ON DELETE CASCADE |
| subject_id | uuid | FK references subjects(id) |
| title | text | NOT NULL |
| difficulty | text | CHECK (difficulty IN ('easy', 'medium', 'hard', 'adaptive')) |
| questions | jsonb | NOT NULL |
| question_count | integer | NOT NULL |
| created_at | timestamptz | DEFAULT now() |

#### `ai_quiz_attempts`
Quiz results and scores.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| quiz_id | uuid | FK references ai_quizzes(id) ON DELETE CASCADE |
| user_id | uuid | FK references profiles(id) ON DELETE CASCADE |
| answers | jsonb | NOT NULL |
| score | numeric(5,2) | NOT NULL |
| correct_count | integer | NOT NULL |
| total_count | integer | NOT NULL |
| time_spent_seconds | integer | |
| completed_at | timestamptz | DEFAULT now() |

#### `user_knowledge_state`
Per-topic mastery levels, weak/strong areas.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| user_id | uuid | FK references profiles(id) ON DELETE CASCADE |
| subject_id | uuid | FK references subjects(id) |
| topic | text | NOT NULL |
| mastery_level | numeric(5,2) | DEFAULT 0, CHECK (mastery_level BETWEEN 0 AND 100) |
| questions_attempted | integer | DEFAULT 0 |
| questions_correct | integer | DEFAULT 0 |
| last_assessed_at | timestamptz | |
| updated_at | timestamptz | DEFAULT now() |
| UNIQUE | | (user_id, subject_id, topic) |

#### `study_plans`
AI-generated personalized study plans.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| user_id | uuid | FK references profiles(id) ON DELETE CASCADE |
| subject_id | uuid | FK references subjects(id) |
| title | text | NOT NULL |
| plan | jsonb | NOT NULL |
| duration_weeks | integer | |
| status | text | CHECK (status IN ('active', 'completed', 'archived')), DEFAULT 'active' |
| progress | numeric(5,2) | DEFAULT 0 |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

#### `knowledge_documents`
RAG documents with pgvector embeddings.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| subject_id | uuid | FK references subjects(id) |
| title | text | NOT NULL |
| content | text | NOT NULL |
| embedding | vector(1536) | |
| metadata | jsonb | DEFAULT '{}' |
| chunk_index | integer | |
| source_url | text | |
| created_at | timestamptz | DEFAULT now() |

### Payments

#### `payments`
Transaction records.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| booking_id | uuid | FK references bookings(id) |
| student_id | uuid | FK references profiles(id) |
| tutor_id | uuid | FK references profiles(id) |
| amount | numeric(10,2) | NOT NULL |
| currency | text | DEFAULT 'USD' |
| platform_fee | numeric(10,2) | NOT NULL |
| tutor_amount | numeric(10,2) | NOT NULL |
| status | text | CHECK (status IN ('pending', 'completed', 'refunded', 'failed')), DEFAULT 'pending' |
| stripe_payment_intent_id | text | |
| stripe_charge_id | text | |
| refund_amount | numeric(10,2) | |
| refunded_at | timestamptz | |
| created_at | timestamptz | DEFAULT now() |

#### `subscriptions`
Stripe subscription state.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| user_id | uuid | FK references profiles(id) ON DELETE CASCADE, UNIQUE |
| plan | text | CHECK (plan IN ('free', 'basic', 'premium')), DEFAULT 'free' |
| stripe_subscription_id | text | |
| stripe_customer_id | text | |
| status | text | CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')), DEFAULT 'active' |
| current_period_start | timestamptz | |
| current_period_end | timestamptz | |
| cancel_at_period_end | boolean | DEFAULT false |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

#### `tutor_payouts`
Automated payout records.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| tutor_id | uuid | FK references profiles(id) |
| amount | numeric(10,2) | NOT NULL |
| currency | text | DEFAULT 'USD' |
| status | text | CHECK (status IN ('pending', 'processing', 'completed', 'failed')), DEFAULT 'pending' |
| stripe_transfer_id | text | |
| period_start | date | NOT NULL |
| period_end | date | NOT NULL |
| lessons_count | integer | DEFAULT 0 |
| created_at | timestamptz | DEFAULT now() |
| completed_at | timestamptz | |

#### `promo_codes`
Discount codes.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| code | text | NOT NULL, UNIQUE |
| discount_type | text | CHECK (discount_type IN ('percentage', 'fixed')), NOT NULL |
| discount_value | numeric(10,2) | NOT NULL |
| max_uses | integer | |
| current_uses | integer | DEFAULT 0 |
| min_purchase | numeric(10,2) | |
| valid_from | timestamptz | NOT NULL |
| valid_until | timestamptz | NOT NULL |
| is_active | boolean | DEFAULT true |
| created_at | timestamptz | DEFAULT now() |

### Platform

#### `notifications`
Multi-channel notifications.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| user_id | uuid | FK references profiles(id) ON DELETE CASCADE |
| type | text | NOT NULL, CHECK (type IN ('booking_confirmed', 'booking_cancelled', 'booking_reminder', 'lesson_completed', 'new_message', 'new_review', 'badge_earned', 'level_up', 'streak_warning', 'challenge_completed', 'payout_completed', 'system')) |
| title | text | NOT NULL |
| body | text | NOT NULL |
| data | jsonb | DEFAULT '{}' |
| channel | text | CHECK (channel IN ('in_app', 'email', 'push')), DEFAULT 'in_app' |
| is_read | boolean | DEFAULT false |
| read_at | timestamptz | |
| created_at | timestamptz | DEFAULT now() |

#### `notification_preferences`
Per-user notification toggles.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, references profiles(id) ON DELETE CASCADE |
| booking_email | boolean | DEFAULT true |
| booking_push | boolean | DEFAULT true |
| message_email | boolean | DEFAULT false |
| message_push | boolean | DEFAULT true |
| reminder_email | boolean | DEFAULT true |
| reminder_push | boolean | DEFAULT true |
| achievement_email | boolean | DEFAULT false |
| achievement_push | boolean | DEFAULT true |
| marketing_email | boolean | DEFAULT true |
| updated_at | timestamptz | DEFAULT now() |

#### `materials`
Uploaded lesson materials and files.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| uploaded_by | uuid | FK references profiles(id) |
| booking_id | uuid | FK references bookings(id), nullable |
| course_lesson_id | uuid | FK references course_lessons(id), nullable |
| file_name | text | NOT NULL |
| file_url | text | NOT NULL |
| file_type | text | |
| file_size | integer | |
| created_at | timestamptz | DEFAULT now() |

#### `courses`
Tutor-created structured courses.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| tutor_id | uuid | FK references tutor_profiles(id) ON DELETE CASCADE |
| subject_id | uuid | FK references subjects(id) |
| title | text | NOT NULL |
| slug | text | NOT NULL, UNIQUE |
| description | text | |
| thumbnail_url | text | |
| price | numeric(10,2) | |
| is_free | boolean | DEFAULT false |
| level | text | CHECK (level IN ('beginner', 'intermediate', 'advanced', 'all_levels')), DEFAULT 'all_levels' |
| status | text | CHECK (status IN ('draft', 'published', 'archived')), DEFAULT 'draft' |
| enrolled_count | integer | DEFAULT 0 |
| lesson_count | integer | DEFAULT 0 |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |

#### `course_lessons`
Individual lessons within courses.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| course_id | uuid | FK references courses(id) ON DELETE CASCADE |
| title | text | NOT NULL |
| description | text | |
| content | text | |
| video_url | text | |
| sort_order | integer | DEFAULT 0 |
| duration_minutes | integer | |
| is_free_preview | boolean | DEFAULT false |
| created_at | timestamptz | DEFAULT now() |

#### `course_enrollments`
Student enrollment and progress.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| student_id | uuid | FK references profiles(id) ON DELETE CASCADE |
| course_id | uuid | FK references courses(id) ON DELETE CASCADE |
| progress | numeric(5,2) | DEFAULT 0 |
| completed_lessons | jsonb | DEFAULT '[]' |
| enrolled_at | timestamptz | DEFAULT now() |
| completed_at | timestamptz | |
| UNIQUE | | (student_id, course_id) |

#### `admin_audit_log`
Admin action tracking.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| admin_id | uuid | FK references profiles(id) |
| action | text | NOT NULL |
| entity_type | text | |
| entity_id | uuid | |
| details | jsonb | DEFAULT '{}' |
| created_at | timestamptz | DEFAULT now() |

#### `platform_settings`
Key-value platform config.

| Column | Type | Constraints |
|--------|------|-------------|
| key | text | PK |
| value | jsonb | NOT NULL |
| updated_at | timestamptz | DEFAULT now() |
| updated_by | uuid | FK references profiles(id) |

#### `announcements`
Admin announcements.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| title | text | NOT NULL |
| content | text | NOT NULL |
| target_role | text | CHECK (target_role IN ('all', 'student', 'tutor')), DEFAULT 'all' |
| is_active | boolean | DEFAULT true |
| starts_at | timestamptz | DEFAULT now() |
| ends_at | timestamptz | |
| created_by | uuid | FK references profiles(id) |
| created_at | timestamptz | DEFAULT now() |

#### `learning_progress`
Aggregated learning stats per user per subject.

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, DEFAULT gen_random_uuid() |
| user_id | uuid | FK references profiles(id) ON DELETE CASCADE |
| subject_id | uuid | FK references subjects(id) |
| lessons_completed | integer | DEFAULT 0 |
| total_hours | numeric(10,2) | DEFAULT 0 |
| quizzes_taken | integer | DEFAULT 0 |
| average_quiz_score | numeric(5,2) | |
| current_mastery | numeric(5,2) | DEFAULT 0 |
| updated_at | timestamptz | DEFAULT now() |
| UNIQUE | | (user_id, subject_id) |

### RLS Policies

- Users read/update own profile; public can read basic profile info (name, avatar, role)
- Students/tutors see only their own bookings
- Message access restricted to conversation participants
- Notifications visible only to recipient
- Reviews publicly readable; only booking student can create
- Tutor profiles publicly readable when approved; tutor can update own
- Admin role bypasses all RLS via service role key
- Materials accessible to booking participants or course enrollees

### Realtime Subscriptions

- `messages` (filtered by conversation_id) - live chat
- `notifications` (filtered by user_id) - instant notifications
- `bookings` (filtered by user_id) - status changes
- `user_xp` (filtered by user_id) - XP/level animations

### Key Indexes

- `profiles(email)` - unique
- `profiles(role)` - filter by role
- `tutor_profiles(is_approved, is_active)` - marketplace queries
- `tutor_profiles(average_rating DESC)` - sort by rating
- `tutor_profiles(hourly_rate)` - price filter
- `subjects(slug)` - unique, URL lookup
- `subjects(category)` - category filter
- `bookings(student_id, status)` - student dashboard
- `bookings(tutor_id, status)` - tutor dashboard
- `bookings(scheduled_at)` - reminder queries
- `reviews(tutor_id, created_at DESC)` - tutor profile reviews
- `messages(conversation_id, created_at)` - chat history
- `notifications(user_id, is_read, created_at DESC)` - notification bell
- `xp_transactions(user_id, created_at DESC)` - XP history
- `leaderboard_entries(period_type, period_start, rank)` - leaderboard display
- `knowledge_documents` USING ivfflat (embedding vector_cosine_ops) - RAG similarity search
- `tutor_profiles` GIN index on `languages_spoken` - language filter
- Full-text search: GIN index on `tsvector` for tutor_profiles (headline, about) + profiles (full_name)

---

## Feature Areas (14 Modules)

### A. Authentication & User Management
- Email/password + Google OAuth + email verification
- Role selection (student/tutor) during registration
- Tutor application + admin approval flow
- Cookie-based sessions via `@supabase/ssr`
- Profile management, password reset, account deletion

### B. Tutor Marketplace
- Tutor profile pages (qualifications, intro video, rates, reviews)
- Search with filters (subject, price, rating, availability, language)
- Full-text search with trigram indexes
- Featured/verified tutor badges
- Trial lesson offering
- ISR rendering for public tutor profiles

### C. Booking & Scheduling
- Timezone-aware availability editor (weekly recurring + date overrides)
- Calendar slot picker with conflict detection
- Stripe Checkout payment on booking
- Rescheduling/cancellation with policy enforcement
- Package deals and recurring bookings
- Email + push reminders (24h and 1h before)

### D. Video Classroom (LiveKit)
- 1-on-1 WebRTC video via LiveKit
- Screen sharing (tutor + student)
- tldraw whiteboard integration
- Annotation overlay on screen share
- In-session text chat
- Session recording (LiveKit Egress -> Supabase Storage)
- Device selection, connection quality indicator, session timer

### E. Messaging
- Real-time 1-on-1 chat via Supabase Realtime
- Conversation list with unread counts
- File/image sharing, typing indicators, read receipts
- Online/offline presence

### F. Gamification Engine
- **XP**: Earned for lessons (+50), quizzes (+20), streaks (+10), reviews (+15), referrals (+200)
- **Levels**: 1-100 with titles and perks, XP threshold progression
- **Badges**: Milestone-based (first lesson, 10 lessons, perfect quiz, 30-day streak, etc.)
- **Streaks**: Daily activity tracking, freeze protection (2/month)
- **Leaderboards**: Weekly/monthly/all-time, global and per-subject
- **Challenges**: Time-limited goals with XP/coin/badge rewards
- **Rewards Store**: Spend coins on discounts, free lessons, profile customizations

### G. AI Tutor
- Streaming chat with GPT-4o via Vercel AI SDK
- RAG using pgvector for custom knowledge base
- Adaptive difficulty based on user_knowledge_state mastery levels
- Quiz generation (multiple choice, fill-in-blank) with auto-grading
- Weak area identification from quiz results
- Personalized study plan generation
- Socratic method mode option
- Full conversation history persistence

### H. Payment System
- Stripe Checkout for individual lessons
- Stripe Billing for subscriptions (Free/Basic/Premium tiers)
- Stripe Connect Express for tutor payouts (automated weekly)
- Platform commission (configurable, default 15%)
- Refund handling, promo codes, lesson packages

### I. Admin Dashboard
- Overview metrics (users, revenue, sessions, growth)
- User management (view, suspend, delete)
- Tutor application review/approval
- Content moderation (reviews, profiles, messages)
- Revenue analytics, payout management
- Platform settings, subject management
- Gamification management (badges, challenges, rewards)
- Audit log

### J. SEO & Marketing Pages
- SSG: Landing, about, pricing, how-it-works, blog posts
- ISR: Subject pages (60s revalidation), tutor profiles (300s revalidation)
- SSR: Tutor search (dynamic queries), dashboard
- JSON-LD: EducationalOrganization, Course, Person, FAQPage, Review, BreadcrumbList
- Dynamic sitemap.xml and robots.txt
- Open Graph + Twitter Card meta tags
- URL structure: `/subjects/[slug]`, `/tutors/[username]`, `/blog/[slug]`

### K. PWA
- Web app manifest (standalone display, icons, theme)
- Serwist service worker (asset caching, offline fallback page)
- Install prompt (Add to Home Screen)
- Push notifications via Web Push API
- Background sync for offline messages

### L. Notification System
- In-app: Bell icon with dropdown, unread count, Supabase Realtime
- Email: Resend for booking confirmations, reminders, receipts
- Push: Web Push API for reminders, new messages, achievements
- User preference toggles per notification type

### M. Progress & Analytics
- Student: Lessons completed, hours learned, subject mastery radar chart, streak history
- Tutor: Response rate, completion rate, average rating, earnings by period
- Admin: DAU/MAU, conversion rates, revenue, session metrics

### N. Content Management
- Tutor material uploads (PDFs, slides) to Supabase Storage
- Recorded lesson storage and playback
- Course creation (structured multi-lesson content)
- Student enrollment and progress tracking

---

## Subscription Tiers

| Feature | Free | Basic ($9.99/mo) | Premium ($24.99/mo) |
|---------|------|-------------------|---------------------|
| Browse tutors | Yes | Yes | Yes |
| Book lessons | Yes | Yes | Yes |
| AI Tutor messages | 5/day | Unlimited | Unlimited |
| AI Quiz generation | 1/day | Unlimited | Unlimited |
| AI Study plans | No | Yes | Yes |
| Gamification (XP, streaks) | Basic | Full (badges, leaderboard) | Full |
| Challenges & rewards store | No | Yes | Yes |
| Lesson recordings access | No | No | Yes |
| Priority booking | No | No | Yes |
| Tutor response guarantee | No | No | 24h |
| Course access | Free courses only | All courses | All courses |
| Profile customization | Basic | Enhanced | Premium frames/themes |

---

## Business Rules

### Platform Commission: 15%
- Student pays full lesson price -> Platform keeps 15% -> Tutor receives 85%
- Applied to individual lessons and package bookings
- Subscription revenue is 100% platform revenue (no tutor split)

### Booking Policies
- Cancellation: Free cancellation up to 24h before lesson; 50% refund 12-24h; no refund <12h
- No-show: Student charged full amount; tutor receives payout
- Rescheduling: Free up to 12h before lesson

### Tutor Approval
- Tutors submit application with qualifications + intro video
- Admin reviews and approves/rejects
- Approved tutors appear in marketplace
- Rejected tutors can reapply after 30 days

### Payout Schedule
- Automated weekly payouts every Monday
- Minimum payout threshold: $10
- Stripe Connect Express for direct bank deposits

### AI Usage Limits (enforced per subscription tier)
- Free: 5 AI messages/day, 1 quiz/day, no study plans
- Basic: Unlimited messages, unlimited quizzes, study plans included
- Premium: All Basic features + priority AI processing

### Gamification XP Values
| Event | XP | Coins |
|-------|-----|-------|
| Lesson completed | +50 | +10 |
| Quiz completed | +20 | +5 |
| Perfect quiz (100%) | +50 | +15 |
| Daily streak bonus | +10 | +2 |
| Review written | +15 | +3 |
| Referral signup | +200 | +50 |
| Challenge completed | varies | varies |
| Badge earned | +25 | +5 |

---

## Key User Flows

### Student: Discover -> Book -> Learn -> Review
1. Land on marketing page or find tutor via search engine
2. Register (email/Google) -> Select Student role -> Onboarding (timezone, interests)
3. Browse /tutors -> Filter by subject, price, rating, availability
4. Click tutor -> View profile (video, bio, reviews, availability)
5. Book lesson -> Select slot -> Stripe Checkout -> Confirmation
6. Receive email + push reminder
7. Join classroom -> Video + whiteboard + screen share
8. After session -> Rate + review tutor
9. Earn XP -> Level check -> Badge check -> Streak increment

### Tutor: Apply -> Setup -> Teach -> Earn
1. Register -> Select Tutor role -> Profile wizard (6 steps)
2. Submit for admin review -> Approved -> Set up Stripe Connect
3. Students book available slots -> Tutor notified
4. Join classroom -> Teach with video/whiteboard/screen share
5. Session ends -> Student reviews -> Rating updates
6. Weekly payout to Stripe Connect account

### AI Tutor: Chat -> Quiz -> Adapt -> Plan
1. Navigate to /student/ai-tutor -> Select subject
2. Chat with AI (streaming) -> AI uses RAG for subject knowledge
3. Request quiz -> AI generates adaptive difficulty questions
4. Submit answers -> Auto-grade -> XP awarded
5. AI updates knowledge state (mastery per topic, weak areas)
6. Generate personalized study plan based on gaps

### Gamification: Earn -> Level -> Compete -> Redeem
1. Complete activities -> Earn XP (lessons +50, quizzes +20, streaks +10)
2. XP crosses threshold -> Level up animation -> New perks unlocked
3. Milestones reached -> Badge earned notification
4. Daily activity -> Streak maintained (or use freeze)
5. XP counted on leaderboard -> Weekly/monthly rankings
6. Accept challenges -> Track progress -> Earn bonus rewards
7. Visit rewards store -> Spend coins on discounts/free lessons

---

## MVP Implementation Phases

### Phase 1: Foundation
**Goal**: Project scaffolding, auth, profiles, marketing pages
- Next.js + TypeScript + Tailwind + shadcn/ui setup
- Supabase project + migration infrastructure
- Email/password + Google OAuth authentication
- User profiles (student/tutor roles)
- DB: profiles, subjects (seeded), tutor_profiles + RLS
- Marketing pages: landing, pricing, about (SSG)
- Layout: header, footer, sidebar, responsive nav
- Auth middleware + role-based routing
- Vercel deployment + CI pipeline

### Phase 2: Marketplace & Booking
**Goal**: Students can find tutors and book paid lessons
- Tutor onboarding wizard (profile, subjects, rate, video, availability)
- Marketplace search with filters + full-text search
- Public tutor profile pages (ISR with JSON-LD)
- Subject directory pages
- Timezone-aware availability system
- Booking flow: calendar -> slot selection -> Stripe Checkout -> confirmation
- Reviews system (post-lesson)
- Booking confirmation + reminder emails (Resend)
- DB: availability, bookings, reviews, payments + RLS

### Phase 3: Video Classroom & Messaging
**Goal**: Live tutoring sessions and real-time communication
- LiveKit self-hosted setup + token generation API
- Video classroom: 1-on-1 video, screen sharing, session controls
- tldraw whiteboard integration
- In-session text chat
- Session recording (LiveKit Egress)
- Messaging: conversation list, real-time chat, file sharing
- Supabase Realtime for messages + presence
- DB: sessions, session_chat_messages, conversations, messages

### Phase 4: AI Tutor & Gamification
**Goal**: AI-powered learning and engagement systems
- AI chat with streaming (GPT-4o + Vercel AI SDK)
- Quiz generation + auto-grading
- Knowledge state tracking (mastery per topic)
- Weak area identification + study plan generation
- pgvector RAG setup for custom knowledge base
- XP system + level progression
- Badges (milestone-based, auto-evaluated)
- Streaks + freeze protection
- Leaderboards (weekly/monthly/all-time)
- Cron jobs: streak calculation, leaderboard refresh
- DB: all gamification + AI tables

### Phase 5: Payments V2, Content & Notifications
**Goal**: Full monetization, content platform, notifications
- Stripe Connect tutor onboarding + automated payouts
- Subscription tiers (Free/Basic/Premium)
- Lesson packages + promo codes
- Course creation by tutors + student enrollment
- Material uploads
- In-app + email + push notification system
- Notification preferences
- PWA: manifest, service worker, offline page, install prompt
- Admin dashboard v1 (user mgmt, tutor approvals, basic analytics)

### Phase 6: Polish & Launch
**Goal**: Production-ready platform
- Admin dashboard v2 (revenue analytics, moderation, settings)
- Challenges + rewards store
- Student/tutor analytics dashboards
- SEO finalization (all JSON-LD, sitemap, OG images)
- Blog (MDX)
- PWA polish (background sync, offline improvements)
- Core Web Vitals optimization
- WCAG 2.1 AA accessibility audit
- Sentry error tracking + error boundaries
- Playwright E2E tests for critical flows
- Security audit (CSP, rate limiting, input sanitization)

---

## Third-Party Services & Estimated MVP Cost

| Service | Purpose | Free Tier | Est. Cost (1K users) |
|---------|---------|-----------|---------------------|
| Supabase | DB, Auth, Realtime, Storage | 500MB DB, 50K MAU | $25/mo (Pro) |
| Vercel | Hosting, CI/CD | 100GB bandwidth | $20/mo (Pro) |
| LiveKit | Video conferencing | Open source self-host | $10-20/mo (VPS) |
| OpenAI | AI tutor, embeddings | Pay-per-use | $50-100/mo |
| Stripe | Payments | 2.9% + 30c per txn | Transaction-based |
| Resend | Email | 3K emails/mo | Free |
| PostHog | Analytics | 1M events/mo | Free |
| Sentry | Error tracking | 5K errors/mo | Free |
| **Total** | | | **~$105-165/mo** |

---

## Verification Plan

### After Each Phase
1. **Build check**: `npm run build` passes without errors
2. **Type check**: `npx tsc --noEmit` passes
3. **Lint**: `npm run lint` passes
4. **Dev server**: `npm run dev` loads without console errors
5. **Feature test**: Manually test each feature in the phase
6. **Responsive check**: Test on mobile viewport (375px) and desktop (1440px)
7. **Lighthouse audit**: Score 90+ on Performance, Accessibility, SEO, Best Practices

### Critical E2E Tests (Phase 6)
- Student registration -> email verification -> login
- Tutor registration -> admin approval -> profile setup
- Search tutors -> book lesson -> Stripe payment -> confirmation
- Join classroom -> video connects -> screen share works -> session ends
- AI tutor chat -> quiz generation -> grading -> XP awarded
- Gamification: XP earned -> level up -> badge earned -> leaderboard updated
- Push notification delivery
- PWA install prompt appears

---

## Progress Snapshot

- **Phase 1 marketing refresh (2026-02-04):** Rebuilt the homepage hero/benefits/how-it-works/pricing/subjects sections with tutoring-focused storytelling and JSON-LD metadata.
- **Authentication + Supabase helpers:** Added the auth layout, register/login/recover pages, browser/server/service-role Supabase clients, and middleware guarding `/dashboard`, `/student`, `/tutor`.
- **Next steps to start tomorrow:** Seed Supabase tables (subjects, tutor_profiles, availability, bookings, reviews), add marketing subpages (`/pricing`, `/how-it-works`, `/subjects/[slug]`, `/tutors/[username]`), and lay the Phase 1 dashboard skeleton so auth work feeds directly into Phase 2.

## Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# LiveKit
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
NEXT_PUBLIC_LIVEKIT_URL=

# OpenAI
OPENAI_API_KEY=

# Resend
RESEND_API_KEY=

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# Sentry
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_NAME=SBETUTOR
```
