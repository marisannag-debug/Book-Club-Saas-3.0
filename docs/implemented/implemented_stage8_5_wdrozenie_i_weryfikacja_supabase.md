---
title: "Implemented Feature: stage8_5_wdrozenie_i_weryfikacja_supabase"
feature_key: stage8_5_wdrozenie_i_weryfikacja_supabase
plan: docs/plans/PLAN_stage8_5_wdrozenie_i_weryfikacja_supabase.md
release_commit: <pending>
date: 2026-05-13
status: blocked
---

# Opis funkcji

- Zweryfikowano, że projekt Supabase odpowiada na health check `/auth/v1/health`.
- Zweryfikowano, że endpoint REST dla `clubs` zwracał `404`, co oznacza brak wdrożonej lub widocznej tabeli `clubs` w live projekcie.
- Próba wejścia do SQL Editor przez przeglądarkę zakończyła się ekranem logowania Supabase, więc wdrożenie migracji nie mogło zostać wykonane w tej sesji bez autoryzacji użytkownika.

## API / Schema

- Planowana migracja: `supabase/migrations/002_create_clubs.sql`.
- Planowany rollback: `supabase/migrations/002_create_clubs_rollback.sql`.
- REST `clubs` nie był dostępny w stanie wymaganym przez stage 8.5.

## UI / Admin changes

- Brak zmian w aplikacji.
- Próba wejścia do Supabase SQL Editor wymagała logowania do dashboardu Supabase.

## Tests / Verification

- Health check Supabase: passed.
- REST endpoint `clubs`: failed (`404 Not Found`).
- Browser access do Supabase SQL Editor: blocked by sign-in.
- `npx supabase db push --db-url "$SUPABASE_DB_URL"`: nie udało się wykonać w tej sesji z powodu problemów z dostępnością hosta DB w środowisku terminalowym.

## Acceptance criteria & Results

- Migracja `002_create_clubs.sql` wdrożona do live Supabase: not completed.
- Endpoint REST dla `clubs` bez `404`: not completed.
- Create-club flow zapisuje rekord w live bazie: not verified.
- Dashboard quick access pokazuje nowo utworzony klub: not verified.
- Rollback gotowy: available in repo.

## Notes / Next steps

- Następny krok po uzyskaniu dostępu do Supabase: zalogować się do dashboardu, uruchomić migrację `002_create_clubs.sql`, a następnie powtórzyć weryfikację `REST /clubs`, create-club flow i dashboard quick access.
- Jeśli użytkownik dostarczy aktywną sesję Supabase albo ręcznie wykona migrację, stage 8.5 może zostać domknięty bez zmian w kodzie aplikacji.
