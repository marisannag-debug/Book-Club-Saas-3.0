---
title: "Strategia testów — BookClub Pro (MVP)"
description: "Strategia testów dla MVP — poziomy testów, środowiska, automatyzacja i kryteria sukcesu"
status: draft
version: 0.1
authors: ["AI (wygenerowane)"]
references:
  - docs/workflows/Agent-programowanie.md
  - docs/business/bookclub-pro-mvp-scoping.md
date: 2026-05-04
---

# Strategia testów — MVP BookClub Pro

## Cel
Zapewnienie wiarygodnej weryfikacji krytycznych funkcji MVP (rejestracja, tworzenie klubu, zaproszenia, głosowania, wyniki, podstawowy czat) przez automatyczne i manualne testy na poziomach unit/integration/E2E, accessibility i podstawowych testów wydajnościowych.

## Zakres
- Obejmuje: unit tests, integration tests (kontrakt front↔back), E2E (kluczowe flowy), accessibility smoke, podstawowe load tests i security/RLS checks.
- Nie obejmuje: pełnego load testu produkcyjnego, zaawansowanych security pentestów, funkcji Tier2/3 wskazanych w planie MVP.

## Test objectives i metryki sukcesu
- Unit coverage: >= 80% dla modułów krytycznych (walidacja, logika głosowania).
- CI: wszystkie unit/integration tests muszą być zielone dla PR (100% pass); preview pipeline wymaga dodatkowych smoke/integration tests.
- E2E: krytyczne ścieżki przechodzą w preview (pass rate 100% w green CI).

## Poziomy testów
- Unit: logika, helpery, walidacje Zod.
- Integration: API ↔ DB, kontrakt (Supabase + funkcje/REST/GraphQL).
- E2E: Playwright — pełne scenariusze użytkownika (signup → create club → invite → vote → results).
- Accessibility: axe/playwright; manual checks (keyboard nav, screenreader smoke).
- Performance: krótkie benchmarki (autocannon) do wykrycia regresji percepcji wydajności.
- Security/RLS: testy sprawdzające polityki Row Level Security (Supabase) i brak dostępu nieautoryzowanego.

## Environments matrix
- Lokalny dev: Next.js + MSW (mock API) lub lokalny Supabase (`npx supabase start`).
- Preview: Vercel preview + `SUPABASE_PREVIEW_DB_URL` (jeśli dostępne) — uruchamiane z PR.
- Staging/Prod: właściwy projekt Supabase.

Wymagane env vars (przykładowe):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_DB_URL=
SUPABASE_PREVIEW_DB_URL=
SUPABASE_SERVICE_ROLE_KEY=    # server-side only
RESEND_API_KEY=
ANALYTICS_URL=
```

## Test data management
- Seedy: `scripts/seeds/seed_<feature>.sql` lub JS seed w `scripts/seeds/` do szybkiego przygotowania danych.
- Teardown: `psql $DATABASE_URL -f scripts/seeds/teardown.sql` lub truncate tables między scenariuszami.
- Dla testów E2E: fixturey resetujące DB przed każdym scenariuszem (Playwright fixtures lub custom API reset endpoint działający tylko w preview).

Przykład: uruchomienie seed + teardown
```bash
# start lokalnego supabase
npx supabase start
# załaduj seed
psql "$SUPABASE_DB_URL" -f scripts/seeds/seed_common.sql
# po teście: cleanup
psql "$SUPABASE_DB_URL" -f scripts/seeds/teardown.sql
```

## Automation & CI
- Komendy:
  - unit tests: `npm test`
  - e2e tests: `npx playwright test` (z opcją `--project=chromium`)
  - lokalny supabase: `npx supabase start`
  - push preview migrations: `npx supabase db push --db-url $SUPABASE_PREVIEW_DB_URL`
  - quick coverage: `npm test -- --coverage --outputFile=reports/test-report.html`

- Co uruchamiać gdzie:
  - PR: `npm run lint && npm test` (unit) — obowiązkowe.
  - Preview pipeline: integration tests + smoke E2E (wybrane scenariusze) + accessibility smoke.
  - Pre-merge (staging): pełne E2E suite.

## Security & RLS tests
- Testy muszą weryfikować, że operacje związane z głosowaniem wymagają członkostwa (RLS): próba `POST /api/votes/:id/submit` jako nie‑member → 401/403.
- Testy walidują, że `SUPABASE_SERVICE_ROLE_KEY` nie jest wymagany po stronie klienta i nigdy nie jest ujawniany.

## Accessibility
- Automatyczne: integracja `axe-core` w Playwright (`npx playwright test tests/accessibility`) oraz `jest-axe` dla komponentów.
- Manualne: keyboard navigation (tab order), screenreader smoke using VoiceOver/NVDA on critical pages.

## Performance & load (minimalne)
- Krótkie testy: `npx autocannon -c 50 -d 10 http://localhost:3000/api/votes` (symulacja burstów dla endpointów tworzenia głosowania/głosowania).
- Metrika sukcesu: p95 latency < 500ms dla kluczowych endpointów w lokalnym środowisku testowym.

## Acceptance criteria
- Unit coverage >= 80% dla krytycznych modułów.
- Wszystkie unit/integration tests zielone w PR.
- Dwa wybrane E2E scenariusze (signup, create vote + submit) przechodzą w preview.
- Accessibility smoke: brak krytycznych błędów z axe.

## Output artifacts
- Test coverage: `coverage/lcov-report/index.html`
- Playwright report: `playwright-report/index.html`
- Integration test reports: `reports/integration-report.html`
- Seed/teardown scripts: `scripts/seeds/`

## Next steps
- Dla nowej funkcji: wygenerować `tests/e2e/<feature>.spec.ts` zgodnie ze scenariuszami i dodać seed SQL.
- Zautomatyzować smoke tests w preview pipeline.

## PYTANIA / ZAŁOŻENIA
- Jeśli preview DB nie jest dostępne (`SUPABASE_PREVIEW_DB_URL`):
  - Opcja A: użyć lokalnego `npx supabase start` podczas CI (PROPOZYCJA: A dla szybkiej weryfikacji),
  - Opcja B: uruchomić testy integration jedynie lokalnie i oznaczyć preview jako manual.

---
