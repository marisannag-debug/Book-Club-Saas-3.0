---
title: "Implemented Feature: stage7_strona_klubu"
feature_key: stage7_strona_klubu
plan: docs/plans/PLAN_stage7_strona_klubu.md
release_commit: <pending>
date: 2026-05-12
status: draft
---

# Opis funkcji

- Zastąpiono tymczasowy ekran `/club/[id]` pełnym dashboardem klubu.
- Widok pokazuje nagłówek klubu, trzy sekcje podsumowania oraz stany pusty dla braku aktywnego głosowania i spotkania.
- Dane widoku są dostarczane przez serwerowy helper w `lib/club-dashboard.server.ts`, który obecnie zwraca read-only fallback bez nowych migracji.

## API / Schema

- Brak nowych endpointów.
- Brak zmian schematu bazy.
- Lokalny kontrakt view modelu klubu znajduje się w `app/components/ClubDashboard/types.ts`.
- Serwerowy helper read-only znajduje się w `lib/club-dashboard.server.ts`.

## UI changes

- Dodano layout klubu: `app/club/[id]/layout.tsx`.
- Dodano komponenty dashboardu klubu w `app/components/ClubDashboard/`.
- Zmieniono trasę `app/club/[id]/page.tsx` na render dashboardu z mockowanych danych.

## Tests

- `tests/unit/club-dashboard.test.tsx`
- `tests/unit/club-dashboard.server.test.ts`
- `tests/e2e/club-dashboard.spec.ts`

## Acceptance criteria & Results

- Dashboard renderuje się dla przykładowego klubu: passed.
- Dashboard pokazuje stany pusty dla nowego klubu: passed.
- Serwerowy helper read-only zwraca spójny model dla obu stanów: passed.
- Smoke E2E dla `/club/sunset-readers` i `/club/empty-club`: passed.

## Notes / Next steps

- Stage 8 może podpiąć formularz tworzenia klubu do tego shell’a.
- Stage 10 i 12 mogą wykorzystać obecne karty jako punkty wejścia do zaproszeń i głosowań.