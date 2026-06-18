# Book Club SaaS (BookClub Pro)

Aplikacja typu SaaS dla klubów książki, zbudowana w Next.js (App Router) z backendem opartym o Supabase (Auth + PostgreSQL z RLS). Umożliwia rejestrację i logowanie użytkowników, tworzenie klubów, dołączanie do nich przez zaproszenia, zarządzanie rolami i członkostwem, zgłaszanie i głosowanie na propozycje książek oraz planowanie terminu spotkania.

Aplikacja powstaje etapowo (Stage 1–14). Szczegółowa dokumentacja każdego etapu znajduje się w `docs/plans/` (plany) oraz `docs/implemented/` (opisy wdrożeń).

## Stos technologiczny

- **Next.js 16** (App Router) + **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **Supabase** — Auth oraz PostgreSQL z politykami RLS (`@supabase/supabase-js`)
- **Zod** — walidacja danych wejściowych w warstwie API i helperach
- **Vitest** (testy jednostkowe) + **Playwright** (testy E2E)

## Szybki start

```powershell
npm install
npm run dev
```

Aplikacja: http://localhost:3000

## Konfiguracja środowiska

Skopiuj szablon i uzupełnij wartości lokalne:

```powershell
copy .env.example .env
```

Wymagane zmienne:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`
- `NEXT_PUBLIC_APP_ENV`

Nie commituj sekretów.

## Skrypty

- `npm run dev` — uruchamia serwer deweloperski
- `npm run build` — tworzy build produkcyjny
- `npm run start` — uruchamia serwer produkcyjny
- `npm run lint` — uruchamia ESLint
- `npm run test` — testy jednostkowe (Vitest)
- `npm run test:e2e` — testy E2E (Playwright)

## Strony aplikacji (trasy)

### Publiczne / autentykacja
- **`/`** — strona główna (landing) BookClub Pro: hero z CTA i nawigacją do logowania/rejestracji.
- **`/register`** — rejestracja email + hasło z walidacją w trakcie wpisywania, stanami loading/sukces/błąd oraz mapowaniem błędów Supabase Auth.
- **`/login`** — logowanie email + hasło oparte o Supabase Auth, z obsługą błędów i przekierowaniem po sukcesie.

### Dashboard użytkownika
- **`/dashboard`** — panel użytkownika; pokazuje kluby, do których należy/utworzył (pobierane z Supabase po `created_by`), z szybkim dostępem do widoku klubu.

### Tworzenie i dołączanie do klubu
- **`/club/create`** — formularz tworzenia klubu z walidacją nazwy i opisu; zapisuje rekord w tabeli `clubs` z `created_by` bieżącego użytkownika i przekierowuje do nowego klubu.
- **`/club/join`** — dołączanie do istniejącego klubu przez kod/token zaproszenia.

### Widok klubu
- **`/club/[id]`** — dashboard klubu: nagłówek z nazwą i opisem (z bazy) oraz trzy karty podsumowania — głosowanie nad książką (Active voting), najbliższe spotkanie (Next meeting) i członkowie/zaproszenia (Invite members), wraz ze stanami pustymi i skrótami do podstron.
- **`/club/[id]/voting`** — lista propozycji książek i głosowanie; dodawanie/edycja/usuwanie propozycji (z okładką) oraz podsumowanie oddanych głosów.
- **`/club/[id]/voting/create`** — dodanie nowej propozycji książki.
- **`/club/[id]/meetings/[meetingId]`** — planer terminu spotkania: propozycje slotów, głosowanie na termin i podgląd stanu z backendu (renderowany od razu, bez mockupu).
- **`/club/[id]/members/manage`** — zarządzanie członkami i rolami (`host` / `member`); zmiana ról przez prowadzącego klubu.
- **`/club/[id]/members/[memberId]/actions`** — „Mój profil”: akcje dla własnego członkostwa (zmiana wyświetlanej nazwy, akceptacja członkostwa, opuszczenie klubu).
- **`/club/[id]/invite`** — generowanie i podgląd linku/kodu zaproszenia do klubu.

## Endpointy API

- **`POST /api/membership`** / **`GET /api/membership`** — pobranie szczegółów członkostwa oraz akcje (akceptacja, opuszczenie klubu, zmiana nazwy).
- **`/api/club-roles`** (`GET`, `PATCH`) — odczyt i zmiana ról członków (`host` / `member`).
- **`/api/club-invites`** oraz `/api/club-invites/preview`, `/api/club-invites/redeem` — tworzenie, podgląd i realizacja zaproszeń.
- **`/api/book-proposals`** oraz `/api/book-proposals/[proposalId]` — CRUD propozycji książek (listowanie, tworzenie, edycja, usuwanie) z uprawnieniami autor/host.
- **`/api/votes`** — oddawanie i wycofywanie głosów na propozycje książek.
- **`/api/meeting-planner`** — inicjalizacja/odczyt planera spotkania dla klubu.
- **`/api/meeting-slots`** — zarządzanie proponowanymi terminami (slotami) spotkania.
- **`/api/meeting-votes`** — głosowanie na terminy spotkania.

## Funkcje wg etapów (obecny stan)

- **Stage 1–2** — bazowa wersja aplikacji i strona główna (hero, header, footer).
- **Stage 3–6** — rejestracja, logowanie i minimalny backend autentykacji oparty o Supabase Auth, wraz z weryfikacją działania.
- **Stage 7** — dashboard klubu (`/club/[id]`) z kartami podsumowania i stanami pustymi.
- **Stage 8** — pełny flow tworzenia klubu zapisujący dane do tabeli `clubs` (z RLS).
- **Stage 9** — dołączanie do klubu przez zaproszenia.
- **Stage 10** — role `host` i `member`, widok zarządzania rolami, helpery uprawnień i RLS.
- **Stage 11** — funkcje członkostwa: akceptacja członkostwa, opuszczenie klubu, zmiana własnej wyświetlanej nazwy.
- **Stage 12** — propozycje książek (CRUD z okładkami, uprawnienia autor/host).
- **Stage 13** — głosowanie na propozycje książek z podsumowaniem głosów.
- **Stage 14** — planer terminu spotkania: propozycje slotów i głosowanie na termin (backend `club_meetings` / `club_meeting_slots` / `club_meeting_slot_votes`).

## Baza danych (migracje)

Migracje SQL (wraz z plikami rollback) znajdują się w `supabase/migrations/`:

- `000_init_users.sql`, `001_enable_rls_and_policies.sql` — użytkownicy i bazowe RLS.
- `002_create_clubs.sql` — tabela `clubs`.
- `003_create_club_invites.sql` — zaproszenia.
- `004_add_club_member_roles.sql` — role członków + helper `user_is_host_of_club`.
- `005_update_membership_flow.sql`, `006_dedupe_club_members.sql` — flow członkostwa.
- `007_create_book_proposals.sql` — propozycje książek.
- `008_create_votes_table.sql` — głosy na propozycje.
- `009_create_meetings.sql` — spotkania, sloty i głosy na terminy.

Aplikowanie migracji do środowiska Supabase:

```powershell
npx supabase db push --db-url "$env:SUPABASE_DB_URL"
```

> Uwaga: większość funkcji wymaga zastosowania odpowiednich migracji oraz uprawnień (`GRANT`) dla roli `authenticated` na działającej bazie Supabase. Brak migracji/uprawnień objawia się błędami 400 przy odczycie/zapisie danych.

## Struktura projektu

- `app/` — trasy App Routera, strony i komponenty UI oraz endpointy `app/api/`.
- `lib/` — helpery domenowe (`auth.ts`, `membership.ts`, `book-proposals.ts`, `voting.ts`, `invite.ts`, `club-create.ts`, `club-dashboard.server.ts`) oraz warstwa dostępu do danych w `lib/db/`.
- `supabase/migrations/` — migracje SQL i pliki rollback.
- `tests/` — testy jednostkowe (Vitest) i E2E (Playwright).
- `docs/` — dokumentacja: `plans/` (plany etapów), `implemented/` (opisy wdrożeń), `contracts/` (kontrakty API), `architecture/`, `business/`, `roles/`.
- `.env.example` — szablon zmiennych środowiskowych.

## Notatki

Pełniejszy przewodnik konfiguracji (w wariancie dla Windows) oraz polecenia migracji opisuje [docs/README.md](docs/README.md). Szczegóły poszczególnych funkcji znajdują się w `docs/implemented/`.
