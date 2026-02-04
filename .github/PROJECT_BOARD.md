# SBETUTOR Parallel Delivery Board

## Board Structure
- **Backlog / Icebox:** Raw requests pulled from Product, Research, or bug triage before prioritizing.
- **Phase 1 – Foundation:** Auth, marketing, layout, Supabase scaffolding. No downstream work can land here until the framework and DB schema exist.
- **Phase 2 – Marketplace & Booking:** Tutor marketplace, availability, booking/payment flows. Depends on Phase 1 CI + Supabase seed data.
- **Phase 3 – Video Classroom & Messaging:** LiveKit classrooms, messaging, and session records. Depends on Phase 2 (bookings + sessions) and on Supabase realtime setup.
- **Phase 4 – AI Tutor & Gamification:** GPT-4o chat, RAG, XP/badges, rewards (requires Phase 2+3 data flows).
- **Phase 5 – Payments V2/Content/Notifications:** Stripe Connect, subscriptions, course materials, notifications, PWA/admin groundwork. Depends on Phase 2 payments + Phase 3 messaging hooks.
- **Phase 6 – Polish & Launch:** Analytics, challenges/rewards, SEO/blog, PWA polish, observability, security. Unblocks once Phases 1‑5 pass verification gates.
- **Verification & Done:** Passive column for cards that have passed the verification workflow and manual QA.
- **Blocked:** Capture dependency issues (Supabase migrations, third-party credentials, infra, etc.) so teams can see blockers outside their phase column.

## Dependency Pyramid
| Phase | Depends On | Gate |
|-------|------------|------|
| Phase 1 | — | CI verification (build/tsc/lint/test) |
| Phase 2 | Phase 1, tutor/table seeds | CI + manual booking/email reminders |
| Phase 3 | Phase 2, LiveKit infra | CI + session + messaging rehearsal |
| Phase 4 | Phase 2 & 3 data + OpenAI keys | CI + AI tutor + leaderboard simulation |
| Phase 5 | Phase 2 payments + Phase 4 gamification | CI + Stripe Connect payouts + notification smoke |
| Phase 6 | All prior phases | CI + Playwright critical flows + Lighthouse audit |

## Board Use
1. Create new cards per feature/sub-task using the matching phase template.
2. Link cards that feed data downstream (e.g., Booking Card → Classroom Token API). Use the dependency field (GitHub Projects 2/3) or labels/tickets to mark blocking relationships.
3. Each card moves across columns left-to-right as it satisfies requirements.
4. Attach verification artifacts (CI run link, Playwright report, Lighthouse screenshot) before moving to **Verification & Done**.
5. Daily standups should scan the **Blocked** column and dependency rows to prevent pipeline stalls.

## Automation
- Every push/PR triggers the shared `verification` workflow (build, `npx tsc --noEmit`, `npm run lint`, `npm run test`). Cards should not advance unless the workflow passes.
- For phase-specific checks (LiveKit, AI, Stripe Connect), attach a checklist or PR comment describing the manual verification steps listed in the phase template.
