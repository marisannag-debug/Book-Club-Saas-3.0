---
title: "Implemented Plan: stage3_rejestracja"
plan: docs/plans/PLAN_stage3_rejestracja.md
feature_key: stage3_rejestracja
branches:
  present_local: main
pr_urls: {}
commits:
  head: 2cb9367a
date: 2026-05-12
status: implemented
---

# Podsumowanie

Stage 3 został zrealizowany jako pełny flow rejestracji email + hasło dla `/register`. Formularz ma bieżącą walidację, czytelne stany błędu i sukcesu, blokadę submit podczas wysyłki oraz poprawione a11y. Backendowy helper `registerUser` korzysta teraz z realnego Supabase Auth zamiast mocka, a testy unit i E2E zostały dostosowane do nowego kontraktu.

## Zmiany w kodzie

- `app/components/auth/RegisterForm.tsx` — przebudowa formularza rejestracji: walidacja emaila i hasła w trakcie wpisywania i przy submit, stany loading/success/error, disabled submit, `role=status`, komunikaty `role=alert`, poprawione etykiety i link do logowania.
- `lib/auth.ts` — zamiana mocka na adapter Supabase Auth dla `registerUser`, mapowanie błędów Supabase na komunikaty przyjazne użytkownikowi, normalizacja URL Supabase oraz zachowanie kontraktu zwrotki `AuthResult`.
- `tests/unit/auth.test.ts` — nowe testy dla adaptera Supabase, walidacji formularza, blokady submit i happy path rejestracji.
- `tests/e2e/auth.spec.ts` — scenariusz walidacji błędnych danych oraz happy path rejestracji; odpowiedź signup jest stubowana, żeby test był deterministyczny mimo limitu wysyłki maili w projekcie.
- `playwright.config.ts` — włączone `reuseExistingServer`, aby Playwright mógł korzystać z już uruchomionego dev servera na porcie 3000.
- `.env.example` — uproszczony do publicznych zmiennych wymaganych dla Stage 3: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_ENV`.
- `package.json` i `package-lock.json` — dodana zależność `@supabase/supabase-js`.

## Migracje

- Brak nowych migracji SQL.
- Stage 3 opiera się wyłącznie o Supabase Auth, więc nie było potrzeby uruchamiania `supabase db push`.

## Testy

- Unit: `npx vitest run tests/unit/auth.test.ts` — pass.
- E2E: `npx playwright test tests/e2e/auth.spec.ts` — pass.
- Dodatkowa diagnostyka: bezpośredni test signup w Supabase zwrócił `429 over_email_send_rate_limit`, dlatego happy path E2E został stabilizowany stubem odpowiedzi signup zamiast zależnością od limitu zewnętrznego projektu.

## Acceptance E2E (krok po kroku)

1. Uruchomić aplikację:
```powershell
npm run dev:test
```

2. Uruchomić testy E2E rejestracji:
```powershell
npx playwright test tests/e2e/auth.spec.ts
```

3. Oczekiwany rezultat:
- `/register` renderuje formularz email + hasło zgodny z makietą S002.
- Niepoprawny email pokazuje błąd inline.
- Hasło krótsze niż 6 znaków pokazuje błąd inline i blokuje submit.
- Poprawny submit kończy się komunikatem sukcesu albo instrukcją sprawdzenia skrzynki.

## Deviations / PYTANIA

- W trakcie wdrażania live Supabase signup w projekcie zwracał `over_email_send_rate_limit`. To nie jest regres UI, tylko ograniczenie środowiska Supabase, więc happy path E2E został odseparowany od tej zależności przez stub odpowiedzi signup.
- `lib/supabase.server.ts` pozostał bez zmian, bo Stage 3 nie wymagało logiki server-side poza publicznym anon clientem.
- `app/register/page.tsx` nie wymagał zmian strukturalnych; shell strony był już zgodny z zakresem stage 3.

## Notes / Next steps

1. Jeśli ten flow ma być testowany w CI przeciwko żywemu Supabase, warto użyć świeżego projektu albo resetowalnego środowiska testowego, żeby uniknąć limitu wysyłki wiadomości.
2. Można dopisać krótki note w docs/README o wymaganych publicznych zmiennych auth dla Stage 3.
3. Kolejny etap może rozbudować logowanie albo recovery bez ruszania samego kontraktu rejestracji.