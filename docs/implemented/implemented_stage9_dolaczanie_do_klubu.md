---
title: "Implemented Feature: stage9_dolaczanie_do_klubu"
feature_key: stage9_dolaczanie_do_klubu
plan: docs/plans/PLAN_stage9_dolaczanie_do_klubu.md
release_commit: bc5b882543596680e27979f62736624c3ab05016
date: 2026-05-18
status: implemented
---

# Opis funkcji

- Zastąpiono placeholder `/club/join` pełnym flow dołączania do klubu przez kod zaproszenia i link z tokenem.
- Dodano widok `/club/[id]/invite`, z którego organizator generuje i kopiuje zaproszenie do klubu.
- Join flow pokazuje podgląd zaproszenia z tokenu, obsługuje manualny kod oraz przekierowuje do `/club/[id]` po sukcesie.
- Wprowadzono backendowe helpery do generowania, hashowania, weryfikacji i redeem zaproszeń.
- Dodano route handlery dla tworzenia, preview i redeem zaproszeń.
- Rozszerzono auth login/register o obsługę `returnTo`, żeby użytkownik po logowaniu wracał do join flow.
- Dodano migrację `club_invites` i `club_members` z RLS, indeksami i rollbackiem.
- Dopracowano widoczność klubów w dashboardzie tak, aby członek widział także kluby dołączone przez membership.
- Rozwiązano cykl RLS między `clubs` i `club_members` przez helper `SECURITY DEFINER`, dzięki czemu dashboard nie wywala się przy odczycie listy klubów.
- Zsynchronizowano remote Supabase z migracjami stage 9 i odświeżono cache schematu PostgREST.

## API / Schema

- Kontrakt wejścia/wyjścia opisany w `docs/contracts/club-invite.json`.
- Backend do generowania i akceptacji zaproszeń realizuje `lib/club-invite.server.ts`.
- Helpery tokenu, kodu i URL zaproszenia znajdują się w `lib/invite.ts`.
- Route handlery:
  - `app/api/club-invites/route.ts`
  - `app/api/club-invites/preview/route.ts`
  - `app/api/club-invites/redeem/route.ts`
- Schemat bazy rozszerzono o `supabase/migrations/003_create_club_invites.sql` oraz rollback.
- Nowe tabele:
  - `club_invites`
  - `club_members`
- Dodatkowo policy SELECT dla `clubs` korzysta z helpera `user_is_member_of_club(...)`, żeby odczyt klubów był zgodny z membership bez zapętlenia RLS.

## UI changes

- Dodano nowy ekran `app/club/join/page.tsx` z dwiema ścieżkami wejścia: kod oraz link z tokenem.
- Dodano `app/components/club/JoinClubForm.tsx`.
- Dodano `app/components/club/CreateInviteForm.tsx`.
- Dodano nową trasę `app/club/[id]/invite/page.tsx`.
- Zmieniono `app/components/ClubDashboard/ClubDashboard.tsx`, aby karta zaproszeń prowadziła do generatora zaproszeń.
- Rozszerzono `app/login/page.tsx`, `app/register/page.tsx`, `app/components/auth/LoginForm.tsx` i `app/components/auth/RegisterForm.tsx` o `returnTo`.
- Dashboard szybki dostęp teraz pokazuje także kluby dołączone przez membership, nie tylko kluby utworzone przez użytkownika.

## Tests

- `tests/unit/invite.test.ts`
- `tests/unit/club-invite.server.test.ts`
- `tests/unit/join-club-form.test.tsx`
- `tests/unit/club-dashboard.test.tsx`
- `tests/unit/auth.test.ts`
- `tests/e2e/join-club.spec.ts`
- `tests/unit/dashboard-clubs.test.ts`
- `tests/unit/dashboard-page.test.tsx`

## Acceptance criteria & Results

- Join flow przez kod działa: passed.
- Join flow przez link z tokenem działa: passed.
- Generowanie zaproszenia z dashboardu działa: passed.
- Przekierowanie `returnTo` po auth działa: passed.
- Unit tests dla helperów, backendu i formularzy: passed.
- Smoke E2E dla join/invite: passed.
- Dashboard quick access dla członka klubu: passed.
- Remote Supabase schema i REST verification: passed.

## Notes / Next steps

- Flow wspiera wysyłkę e-mail przez Resend, jeśli ustawione są zmienne `RESEND_API_KEY` i `RESEND_FROM_EMAIL`.
- Jeśli później pojawi się pełny panel członkostwa, podstawą będą już `club_invites` i `club_members`.
- Jeśli w przyszłości dodamy bardziej rozbudowane reguły widoczności klubów, helper `user_is_member_of_club(...)` pozostaje punktem centralnym dla odczytu membership bez cyklu RLS.