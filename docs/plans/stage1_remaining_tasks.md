---
title: "Stage 1 — pozostające zadania"
date: 2026-05-04
author: "AI (wygenerowane)"
---

# Stage 1 — Pozostałe do zrealizowania etapy (lista priorytetów)

Poniżej zestawienie elementów Stage 1, które nadal wymagają implementacji, priorytety oraz szybkie instrukcje do wykonania.

## Priorytet: Wysoki

1. Dodać placeholder server-side Supabase client
   - Cel: `book_club_saas_3/lib/supabase.server.ts` (server-side factory klienta, używa env vars).
   - Branch: `feature/stage1-backend`
   - Sugerowane commity: `feat(lib): add supabase.server placeholder`
   - Komendy:
```bash
git fetch origin
git checkout -b feature/stage1-backend origin/feature/stage1-backend || git checkout -b feature/stage1-backend
# utwórz plik i commituj
git add book_club_saas_3/lib/supabase.server.ts
git commit -m "feat(lib): add supabase.server placeholder"
git push -u origin feature/stage1-backend
```

2. Dodać migracje inicjalne i instrukcję (supabase)
   - Pliki: `supabase/migrations/000_init_users.sql` oraz `supabase/migrations/revert_000_init_users.sql` i `supabase/migrations/README.md`.
   - Sugerowany commit: `db(migrations): add initial users migration`
   - Przykładowa zawartość `000_init_users.sql` (placeholder):
```sql
BEGIN;
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);
COMMIT;
```

3. Dodać rollback/invert SQL (revert_000_init_users.sql) i dokumentację
   - Komendy: utworzyć pliki, commit, push (analogicznie jak wyżej).

## Priorytet: Średni

4. Dodać unit tests dla formularzy auth
   - Pliki: `tests/unit/forms.test.tsx` (RegisterForm + LoginForm)
   - Komenda (lokalnie):
```bash
# dodać testy w tests/unit
git add tests/unit/forms.test.tsx
git commit -m "test(auth): add RegisterForm/LoginForm unit tests"
git push
```

5. Dodać E2E smoke (Playwright)
   - Plik: `tests/e2e/smoke/auth.spec.ts`
   - Scenariusze: otwarcie `/`, `/register`, `/login` i sprawdzenie renderów.

6. Dodać CI workflow (PR -> lint -> test -> build)
   - Plik: `.github/workflows/ci-stage1.yml`
   - Szybki snippet:
```yaml
name: CI
on: [pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

## Priorytet: Niski

7. Uruchomić `npm install` i `npm run dev` lokalnie w celu weryfikacji, poprawić błędy runtime
```bash
cd book_club_saas_3
npm install
npm run dev
```

8. Reconcile PRs i cross-reference
   - Zaktualizować PR frontend (`feat(stage1): frontend skeleton — Stage 1`) o linki do raportów (ten raport + raport wdrożeń).
   - Otworzyć PR backendu i dodać odniesienie do PR frontendu.

9. Maintenance Git (opcjonalne, ale zalecane)
```bash
git prune
git gc --aggressive --prune=now
```

## Dodatkowe uwagi
- Każdy większy krok backendowy (migracje) powinien zawierać rollback SQL i instrukcję backup przed zastosowaniem na staging/prod.
- Przy dodawaniu migracji: dołącz `migration.sql` i `rollback.sql` do `docs/artifacts/`.

---
Pliki raportów zostały umieszczone w `docs/implemented/` oraz `docs/plans/`. Jeśli chcesz, od razu zaimplementuję punkt 1 i 2 (utworzenie placeholdera `supabase.server.ts` i migracji) i otworzę PR backendowy.
