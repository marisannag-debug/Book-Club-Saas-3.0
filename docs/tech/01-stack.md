---
title: "Stack technologiczny"
description: "Opis stosu technologicznego: frontend, backend, DB, auth, storage, komendy deva i deploy"
status: draft
version: 0.1
authors: ["AI (wygenerowane)"]
references:
  - docs/workflows/Agent-programowanie.md
  - docs/workflows/Agent-plany.md
date: 2026-05-04
---

# Stack technologiczny — BookClub Pro (MVP)

## 1. Ogólny zarys architektury
- Frontend: Next.js 14 (App Router) + React 18 + TypeScript + Tailwind CSS
- Backend: Supabase (Postgres + Auth + RLS + Storage + Edge Functions) — serwer bezstanowy, głównie SQL + policies
- API: REST/Edge Functions + opcjonalny GraphQL/Schema-first (jeśli potrzebne)
- Validation & Types: Zod + TypeScript (schema-first for public boundaries)
- Tests: Jest/Vitest (unit), integration tests (supertest/axios), Playwright (E2E)
- CI/CD: GitHub Actions + Vercel (preview & prod)
- Dev tooling: pnpm, pnpm-workspaces

Prosty ASCII diagram:

Frontend (Next.js) <---> Supabase (Postgres + Edge) <---> Storage / External APIs

## 2. Kluczowe technologie i jak ich używamy
- Next.js 14 (App Router): routing, SSR/ISR kiedy wymagane, server components opcjonalnie.
- TypeScript: pełne `strict` w `tsconfig.json`, typy udostępniane między frontendem a backendem (packages lub `src/lib/types`).
- Tailwind CSS: utility-first dla szybkiego prototypowania i spójnego designu.
- Supabase:
  - Postgres jako główne źródło prawdy
  - Auth (email magic link / password)
  - RLS (Row Level Security) — wymóg bezpieczeństwa dla większości tabel
  - Storage — obrazy awatarów/okładek
  - Edge Functions — server-side actions wymagające service key
- Zod: walidacja i parsowanie danych na granicach API
- Playwright: E2E tests i accessibility smoke (axe)
- pnpm: menedżer pakietów (szybszy, deterministyczny)
- Vercel: hosting frontendu (preview + production)

## 3. Komendy deweloperskie (szybkie)
```powershell
# instalacja
pnpm install

# lokalny dev (frontend)
pnpm dev

# lokalny supabase (jeśli używasz emulatora)
npx supabase start

# push migrations to preview/local DB
npx supabase db push --db-url "$SUPABASE_DB_URL"

# testy
pnpm test
npx playwright test

# lint
pnpm lint
```

## 4. Kroki deploya (wybrane)
1. Przygotuj migracje SQL + rollback scripts (w `supabase/migrations/`).
2. Utwórz backup bazy: `pg_dump --format=custom -f backup.dump "$DATABASE_URL"`.
3. Push branch → PR → CI (lint + unit tests).
4. W preview pipeline (jeśli `SUPABASE_PREVIEW_DB_URL`): `npx supabase db push --db-url $SUPABASE_PREVIEW_DB_URL`.
5. Merge to `main` → Vercel deploy; migracje do produkcji po manualnym akceptowaniu i backupie.

## 5. Operacyjne uwagi
- Secrets: przechowuj w GitHub Secrets / Vercel Env / Supabase Project Settings.
- Monitoring: Sentry (errors), Prometheus/Grafana or hosted metrics for API latency.
- Backup: cotygodniowy snapshot + before-migration backup.
- Koszty: Supabase storage & function invocations — miej limity i retry logic.

## 6. Mapping to PLAN
- Przykładowe mapowania:
  - `PLAN_user_registration` → Auth (Supabase Auth), users table, signup flow
  - `PLAN_create_club` → clubs table, club page, permissions (RLS)
  - `PLAN_create_vote` → votes, vote_options, submissions, unique constraints

## 7. PYTANIA / ZAŁOŻENIA
- Zakładam, że projekt używa Supabase jako głównego backendu (jeśli nie, wskazać alternatywę).
- Czy preview DB (`SUPABASE_PREVIEW_DB_URL`) będzie dostępne w CI? (jeśli nie — zmodyfikować instrukcje migracji w CI)
- Czy wymagane są prywatne regiony danych (data residency)?
