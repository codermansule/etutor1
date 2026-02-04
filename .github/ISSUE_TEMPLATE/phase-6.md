---
name: Phase 6 – Polish & Launch
about: Final polish: admin analytics, challenges/rewards, SEO/blog, PWA optimization, accessibility, Playwright, and security.
title: "[Phase 6] Polish & Launch"
labels: phase6, polish, launch
---

## Objective
Ship a production-ready platform with full analytics, gamification completion, SEO/blog, PWA polish, stability observability, tests, and security hardening.

## Requirements
- Admin dashboard v2 with revenue analytics, moderation tools, platform settings, and audit trails.
- Challenges + rewards store complete (tracking, redemption, CDN-safe assets) and accessible leaderboards.
- SEO completion: JSON-LD (EduOrg, Course, Person, FAQ), sitemap/robots, OG/Twitter metadata, MDX blog.
- PWA enhancements: background sync, offline improvements, accessibility fine-tuning (WCAG 2.1 AA), Core Web Vitals optimization.
- Observability: Sentry error boundaries, PostHog analytics, Playwright E2E for critical flows.
- Security audit steps (CSP, rate limits, sanitization) and finalize release checklist.

## Required Services
- PostHog & Sentry for analytics/error tracking
- Vercel (Playwright suites + deployment previews)
- External security/performance tooling as needed

## Acceptance Criteria
- [ ] Playwright E2E tests cover critical flows from `PROJECT.md`.
- [ ] Admin analytics dashboards show live revenue/stats; audit log captured.
- [ ] SEO/blog pages validate structured data + sitemap/robots.
- [ ] PWA scores across Core Web Vitals + WCAG AA benchmarks.
- [ ] Security gate items documented and enforced.

## Verification
- [ ] npm run build
- [ ] npx tsc --noEmit
- [ ] npm run lint
- [ ] npm run test
- [ ] Playwright critical flow suite run
- [ ] Lighthouse audit (Perf/A11y/SEO/Best Practices)
