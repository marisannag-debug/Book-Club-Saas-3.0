---
title: "PLAN_stage3_rejestracja"
status: draft
authors: ["AI (wygenerowane)"]
date: 2026-05-12
references:
  - docs/plans/mvp-file-structure-plan.md
  - docs/plans/mvp-stage-outline.md
  - docs/architecture/01-makiety.md
  - docs/business/bookclub-pro-user-journey-map.md
  - tests/unit/auth.test.ts
  - tests/e2e/auth.spec.ts
---

# Stage 3 — Rejestracja

## 1. Cel
Zbudować działający flow rejestracji dla S002 w wariancie email + hasło, z czytelnym UI, walidacją, dostępnością i realną integracją z Supabase Auth zamiast mocka.

## 2. Zakres
### Wchodzi w zakres
- Strona `/register` i komponent `RegisterForm`.
- Walidacja po stronie klienta dla emaila i hasła.
- Stany UI: loading, success, error, disabled submit.
- Integracja `registerUser` z Supabase Auth.
- Aktualizacja testów unit i E2E dla flow rejestracji.
- Zachowanie zgodne z makietą S002 i obecnym układem aplikacji.

### Nie wchodzi w zakres
- Pełny flow logowania i odzyskiwania hasła.
- Tworzenie tabel profilu użytkownika lub rozbudowa modelu danych poza auth.
- Social login, magic link, MFA i reset hasła.
- Nowe endpointy API, jeśli rejestracja może działać bezpośrednio przez helper auth.

## 3. Wymagania funkcjonalne
- Formularz musi przyjmować tylko email i hasło.
- Email musi być walidowany na bieżąco i przy submit.
- Hasło musi spełniać minimalną długość zgodną z S002, czyli 6 znaków.
- Submit musi być zablokowany podczas wysyłki, żeby uniknąć podwójnych rejestracji.
- Po sukcesie użytkownik ma dostać jasny komunikat, że konto zostało utworzone, wraz z następnym krokiem.
- Błędy z Supabase muszą być mapowane na czytelne komunikaty dla użytkownika.
- Zapis musi zachować semantykę dostępności: etykiety, focus order i region statusu.

## 4. Wymagania niefunkcjonalne
- Wydajność: bez ciężkich zależności i bez niepotrzebnego stanu globalnego.
- Bezpieczeństwo: brak sekretów w kodzie klienta, używać tylko publicznego anon key na froncie.
- UX: krótki formularz, jasne komunikaty, bez zbędnych kroków po drodze.
- Dostępność: poprawne `label`, `aria-live`, `role=status`, czytelny focus i kontrast.
- Stabilność: obecne testy nie mogą przestać przechodzić po przełączeniu z mocka na realny adapter.

## 5. Kontekst techniczny
- Komponenty: `app/register/page.tsx`, `app/components/auth/RegisterForm.tsx`, `lib/auth.ts`.
- Integracja backendowa: Supabase Auth `signUp` jako docelowy mechanizm rejestracji.
- Placeholder serwerowy: `lib/supabase.server.ts` pozostaje punktem integracji tylko wtedy, gdy stage rzeczywiście zacznie potrzebować logiki server-side.
- Testy: `tests/unit/auth.test.ts` i `tests/e2e/auth.spec.ts`.
- Dane: w tym stage nie dodajemy nowych tabel ani migracji SQL.

## Preconditions
- Branch roboczy utworzony od `main`.
- Dostępny projekt Supabase z włączonym Auth i przygotowanymi danymi dostępowymi.
- W lokalnym środowisku ustawione `NEXT_PUBLIC_SUPABASE_URL` i `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Istniejące trasy `/register` i `/login` działają lokalnie.
- Aktualny mock w `lib/auth.ts` jest jeszcze dostępny jako punkt wyjścia do podmiany.
- Testy Playwright dla auth są już w repo i mogą zostać rozbudowane bez tworzenia nowego harnessu.

## 6. Kroki implementacji
### 6.1 Frontend
1. Uporządkować `RegisterForm`, tak aby walidacja emaila i hasła działała przed wysłaniem formularza oraz w trakcie wpisywania.
2. Dodać jawne stany błędu pod polami i zachować region statusu dla komunikatu końcowego.
3. Utrzymać minimalny układ z makiety S002: email, hasło, CTA i krótki link/nawigacja do logowania.
4. Zablokować submit podczas trwającej rejestracji i pokazać stan loading.
5. Rozszerzyć `tests/unit/auth.test.ts` o scenariusze walidacji, błędów i poprawnego przekazania danych do helpera.
6. Rozszerzyć `tests/e2e/auth.spec.ts` o scenariusz błędnego emaila, za krótkiego hasła i happy path.

### 6.2 Backend
1. Podmienić mock w `lib/auth.ts` na adapter Supabase Auth dla `registerUser`.
2. Zachować stabilny kontrakt zwracanych wyników, żeby UI mogło mapować sukces i błąd bez dodatkowych warstw.
3. Ustalić, czy signup ma wymuszać potwierdzenie emaila; jeśli tak, success message ma instruować użytkownika, żeby sprawdził skrzynkę.
4. Nie dodawać migracji SQL w Stage 3, chyba że zespół świadomie zdecyduje się na osobną tabelę profilu, co powinno wejść do następnego stage.
5. Jeśli pojawi się potrzeba klienta Supabase po stronie serwera, odłożyć to do `lib/supabase.server.ts` bez rozbudowywania tego stage ponad minimum.

### 6.3 Minimalny podział pracy
- 1x frontend dev: walidacja, stany UI, dostępność i testy formularza.
- 1x backend dev: adapter Supabase Auth, env wiring i mapowanie błędów.

## 7. Rekomendowana kolejność prac
1. Najpierw dopiąć frontendowy UX formularza, bo obecny ekran już istnieje i daje szybki feedback.
2. Następnie podmienić `registerUser` na realne `signUp`, utrzymując kontrakt odpowiedzi.
3. Na końcu dopracować testy unit i Playwright, żeby zablokować regresję przy przejściu z mocka na integrację.

## 8. `.env.example`
W Stage 3 trzeba mieć tylko zmienne potrzebne do publicznej integracji auth:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Nie dodawać `SUPABASE_SERVICE_ROLE_KEY`, jeśli Stage 3 nie używa jeszcze operacji administracyjnych po stronie serwera.

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
Brak nowych migracji SQL w Stage 3. Rejestracja opiera się na Supabase Auth, więc nie trzeba uruchamiać `supabase db push` dla tego etapu.

Jeśli zespół zdecyduje się na osobną tabelę profilu użytkownika, to powinien być osobny plan i osobna migracja, nie ten stage.

## 11. Branch, commit i PR
- Branch: `feature/plans/PLAN_stage3_rejestracja`
- Commit: `docs(plans): add PLAN_stage3_rejestracja.md`
- PR title: `PLAN: stage 3 rejestracja — implementation plan`

## 12. Kryteria akceptacji
- `/register` renderuje formularz email + hasło zgodny z makietą S002.
- Walidacja blokuje submit dla pustych i niepoprawnych pól.
- `registerUser` korzysta z Supabase Auth zamiast mocka.
- Użytkownik widzi jasny sukces albo czytelny błąd po próbie rejestracji.
- Testy unit i E2E dla rejestracji przechodzą lokalnie.
- Nie pojawiają się nowe migracje ani nowe tabele tylko po to, żeby domknąć sam signup.

## 13. Testy
- Unit: sprawdzenie walidacji formularza, disabled state i mapowania sukces/błąd.
- Integracyjne: mock Supabase Auth dla `registerUser` i weryfikacja kontraktu odpowiedzi.
- E2E: wejście na `/register`, próba poprawnej rejestracji i scenariusze walidacji błędnych danych.

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
1. Otworzyć `/register`.
2. Wpisać poprawny email i hasło co najmniej 6-znakowe.
3. Sprawdzić, że pojawia się success state, a nie crash UI.
4. Wpisać niepoprawny email i sprawdzić, że formularz pokazuje błąd inline.
5. Wpisać za krótkie hasło i sprawdzić, że submit pozostaje zablokowany.

## 15. Gotowe do review?
- Preconditions są opisane i obejmują Supabase oraz lokalne env.
- Kroki implementacji obejmują osobno frontend i backend.
- Brak zmian DB i brak potrzeby migracji są jasno zapisane.
- `.env.example` ma konkretną listę zmiennych dla Stage 3.
- Acceptance E2E zawiera kopiowalne komendy do uruchomienia testów.
- Testy są przypisane do istniejących plików w repo.

## 16. PYTANIA / ZAŁOŻENIA
- Założenie: signup ma kończyć się komunikatem sukcesu, a nie automatycznym przekierowaniem. PROPOZYCJA: po sukcesie pokaż link do logowania zamiast natychmiastowego redirectu.
- Założenie: w Supabase Auth włączone jest potwierdzenie emaila. PROPOZYCJA: tak, bo to najbezpieczniejszy wariant MVP i najczytelniejszy dla użytkownika.
- Założenie: Stage 3 nie tworzy osobnej tabeli profilu. PROPOZYCJA: nie tworzyć jej teraz, tylko zostawić to do osobnego etapu, gdy pojawi się realna potrzeba danych poza auth.