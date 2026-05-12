---
title: "Implemented Plan: stage1_bazowa_wersja_aplikacji"
plan: docs/plans/PLAN_stage1_bazowa_wersja_aplikacji.md
feature_key: stage1_bazowa_wersja_aplikacji
branches:
  intended: feature/stage1-file-structure
  present_local: main
  migrations_branch: feature/db-migrations/init-users
pr_urls: {}
commits:
  head: 4db670e4
date: 2026-05-12
status: implemented
---

# Podsumowanie

Stage 1 został domknięty w zakresie nowego planu: frontend działa, auth UI jest gotowe, backend jest utrzymany w minimalnym, placeholderowym zakresie, a dokumentacja i testy są już na miejscu. Strona główna renderuje `Header`, `Hero`, `FeatureCards` i `Footer`, a `/register` oraz `/login` mają działające formularze z mockowaną logiką. Dodatkowo dodano `tests/unit/auth.test.ts` oraz `tests/e2e/auth.spec.ts` dla helperów auth i smoke coverage flowów `/register` oraz `/login`.

## Zmiany w kodzie (zaimplementowane)

- `app/layout.tsx` — podstawowy `RootLayout` z globalnymi stylami.
- `app/page.tsx` — strona główna z `Header`, `Hero`, `FeatureCards` i `Footer`.
- `app/components/Header.tsx` — nawigacja z linkami `Home / Login / Register`.
- `app/components/Hero.tsx` — sekcja hero.
- `app/components/FeatureCards.tsx` — sekcja kart funkcji.
- `app/components/Footer.tsx` — stopka aplikacji.
- `app/components/auth/RegisterForm.tsx` — formularz klienta rejestracji z mockowaną logiką.
- `app/components/auth/LoginForm.tsx` — formularz klienta logowania z mockowaną logiką.
- `app/register/page.tsx` — strona rejestracji.
- `app/login/page.tsx` — strona logowania.
- `lib/auth.ts` — wspólny placeholder auth helperów.
- `lib/supabase.server.ts` — serwerowy placeholder klienta Supabase.
- `README.md` — rootowy onboarding i szybki start.
- `docs/README.md` — dokumentacja repozytorium.
- `supabase/migrations/README.md` — opis istniejących migracji i sposobu ich uruchamiania.
- `vitest.config.ts` — konfiguracja testów jednostkowych.
- `vitest.setup.ts` — setup dla matcherów DOM.
- `tests/unit/header.test.tsx` — podstawowy test dla `Header`.
- `tests/unit/auth.test.ts` — testy helperów auth i formularzy.
- `tests/e2e/auth.spec.ts` — smoke testy Playwright dla `/register` i `/login`.
- `playwright.config.ts` — uruchamianie E2E z czystym serwerem testowym.
- `package.json` — skrypt `dev:test` z `next dev --webpack` dla Playwright.

Build został zweryfikowany lokalnie i przechodzi poprawnie po tych zmianach.

## Zakres zgodny z nową wersją Stage 1

Aktualna implementacja odpowiada nowej wersji planu Stage 1, w której:

- frontend jest dowożony jako pierwsza warstwa,
- backend rośnie tylko w minimalnym zakresie potrzebnym do obsługi UI,
- dokumentacja i testy są częścią tego samego etapu, a nie osobnym późniejszym dodatkiem.

## Migracje

W repo są obecnie dwie migracje bazowe oraz ich rollbacki, zgodne z planem Stage 1:

- `supabase/migrations/000_init_users.sql`
- `supabase/migrations/000_init_users_rollback.sql`
- `supabase/migrations/001_enable_rls_and_policies.sql`
- `supabase/migrations/001_enable_rls_and_policies_rollback.sql`

Dodano także `supabase/migrations/README.md`, więc ta luka z poprzedniej wersji planu została domknięta.

## Testy

- Unit: `tests/unit/header.test.tsx`, `tests/unit/auth.test.ts`.
- Integration: brak osobnych testów integracyjnych.
- E2E: `tests/e2e/auth.spec.ts`.

Weryfikacja lokalna zakończona powodzeniem: `npm test` oraz `npm run test:e2e` przechodzą. Dla Playwright użyto obejścia opartego o `next dev --webpack`, a `next.config.ts` ma ustawione `allowedDevOrigins: ["127.0.0.1"]`, żeby uniknąć blokady dev resource przy uruchomieniach testowych.

## Acceptance E2E (krok po kroku)

1. W katalogu `Book-Club-Saas-3.0`:
```bash
npm install
npm run dev
# Otwórz http://localhost:3000 — oczekiwane: strona główna z Header + Hero + FeatureCards + Footer
```

Aktualny rezultat: serwer startuje i renderuje stronę główną zgodną z nowym planem.

## Deviations / PYTANIA

- `.env.example` istnieje.
- `supabase/migrations/README.md` istnieje.
- Test unit dla `Header` istnieje.

## Co jeszcze zostało do zrobienia

- Rozbudowywać backend tylko wtedy, gdy pojawi się nowy ekran lub nowy flow.
- Utrzymać Playwright na `dev:test`, jeśli chcemy uniknąć regresji związanych z Turbopack przy E2E.

## Notes / Next steps

1. Utrzymać spójność między [docs/plans/PLAN_stage1_bazowa_wersja_aplikacji.md](docs/plans/PLAN_stage1_bazowa_wersja_aplikacji.md) a wdrożeniem.
2. Rozszerzać testy w kolejnym etapie, bez cofania obecnych placeholderów.
3. Trzymać backend w wersji minimalnej aż do momentu, gdy frontend będzie potrzebował kolejnego kroku integracji.
