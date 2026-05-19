---
title: "MVP — Plan struktury plików"
description: "Docelowa struktura plików dla etapów MVP zgodna z aktualnym projektem Book-Club-Saas-3.0"
status: draft
version: 0.2
authors: ["AI (wygenerowane)"]
references:
  - docs/plans/mvp-stage-outline.md
  - docs/architecture/01-makiety.md
date: 2026-05-04
---

# MVP — Plan struktury plików i krótkie opisy

Na podstawie `docs/plans/mvp-stage-outline.md` oraz `docs/architecture/01-makiety.md` przygotowano poniższy plan etapów wraz z docelową strukturą plików zgodną z aktualnym drzewem repozytorium `Book-Club-Saas-3.0`.

Założenie operacyjne: frontend dowozimy etapami, a backend budujemy równolegle, ale tylko do minimalnego poziomu potrzebnego do obsługi aktualnie dowożonego UI.

## Stage 1 — Bazowa wersja aplikacji
- Cel: działający szkielet Next.js z minimalnym layoutem i skryptami.
- Proponowane pliki:
  - `package.json`.
  - `next.config.ts`.
  - `app/layout.tsx`, `app/page.tsx`.
- Opis: weryfikacja środowiska deweloperskiego i minimalnego layoutu zgodnego z makietą S001.

## Stage 2 — Strona główna
- Cel: landing z CTA do rejestracji.
- Proponowane pliki:
  - `app/page.tsx` (aktualizacja).
  - `app/components/Header.tsx`.
  - `app/components/Hero.tsx`.
  - `app/components/FeatureCards.tsx`.
  - `app/components/Footer.tsx`.
- Opis: hero i sekcja funkcji zgodne z S001; CTA prowadzi do `/register`.

## Stage 3 — Rejestracja
- Cel: formularz rejestracji (email + hasło).
- Proponowane pliki:
  - `app/register/page.tsx`.
  - `app/components/auth/RegisterForm.tsx`.
  - `lib/auth.ts`.
- Opis: dostępność (ARIA), podstawowa walidacja i mockowane helpery auth.

## Stage 4 — Logowanie
- Cel: flow logowania i odzyskiwania sesji.
- Proponowane pliki:
  - `app/login/page.tsx`.
  - `app/components/auth/LoginForm.tsx`.
- Opis: prosty UI i przekierowanie po sukcesie do dashboardu klubu.

## Stage 5 — Minimalny backend auth
- Cel: backend minimalny do obsługi rejestracji i logowania.
- Proponowane pliki:
  - `lib/auth.ts`.
  - `lib/supabase.server.ts`.
  - `supabase/migrations/000_init_users.sql`.
  - `supabase/migrations/001_enable_rls_and_policies.sql`.
  - `supabase/migrations/000_init_users_rollback.sql`.
  - `supabase/migrations/001_enable_rls_and_policies_rollback.sql`.
- Opis: najpierw obsłużyć aktualny front, potem rozszerzać backend o kolejne zależności biznesowe.

## Stage 6 — Kontrola funkcjonowania rejestracji i logowania
- Cel: testy jednostkowe i smoke E2E dla auth flows.
- Proponowane pliki:
  - `tests/unit/header.test.tsx`.
  - `tests/unit/auth.test.ts`.
  - `tests/e2e/auth.spec.ts`.
- Opis: scenariusze happy-path oraz walidacja pól.

## Stage 7 — Strona klubu (dashboard)
- Cel: centralne miejsce zarządzania klubem.
- Proponowane pliki:
  - `app/club/[id]/page.tsx`.
  - `app/club/[id]/layout.tsx`.
  - `app/components/ClubDashboard/`.
- Opis: karty Active voting, Next meeting, Invite members.

## Stage 8 — Tworzenie klubu
- Cel: formularz tworzenia klubu.
- Proponowane pliki:
  - `app/club/create/page.tsx`.
  - `app/components/club/CreateClubForm.tsx`.
- Opis: po sukcesie redirect do `app/club/[id]`.

## Stage 9 — Dołączanie do klubu (zaproszenia/kody)
- Cel: invite via email + generowany kod/link.
- Proponowane pliki:
  - `app/club/join/page.tsx`.
  - `app/club/[id]/invite/page.tsx`.
  - `app/components/club/JoinClubForm.tsx`.
  - `app/components/club/CreateInviteForm.tsx`.
  - `app/api/club-invites/route.ts`.
  - `app/api/club-invites/preview/route.ts`.
  - `app/api/club-invites/redeem/route.ts`.
  - `lib/club-invite.server.ts`.
  - `lib/invite.ts`.
  - `docs/contracts/club-invite.json`.
  - `supabase/migrations/003_create_club_invites.sql`.
  - `supabase/migrations/003_create_club_invites_rollback.sql`.
- Opis: generowanie linku, wysyłka maila, flow akceptacji.

## Stage 10 — Role: członek i prowadzący
- Cel: model ról, migracje DB i UI zarządzania rolami.
- Proponowane pliki:
  - `supabase/migrations/NN_create_roles.sql`.
  - `lib/db/roles.ts`.
  - `app/club/[id]/members/manage.tsx`.
- Opis: przygotować RLS i polityki oraz UI do nadawania ról.

## Stage 11 — Brakujące funkcje członkostwa
- Cel: CRUD członkostwa (akceptacja, opuszczanie, role).
- Proponowane pliki:
  - `app/api/membership/route.ts`.
  - `app/club/[id]/members/[memberId]/actions.tsx`.

## Stage 12 — Propozycje książki
- Cel: formularz dodawania propozycji książek.
- Proponowane pliki:
  - `app/club/[id]/voting/create/page.tsx`.
  - `app/components/voting/ProposalList.tsx`.

## Stage 13 — Głosowanie
- Cel: oddawanie głosów i agregacja wyników.
- Proponowane pliki:
  - `app/club/[id]/voting/[votingId]/page.tsx`.
  - `app/api/votes/route.ts`.

## Stage 14 — Propozycje terminu i głosowanie na termin
- Cel: scheduling + vote-on-date.
- Proponowane pliki:
  - `app/club/[id]/meetings/create/page.tsx`.
  - `app/club/[id]/meetings/[meetingId]/page.tsx`.

## Stage 15 — Powiadomienia e-mail
- Cel: opcjonalne powiadomienia o głosowaniach i spotkaniach.
- Proponowane pliki:
  - `app/api/notifications/route.ts`.
  - `lib/notifications.ts`.
  - `supabase/functions/email-send` (opcjonalnie).

## Stage 16 — Prosty chat
- Cel: realtime chat per klub (history + wysyłka).
- Proponowane pliki:
  - `app/club/[id]/chat/page.tsx`.
  - `app/api/chat/route.ts` lub integracja Supabase Realtime.

## Stage 17 — Dashboards, lokalizacja i analytics
- Cel: metrics, i18n i overview dashboard.
- Proponowane pliki:
  - `app/dashboard/overview/page.tsx`.
  - `lib/analytics.ts`.
  - `locales/pl/*.json`.

## Stage 18 — QA, load tests, production checklist
- Cel: testy obciążeniowe i checklist release.
- Proponowane pliki:
  - `tests/load/loadtest.k6.js`.
  - `docs/release-checklist.md`.

---

## Current Repo Structure

Aktualna struktura repo:

```
Book-Club-Saas-3.0/
├─ README.md
├─ .env.example
├─ AGENTS.md
├─ CLAUDE.md
├─ app/
│  ├─ globals.css
│  ├─ layout.tsx
│  ├─ page.tsx
│  ├─ login/
│  │  └─ page.tsx
│  ├─ register/
│  │  └─ page.tsx
│  ├─ club/
│  │  └─ [id]/
│  └─ components/
│     ├─ FeatureCards.tsx
│     ├─ Footer.tsx
│     ├─ Header.tsx
│     ├─ Hero.tsx
│     └─ auth/
│        ├─ LoginForm.tsx
│        └─ RegisterForm.tsx
├─ docs/
│  ├─ README.md
│  ├─ architecture/
│  ├─ business/
│  ├─ implemented/
│  ├─ plans/
│  ├─ roles/
│  ├─ tech/
│  └─ workflows/
├─ lib/
│  ├─ auth.ts
│  └─ supabase.server.ts
├─ public/
├─ supabase/
│  └─ migrations/
│     ├─ 000_init_users.sql
│     ├─ 000_init_users_rollback.sql
│     ├─ 001_enable_rls_and_policies.sql
│     ├─ 001_enable_rls_and_policies_rollback.sql
│     └─ README.md
├─ tests/
│  └─ unit/
│     └─ header.test.tsx
├─ vitest.config.ts
├─ vitest.setup.ts
├─ eslint.config.mjs
├─ next-env.d.ts
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ temp_page.html
└─ tsconfig.json
```

## Zasady i uzasadnienie

- `app/` jest jedynym źródłem tras App Router i zawiera zarówno route'y, jak i współdzielone UI.
- `app/components/` trzyma wspólne komponenty, a `app/components/auth/` zawiera formularze logowania i rejestracji.
- `lib/` przechowuje pomocnicze wrappery i minimalne placeholdery backendowe.
- `supabase/migrations/` zawiera SQL migrations, rollbacki oraz własny README z instrukcją uruchamiania.
- `tests/` dzieli testy unit, a konfiguracja Vitest siedzi w root repo.
- Pliki dokumentacyjne (`README.md`, `docs/`) są częścią repo i powinny odzwierciedlać rzeczywisty stan implementacji.

## Rekomendowane zmienne środowiskowe

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_DB_URL=
NEXT_PUBLIC_APP_ENV=development
```

## Wskazówki implementacyjne

- Najpierw dowoź UI w `app/`, potem dodawaj backend tylko w zakresie potrzebnym do obsługi tego UI.
- Placeholdery backendowe trzymaj w `lib/auth.ts` i `lib/supabase.server.ts` do czasu, aż dany ekran rzeczywiście ich potrzebuje.
- Rozbudowuj `supabase/migrations/` etapami, zamiast wrzucać cały model danych naraz.
- Utrzymuj testy unit i smoke E2E równolegle z rozwojem frontend/backend.

## Acceptance criteria dla obecnej struktury

- `npm run dev` uruchamia aplikację bez błędów.
- `app/page.tsx`, `app/register/page.tsx` i `app/login/page.tsx` renderują oczekiwane komponenty.
- `.env.example` istnieje i zawiera wymagane zmienne.
- `supabase/migrations/` zawiera pliki SQL i `README.md`.
- `tests/unit/` zawiera przynajmniej test dla `Header`.

## Branch i commit

- Branch: `main`
- Commit: `chore(stage1): complete docs and testing setup`

## PYTANIA / ZAŁOŻENIA

- Założono jednolitą aplikację Next.js, nie monorepo.
- Shared UI pozostaje w `app/components/`, bo repo jest nadal niewielkie.

## Stage 1 — Szczegółowy plan

Szczegółowy plan Stage 1 został wyodrębniony do pliku: [docs/plans/PLAN_stage1_bazowa_wersja_aplikacji.md](docs/plans/PLAN_stage1_bazowa_wersja_aplikacji.md).