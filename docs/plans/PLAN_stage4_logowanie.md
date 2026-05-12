---
title: "PLAN_stage4_logowanie"
status: draft
authors: ["AI (wygenerowane)"]
date: 2026-05-12
references:
  - docs/plans/mvp-file-structure-plan.md
  - docs/plans/mvp-stage-outline.md
  - docs/workflows/Agent-plany.md
  - docs/architecture/01-makiety.md
  - docs/business/bookclub-pro-user-journey-map.md
  - tests/unit/auth.test.ts
  - tests/e2e/auth.spec.ts
---

# Stage 4 — Logowanie

## 1. Cel
Zbudować działający flow logowania dla istniejącego użytkownika w wariancie email + hasło, z czytelnym UI, walidacją, dostępnością i realną integracją z Supabase Auth zamiast mocka.

## 2. Zakres
### Wchodzi w zakres
- Strona `/login` i komponent `LoginForm`.
- Walidacja po stronie klienta dla emaila i hasła.
- Stany UI: loading, success, error, disabled submit.
- Integracja `loginUser` z Supabase Auth `signInWithPassword`.
- Aktualizacja testów unit i E2E dla flow logowania.
- Zachowanie zgodne z obecnym układem aplikacji i prostą strukturą z makiety.

### Nie wchodzi w zakres
- Rejestracja nowych użytkowników.
- Reset hasła, magic link, social login, MFA i remember me.
- Logout i zarządzanie sesją poza samym wejściem do systemu.
- Tworzenie tabel profilu użytkownika lub rozbudowa modelu danych poza auth.
- Nowe endpointy API, jeśli logowanie może działać bezpośrednio przez helper auth.

## 3. Wymagania funkcjonalne
- Formularz musi przyjmować tylko email i hasło.
- Email musi być walidowany na bieżąco i przy submit.
- Hasło nie powinno być puste; formularz ma blokować submit, jeśli pole jest niewypełnione.
- Submit musi być zablokowany podczas wysyłki, żeby uniknąć podwójnych prób logowania.
- Po sukcesie użytkownik ma dostać jasny komunikat lub zostać przekierowany do kolejnego kroku zgodnie z decyzją stage, ale bez ukrytego, nieczytelnego przejścia.
- Błędy z Supabase muszą być mapowane na czytelne komunikaty dla użytkownika.
- Zapis musi zachować semantykę dostępności: etykiety, focus order i region statusu.

## 4. Wymagania niefunkcjonalne
- Wydajność: bez ciężkich zależności i bez niepotrzebnego stanu globalnego.
- Bezpieczeństwo: brak sekretów w kodzie klienta, używać tylko publicznego anon key na froncie.
- UX: krótki formularz, jasne komunikaty, bez zbędnych kroków po drodze.
- Dostępność: poprawne `label`, `aria-live`, `role=status`, czytelny focus i kontrast.
- Stabilność: obecne testy nie mogą przestać przechodzić po przełączeniu z mocka na realny adapter.

## 5. Kontekst techniczny
- Komponenty: `app/login/page.tsx`, `app/components/auth/LoginForm.tsx`, `lib/auth.ts`.
- Integracja backendowa: Supabase Auth `signInWithPassword` jako docelowy mechanizm logowania.
- Placeholder serwerowy: `lib/supabase.server.ts` pozostaje opcjonalnym punktem integracji tylko wtedy, gdy stage rzeczywiście zacznie potrzebować logiki server-side.
- Testy: `tests/unit/auth.test.ts` i `tests/e2e/auth.spec.ts`.
- Dane: w tym stage nie dodajemy nowych tabel ani migracji SQL.

## Preconditions
- Branch roboczy utworzony od `main`.
- Dostępny projekt Supabase z włączonym Auth i przygotowanymi danymi dostępowymi do istniejącego konta testowego.
- W lokalnym środowisku ustawione `NEXT_PUBLIC_SUPABASE_URL` i `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Istniejące trasy `/login` i `/register` działają lokalnie.
- Aktualny mock w `lib/auth.ts` jest jeszcze dostępny jako punkt wyjścia do podmiany.
- Testy Playwright dla auth są już w repo i mogą zostać rozbudowane bez tworzenia nowego harnessu.

## 6. Kroki implementacji
### 6.1 Frontend
1. Uporządkować `LoginForm`, tak aby walidacja emaila i hasła działała przed wysłaniem formularza oraz w trakcie wpisywania.
2. Dodać jawne stany błędu pod polami i zachować region statusu dla komunikatu końcowego.
3. Utrzymać minimalny układ z obecnej strony: email, hasło, CTA i link/nawigacja do rejestracji.
4. Zablokować submit podczas trwającego logowania i pokazać stan loading.
5. Rozszerzyć `tests/unit/auth.test.ts` o scenariusze walidacji, błędów i poprawnego przekazania danych do helpera.
6. Rozszerzyć `tests/e2e/auth.spec.ts` o scenariusz błędnego emaila, pustego hasła i happy path logowania.

### 6.2 Backend
1. Podmienić mock w `lib/auth.ts` na adapter Supabase Auth dla `loginUser`.
2. Zachować stabilny kontrakt zwracanych wyników, żeby UI mogło mapować sukces i błąd bez dodatkowych warstw.
3. Ustalić, czy po loginie ma następować redirect, czy tylko komunikat sukcesu; jeśli redirect, to do kolejnego etapu aplikacji zgodnie z MVP.
4. Nie dodawać migracji SQL w Stage 4, ponieważ logowanie opiera się na Supabase Auth i nie wymaga nowych tabel.
5. Jeśli pojawi się potrzeba klienta Supabase po stronie serwera, odłożyć to do `lib/supabase.server.ts` bez rozbudowywania tego stage ponad minimum.

### 6.3 Minimalny podział pracy
- 1x frontend dev: walidacja, stany UI, dostępność i testy formularza.
- 1x backend dev: adapter Supabase Auth, env wiring i mapowanie błędów.

## 7. Rekomendowana kolejność prac
1. Najpierw dopiąć frontendowy UX formularza, bo obecny ekran już istnieje i daje szybki feedback.
2. Następnie podmienić `loginUser` na realne `signInWithPassword`, utrzymując kontrakt odpowiedzi.
3. Na końcu dopracować testy unit i Playwright, żeby zablokować regresję przy przejściu z mocka na integrację.

## 8. `.env.example`
W Stage 4 trzeba mieć tylko zmienne potrzebne do publicznej integracji auth:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Nie dodawać `SUPABASE_SERVICE_ROLE_KEY`, jeśli Stage 4 nie używa jeszcze operacji administracyjnych po stronie serwera.

## 9. Komendy lokalne
```powershell
npm install
npm run dev
npm run lint
npm run test
npm run test:e2e
npm run build
```

```bash
npm install
npm run dev
npm run lint
npm run test
npm run test:e2e
npm run build
```

## 10. Zmiany DB / migracje
Brak nowych migracji SQL w Stage 4. Logowanie opiera się na Supabase Auth, więc nie trzeba uruchamiać `supabase db push` dla tego etapu.

Jeśli zespół zdecyduje się później na dodatkową warstwę sesji lub profil użytkownika, to powinien być osobny plan i osobna migracja, nie ten stage.

## 11. Branch, commit i PR
- Branch: `feature/plans/PLAN_stage4_logowanie`
- Commit: `docs(plans): add PLAN_stage4_logowanie.md`
- PR title: `PLAN: stage 4 logowanie — implementation plan`

## 12. Kryteria akceptacji
- `/login` renderuje formularz email + hasło zgodny z obecną prostą makietą.
- Walidacja blokuje submit dla pustych i niepoprawnych pól.
- `loginUser` korzysta z Supabase Auth zamiast mocka.
- Użytkownik widzi jasny sukces albo czytelny błąd po próbie logowania.
- Testy unit i E2E dla logowania przechodzą lokalnie.
- Nie pojawiają się nowe migracje ani nowe tabele tylko po to, żeby domknąć sam login.

## 13. Testy
- Unit: sprawdzenie walidacji formularza, disabled state i mapowania sukces/błąd.
- Integracyjne: mock Supabase Auth dla `loginUser` i weryfikacja kontraktu odpowiedzi.
- E2E: wejście na `/login`, próba poprawnego logowania i scenariusze walidacji błędnych danych.

## 14. Acceptance E2E test (krok po kroku)
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
1. Otworzyć `/login`.
2. Wpisać poprawny email i hasło istniejącego użytkownika testowego.
3. Sprawdzić, że pojawia się success state albo kontrolowany redirect, a nie crash UI.
4. Wpisać niepoprawny email i sprawdzić, że formularz pokazuje błąd inline.
5. Zostawić puste hasło i sprawdzić, że submit pozostaje zablokowany.

## 15. Gotowe do review?
- Preconditions są opisane i obejmują Supabase oraz lokalne env.
- Kroki implementacji obejmują osobno frontend i backend.
- Brak zmian DB i brak potrzeby migracji są jasno zapisane.
- `.env.example` ma konkretną listę zmiennych dla Stage 4.
- Acceptance E2E zawiera kopiowalne komendy do uruchomienia testów.
- Testy są przypisane do istniejących plików w repo.

## 16. PYTANIA / ZAŁOŻENIA
- Założenie: login ma kończyć się kontrolowanym sukcesem, a nie nieczytelnym przejściem. PROPOZYCJA: po sukcesie pokaż krótki komunikat i przekieruj dopiero po potwierdzeniu działania flow.
- Założenie: logowanie używa standardowego `signInWithPassword` bez dodatkowych mechanizmów bezpieczeństwa. PROPOZYCJA: tak, bo to najprostszy wariant MVP i spójny z obecnym etapem.
- Założenie: Stage 4 nie tworzy osobnej tabeli profilu. PROPOZYCJA: nie tworzyć jej teraz, tylko zostawić to do osobnego etapu, gdy pojawi się realna potrzeba danych poza auth.
