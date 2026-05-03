---
title: "Edge cases — przypadki brzegowe i błędy"
description: "Lista priorytetowych przypadków brzegowych, kroki reprodukcji i rekomendacje mitigacji"
status: draft
version: 0.1
authors: ["AI (wygenerowane)"]
references:
  - docs/workflows/Agent-programowanie.md
  - docs/business/bookclub-pro-mvp-scoping.md
date: 2026-05-04
---

# Edge cases — priorytetowe przypadki brzegowe

Instrukcja: każdy przypadek zawiera ID, opis, kroki reprodukcji, oczekiwane zachowanie, jak zweryfikować w DB/logach, priorytet i rekomendacja.

## EC-001 — Walidacja: brak tytułu głosowania / <2 propozycje
- Opis: użytkownik próbuje utworzyć głosowanie bez wymaganego minimum.
- Kroki:
  1. Otwórz Create Voting.
  2. Pozostaw tytuł pusty lub dodaj <2 propozycje.
  3. Submit.
- Oczekiwane: front-end blokuje submit z czytelnym błędem; backend waliduje i zwraca 400.
- Weryfikacja DB/logs: brak wpisu w `votes`.
- Priorytet: Critical.
- Mitigacja: real-time validation + server-side validation (Zod) + test cases.

Repro (curl):
```bash
curl -X POST "$APP_URL/api/votes" -H "Content-Type: application/json" -d '{"title":"","options":[]}'
# expect 400
```

---

## EC-002 — Concurrency: race przy jednoczesnym głosowaniu (deadline)
- Opis: wielu użytkowników wysyła głosy jednocześnie w okolicy deadline; możliwe race conditions przy zapisie wyników.
- Kroki:
  1. Przygotuj istniejące voting_id.
  2. Wyślij 50 równoczesnych żądań POST /api/votes/:id/submit.
- Oczekiwane: każdy autoryzowany użytkownik oddaje co najwyżej 1 głos; system nie tworzy duplikatów.
- Weryfikacja DB: constraint UNIQUE (vote_id, user_id) + count submissions == liczba unikalnych użytkowników.
- Priorytet: Critical.
- Mitigacja: transakcje DB + upsert/strict unique constraints; retry z backoff.

Repro (autocannon example):
```bash
npx autocannon -c 50 -d 10 -m POST -H "Authorization: Bearer $TOKEN" -b '{"option_id":"opt1"}' http://localhost:3000/api/votes/<id>/submit
```

---

## EC-003 — Duplicate submissions (double click)
- Opis: użytkownik dwukrotnie klika CTA; backend otrzymuje dwa żądania.
- Oczekiwane: idempotent handling — drugi request zwraca 409 lub 200 (no-op) i nie dubluje zapisu.
- Priorytet: Important.
- Mitigacja: debounce UI, server-side idempotency token lub unique constraint + graceful handling.

Repro (Playwright snippet):
```js
await page.click('button#vote');
await page.click('button#vote');
// assert only one submission in DB
```

---

## EC-004 — Membership enforcement (guest trying to submit when auth required)
- Opis: plan wymaga auth; guest próbuje oddać głos.
- Oczekiwane: deny (401/403) and friendly error message.
- Priorytet: Critical.
- Mitigacja: RLS policies + server-side membership check.

Repro (curl):
```bash
curl -X POST "$APP_URL/api/votes/<id>/submit" -d '{"option_id":"opt1"}'
# expect 401/403
```

---

## EC-005 — Token expiry / session refresh
- Opis: token wygasł w trakcie działania — np. podczas dłuższego komponowania propozycji.
- Oczekiwane: klient wykrywa expiry, próbuje silent refresh (OIDC) lub kieruje do logowania bez utraty pracy.
- Priorytet: Important.

Test:
```
# force expiry by setting token to expired value, attempt protected API call, expect 401 and client refresh attempt
```

---

## EC-006 — Email provider failure (Resend) — retry behavior
- Opis: wysyłka maila (invite/follow-up) zwraca błąd od providera.
- Oczekiwane: retry z backoff + oznaczenie w logs/queue + user-friendly error najwyżej temporary.
- Priorytet: Important.

Repro:
```
# stub Resend responses to 5xx and assert retry attempts logged
```

---

## EC-007 — Supabase constraint violation (unique) — recovery
- Opis: np. duplicate user or duplicate vote submission.
- Oczekiwane: 409 conflict with clear message; no partial writes.
- Priorytet: Important.

Verification SQL:
```sql
SELECT * FROM votes WHERE vote_id='<id>' AND user_id='<user>';
```

---

## EC-008 — Large payloads / upload
- Opis: upload cover image or large description.
- Oczekiwane: server rejects too large payload (413) or streams to storage, progress indications.
- Priorytet: Optional (MVP: avoid heavy uploads).

---

## EC-009 — Network flakiness / offline
- Opis: aplikacja powinna radzić sobie z chwilową utratą sieci; stosować retry i lokalny przechowujący stany.
- Test: symuluj offline w Playwright i sprawdź UI messages + retry.

---

## EC-010 — Rate-limit exceeded
- Opis: symulacja przekroczenia limitów.
- Oczekiwane: zwrócenie 429 i czytelny komunikat; client powtarza z backoff.

Test (autocannon):
```bash
npx autocannon -c 200 -d 10 http://localhost:3000/api/votes
```

---

## Artifacts to commit
- Test scripts: `tests/e2e/*`, `tests/integration/*`.
- Seed + teardown: `scripts/seeds/*`.
- Test reports: `reports/*`, `playwright-report/`.

## Mapping to plan
- Każdy EC mapuje do funkcji w `docs/business/bookclub-pro-mvp-scoping.md` (głosowania, zaproszenia, auth) — upewnij się, że test nie rozszerza zakresu planu.
