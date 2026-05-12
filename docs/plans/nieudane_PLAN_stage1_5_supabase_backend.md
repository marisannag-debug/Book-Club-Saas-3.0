---
title: "PLAN_stage1.5_supabase_backend"
status: draft
authors: ["AI (wygenerowane)"]
date: 2026-05-04
---

# PLAN Stage 1.5 — Wdrożenie backendu (Supabase)

Cel: przygotować i wdrożyć backend aplikacji na Supabase: server-side client, kompletny zestaw migracji (schemat + RLS + seed), CI dla preview, testy integracyjne, dokumentację i bezpieczne przechowywanie kluczy.

Odniesienia:
- [docs/implemented/deployments_report_stage1.md](docs/implemented/deployments_report_stage1.md)
- [docs/plans/PLAN_stage1_bazowa_wersja_aplikacji.md](docs/plans/PLAN_stage1_bazowa_wersja_aplikacji.md)
- [docs/plans/mvp-file-structure-plan.md](docs/plans/mvp-file-structure-plan.md)
- [docs/workflows/Agent-plany.md](docs/workflows/Agent-plany.md)

Zakres (w tym etapie):
- Utworzenie branchu backendowego i server-side Supabase client (`book_club_saas_3/lib/supabase.server.ts`).
- Dopracowanie i uporządkowanie migracji SQL (`supabase/migrations/`): schemat tabel, rollbacky, RLS policies, seed data.
- CI: workflow do aplikowania migracji na preview DB (opcjonalnie) i uruchamiania testów integracyjnych.
- Runbook migracji (backup, apply, rollback).

Poza zakresem (Stage 1.5): automatyczne stosowanie migracji w produkcji bez ręcznej aprobaty; integracje płatności.

Termin i priorytet: wysoki — potrzebne do integracji frontend↔backend.

Kroki wykonania (szczegółowo)

1) Utwórz branch

- Nazwa: `feature/stage1-backend` (lub `feature/stage1-backend/<short>` jeśli potrzebne subtaski).
- Komenda:

```bash
git fetch origin
git checkout -b feature/stage1-backend
```

2) Dodaj server-side Supabase client

- Lokalizacja: `book_club_saas_3/lib/supabase.server.ts`.
- Przykładowy szkielet:

```ts
import { createClient } from '@supabase/supabase-js'

export function createSupabaseServerClient() {
  if (!process.env.SUPABASE_DB_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_DB_URL or SUPABASE_SERVICE_ROLE_KEY')
  }
  return createClient(process.env.SUPABASE_DB_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  })
}
```

- Nie commituj sekretów do repo; użyj zmiennych środowiskowych.

3) Zaktualizuj `supabase/migrations/` i nazewnictwo

- Uporządkuj istniejące pliki migracji (prefiksuj timestampem): `YYYYMMDDHHMM_description.sql` lub zachowaj numerację porządkową w repo, ale w produkcji preferowany format timestamp.
- Tworzenie nowej migracji (supabase CLI):

```bash
npx supabase migration new add_votes_table
# edytuj wygenerowany plik SQL w ./supabase/migrations/
```

- Aplikowanie migracji (preview/local):

```bash
npx supabase start            # opcjonalnie, jeśli używasz emulatora
npx supabase db push --db-url "$SUPABASE_DB_URL"
```

4) RLS policies (Row Level Security)

- Włącz RLS i dodaj polityki dla tabel wrażliwych (przykłady):

```sql
-- enable RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- allow authenticated users to insert membership (via server function or with auth check)
CREATE POLICY "members_insert_authenticated" ON members
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- allow users to update their own member row
CREATE POLICY "members_update_own" ON members
  FOR UPDATE
  USING (auth.uid() = user_id);
```

- Dołącz policje jako osobną migrację z rollbackem.

5) Seed data

- Dodaj opcjonalną migrację `seeds/` lub `supabase/migrations/` z przykładowymi danymi (admin, sample club, sample member). Przykład:

```sql
INSERT INTO users (id, email, name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@example.com', 'Admin');

INSERT INTO clubs (id, name, slug, owner_id) VALUES
  ('00000000-0000-0000-0000-000000000010', 'Sample Club', 'sample-club', '00000000-0000-0000-0000-000000000001');

INSERT INTO members (club_id, user_id, role) VALUES
  ('00000000-0000-0000-0000-000000000010','00000000-0000-0000-0000-000000000001','admin');
```

6) CI dla migracji i testów integracyjnych

- Dodaj workflow `.github/workflows/ci-migrations.yml` uruchamiany na PR:
  - checkout
  - `npm ci`
  - lint
  - unit tests
  - jeśli istnieje secret `SUPABASE_PREVIEW_DB_URL`: `npx supabase db push --db-url ${{ secrets.SUPABASE_PREVIEW_DB_URL }}` i uruchom testy integracyjne.

Przykładowy fragment:

```yaml
on: [pull_request]
jobs:
  migrations-preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - name: Apply migrations to preview DB
        if: env.SUPABASE_PREVIEW_DB_URL
        run: npx supabase db push --db-url "$SUPABASE_PREVIEW_DB_URL"
```

7) Testy integracyjne

- Dodaj testy, które uruchamiają się przeciwko preview DB: weryfikacja insertów do `users`, `members` i `submissions` oraz enforcement RLS (nieautoryzowany insert powinien zwrócić 401/403).

8) Backup i rollback

- Przed zastosowaniem na staging/prod wykonaj backup:

```bash
pg_dump --format=custom -f backup_$(date +%Y%m%d%H%M).dump "$DATABASE_URL"
```

- Rollback: uruchom odpowiednie `revert_*.sql` w odwrotnej kolejności migracji lub przywróć backup przez `pg_restore`.

9) Runbook migracji (krótkie kroki)

- Lokalnie/przed preview: uruchom migracje na preview DB, uruchom integracyjne testy.
- Na staging: wykonaj backup -> zaaplikuj migracje -> sprawdź sanity tests -> manual smoke (signup, create club, join, create vote, submit vote).
- W razie problemów: rollback przez `revert_*.sql` lub przywrócenie backup.

10) Dokumentacja kluczy Supabase (gdzie znaleźć / jak wygenerować)

- Panel Supabase: https://app.supabase.com → wybierz projekt → `Settings` → `API`:
  - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (przechowuj tylko server-side)
- DB connection: `Settings` → `Database` → `Connection string` → skopiuj `DATABASE_URL` lub odpowiednią formę.
- Generowanie/rotacja: w panelu `API` możesz rotować klucze; dokumentuj każdą rotację i aktualizuj secrets.
- Przechowywanie: GitHub Secrets (`SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_PREVIEW_DB_URL`) i Vercel Environment (`NEXT_PUBLIC_...` tylko publiczne), lokalnie `.env.local` (nigdy commitować).

11) Kryteria akceptacji

- Wszystkie migracje mają rollback i przechodzą lokalnie/na preview.
- RLS policies zapewniają, że tylko uprawnione akcje są możliwe (testy integracyjne przechodzą).
- Backup i runbook dostępne w `docs/implemented/`.
- PR `feature/stage1-backend` otwarty, z checklistą i powiązaniem do PR frontendu.

12) Kolejne kroki (po ukończeniu planu)

- Scalić backend → staging (po review), wykonać backup i manual apply.
- Po zielonym stagingu: przygotować proces migracji do produkcji (manual gated workflow + backup).

---

Plik planu utworzony automatycznie. Jeśli chcesz, mogę teraz: utworzyć branch `feature/stage1-backend` i dodać `book_club_saas_3/lib/supabase.server.ts` z powyższym szablonem.
