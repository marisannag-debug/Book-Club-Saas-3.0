---
title: "Standardy kodu"
description: "Linting, formatting, testing standards, runtime validation i CI gating"
status: draft
version: 0.1
authors: ["AI (wygenerowane)"]
references:
  - docs/workflows/Agent-programowanie.md
  - docs/workflows/Agent-plany.md
date: 2026-05-04
---

# Standardy kodu

## 1. Formatter i lint
- Prettier + ESLint (recommended configs). Uruchamiaj jako pre-commit hook i w CI.
 - `npm run lint` → ESLint + TypeScript rules.

Przykładowe komendy:
```bash
npm run lint
npm run lint -- --fix
npm run format
```

## 2. TypeScript policy
- `tsconfig.json`: `strict: true` (zalecane).
- `noImplicitAny: true`, ograniczanie `any`. Jeśli `any` jest użyte, musi być opisane w komentarzu i mieć plan refaktoru.

## 3. Runtime validation
- Walidacja zewnętrznych danych za pomocą Zod (API endpoints, Edge Functions). Nie ufaj TypeScript w runtime.
- Pattern: `schema.parse(req.body)` → jeśli błąd, zwróć 400 z czytelnym opisem.

## 4. Error handling i logging
- Centralny handler błędów po stronie serwera (Edge/Server route middleware), zwracaj ustandaryzowany shape `{error: {code, message}}`.
- Logowanie: Sentry dla błędów krytycznych; debug logs lokalnie.

## 5. Testing standards
- Unit tests: każdy moduł zawiera testy jednostkowe dla krytycznej logiki.
- Integration tests: DB interactions and RLS policies (run against local supabase or preview DB).
- E2E: Playwright dla krytycznych flow (signup, create club, invite, vote flows).
- Coverage: minimalny cel 80% dla modułów krytycznych; globalny coverage target kalkulować wg risk-profile.

Komendy:
```bash
npm test
npx playwright test --reporter=list
```

## 6. CI gating
- PR nie może być zmergowany bez:
  - lint green
  - unit tests green
  - integration tests (if backend changed) green
  - optional: preview e2e smoke green

## 7. Pre-commit i commit policy
 - Husky + lint-staged: uruchamiaj `npm run lint -- --fix` i format przed commitem.
- commitlint: enforce Conventional Commits.

## 8. Observability i telemetry
- Instrumentuj krytyczne ścieżki eventami (club_created, vote_submitted). Dodaj metryki latency and error rates.

## 9. Security
- Never commit secrets. Zwracaj 401/403 dla nieautoryzowanych akcji. Validate membership via RLS.

## 10. Mapping to PLAN
- Dla każdej implementacji: dołącz `docs/implemented/implemented_plan_<feature>.md` i `docs/implemented/implemented_feature_<feature>.md` z: co zostało zaimplementowane, testy, uruchomione komendy i ewentualne odstępstwa od planu.

## 11. PYTANIA / ZAŁOŻENIA
- Czy minimalne coverage 80% jest akceptowalne dla MVP, czy wymagamy wyższych progów dla krytycznych modułów?
