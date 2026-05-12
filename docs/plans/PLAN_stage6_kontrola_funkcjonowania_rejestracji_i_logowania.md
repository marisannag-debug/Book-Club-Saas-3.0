---
title: "PLAN_stage6_kontrola_funkcjonowania_rejestracji_i_logowania"
status: draft
authors: ["AI (wygenerowane)"]
date: 2026-05-12
references:
  - docs/plans/mvp-file-structure-plan.md
  - docs/plans/mvp-stage-outline.md
  - docs/workflows/Agent-plany.md
  - tests/unit/auth.test.ts
  - tests/unit/header.test.tsx
  - tests/unit/supabase.server.test.ts
  - tests/e2e/auth.spec.ts
  - app/components/auth/LoginForm.tsx
  - app/components/auth/RegisterForm.tsx
  - app/components/Header.tsx
---

# Stage 6 — Kontrola funkcjonowania rejestracji i logowania

## 1. Cel
Ustabilizować i zabezpieczyć flow rejestracji oraz logowania przez zestaw testów jednostkowych i smoke E2E, tak aby kolejne etapy mogły bezpiecznie opierać się na istniejącym kontrakcie auth.

## 2. Zakres
### Wchodzi w zakres
- Testy jednostkowe helperów auth w `tests/unit/auth.test.ts`.
- Test regresji dla nagłówka i linków do `/login` oraz `/register` w `tests/unit/header.test.tsx`.
- Smoke E2E dla `/register` i `/login` w `tests/e2e/auth.spec.ts`.
- Weryfikacja kontraktu błędów i sukcesu dla formularzy logowania i rejestracji.
- Uporządkowanie danych testowych i mocków Supabase tak, aby testy były powtarzalne lokalnie i w CI.

### Nie wchodzi w zakres
- Nowe funkcje biznesowe poza auth.
- Zmiany schematu bazy, migracje Supabase lub polityki RLS.
- Nowe endpointy API, server actions albo rozbudowa backendu produktu.
- Zmiany w wizualnym designie stron poza ewentualnymi poprawkami potrzebnymi do testowalności.

## 3. Wymagania funkcjonalne
- Rejestracja ma być potwierdzona testem jednostkowym i E2E dla happy path.
- Logowanie ma być potwierdzone testem jednostkowym i E2E dla happy path.
- Walidacja pól w formularzach ma blokować submit dla niepoprawnych danych.
- Komunikaty z helperów auth mają być mapowane na czytelne treści dla użytkownika.
- Header ma prowadzić do właściwych tras auth i nie może regresować podczas zmian testów.
- Testy mają pokrywać minimalny kontrakt wymagany przez stage 3, stage 4 i stage 5.

## 4. Wymagania niefunkcjonalne
- Stabilność: testy nie mogą zależeć od rzeczywistego Supabase ani od stanu zewnętrznego.
- Powtarzalność: dane testowe mają być deterministyczne lub generowane lokalnie per test.
- Czytelność: asercje mają wprost sprawdzać komunikaty, role ARIA i docelowe trasy.
- Utrzymanie: testy mają być krótkie, lokalne i łatwe do rozszerzenia w kolejnych etapach.

## 5. Kontekst techniczny
- Komponenty UI: `app/components/auth/LoginForm.tsx`, `app/components/auth/RegisterForm.tsx`, `app/components/Header.tsx`.
- Warstwa logiki: `lib/auth.ts` oraz istniejący wrapper Supabase server-side w `lib/supabase.server.ts`.
- Testy jednostkowe: Vitest + React Testing Library.
- Testy E2E: Playwright z route mockingiem dla endpointów Supabase Auth.
- Dane i env: nadal wymagane są `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`, opcjonalnie `SUPABASE_SERVICE_ROLE_KEY` dla testów server-side.

## Preconditions
- Branch roboczy utworzony od `main` albo aktualny branch funkcjonalny `rejestracja_i_logowanie`.
- Lokalnie dostępne zmienne z `.env.example` dla auth i adresu aplikacji.
- Zainstalowane zależności node i gotowe środowisko Playwright.
- Istniejące komponenty `/register` i `/login` są już wdrożone.
- Testy unit i E2E mają prawo mockować Supabase bez łączenia się z produkcyjną bazą.

## 6. Kroki implementacji
### 6.1 Frontend
1. Utrwalić testy formularzy w `tests/unit/auth.test.ts`, tak aby sprawdzały blokadę submitu, walidację inline oraz komunikaty sukcesu i błędu.
2. Zachować asercje dla dostępności: label, role przycisków, role status i czytelne teksty błędów.
3. Uzupełnić regresję nagłówka w `tests/unit/header.test.tsx`, żeby CTA do `/login` i `/register` pozostały niezmienne.
4. W `tests/e2e/auth.spec.ts` utrzymać smoke dla obu formularzy z route mockingiem odpowiedzi Supabase.
5. Jeśli test ujawni rozjazd kontraktu, poprawić tylko komunikat lub stabilność renderowania, bez rozbudowy UI.

### 6.2 Backend
1. Potwierdzić, że helpery w `lib/auth.ts` zwracają stabilny kontrakt `{ ok, message }` i są testowalne przez mock `createClient`.
2. Zweryfikować, że testy server-side nie wymagają zmian w `lib/supabase.server.ts`, poza ewentualnym doprecyzowaniem mocka albo helpera testowego.
3. Nie dodawać nowych endpointów ani migracji, bo stage 6 dotyczy kontroli jakości istniejącego auth flow.
4. Jeżeli potrzeba, wyizolować wspólne fixture lub helpery testowe, ale bez zmiany publicznego API aplikacji.

### 6.3 Minimalny podział pracy
- 1x frontend dev: testy komponentów, asercje dostępności i regresja nagłówka.
- 1x backend/test dev: mocki Supabase Auth, kontrakt helperów i smoke E2E.

## 7. Rekomendowana kolejność prac
1. Najpierw dopiąć testy jednostkowe helperów auth, bo one definiują kontrakt komunikatów.
2. Następnie zabezpieczyć regresję Headera, żeby nawigacja do auth nie rozjechała się przy zmianach w UI.
3. Na końcu dopiąć smoke E2E dla `/register` i `/login`, bo one potwierdzają pełny przepływ użytkownika.

## 8. Wymagania niefunkcjonalne do walidacji
- Testy mają działać lokalnie na Windows i w CI bez zmian w konfiguracji środowiska.
- Błędy mają być wyświetlane jako konkretne komunikaty, nie jako surowe odpowiedzi Supabase.
- Asercje nie powinny zależeć od przypadkowej kolejności renderowania.

## 9. `.env.example`
Stage 6 nie wprowadza nowych zmiennych, ale plik wzorcowy musi nadal zawierać wszystkie wartości potrzebne do uruchomienia auth i testów lokalnych.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=
```

Jeśli zespół używa osobnego środowiska testowego, może dopisać własny `NEXT_PUBLIC_APP_ENV`, ale stage 6 nie wymaga nowej zmiennej obowiązkowej.

## 10. Komendy lokalne
```powershell
npm install
npm run lint
npm run test
npx playwright test tests/e2e/auth.spec.ts
npm run test:e2e
npm run dev:test
npm run build
```

```bash
npm install
npm run lint
npm run test
npx playwright test tests/e2e/auth.spec.ts
npm run test:e2e
npm run dev:test
npm run build
```

## 11. Zmiany DB / migracje
Stage 6 nie wymaga zmian w bazie danych ani nowych migracji. Jeśli testy ujawnią problem w warstwie auth backendu, należy go rozwiązać w helperach albo mockach, a nie przez rozszerzanie modelu danych.

## 12. Branch, commit i PR
- Branch: `feature/plans/PLAN_stage6_kontrola_funkcjonowania_rejestracji_i_logowania`
- Commit: `docs(plans): add PLAN_stage6_kontrola_funkcjonowania_rejestracji_i_logowania.md`
- PR title: `PLAN: stage 6 kontrola rejestracji i logowania — implementation plan`

## 13. Kryteria akceptacji
- Istnieje osobny plan dla stage 6 zapisany w `docs/plans/`.
- Plan obejmuje unit testy, header regression test i smoke E2E dla auth.
- Zakres nie wprowadza nowych migracji ani nowych endpointów.
- `.env.example` jest opisany jako wystarczający dla lokalnego uruchomienia testów.
- Zdefiniowano kolejność prac, podział ról i komendy uruchomieniowe.

## 14. Testy
- Unit: `tests/unit/auth.test.ts` dla helperów i mapowania błędów.
- Unit: `tests/unit/header.test.tsx` dla linków w nagłówku.
- E2E: `tests/e2e/auth.spec.ts` dla happy-path i walidacji formularzy.
- Smoke: `npm run test` oraz `npx playwright test tests/e2e/auth.spec.ts` jako minimalna weryfikacja przed merge.

## 15. Acceptance E2E test (krok po kroku)
```powershell
npm run dev:test
```

```powershell
npx playwright test tests/e2e/auth.spec.ts
```

```powershell
npx playwright test tests/e2e/auth.spec.ts --headed
```

```bash
npm run dev:test
```

```bash
npx playwright test tests/e2e/auth.spec.ts
```

```bash
npx playwright test tests/e2e/auth.spec.ts --headed
```

Kroki ręczne do potwierdzenia:
1. Uruchomić aplikację lokalnie i otworzyć `/register`.
2. Sprawdzić, że błędny email i zbyt krótkie hasło blokują submit.
3. Wykonać happy path rejestracji i potwierdzić komunikat sukcesu.
4. Otworzyć `/login`, sprawdzić walidację oraz happy path logowania.
5. Kliknąć linki w nagłówku i potwierdzić prowadzenie do `/login` i `/register`.

## 16. Gotowe do review?
- Preconditions są jasno opisane.
- Kroki implementacji są rozdzielone na frontend i backend/testy.
- Nie ma zbędnych zmian w bazie ani nowych endpointów.
- Komendy lokalne i E2E są kopiowalne.
- Branch, commit i PR title są zdefiniowane.

## 17. PYTANIA / ZAŁOŻENIA
- Założenie: stage 6 ma kontrolować istniejący auth flow, a nie rozbudowywać produkt. PROPOZYCJA: ograniczyć zakres do testów i stabilizacji kontraktu.
- Założenie: route mocking Supabase w Playwright jest wystarczający dla smoke E2E. PROPOZYCJA: nie podpinać prawdziwego backendu w testach E2E.
- Założenie: header należy do zakresu regresji, bo prowadzi użytkownika do auth. PROPOZYCJA: utrzymać test linków w `tests/unit/header.test.tsx`.