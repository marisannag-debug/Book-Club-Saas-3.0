---
title: "Ograniczenia technologiczne"
description: "Hard/soft constraints, known limitations i rekomendowane workarounds"
status: draft
version: 0.1
authors: ["AI (wygenerowane)"]
references:
  - docs/workflows/Agent-programowanie.md
  - docs/workflows/Agent-plany.md
date: 2026-05-04
---

# Ograniczenia technologiczne — co warto znać

## Hard constraints (narzucone)
- Supabase jako główny backend (Postgres + Auth + RLS). Wszystkie plany i implementacje muszą uwzględniać RLS i polityki.
- Brak long-running server processes (hosting serverless, Vercel) — używaj Edge/Serverless Functions lub zewnętrznego worker service dla długich zadań.
- Klucz `SUPABASE_SERVICE_ROLE_KEY` nie może być ujawniony klientowi; używaj go wyłącznie po stronie serwera/Edge.

## Soft constraints (preferencje / ograniczenia operacyjne)
- Budżet: ograniczony transfer/storage → preferuj optymalizację obrazów i limity wielkości przesyłu.
- Preview DB może być limitowany — CI powinien umieć działać w trybie fallback (mock API / MSW) jeśli preview DB nie jest dostępne.

## Known limitations i rekomendacje
- Real-time scale: Supabase Realtime ma limity; dla bardzo dużej liczby połączeń rozważyć dedykowane rozwiązanie (Redis/Socket server).
- Large file uploads: używaj signed URLs i chunked uploads; rozważ dedykowane CDN/Storage jeśli pliki będą duże.
- Scheduled/background jobs: wykorzystaj external cron (e.g., GitHub Actions scheduled, Supabase Edge + cron) lub serverless worker.

## Database i migracje
- Migration-first policy: każda zmiana schematu → SQL migration + rollback script. Zakładaj manualny krok przed produkcją.

## Security limits
- PII handling: minimalizuj przechowywane PII; szyfruj dane w spoczynku (jeśli wymagane) i w tranzycie.

## Mapping to PLAN
- Każdy plan musi wskazywać ograniczenia: czy funkcja wymaga long-running job? Czy wymaga dużych uploadów? (jeśli tak — zaakceptuj alternatywę lub zaznacz w `PYTANIA / ZAŁOŻENIA`).

## PYTANIA / ZAŁOŻENIA
- Czy akceptujemy brak dedykowanych workerów (czy wszystkie background tasks mają być realizowane przez Edge Functions lub zewnętrze cron)?
- Czy trzeba planować data residency (np. EU-only)?
