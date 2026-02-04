---
name: Phase 1 – Foundation Setup
about: Scaffold the Next.js + Supabase foundation, auth flows, marketing pages, and CI/verification baseline.
title: "[Phase 1] Foundation setup"
labels: phase1, foundational
---

## Objective
Build the scaffolding for SBETUTOR: Next.js 14 App Router with Tailwind/shadcn, Supabase auth/schema, marketing microsite, layout components, and CI verification.

## Requirements
- Initialize Next.js + Tailwind + shadcn/ui + globals.
- Configure Supabase projects (profiles, subjects seeds, RLS) plus `lib/supabase` helpers.
- Implement `(auth)` flows (register/login/forgot/verify) with role selection + Supabase middleware.
- Create marketing pages in `(marketing)` (landing, pricing, about, SEO metadata, JSON-LD).
- Build shared layout (header, footer, nav, responsive sidebar/topbar) and global theming.
- Add CI/verification scripts aligned with `npm run build`, `npx tsc --noEmit`, `npm run lint`.

## Required Services
- Supabase (Auth + Postgres + RLS)
- Vercel for deployment preview + environment
- Resend for email verification (phase-1 placeholders acceptable)

## Acceptance Criteria
- [ ] Clean `npm run build`, `npx tsc --noEmit`, `npm run lint`.
- [ ] Auth flows gated by Supabase sign-in and role selection with appropriate redirects.
- [ ] Marketing pages SSG ready with metadata + JSON-LD.
- [ ] Layout renders consistently on mobile/desktop and respects theme toggling.
- [ ] CI workflow (verification) defined and referenced in README.

## Verification
- [ ] npm run build
- [ ] npx tsc --noEmit
- [ ] npm run lint
- [ ] Manual mobile/desktop layout sanity check
