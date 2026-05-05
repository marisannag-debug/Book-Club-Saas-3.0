---
title: "MVP — Plan struktury plików"
description: "Docelowa struktura plików dla etapów MVP zgodna z aktualnym projektem book_club_saas_3"
status: draft
version: 0.1
authors: ["AI (wygenerowane)"]
references:
  - docs/plans/mvp-stage-outline.md
  - docs/architecture/01-makiety.md
date: 2026-05-04
---

# MVP — Plan struktury plików i krótkie opisy

Na podstawie `docs/plans/mvp-stage-outline.md` oraz `docs/architecture/01-makiety.md` przygotowano poniższy plan etapów wraz z proponowaną, docelową strukturą plików zgodną z obecnym drzewem projektu `book_club_saas_3`.

Każdy etap zawiera: krótką definicję celu, proponowane pliki/katalogi i krótki opis implementacji.

## Stage 1 — Bazowa wersja aplikacji
- Cel: zapewnić działający szkielet Next.js z minimalnym layoutem i skryptami.
- Proponowane pliki:
  - `book_club_saas_3/package.json` — sprawdzić/skonfigurować skrypty `dev`, `build`, `test`.
  - `book_club_saas_3/next.config.ts`
  - `book_club_saas_3/app/layout.tsx`, `book_club_saas_3/app/page.tsx`
- Opis: weryfikacja środowiska deva i minimalnego layoutu zgodnego z makietą S001.

## Stage 2 — Strona główna
- Cel: zbudować landing z CTA do rejestracji.
- Proponowane pliki:
  - `book_club_saas_3/app/page.tsx` (aktualizacja)
  - `book_club_saas_3/app/components/Header.tsx`
  - `book_club_saas_3/app/components/Hero.tsx`
  - `book_club_saas_3/app/components/FeatureCards.tsx`
- Opis: hero + features zgodnie z S001; CTA prowadzi do `app/register`.

## Stage 3 — Rejestracja
- Cel: szybki formularz rejestracji (email + hasło).
- Proponowane pliki:
  - `book_club_saas_3/app/register/page.tsx`
  - `book_club_saas_3/app/components/auth/RegisterForm.tsx`
  - `book_club_saas_3/lib/auth.ts` (walidacja, helpery)
- Opis: dostępność (ARIA), walidacja przy blur, integracja z backendem/Supabase.

## Stage 4 — Logowanie
- Cel: flow logowania i odzyskiwania sesji.
- Proponowane pliki:
  - `book_club_saas_3/app/login/page.tsx`
  - `book_club_saas_3/app/components/auth/LoginForm.tsx`
- Opis: prosty UI, przekierowanie po sukcesie do dashboardu klubu.

## Stage 5 — Kontrola funkcjonowania rejestracji i logowania
- Cel: testy jednostkowe i E2E smoke dla auth flows.
- Proponowane pliki:
  - `tests/unit/auth.test.ts`
  - `tests/e2e/auth.spec.ts` (Playwright)
- Opis: scenariusze happy-path oraz walidacja pól.

## Stage 6 — Strona klubu (dashboard)
- Cel: centralne miejsce zarządzania klubem.
- Proponowane pliki:
  - `book_club_saas_3/app/club/[id]/page.tsx`
  - `book_club_saas_3/app/club/[id]/layout.tsx`
  - `book_club_saas_3/app/components/ClubDashboard/` (karty, sidebar, CTA)
- Opis: karty Active voting, Next meeting, Invite members.

## Stage 7 — Tworzenie klubu
- Cel: formularz tworzenia (nazwa, opis).
- Proponowane pliki:
  - `book_club_saas_3/app/club/create/page.tsx`
  - `book_club_saas_3/app/components/club/CreateClubForm.tsx`
- Opis: po sukcesie redirect do `app/club/[id]`.

## Stage 8 — Role: członek i prowadzący
- Cel: model ról, DB migration i UI zarządzania rolami.
- Proponowane pliki:
  - `supabase/migrations/NN_create_roles.sql`
  - `book_club_saas_3/lib/db/roles.ts`
  - `book_club_saas_3/app/club/[id]/members/manage.tsx`
- Opis: przygotować RLS i polityki; UI do nadawania ról.

## Stage 9 — Dołączanie do klubu (zaproszenia/kody)
- Cel: invite via email + generowany kod/link.
- Proponowane pliki:
  - `book_club_saas_3/app/club/[id]/invite/page.tsx`
  - `book_club_saas_3/app/api/invite/route.ts`
  - `book_club_saas_3/lib/invite.ts`
- Opis: generowanie linku, wysyłka maila, accept flow.

## Stage 10 — Brakujące funkcje członkostwa
- Cel: CRUD członkostwa (akceptacja, opuszczanie, role).
- Proponowane pliki:
  - `book_club_saas_3/app/api/membership/route.ts`
  - `book_club_saas_3/app/club/[id]/members/[memberId]/actions.tsx`

## Stage 11 — Propozycje książki
- Cel: formularz dodawania propozycji książek.
- Proponowane pliki:
  - `book_club_saas_3/app/club/[id]/voting/create/page.tsx`
  - `book_club_saas_3/app/components/voting/ProposalList.tsx`

## Stage 12 — Głosowanie
- Cel: oddawanie głosów i agregacja wyników.
- Proponowane pliki:
  - `book_club_saas_3/app/club/[id]/voting/[votingId]/page.tsx`
  - `book_club_saas_3/app/api/votes/route.ts`

## Stage 13 — Propozycje terminu i głosowanie na termin
- Cel: scheduling + vote-on-date.
- Proponowane pliki:
  - `book_club_saas_3/app/club/[id]/meetings/create/page.tsx`
  - `book_club_saas_3/app/club/[id]/meetings/[meetingId]/page.tsx`

## Stage 14 — Powiadomienia e‑mail
- Cel: opcjonalne powiadomienia o głosowaniach i spotkaniach.
- Proponowane pliki:
  - `book_club_saas_3/app/api/notifications/route.ts`
  - `book_club_saas_3/lib/notifications.ts`
  - `supabase/functions/email-send` (opcjonalnie)

## Stage 15 — Prosty chat
- Cel: realtime chat per klub (history + wysyłka).
- Proponowane pliki:
  - `book_club_saas_3/app/club/[id]/chat/page.tsx`
  - `book_club_saas_3/app/api/chat/route.ts` (lub integracja Supabase Realtime)

## Stage 16 — Dashboards, lokalizacja i analytics
- Cel: metrics, i18n i overview dashboard.
- Proponowane pliki:
  - `book_club_saas_3/app/dashboard/overview/page.tsx`
  - `book_club_saas_3/lib/analytics.ts`
  - `locales/pl/*.json`

## Stage 17 — QA, load tests, production checklist
- Cel: testy obciążeniowe, checklist release.
- Proponowane pliki:
  - `tests/load/loadtest.k6.js` (lub inny runner)
  - `docs/release-checklist.md`

---

## Next steps
- Utworzyć branch, dodać plik i otworzyć PR: `docs/plans/mvp-file-structure-plan.md`.
- Mogę także wygenerować szkielet plików dla wybranych etapów (opcjonalnie).

---

Plik wygenerowany automatycznie — proszę o potwierdzenie lub wskazanie, które etapy mam rozwinąć dalej.

## Szczegółowy plan struktury katalogów (Stage 1 — zgodność z create-next-app)

Poniżej znajduje się praktyczna, funkcjonalna struktura katalogów dopasowana do projektu utworzonego za pomocą `npx create-next-app@latest` (App Router). Struktura promuje modularność, łatwe skalowanie i zgodność z dalszą rozbudową (Supabase, testy, CI).

Przykładowe drzewo (root: `book_club_saas_3/`):

```
book_club_saas_3/
├─ app/                     # Next.js App Router
│  ├─ layout.tsx            # global layout
│  ├─ globals.css           # global styles (create-next-app)
│  ├─ page.tsx              # landing / home
│  ├─ components/           # współdzielone komponenty UI (client/server)
│  │  ├─ Header.tsx
│  │  ├─ Hero.tsx
│  │  └─ auth/              # auth-related small components
│  │     ├─ LoginForm.tsx
│  │     └─ RegisterForm.tsx
│  ├─ register/             # route: /register
│  │  └─ page.tsx
│  ├─ login/                # route: /login
│  │  └─ page.tsx
│  ├─ club/                 # feature folder: klub
│  │  └─ [id]/
│  │     ├─ page.tsx
│  │     └─ layout.tsx
│  └─ api/                  # App Router route handlers
│     └─ invite/
│        └─ route.ts        # POST /api/invite
|
├─ lib/                     # shared helpers, clients, types
│  ├─ auth.ts               # high-level auth helpers (server/client wrappers)
│  ├─ supabase.server.ts    # server-side Supabase client (do not leak keys)
│  └─ validators.ts
|
├─ public/                  # statyczne assety (images, icons)
|
├─ supabase/                # migracje SQL, setup, edge functions
│  ├─ migrations/
│  └─ functions/
|
├─ tests/
│  ├─ unit/
│  └─ e2e/
|
├─ scripts/                 # helpery developerskie (seed, db-push)
|
├─ locales/                 # i18n JSON/YAML files (pl, en)
|
├─ .env.example             # wymagane zmienne środowiskowe (przykład)
├─ package.json
├─ next.config.ts
└─ README.md
```

Zasady i uzasadnienie:
- `app/` jako jedyne źródło tras (App Router). Trasy i ich UI umieszczamy w strukturze feature-first (np. `app/club/[id]`).
- `app/components/` trzyma małe, współdzielone komponenty; komponenty specyficzne dla jednej trasy trzymamy w folderze tej trasy.
- Route handlers: używamy `app/api/<feature>/route.ts` dla endpointów zgodnych z App Router (serwerowe). Dla funkcji side-effect (np. email) preferujemy Supabase Functions lub `supabase/functions/`.
- `lib/` przechowuje wrappery i klienty (np. `supabase.server.ts`) oraz helpery testów. Rozdzielamy pliki server-only (`*.server.ts`) i client (`*.client.ts`) jeśli potrzeba.
- `supabase/migrations/` zawiera SQL migrations i RLS policies — każdy zmiany migracji opisujemy w planie i commitujemy razem z kodem.
- `tests/` dzieli testy unit i e2e; konfigurację Playwright/Vitest trzymamy w root `package.json` i dedykowanych konfigach.

Rekomendowane pliki konfiguracyjne i zmienne środowiskowe (minimum w `.env.example`):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
NEXT_PUBLIC_APP_ENV=development
```

Wskazówki implementacyjne (Stage 1):
- Zacznij od weryfikacji `app/layout.tsx`, `app/globals.css`, `app/page.tsx` wygenerowanych przez `create-next-app` i dostosuj layout (header/footer) do makiet.
- Utwórz `app/components/` i przenieś tam drobne komponenty (Header, Hero, FeatureCards).
- Dodaj `lib/supabase.server.ts` placeholder (bez kluczy) i `lib/auth.ts` z mockami — w Stage 1 mocki wystarczą; integracja z Supabase w Stage 8+.
- Dodaj `.env.example` i zaktualizuj README o kroki uruchomienia: `npm install`, `npm run dev`.
- Przygotuj prosty `supabase/migrations/README.md` z instrukcją `supabase db push --db-url $SUPABASE_DB_URL`.

Acceptance criteria dla Stage 1 (struktura i kompatybilność):
- `npm run dev` uruchamia aplikację bez błędów i otwiera `http://localhost:3000`.
- `app/page.tsx`, `app/register/page.tsx` i `app/login/page.tsx` renderują oczekiwane komponenty (Header, Hero, RegisterForm).
- `.env.example` istnieje i zawiera wymienione zmienne.
- `supabase/migrations/` istnieje i zawiera README z instrukcjami.

Branch i commit:
- Branch: `feature/stage1-file-structure` 
- Commit: `chore(stage1): scaffold file-structure and docs` 

PYTANIA / ZAŁOŻENIA
- Założyłem, że projekt pozostanie jednolitą aplikacją Next.js (nie monorepo). Jeśli planujemy monorepo, strukturę należy przenieść do `packages/`.
-- PROPOZYCJA: trzymać shared UI w `app/components/` przy małym zespole; przy większym zespole rozdzielić na `packages/ui`.

## Stage 1 — Szczegółowy plan

Szczegółowy plan Stage 1 został wyodrębniony do pliku: [docs/plans/PLAN_stage1_bazowa_wersja_aplikacji.md](docs/plans/PLAN_stage1_bazowa_wersja_aplikacji.md).
