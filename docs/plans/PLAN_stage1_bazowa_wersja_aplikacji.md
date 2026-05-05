---
title: "PLAN_stage1_bazowa_wersja_aplikacji"
status: draft
authors: ["AI (wygenerowane)"]
date: 2026-05-04
---

# Stage 1 — Bazowa wersja aplikacji

## Preconditions
- Repo z bazą aplikacji utworzoną przez `npx create-next-app@latest` (App Router).
- Node.js 18+ i npm/yarn zainstalowane lokalnie.
- Branch roboczy utworzony z `main`: `feature/stage1-file-structure`.
- Brak zcommitowanych sekretów; dostęp do zmiennych środowiskowych (lokalnie przez `.env`/`.env.local`).

## 1. Cel
Zapewnić stabilny szkielet aplikacji (Next.js App Router) z minimalnym layoutem, podstawowymi komponentami UI, placeholderami dla integracji backend (Supabase), podstawową konfiguracją deweloperską i checklistą gotową do review.

## 2. Zakres
- Wchodzi w zakres:
  - Uporządkowanie / przeniesienie komponentów do `app/components/`.
  - Minimalny `Header`, `Footer`, `Hero` oraz formy `RegisterForm` i `LoginForm` z mockowaną walidacją.
  - Dodanie `lib/` z placeholderami: `supabase.server.ts`, `auth.ts` (mocki).
  - Utworzenie `.env.example`, `supabase/migrations/README.md` i podstawowego README uruchamiania.
  - Dodanie prostych testów smoke (unit + e2e-snippets).
- Nie wchodzi w zakres:
  - Pełna integracja z Supabase (rzeczywiste migracje/sekrety) — traktować jako placeholdery.
  - Kompleksowe E2E dla wszystkich funkcji (tylko smoke dla auth routes).

## 3. Wymagania funkcjonalne
- Strona główna (`/`) renderuje `Header`, `Hero` i `FeatureCards`.
- `/register` i `/login` mają działające formularze UI (walidacja front-end).
- `npm run dev` uruchamia aplikację bez błędów.
- `.env.example` dokumentuje wymagane zmienne.

## 4. Wymagania niefunkcjonalne
- Bezpieczeństwo: nie commitować sekretów; serwerowe klienty Supabase w `*.server.ts`.
- Dostępność: podstawowe atrybuty ARIA w formularzach.
- Czytelność i skalowalność: feature-first layout w `app/`.

## 5. Kontekst techniczny
- Next.js (App Router), TypeScript (jeśli używane), React.
- UI: małe, współdzielone komponenty w `app/components/`.
- Backend: Supabase (placeholdery w `lib/` i folderze `supabase/`).

## 6. Kroki implementacji
1. Przygotowanie branch i preconditions (0.5h)
   - `git checkout -b feature/stage1-file-structure`
   - Upewnij się, że `main` jest aktualny: `git fetch && git rebase origin/main`.
2. Frontend — Partia A: Layout i header (1.5h)
   - Zaktualizuj `app/layout.tsx` żeby zawierał podstawowy `Header` i `Footer`.
   - Utwórz `app/components/Header.tsx` z prostym nav (logo, linki `Home / Register / Login`).
   - Utwórz `app/components/Footer.tsx` (kontakt, copyright).
   - Sprawdź uruchomienie: `npm run dev`.
3. Frontend — Partia B: Landing i auth forms (2h)
   - Utwórz `app/components/Hero.tsx` i `app/components/FeatureCards.tsx`.
   - Utwórz `app/register/page.tsx` i `app/login/page.tsx`, importuj `RegisterForm`/`LoginForm` z `app/components/auth/`.
   - `RegisterForm` i `LoginForm` implementują local state + podstawową walidację (email, password length).
4. Backend placeholders — Partia A: lib i env (0.5h)
   - Dodaj `lib/supabase.server.ts` (export factory funkcji klienta, bez kluczy; komentarz o użyciu env vars).
   - Dodaj `lib/auth.ts` z mockami helperów: `getUserFromCookie()` zwraca `null`/mock.
   - Dodaj `.env.example` (patrz sekcja poniżej).
5. Dev DX i dokumentacja (0.5h)
   - Zaktualizuj `README.md` o kroki: `npm install`, `npm run dev` i wskazówki `.env`.
   - Dodaj `supabase/migrations/README.md` z instrukcją `supabase db push --db-url $SUPABASE_DB_URL` (jeśli ktoś używa Supabase lokalnie).
6. Testy — Partia A: smoke/unit (1h)
   - Dodaj prosty test: `tests/unit/header.test.tsx` sprawdzający render `Header` (użyj Vitest + @testing-library/react lub Jest jeśli już w projekcie).
   - Dodaj E2E smoke spec: `tests/e2e/smoke/auth.spec.ts` (Playwright) z przypadkami: render `/`, `/register`, `/login`.
7. Review i PR (0.5h)
   - Commituj małe zmiany: każdy logiczny krok jako osobny commit.
   - PR title: `chore(stage1): scaffold file-structure and docs`
   - Request review: 1x frontend dev, 1x backend dev.

   - Przykładowe commity:
     - `chore(stage1): add Header/Footer and layout adjustments`
     - `chore(stage1): add auth forms and landing components`
     - `chore(stage1): add lib placeholders and .env.example`

## 7. Kryteria akceptacji
- `npm run dev` startuje serwer i strona główna (`/`) renderuje bez błędów.
- `/register` i `/login` renderują formularze i wykonują lokalną walidację (client-side).
- `.env.example` zawiera wymagane zmienne środowiskowe.
- Pliki umieszczone zgodnie z opisanym drzewem (feature-first w `app/`).
- PR ma przynajmniej jedną aprobatę i zielone podstawowe testy (unit smoke).

## 8. Testy
- Unit:
  - `tests/unit/header.test.tsx` — render Header.
  - `tests/unit/forms.test.tsx` — walidacja RegisterForm.
- E2E (smoke):
  - `tests/e2e/smoke/auth.spec.ts` — uruchamia `http://localhost:3000`, sprawdza status i obecność znaczników.

### .env.example (treść)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_ENV=development
```

### Przykładowa migracja SQL (opcjonalna, placeholder)
Plik: `supabase/migrations/000_init_users.sql`
```sql
-- minimalna tabela users (placeholder dla Stage 1)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

Uruchomienie migracji (przykład):
```
supabase db push --db-url $SUPABASE_DB_URL
```

### Komendy lokalnego deva (PowerShell)
```powershell
git checkout -b feature/stage1-file-structure
npm install
npm run dev
```

### Acceptance E2E test (krok po kroku)
1. `npm run dev`
2. Otwórz `http://localhost:3000` — sprawdź czy załadował się `Header` i `Hero`.
3. Przejdź do `/register` — wypełnij formularz (mock) i sprawdź walidację.
4. Przejdź do `/login` — sprawdź walidację.

## Branch i PR naming
- Branch: `feature/stage1-file-structure`
- Commit (example): `chore(stage1): scaffold file-structure and docs`
- PR title: `chore(stage1): scaffold file-structure — Stage 1`

## Minimalny podział pracy
- Frontend dev: implementacja layoutu + komponentów + unit tests.
- Backend dev: przygotowanie `lib/` placeholderów, instrukcji migracji, przegląd security.

## PYTANIA / ZAŁOŻENIA
- Czy integrujemy Supabase natychmiastowo, czy zostawiamy placeholdery? PROPOZYCJA: zostawić placeholdery w Stage 1 i zintegrować w Stage 8.
- Czy preferujemy `Vitest` (lightweight) czy `Jest`? PROPOZYCJA: `Vitest` dla szybkich testów dev.

---
Plan przygotowany zgodnie z `docs/workflows/Agent-plany.md`.
