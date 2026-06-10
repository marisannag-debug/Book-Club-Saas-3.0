---
title: "MVP — Plan struktury plików"
status: draft
version: 1.0
authors: ["AI (wygenerowane)"]
date: 2026-05-25
references:
  - docs/workflows/Agent-plany.md
  - docs/workflows/Agent-programowanie.md
  - docs/architecture/01-makiety.md
  - docs/architecture/03-zasady-ux.md
  - docs/plans/bookclub-pro-mvp-scoping.md
  - docs/plans/PLAN_stage1_bazowa_wersja_aplikacji.md
  - docs/plans/PLAN_stage2_strona_glowna.md
  - docs/plans/PLAN_stage3_rejestracja.md
  - docs/plans/PLAN_stage4_logowanie.md
  - docs/plans/PLAN_stage5_minimalny_backend_auth.md
  - docs/plans/PLAN_stage6_kontrola_funkcjonowania_rejestracji_i_logowania.md
  - docs/plans/PLAN_stage7_strona_klubu.md
  - docs/plans/PLAN_stage8_tworzenie_klubu.md
  - docs/plans/PLAN_stage8_5_wdrozenie_i_weryfikacja_supabase.md
  - docs/plans/PLAN_stage9_dolaczanie_do_klubu.md
  - docs/plans/PLAN_stage10_role_czlonek_i_prowadzacy.md
  - docs/plans/PLAN_stage11_brakujace_funkcje_czlonkostwa.md
  - docs/plans/PLAN_stage14_propozycje_terminu_i_glosowanie_na_termin.md
---

# MVP — Plan struktury plików i kolejności etapów

## 1. Cel
Zdefiniować docelową strukturę plików oraz kolejność dowożenia MVP BookClub Pro w małych, wykonywalnych etapach. Plan ma utrzymać spójność między UI, backendem, migracjami Supabase, testami i dokumentacją, tak aby każdy etap mógł być wdrożony niezależnie i zweryfikowany lokalnie.

## 2. Zakres
### Wchodzi w zakres
- Pełna mapa etapów MVP od Stage 1 do Stage 18.
- Docelowe pliki frontendowe, backendowe, testowe i dokumentacyjne dla każdego etapu.
- Podział pracy na małe partie: frontend najpierw, backend równolegle, potem testy i weryfikacja.
- Powiązanie planu struktury z aktualnym drzewem repozytorium `Book-Club-Saas-3.0`.
- Minimalne wymagania środowiskowe, komendy uruchomieniowe i strategia migracji Supabase.

### Nie wchodzi w zakres
- Szczegółowa implementacja każdego stage w kodzie źródłowym.
- Production hardening wykraczający poza MVP, np. billing, role globalne, panel pro-admin.
- Rozbudowany analytics stack, mobile app, realtime collaboration poza planem MVP.
- Finalny design system. Plan dotyczy struktury plików i kolejności dostarczania, nie pełnego brand booka.

## 3. Wymagania funkcjonalne
- Plan musi wskazywać, które pliki powstają w którym stage.
- Plan musi pokazywać kolejność: frontend, backend, testy, weryfikacja.
- Plan musi zachować zgodność z aktualnym układem repozytorium i z App Routerem Next.js.
- Plan musi zawierać ścieżki dla migracji Supabase, kontraktów API i testów E2E.
- Plan musi być spójny z późniejszymi planami Stage 1-11, które odwołują się do tego dokumentu.

## 4. Wymagania niefunkcjonalne
- Wydajność: frontend ma być budowany etapami, bez nadmiarowej logiki po stronie klienta.
- Bezpieczeństwo: backend i migracje muszą zakładać Supabase RLS i minimalne uprawnienia.
- UX: każda karta planu ma odpowiadać konkretnemu ekranowi lub flow, bez rozmytych zakresów.
- Utrzymanie: plan musi od razu wskazywać docelowe pliki, by nie trzeba było zgadywać lokalizacji.
- Testowalność: każdy etap musi mieć przypisany minimalny test lub check do uruchomienia lokalnie.

## 5. Kontekst techniczny
- App Router w `app/` jest główną osią aplikacji.
- Współdzielone komponenty UI trafiają do `app/components/`.
- Backend domain helpery trafiają do `lib/` i `lib/db/`.
- Migracje i rollbacki trafiają do `supabase/migrations/`.
- Testy unit i E2E trafiają odpowiednio do `tests/unit/` i `tests/e2e/`.
- Dokumentacja etapów trafia do `docs/plans/` i `docs/implemented/`.

## 6. Kroki implementacji
### 6.1 Stage 1 — Bazowa wersja aplikacji
Frontend:
- `app/layout.tsx`
- `app/page.tsx`
- `app/components/Header.tsx`
- `app/components/Hero.tsx`
- `app/components/FeatureCards.tsx`
- `app/components/Footer.tsx`
- `app/register/page.tsx`
- `app/login/page.tsx`
- `app/components/auth/RegisterForm.tsx`
- `app/components/auth/LoginForm.tsx`

Backend:
- `lib/auth.ts`
- `lib/supabase.server.ts`
- `supabase/migrations/000_init_users.sql`
- `supabase/migrations/001_enable_rls_and_policies.sql`
- rollbacki dla obu migracji

Cel etapu:
- uruchomienie szkieletu aplikacji i przygotowanie miejsca na dalsze etapy.

### 6.2 Stage 2 — Strona główna
Frontend:
- `app/page.tsx` jako landing
- `app/components/Header.tsx`
- `app/components/Hero.tsx`
- `app/components/FeatureCards.tsx`
- `app/components/Footer.tsx`

Backend:
- brak nowych struktur DB; tylko placeholdery wspierające routing.

Cel etapu:
- strona główna z CTA do rejestracji.

### 6.3 Stage 3 — Rejestracja
Frontend:
- `app/register/page.tsx`
- `app/components/auth/RegisterForm.tsx`

Backend:
- `lib/auth.ts` jako punkt integracji

Testy:
- unit walidacji formularza
- smoke E2E rejestracji

### 6.4 Stage 4 — Logowanie
Frontend:
- `app/login/page.tsx`
- `app/components/auth/LoginForm.tsx`

Backend:
- integracja z `lib/auth.ts`

Testy:
- unit dla logowania
- smoke E2E logowania

### 6.5 Stage 5 — Minimalny backend auth
Backend:
- `lib/auth.ts`
- `lib/supabase.server.ts`
- `supabase/migrations/000_init_users.sql`
- `supabase/migrations/001_enable_rls_and_policies.sql`
- rollbacki do obu migracji

Cel etapu:
- minimalna baza auth do obsługi kolejnych ekranów.

### 6.6 Stage 6 — Kontrola działania auth
Testy:
- `tests/unit/header.test.tsx`
- `tests/unit/auth.test.ts`
- `tests/e2e/auth.spec.ts`

Cel etapu:
- potwierdzić, że rejestracja i logowanie działają stabilnie.

### 6.7 Stage 7 — Strona klubu
Frontend:
- `app/club/[id]/page.tsx`
- `app/club/[id]/layout.tsx`
- `app/components/ClubDashboard/*`

Backend:
- `lib/club-dashboard.server.ts`
- `lib/dashboard-clubs.ts`

Cel etapu:
- dashboard klubu z sekcjami Active voting, Next meeting i Invite members.

### 6.8 Stage 8 — Tworzenie klubu
Frontend:
- `app/club/create/page.tsx`
- `app/components/club/CreateClubForm.tsx`

Backend:
- `lib/club-create.ts`
- `lib/db/` helpery tworzenia klubu
- migracje tworzące `clubs`

Cel etapu:
- tworzenie klubu i redirect do jego panelu.

### 6.9 Stage 9 — Dołączanie do klubu
Frontend:
- `app/club/join/page.tsx`
- `app/club/[id]/invite/page.tsx`
- `app/components/club/JoinClubForm.tsx`
- `app/components/club/CreateInviteForm.tsx`

Backend:
- `app/api/club-invites/route.ts`
- `app/api/club-invites/preview/route.ts`
- `app/api/club-invites/redeem/route.ts`
- `lib/club-invite.server.ts`
- `lib/invite.ts`
- `docs/contracts/club-invite.json`
- `supabase/migrations/003_create_club_invites.sql`
- `supabase/migrations/003_create_club_invites_rollback.sql`

Cel etapu:
- invite by link/code, preview zaproszenia i redeem.

### 6.10 Stage 10 — Role członek i prowadzący
Frontend:
- `app/club/[id]/members/manage/page.tsx`
- `app/components/club/ClubMembersRolesClient.tsx`
- `app/components/club/MembersRoleManager.tsx`

Backend:
- `lib/db/roles.ts`
- `supabase/migrations/004_add_club_member_roles.sql`
- `supabase/migrations/004_add_club_member_roles_rollback.sql`

Cel etapu:
- zarządzanie rolami host/member oraz ich egzekwowanie przez RLS.

### 6.11 Stage 11 — Brakujące funkcje członkostwa
Frontend:
- `app/club/[id]/members/[memberId]/actions/page.tsx`
- `app/components/club/MembershipActions.tsx`

Backend:
- `app/api/membership/route.ts`
- `lib/membership.ts`
- `lib/db/membership.ts`
- `supabase/migrations/005_update_membership_flow.sql`
- `supabase/migrations/005_update_membership_flow_rollback.sql`

Cel etapu:
- akceptacja, opuszczenie klubu i własna nazwa członka.

### 6.12 Stage 12 — Propozycje książki
Frontend:
- `app/club/[id]/voting/create/page.tsx`
- `app/components/voting/ProposalList.tsx`

Backend:
- helpery propozycji książek i model danych dla głosowania.
- Szczegółowy plan Stage 12: [docs/plans/PLAN_stage12_propozycje_ksiazek.md](docs/plans/PLAN_stage12_propozycje_ksiazek.md).

### 6.13 Stage 13 — Głosowanie
Frontend:
- `app/club/[id]/voting/[votingId]/page.tsx`

Backend:
- `app/api/votes/route.ts`
- RLS i constrainty dla głosów.

### 6.14 Stage 14 — Propozycje terminu i głosowanie na termin
Frontend:
- `app/club/[id]/meetings/create/page.tsx`
- `app/club/[id]/meetings/[meetingId]/page.tsx`

Backend:
- helpery terminów spotkań i głosowania na termin.

Szczegółowy plan Stage 14: [docs/plans/PLAN_stage14_propozycje_terminu_i_glosowanie_na_termin.md](docs/plans/PLAN_stage14_propozycje_terminu_i_glosowanie_na_termin.md)

### 6.15 Stage 15 — Powiadomienia e-mail
Frontend:
- opcjonalne UI preferencji powiadomień.

Backend:
- `app/api/notifications/route.ts`
- `lib/notifications.ts`
- opcjonalnie `supabase/functions/email-send`

### 6.16 Stage 16 — Prosty chat
Frontend:
- `app/club/[id]/chat/page.tsx`

Backend:
- `app/api/chat/route.ts` lub integracja Supabase Realtime.

### 6.17 Stage 17 — Dashboard, lokalizacja i analytics
Frontend:
- `app/dashboard/overview/page.tsx`

Backend:
- `lib/analytics.ts`
- `locales/pl/*.json`

### 6.18 Stage 18 — QA, load tests, production checklist
Testy i dokumentacja:
- `tests/load/loadtest.k6.js`
- `docs/release-checklist.md`

Cel etapu:
- końcowa weryfikacja jakości i checklist release.

## 7. Rekomendowana kolejność prac
1. Zbudować i utrzymać skeleton aplikacji w Stage 1.
2. Domknąć landing i auth flow w Stage 2-6.
3. Dostarczyć dashboard klubu i tworzenie klubu w Stage 7-8.
4. Rozwinąć invite/join flow w Stage 9.
5. Dodać role członek/prowadzący w Stage 10.
6. Domknąć funkcje członkostwa w Stage 11.
7. Kontynuować kolejno Stage 12-18 bez zmiany wcześniejszych kontraktów.

## 8. Kryteria akceptacji
- Każdy stage ma przypisane konkretne pliki frontendowe i backendowe.
- Każdy stage ma wskazane testy lub weryfikację lokalną.
- Plan jest zgodny z aktualną strukturą repozytorium.
- Plan odwołuje się do istniejących planów stage'ów, a nie duplikuje ich pełnej implementacji.
- Stage 11 i późniejsze plany mogą używać tego dokumentu jako mapy struktury plików.

## 9. Testy
- Unit: minimalny test dla komponentu startowego `Header`.
- Unit: auth UI w Stage 3-4.
- Unit: dashboard i role w Stage 7 i 10.
- Integracyjne: API dla invite/join/membership.
- E2E: auth, club creation, invite/join, membership, voting.

## 10. Preconditions
- Repozytorium jest otwarte jako pojedynczy projekt Next.js.
- `.env.example` istnieje i zawiera zmienne Supabase.
- Włączony jest lokalny workflow Supabase lub dostęp do remote DB.
- Stage 1-4 mogą działać nawet bez backendu produkcyjnego.
- Stage 5+ zakładają gotowe środowisko Supabase.

## 11. `.env.example`
Docelowy minimum dla MVP:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_DB_URL=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=development
RESEND_API_KEY=
RESEND_FROM_EMAIL=
INVITE_TOKEN_TTL_HOURS=168
```

## 12. Komendy lokalne
```powershell
npm install
npm run dev
npm run lint
npm run test
npx playwright test
```

```bash
npm install
npm run dev
npm run lint
npm run test
npx playwright test
```

## 13. Zmiany DB / migracje
Ten plan nie definiuje jednej nowej tabeli, tylko mapuje etapy, które już ją wykorzystują. Mimo to etapowy model migracji jest częścią struktury MVP:

- Stage 5: `000_init_users.sql`, `001_enable_rls_and_policies.sql`.
- Stage 8: migracja tworząca `clubs`.
- Stage 9: `003_create_club_invites.sql`.
- Stage 10: `004_add_club_member_roles.sql`.
- Stage 11: `005_update_membership_flow.sql`.

Przykładowy wzorzec dla dalszych migracji:

```sql
BEGIN;

-- zmiana schematu dla konkretnego etapu MVP
-- dodaj kolumny, indeksy albo polityki RLS

COMMIT;
```

Przykładowa komenda do zastosowania migracji:

```powershell
npx supabase db push --db-url "$env:SUPABASE_DB_URL"
```

## 14. Branch, commit i PR
- Branch planu: `feature/plans/mvp-file-structure-plan`
- Commit planu: `docs(plans): add detailed mvp file structure plan`
- PR title: `PLAN: mvp-file-structure-plan — detailed implementation roadmap`

## 15. Acceptance E2E test (krok po kroku)
```powershell
npm run dev
```

```powershell
npx playwright test tests/e2e/auth.spec.ts
```

```powershell
npx playwright test tests/e2e/club-create.spec.ts
```

```powershell
npx playwright test tests/e2e/club-invite.spec.ts
```

```powershell
npx playwright test tests/e2e/membership.spec.ts
```

```bash
npm run dev
```

```bash
npx playwright test tests/e2e/auth.spec.ts
```

```bash
npx playwright test tests/e2e/club-create.spec.ts
```

```bash
npx playwright test tests/e2e/club-invite.spec.ts
```

```bash
npx playwright test tests/e2e/membership.spec.ts
```

## 16. Gotowe do review?
- Preconditions są opisane.
- Kroki implementacji mapują Stage 1-18 do konkretnych plików.
- Sekcja migracji pokazuje powiązanie stage'ów z DB.
- `.env.example` ma docelowy zestaw zmiennych.
- Acceptance E2E ma kopiowalne komendy.
- Branch, commit i PR title są zdefiniowane.

## 17. PYTANIA / ZAŁOŻENIA
- Założenie: Stage 1-18 pozostają numerycznie spójne z obecnymi planami w `docs/plans/`.
- Założenie: Stage 11 opiera się o mapę struktury z tego dokumentu, a nie o osobny model etapów.
- Założenie: backend rośnie etapami i nie wymaga monolitycznej migracji schematu na start.
- Założenie: kiedy dany stage zostanie wdrożony, jego szczegółowy plan trafia do `docs/plans/PLAN_<stage>.md`, a wynik do `docs/implemented/`.
