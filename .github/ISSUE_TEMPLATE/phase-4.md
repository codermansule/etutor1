---
name: Phase 4 – AI Tutor & Gamification
about: Build the AI tutor workflows, RAG, adaptive quizzes, knowledge tracking, XP, badges, streaks, and leaderboards.
title: "[Phase 4] AI Tutor & Gamification"
labels: phase4, ai, gamification
---

## Objective
Power the adaptive learning layer with GPT-4o + LangChain, RAG with pgvector, quizzes, study plans, XP/badge logic, and all gamification telemetry.

## Requirements
- Streaming AI chat (GPT-4o via Vercel AI SDK) with role-based messages, RAG search, and conversation persistence.
- Quiz generation/auto-grading, knowledge_state updates, weak area detection, personalized study plan generation.
- XP system (lessons, quizzes, streaks, reviews, referrals, challenges) + coin economy, level progression, and badge awarding.
- Streak tracking with freeze protection, leaderboard refresh cron jobs, challenge management, rewards store.
- Supabase tables for AI conversations, quizzes, knowledge_state, gamification entities per schema.
- Notifications for XP/level ups, badges, challenges via in-app/push/email channels.

## Required Services
- OpenAI (GPT-4o streaming + embeddings) + LangChain.js
- Supabase (pgvector, edge functions for cron jobs, Realtime for leaderboards)
- Resend/PostHog/Sentry for telemetry and alerts

## Acceptance Criteria
- [ ] AI tutor supports streaming chat + RAG + quiz generation accessible from student area.
- [ ] Knowledge state logging + study plan output stored per user/subject.
- [ ] XP system awards coins/levels/badges and updates leaderboard entries.
- [ ] Streak handling honors freezes + triggers cron reminders.
- [ ] Rewards store operations redeem coins for configured perks with inventory updates.

## Verification
- [ ] npm run build
- [ ] npx tsc --noEmit
- [ ] npm run lint
- [ ] Play AI tutor chat -> quiz flow -> XP + badge awarding
- [ ] Cron job simulation for leaderboard/streak refresh
