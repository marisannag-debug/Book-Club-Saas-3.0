---
title: "Implemented Plan: stage4_logowanie"
plan: docs/plans/PLAN_stage4_logowanie.md
feature_key: stage4_logowanie
branches:
  present_local: main
pr_urls: {}
commits:
  head: 2dfcc498
date: 2026-05-12
status: implemented
---

# Podsumowanie

Stage 4 został zrealizowany jako pełny flow logowania email + hasło dla `/login`. Formularz ma bieżącą walidację, czytelne stany błędu i sukcesu, blokadę submit podczas wysyłki oraz poprawione a11y. Helper `loginUser` korzysta teraz z realnego Supabase Auth `signInWithPassword` zamiast mocka, a testy unit i E2E zostały dostosowane do nowego kontraktu.

## Zmiany w kodzie

- `app/components/auth/LoginForm.tsx` — przebudowa formularza logowania: walidacja emaila i hasła w trakcie wpisywania i przy submit, stany loading/success/error, disabled submit, `role=status`, komunikaty `role=alert`, poprawione etykiety i link do rejestracji.
- `lib/auth.ts` — zamiana mocka na adapter Supabase Auth dla `loginUser`, mapowanie błędów Supabase na komunikaty przyjazne użytkownikowi, normalizacja URL Supabase oraz zachowanie kontraktu zwrotki `AuthResult`.
- `tests/unit/auth.test.ts` — nowe testy dla adaptera Supabase, walidacji formularza, blokady submit i happy path logowania.
- `tests/e2e/auth.spec.ts` — scenariusz walidacji błędnych danych oraz happy path logowania; odpowiedź token jest stubowana, żeby test był deterministyczny niezależnie od realnego projektu Supabase.
- `docs/plans/PLAN_stage4_logowanie.md` — plan stage 4, na podstawie którego zrealizowano implementację.

## Migracje

- Brak nowych migracji SQL.
- Stage 4 opiera się wyłącznie o Supabase Auth, więc nie było potrzeby uruchamiania `supabase db push`.

## Testy

- Unit: `npx vitest run tests/unit/auth.test.ts` — pass.
- E2E: `npx playwright test tests/e2e/auth.spec.ts` — pass.
- Lint: `npm run lint -- lib/auth.ts app/components/auth/LoginForm.tsx tests/unit/auth.test.ts tests/e2e/auth.spec.ts` — pass.
- Integracja: brak osobnego suite integracyjnego; kontrakt auth został pokryty przez unit testy helpera i E2E z deterministycznym stubem odpowiedzi Supabase.

## Acceptance E2E (krok po kroku)

1. Uruchomić aplikację:
```powershell
npm run dev:test
```

2. Uruchomić testy E2E logowania:
```powershell
npx playwright test tests/e2e/auth.spec.ts
```

3. Oczekiwany rezultat:
- `/login` renderuje formularz email + hasło zgodny z obecną prostą makietą.
- Niepoprawny email pokazuje błąd inline.
- Puste hasło pokazuje błąd inline i blokuje submit.
- Poprawny submit kończy się komunikatem sukcesu.

## Deviations / PYTANIA

- Nie wprowadzono redirectu po loginie. Został utrzymany czytelny komunikat sukcesu, żeby flow było spójne z planem i prostsze do zweryfikowania w testach.
- `app/login/page.tsx` nie wymagał zmian strukturalnych; istniejący shell strony był już zgodny z zakresem stage 4.
- Nie dodano osobnej warstwy sesji ani nowych tabel profilu, bo nie było to potrzebne dla samego logowania.

## Notes / Next steps

1. Jeśli stage 4 ma zostać rozbudowany, kolejnym krokiem może być kontrolowany redirect po loginie do klubu lub dashboardu.
2. Można dopisać krótki note w docs/README o wymaganych publicznych zmiennych auth dla Stage 4.
3. Następny etap funkcjonalny może skupić się na weryfikacji sesji lub przepływie wejścia do klubu bez ruszania samego kontraktu logowania.
