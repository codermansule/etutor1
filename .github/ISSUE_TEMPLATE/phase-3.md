---
name: Phase 3 – Video Classroom & Messaging
about: Implement LiveKit-based classrooms, tldraw whiteboard, and real-time messaging/presence.
title: "[Phase 3] Classroom & Messaging"
labels: phase3, classroom, messaging
---

## Objective
Enable live tutoring sessions with LiveKit video/whiteboard, in-session chat, recording, and a full-featured messaging inbox with presence indicators.

## Requirements
- LiveKit token generation API + `@livekit/components-react` UI for 1-on-1 classrooms (audio/video, screen share, device selection, connection quality, timers).
- tldraw whiteboard integration with session sync + annotation overlays on screen share.
- In-classroom chat, session recording metadata stored in Supabase Storage, and session chat persistence.
- Messaging app: conversation list, unread counts, file sharing, typing indicators, read receipts, online presence via Supabase Realtime.
- Supabase Realtime subscriptions for `sessions`, `session_chat_messages`, and `messages`.
- Admin or tutor dashboard hooks to monitor active sessions/status.

## Required Services
- LiveKit (self-hosted server and recording via Egress)
- Supabase (Realtime + Storage + RLS for messaging)
- Resend/Web Push (optional for session alerts)

## Acceptance Criteria
- [ ] Students/tutors can join LiveKit sessions, toggle screen share, and see timers/quality indicators.
- [ ] tldraw whiteboard syncs with other participant input.
- [ ] Session recording metadata appears in Supabase and downloads from Storage.
- [ ] Messaging works in real time, including presence/typing indicators and file uploads.

## Verification
- [ ] npm run build
- [ ] npx tsc --noEmit
- [ ] npm run lint
- [ ] Simulate classroom session + chat + recording playback
- [ ] Messaging send/receive cycle over Realtime channel
