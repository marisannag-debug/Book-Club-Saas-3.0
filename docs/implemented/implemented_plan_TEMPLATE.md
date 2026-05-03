---
title: "Implemented Plan: <feature_key>"
plan: docs/plans/PLAN_<feature_key>.md
feature_key: <feature_key>
branches:
  frontend: feature/<short>-frontend
  backend: feature/<short>-backend
pr_urls:
  frontend: <url>
  backend: <url>
commits:
  frontend: <hash>
  backend: <hash>
date: YYYY-MM-DD
status: draft
---

# Podsumowanie

Krótki opis zgodności implementacji z planem (1-3 zdania).

## Zmiany w kodzie

- Lista plików zmodyfikowanych/dodanych (ścieżka).

## Migracje

- Lista plików migracji + komenda uruchomienia.

## Testy

- Unit: lista + polecenia
- Integration: lista + polecenia
- E2E: lista + polecenia + wynik (pass/fail)

## Acceptance E2E (krok po kroku)

- Kopiowalna sekcja z komendami i oczekiwanymi rezultatami.

## Deviations / PYTANIA

- Jeśli cokolwiek odstąpiło od planu — opisz i oznacz jako `PROPOZYCJA` jeśli wymagana jest decyzja.

## Notes / Next steps

- Krótkie zalecenia lub zadania follow‑up.
