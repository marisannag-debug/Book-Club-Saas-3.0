---
title: "Scenariusze testowe — krytyczne flowy MVP"
description: "Szczegółowe scenariusze testowe dla krytycznych flowów MVP"
status: draft
version: 0.1
authors: ["AI (wygenerowane)"]
references:
  - docs/workflows/Agent-programowanie.md
  - docs/business/bookclub-pro-mvp-scoping.md
date: 2026-05-04
---

# Scenariusze testowe — krytyczne flowy

Instrukcja: każdy scenariusz zawiera ID, priorytet, preconditions, kroki, oczekiwane rezultaty, mapping do planu, przykładowe komendy do automatyzacji i seed SQL/fixture.

## TS-001 — Sign-up (email + password)
- Priority: Critical
- Plan / Feature: docs/plans/PLAN_user_registration.md (or `user_registration`)
- Preconditions: czysta baza danych; lokalny supabase lub preview DB; seed optional.

Kroki (E2E):
1. Otwórz `/signup`.
2. Wypełnij `email=test+e2e@example.com`, `password=Test1234`.
3. Kliknij `Zarejestruj się`.
4. Oczekuj redirect do dashboard i obecności wpisu w `users`.

Oczekiwane asercje:
- HTTP 200 / redirect do dashboard.
- Wiersz w `users` z `email=test+e2e@example.com`.

Automatyzacja:
```
npx playwright test tests/e2e/signup.spec.ts
```

Seed (SQL):
```sql
-- optional: ensure roles table etc.
INSERT INTO users (id, email) VALUES ('00000000-0000-0000-0000-000000000001','seed@example.com');
```

Cleanup:
```
psql "$SUPABASE_DB_URL" -c "DELETE FROM users WHERE email='test+e2e@example.com';"
```

---

## TS-002 — Create Club (organizer)
- Priority: Critical
- Plan / Feature: docs/plans/PLAN_create_club.md (or `create_club`)
- Preconditions: zalogowany organizator (use fixture), czysta baza klubów.

Kroki:
1. Zaloguj jako organizator.
2. Otwórz `Create Club` form.
3. Wpisz `name=Moje Book Club` → submit.

Oczekiwane:
- Club utworzony w tabeli `clubs` z owner_id = user.id.
- Redirect do Club Page.

Automatyzacja (Playwright / Integration):
```
npx playwright test tests/e2e/create-club.spec.ts
```

Seed / Integration snippet (JS):
```js
// create a test user via Supabase admin or test helper
await supabase.from('users').insert({id: userId, email: 'org@example.com'})
```

---

## TS-003 — Invite member → Join via public link
- Priority: Critical
- Plan: invite/join flow (see user journey)

Kroki:
1. On Club Page -> kliknij `Invite` -> `Copy link`.
2. Otwórz link w incognito -> zarejestruj konto -> powinien dołączyć do klubu.

Oczekiwane:
- Nowy rekord w `members` powiązany z klubem i userem.

Curl example (invite link may be generated on server):
```bash
curl -X POST "${APP_URL}/api/invite" -H "Authorization: Bearer $TOKEN" -d '{"club_id":"<club>","email":"friend@example.com"}'
```

---

## TS-004 — Create Voting (min 2 proposals)
- Priority: Critical

Kroki:
1. Organizer -> Create Voting -> add 2 proposals -> set deadline -> Submit.
2. System creates voting record + options.

Oczekiwane:
- `votes` table contains record; `vote_options` contains co najmniej 2 options.

Integration API sample (curl):
```bash
curl -X POST "$APP_URL/api/votes" -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"title":"Wybór na marzec","options":[{"title":"Lalka","author":"B.Prus"},{"title":"Zarząd" ,"author":"X"}],"deadline":"2026-05-11"}'
```

---

## TS-005 — Member votes (auth and guest variants)
- Priority: Critical

Variants:
- Authenticated member: should be able to submit vote; DB records submission.
- Guest via public link (if allowed by plan): submit recorded as anonymous session or session_id.

Assertions:
- Unique constraint prevents duplicate votes by same user for same voting.

---

## TS-006 — Voting results displayed
- Priority: Important

Steps:
1. After deadline or manual close, organizer opens results.
2. UI displays aggregated counts and top choice.

Checks:
- Results endpoint returns aggregated numbers; UI renders them.

---

## TS-007 — Create meeting + RSVP
- Priority: Important

Steps:
1. Organizer creates meeting (date/time/place).
2. Member marks RSVP -> DB updates attendance.

---

## TS-008 — Simple chat message flow
- Priority: Important

Steps:
1. Member posts message in club chat.
2. Other member sees message in realtime (or on refresh).

Automation hint:
- Use integration test hitting `POST /api/messages` and verify `SELECT * FROM messages`.

---

## Mapping to plan
- Każdy scenariusz mapuje do pozycji w `docs/business/bookclub-pro-mvp-scoping.md` (features: create club, invite, votes, meetings, chat).

## Artifacts to commit
- `tests/e2e/*.spec.ts`, `tests/integration/*.test.js`, `scripts/seeds/*.sql`, `reports/*`.
- Po zakończeniu implementacji dodaj wpis do `docs/implemented/implemented_plan_<feature_key>.md` i `docs/implemented/implemented_feature_<feature_key>.md` zgodnie z `docs/workflows/Agent-programowanie.md`.
