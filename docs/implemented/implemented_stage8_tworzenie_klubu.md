---
title: "Implemented Feature: stage8_tworzenie_klubu"
feature_key: stage8_tworzenie_klubu
plan: docs/plans/PLAN_stage8_tworzenie_klubu.md
release_commit: bc5b8825
date: 2026-05-18
status: implemented
---

# Opis funkcji

- Zastąpiono placeholder `/club/create` pełnym frontendowym flow tworzenia klubu.
- Formularz ma walidację nazwy i opisu, stany błędu/sukcesu oraz redirect do nowego klubu.
- Formularz korzysta z realnego helpera Supabase i zapisuje klub z `created_by` ustawionym na bieżącego użytkownika.
- Dodano migrację `clubs` z RLS, indeksem na `created_by` i rollbackiem.
- Widok `/club/[id]` pobiera teraz realną nazwę i opis z tabeli `clubs`, zamiast budować nagłówek z identyfikatora.
- Nagłówek widoku klubu pokazuje już tylko przycisk powrotu i metadane pomocnicze, bez prezentowania id klubu.
- Live Supabase zostało domknięte: migracja `002_create_clubs.sql` działa, granty dla `authenticated` i `service_role` są ustawione, a REST `/rest/v1/clubs` zwraca `200`.

## API / Schema

- Kontrakt wejścia/wyjścia opisany w `docs/contracts/create-club.json`.
- Backend realizuje insert przez Supabase browser client w `lib/club-create.ts`.
- Schemat bazy został rozszerzony o `supabase/migrations/002_create_clubs.sql` oraz rollback.
- Serwerowy model widoku klubu wykorzystuje `lib/club-dashboard.server.ts`, który czyta rekord z `public.clubs` i dopiero potem przechodzi na fallback.

## UI changes

- Zmieniono `app/club/create/page.tsx` na pełny ekran create club.
- Dodano `app/components/club/CreateClubForm.tsx`.
- Dodano realny helper `lib/club-create.ts`.
- Lokalny mock `lib/club-create.mock.ts` pozostał tylko jako etap przejściowy i nie jest już używany przez formularz.
- Dodano `app/club/[id]/page.tsx` i `app/components/ClubDashboard/*` dla pełnego widoku klubu opartego o dane z bazy.
- Nagłówek klubu został dopracowany wizualnie: przycisk powrotu ma ciemne tło, a identyfikator klubu nie jest już pokazywany.

## Tests

- `tests/unit/club-create.test.ts`
- `tests/unit/create-club-form.test.tsx`
- `tests/unit/dashboard-clubs.test.ts`
- `tests/unit/dashboard-page.test.tsx`
- `tests/e2e/create-club.spec.ts`
- `tests/unit/club-dashboard.server.test.ts`
- `tests/unit/club-dashboard.test.tsx`
- `tests/e2e/club-dashboard.spec.ts`

## Acceptance criteria & Results

- Walidacja inline działa: passed.
- Redirect do `/club/[id]` po sukcesie: passed.
- Smoke E2E dla create flow: passed.
- Backend helper Supabase i mapowanie błędów: passed.
- Widok klubu pokazuje realną nazwę z bazy, a nie id: passed.
- Live Supabase verification dla migracji i REST `/clubs`: passed.

## Notes / Next steps

- Szybki dostęp na dashboardzie pobiera teraz realne kluby użytkownika z Supabase po `created_by` zamiast demo-pozycji.
- Jeśli pojawią się kolejne etapy dla klubu, bazują już na wdrożonej tabeli `clubs` i działającym dashboardzie z nazwą klubu z bazy.