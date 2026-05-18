---
title: "Implemented Feature: stage8_tworzenie_klubu"
feature_key: stage8_tworzenie_klubu
plan: docs/plans/PLAN_stage8_tworzenie_klubu.md
release_commit: <pending>
date: 2026-05-13
status: draft
---

# Opis funkcji

- Zastąpiono placeholder `/club/create` pełnym frontendowym flow tworzenia klubu.
- Formularz ma walidację nazwy i opisu, stany błędu/sukcesu oraz redirect do nowego klubu.
- Formularz korzysta z realnego helpera Supabase i zapisuje klub z `created_by` ustawionym na bieżącego użytkownika.
- Dodano migrację `clubs` z RLS, indeksem na `created_by` i rollbackiem.

## API / Schema

- Kontrakt wejścia/wyjścia opisany w `docs/contracts/create-club.json`.
- Backend realizuje insert przez Supabase browser client w `lib/club-create.ts`.
- Schemat bazy został rozszerzony o `supabase/migrations/002_create_clubs.sql` oraz rollback.

## UI changes

- Zmieniono `app/club/create/page.tsx` na pełny ekran create club.
- Dodano `app/components/club/CreateClubForm.tsx`.
- Dodano realny helper `lib/club-create.ts`.
- Lokalny mock `lib/club-create.mock.ts` pozostał tylko jako etap przejściowy i nie jest już używany przez formularz.

## Tests

- `tests/unit/club-create.test.ts`
- `tests/unit/create-club-form.test.tsx`
- `tests/unit/dashboard-clubs.test.ts`
- `tests/unit/dashboard-page.test.tsx`
- `tests/e2e/create-club.spec.ts`

## Acceptance criteria & Results

- Walidacja inline działa: passed.
- Redirect do `/club/[id]` po sukcesie: passed.
- Smoke E2E dla create flow: passed.
- Backend helper Supabase i mapowanie błędów: passed.

## Notes / Next steps

- Szybki dostęp na dashboardzie pobiera teraz realne kluby użytkownika z Supabase po `created_by` zamiast demo-pozycji.