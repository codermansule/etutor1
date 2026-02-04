# SBETUTOR Phase 1 Foundation

This repository captures the Phase 1 sprint for SBETUTOR: a Preply-style tutoring marketplace with Supabase auth, marketing pages, and CI verification ready for downstream phases like marketplace booking, LiveKit classrooms, AI tutoring, and gamification.

## Highlights

- Next.js 14 App Router with Tailwind CSS 4, custom layout, and typographic system.
- Marketing-ready hero, deliverables, timeline, and verification CTA.
- Central CI workflow ensures every phase runs `build`, `typecheck`, `lint`, and `test` before it can progress.
- GitHub issue templates and project board guidance keep teams aligned on phases 1–6.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the dev server:

   ```bash
   npm run dev
   ```

3. Visit [http://localhost:3000](http://localhost:3000) to explore the Phase 1 hero section, verification plan, and board alignment.

## Available Scripts

- `npm run dev` – starts the Next.js development server.
- `npm run build` – builds a production-ready version of the app.
- `npm run start` – runs the compiled application (after `npm run build`).
- `npm run lint` – executes ESLint with zero warnings allowed.
- `npm run typecheck` – runs `tsc --noEmit` for full type coverage.
- `npm run test` – currently aliases `npm run lint` to satisfy the verification workflow.

## Phase 1 Next Steps

1. Expand the Supabase layer (profiles, subjects, tutor applications, RLS policies).
2. Build `(auth)` flows, marketing pages (`/pricing`, `/how-it-works`, `/subjects/[slug]`), and Scenes for dashboards.
3. Populate `.github/workflows/verification.yml` and issue templates (`.github/ISSUE_TEMPLATE/`) to keep phases accountable.
4. Use `.github/PROJECT_BOARD.md` as the canonical delivery board spec and create cards that represent Phases 2‑6 with dependencies.

## Verification Plan

Before any card moves to the “Verification & Done” column, the `Phase Verification` workflow runs:

1. `npm run build`
2. `npm run typecheck`
3. `npm run lint`
4. `npm run test` (currently lint)

Manual checks for each phase (responsive review, feature test, lighthouse) are complementary to the automated checks listed above.

## Supabase Setup (Phase 1)

1. Add a `.env.local` with the keys you copied from Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://qdncyphicsimvrpvpsmv.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable__PQ72biugCuKAmq4qPIcwg_VYjfD_bM
   SUPABASE_SERVICE_ROLE_KEY=<service_role key from your Supabase API settings>
   ```
   Do not commit `.env.local` or the service role key.

2. Create the Phase 1 tables in the Supabase SQL editor:
   ```sql
   create table subjects (
     id uuid primary key default gen_random_uuid(),
     name text not null,
     slug text unique not null,
     category text not null,
     description text,
     sort_order integer default 0
   );

   create table profiles (
     id uuid primary key references auth.users(id) on delete cascade,
     full_name text not null,
     email text not null,
     role text not null default 'student',
     timezone text default 'UTC',
     created_at timestamptz default now()
   );
   ```

3. Seed `subjects` with your initial offerings (languages, test prep, professional, etc.) so the homepage can render them via `createServerClient()`.
4. When building auth flows, use `createBrowserClient()` on the client and the server helper above for middleware/server components that need the service role key.
