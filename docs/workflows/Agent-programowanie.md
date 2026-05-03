# Reguły i Playbook dla agenta programującego — BookClub Pro

Wersja: 1.1 | Data: 2026-05-04 | Autor: Agent-Programista

## Cel dokumentu
Dostarcz zestaw jasnych, wykonawczych reguł dla autonomicznego agenta tworzącego kod aplikacji webowej, uwzględniających pracę równoległą frontend ↔ backend. Backend będzie realizowany w Supabase (Postgres + Auth + Storage). Agent działa iteracyjnie: najpierw mała partia frontendu (UI + mock API / contract), potem odpowiadająca jej mała partia backendu (Supabase schema, RLS, migracje).

## Zakres obowiązywania
- Agent może tworzyć/edytować pliki źródłowe, migracje, testy, workflowy CI/CD i dokumentację techniczną tylko w dedykowanych branchach feature.
- Dla każdej funkcjonalności agent tworzy sparowane branche: `feature/<short>-frontend` i `feature/<short>-backend` (lub `feature/<short>/frontend` i `feature/<short>/backend`). Oba PR muszą się odwoływać do siebie i być zsynchronizowane przed merge.
- Nie wolno: commitować sekretów; pushować do `main` bez PR i green CI; automatycznie stosować migracji w produkcji bez ręcznej weryfikacji.

## Wysokopoziomowe zasady (Musi / Nie wolno / Zalecane)
1. Musi tworzyć atomiczne commity zgodne z konwencją: `type(scope): short description`.
2. Musi walidować wejścia po stronie klienta i serwera (Zod + TypeScript typy po stronie serwera).
3. Musi pisać testy jednostkowe dla krytycznej logiki i integracyjne dla kontraktu front↔back.
4. Musi dodać integracyjny test sprawdzający: `vote submit` wymaga authenticated member (membership check enforced by RLS/policy).
5. Nie wolno dodawać sekretów do repo (SUPABASE_SERVICE_ROLE_KEY tylko w server env).
6. Musi dostarczyć migration SQL i rollback script dla każdej zmiany schematu.
7. Zalecane: mock API (MSW) i kontrakt (OpenAPI/GraphQL SDL/JSON schema) tworzony równolegle z komponentem frontendowym.
8. Musi zapewnić podstawy accessibility (keyboard focus, aria-labels dla przycisków).
9. Musi dokumentować zmiany w `docs/implemented` lub `docs/plans` i dołączać migration.sql.

## Fazy pracy (paradigma front↔back)
Każda funkcjonalność przechodzi przez następujące małe iteracje:
- Plan → Frontend (UI + mocks + contract) → Backend (Supabase schema + policies + seeds) → Integracja (tests) → CI/Preview → Merge → Prod deploy.

## Operational rules — szczegółowe kroki

Scaffold (jednorazowo dla projektu)
- Utwórz branch: `feature/scaffold` (lub `chore/scaffold` dla inicjalizacji).
- Frontend scaffold:
```bash
pnpm create next-app . -- --app --typescript
pnpm install tailwindcss postcss autoprefixer
pnpm install @supabase/supabase-js @supabase/auth-helpers-nextjs
pnpm install zod msw
```
- Supabase lokalne środowisko:
```bash
npx supabase login            # zaloguj CLI (jeśli wymagane)
npx supabase init             # inicjalizacja katalogu supabase (opcjonalnie)
npx supabase start            # uruchom lokalny Postgres + API (jeśli używasz emulatora)
```
- Utwórz plik klienta Supabase: `src/lib/supabaseClient.ts` (server & client exports) i dodaj do `.gitignore` pliki lokalnego środowiska.

Feature (parowane front/back)
1. Nazwij feature krótko: `short-name`.
2. Utwórz dwie gałęzie:
   - `feature/<short-name>-frontend`
   - `feature/<short-name>-backend`
3. Frontend (small slice):
   - Zaimplementuj UI skeleton i komponenty (accessible), dodaj MSW lub lokalny mock implementujący kontrakt.
   - Dodaj plik kontraktu: `docs/contracts/<short-name>.json` lub `docs/contracts/<short-name>.graphql` z oczekiwanymi endpointami/payload.
   - Dodaj unit tests dla komponentów. Komituj atomicznie.
4. Backend (small slice, Supabase):
   - Utwórz migration SQL w `supabase/migrations/` lub `migrations/` (nazwa: `YYYYMMDDHHMM_<desc>.sql`).
   - Dodaj RLS policies i seed data (jeśli potrzebne).
   - Zaktualizuj `.env.example` z wymaganymi zmiennymi.
5. Integracja:
   - Zaimplementuj integracyjne testy (supertest/axios) używające lokalnego Supabase albo testowego projektu Supabase.
   - Frontend e2e (Playwright) powinien działać przeciwko preview deployowi lub lokalnemu środowisku z uruchomionym supabase.
6. PR policy: oba PR muszą mieć opis, link do kontraktu i wzajemne referencje; merge po green CI i akceptacji.

Tests
- Unit: `pnpm test` (Jest/Vitest)
- Integration: uruchom lokalny Supabase (`npx supabase start`) i uruchom testy integracyjne.
- E2E: `npx playwright test` — testy muszą mieć fixture do czyszczenia bazy między scenariuszami.

CI
- Workflow na PR:
  - checkout -> pnpm install -> lint -> unit tests -> build frontend -> run integration tests (z opcjonalnym preview DB) -> start preview deploy
- Jeśli chcesz uruchamiać migracje w preview, wykonuj je tylko gdy istnieje zmienna `SUPABASE_PREVIEW_DB_URL`.

Przykładowy snippet GitHub Actions (skrócony):
```yaml
name: CI
on: [pull_request]
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
  preview-migrations:
    if: env.SUPABASE_PREVIEW_DB_URL
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx supabase db push --db-url ${{ secrets.SUPABASE_PREVIEW_DB_URL }}
```

Deploy
- Frontend: Vercel (preview for PRs). Production: merge to `main` + manual approval if migrations to prod.
- Backend (Supabase): migracje aplikujemy ręcznie lub przez chroniony workflow tylko do staging/preview; production migrations wymagają review i backup.

DB & migration rules (Supabase)
- Każda zmiana schematu musi być: migration SQL (w `supabase/migrations/`) + rollback SQL lub invert script.
- Tworzenie migracji (lokalnie):
```bash
npx supabase migration new add_votes_table
# edytuj wygenerowany plik SQL
git add supabase/migrations/20260504_add_votes_table.sql
```
- Aplikacja migracji (lokalnie):
```bash
npx supabase start
npx supabase db push --db-url $SUPABASE_DB_URL
```
- Backup przed migracją na staging/prod:
```bash
pg_dump --format=custom -f backup.dump "$DATABASE_URL"
```
- Rollback: dostarcz invert SQL w `migrations/revert_*` i uruchom przez psql, lub przywróć backup.

Security & secrets handling
- Przechowuj klucze tylko w: Vercel Environment, GitHub Secrets, Supabase Project Settings.
- Nigdy nie commituj `SUPABASE_SERVICE_ROLE_KEY`. Używaj go wyłącznie server-side (Edge/Serverless/Server functions) i tylko tam, gdzie konieczne.
- Wymuś RLS (Row Level Security) dla tabel wrażliwych i dodaj polityki sprawdzające członkostwo przy insert/update/delete.

Observability & monitoring
- Emituj eventy server-side: `club_created`, `member_joined`, `vote_created`, `vote_submitted`.
- Logi: Vercel logs + Supabase logs; agreguj w prostym endpointzie analytics lub zewnętrznym systemie.
- Alert: error rate > 1% w 5m lub median latency > 500ms.

Anti-abuse & rate-limits
- Implementuj rate-limiter na warstwie API (Edge function lub middleware): 100 req / 10 min per IP, 20 req / min per user dla endpointów głosowania.
- Duplikaty: UNIQUE constraints (vote_id, user_id) i walidacja po stronie serwera.

Acceptance & verification rules
- Task uznany za zamknięty gdy:
  - oba PR (frontend + backend) green
  - migracje dołączone i backup wykonany (staging/prod)
  - unit + integration + e2e tests green
  - preview deploy dostępny i smoke tests przechodzą (signup, create club, invite, join, create vote, submit vote)

Human-in-the-loop gates
- Agent musi zatrzymać się i poprosić o review przy:
  - każdej migracji do produkcji,
  - wprowadzaniu payment/billing/third-party paid integration,
  - zmianach polityk bezpieczeństwa RLS.

Template snippets
- Przykładowe commit messages:
  - `chore: init scaffold`
  - `feat(auth): add sign-up page (frontend)`
  - `feat(auth): add users table + RLS (supabase migration)`
  - `feat(votes): add voting UI (frontend)`
  - `db(migrations): add votes tables` 

`.env.example` (minimum):
```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_DB_URL=
SUPABASE_PROJECT_REF=
RESEND_API_KEY=
ANALYTICS_URL=
```

## Przykładowy workflow dla pojedynczego feature (skrót)
1. `feature/checkout-frontend` — implementacja UI + mocks + kontrakt `docs/contracts/checkout.json`.
2. `feature/checkout-backend` — migracja `supabase/migrations/YYY_checkout.sql`, polityki RLS, seeds.
3. Open PRs, referencje PR → PR.
4. CI: uruchom testy; opcjonalnie apply migrations to preview DB.
5. Merge backend → staging, then merge frontend.

## Final checklist (priorytetowe)
- [ ] Paired branches created (`-frontend`, `-backend`)
- [ ] Contract file (`docs/contracts/`) dodany
- [ ] Migration SQL + rollback dołączony
- [ ] Tests: unit + integration + e2e green
- [ ] Backup przed migracją na staging/prod
- [ ] PRs cross-referenced i gain approvals

## Metadata
- Wersja: 1.1
- Data: 2026-05-04
- Autor: Agent-Programista
# Reguły i Playbook dla agenta programującego — BookClub Pro

Wersja: 1.0 | Data: 2026-03-26 | Autor: Agent-Programista

## Cel dokumentu
Dostarcz zestaw jasnych, wykonawczych reguł dla autonomicznego agenta piszącego kod aplikacji webowej (Next.js 14 + TypeScript + Tailwind). Reguły mają gwarantować bezpieczne, powtarzalne i testowalne wdrożenia.

## Zakres obowiązywania
Agent może tworzyć/pliki kodu, migracje, testy, workflowy CI/CD i deployować na Vercel tylko w utworzonych branchach feature/*. Nie wolno: commitować sekretów, pushować bez PR, zmieniać prod env bez akceptacji człowieka.

## High-level rules (Musi / Nie wolno / Zalecane)
1. Musi tworzyć atomiczne commity zgodne z konwencją: `type(scope): short description`.
2. Musi walidować wejścia serwera za pomocą Zod i typów TypeScript.
3. Musi pisać testy jednostkowe dla każdej nowej funkcji krytycznej.
4. Musi dodać integracyjny test sprawdzający: `vote submit` wymaga authenticated member.
5. Nie wolno dodawać sekretów do repo (SERVICE ROLE keys tylko w Vercel env).
6. Musi dodać UNIQUE constraint i CHECK w bazie dla krytycznych warunków (np. UNIQUE(vote_id,user_id)).
7. Musi zapewnić rollback plan przy migracjach.
8. Zalecane: prosty rate-limit middleware na endpointy publiczne.
9. Musi zapewnić accessibility podstaw (keyboard focus, aria-labels dla przycisków).
10. Musi dokumentować zmiany w `docs/technical plans` i dołączać migration.sql.

## Operational rules — fazy (scaffold → feature → tests → CI → deploy → monitoring → rollback)

Scaffold
- Krok 1: utwórz branch `feature/scaffold`.
- Krok 2: `pnpm create next-app . -- --app --typescript`.
- Krok 3: zainstaluj Tailwind, Zod.

Feature
- Krok 1: utwórz feature branch `feature/<task>`.
- Krok 2: dodaj pliki, migracje w `migrations/`.
- Krok 3: lokalne testy: `pnpm test` i `pnpm lint`.

Tests
- Krok 1: napisz unit tests (Jest), integration tests (node fetch/supertest), E2E (Playwright).
- Krok 2: uruchom `npx playwright test` przed PR.

CI
- Reguła: workflow uruchamia lint → build → test → e2e → deploy preview.

Deploy
- Preview deploy na PR automatycznie (Vercel), production tylko po merge do `main` i green CI.

Monitoring
- Emituj eventy: `club_created`, `member_joined`, `vote_created`, `vote_submitted`, `meeting_created`.

Rollback
- Przy problemach: revert PR w Vercel, rollback migracji SQL (patrz sekcja migrations).

## Code-style & commit rules
- ESLint + Prettier (config standard). Używaj `pnpm lint -- --fix`.
- Commit messages examples:
  - `chore: init scaffold`
  - `feat(lib): add supabase client`
  - `feat(auth): add sign-up and sign-in pages`
  - `feat(clubs): add clubs API`
  - `db(migrations): add initial schema`
  - `test: add vote submit integration test`
- PR checklist: lint pass, tests pass, migrations attached, docs updated, accessibility smoke.

## Security & secrets handling
- Przechowuj wszystkie klucze tylko w Vercel Env i Supabase project settings.
- Nigdy nie commituj `SUPABASE_SERVICE_ROLE_KEY`. W kodzie używaj `process.env.SUPABASE_SERVICE_ROLE_KEY` tylko w server-side.
- Wymagaj rotacji kluczy po istotnych zmianach.
- Uruchamiaj dependency scan (npm audit / Snyk) przed release.

## Testing rules
- Unit: testuj logikę walidacji, helpery, schematy Zod.
- Integration: testuj API routes (auth + membership checks).
- E2E: Playwright flows (signup → create club → invite → join → create vote → submit vote → results).

Przykładowy test do wymuszania constraintu (Jest + supertest):
```ts
test('vote submit requires authenticated member', async () => {
  const res = await request(app).post('/api/votes/123/submit').send({ option_id: 'opt1' })
  expect(res.status).toBe(401)
})
```

## CI/CD rules (snippet)
`.github/workflows/ci.yml` (skrócony):
```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
```

Preview deploy: Vercel integration (auto on PR). Production: merge to `main` + manual approval if DB migrations.

## DB & migration rules
- Każda zmiana schematu -> migration SQL w `migrations/` z prefiksem `YYYYMMDDHHMM_description.sql`.
- Przed migracją w staging/prod: wykonaj backup: `pg_dump --format=custom -f backup.dump $DATABASE_URL`.
- Rollback: dostarcz invert script lub DROP/CREATE w `migrations/rollback_...sql`.

Przykład migration header:
```sql
-- 202603261200_add_votes_tables.sql
BEGIN;
CREATE TABLE votes (...);
COMMIT;
```

## Observability & monitoring
- Emituj eventy server-side do analytics endpoint (POST /analytics) przy: signup, club_created, vote_submitted.
- Thresholds: error rate > 1% w 5m -> alert; median latency > 500ms -> alert.

## Anti-abuse & rate-limits
- Implementuj rate-limit middleware: 100 req / 10 min per IP, 20 req / min per user for vote endpoints.
- Duplicate prevention: DB UNIQUE (vote_id, user_id).

## Privacy & compliance
- Nie przechowuj PII poza `users.email` i `name` jeśli niezbędne.
- Retention: usuń logi użytkownika po 2 latach lub na żądanie.

## Emergency & rollback playbook
1. Oznacz incident, stwórz kanał #incident.
2. Revert w Vercel (UI) na ostatni green deploy.
3. Jeśli konieczne: uruchom `psql < rollback.sql` z backupu.
4. Komunikuj użytkownikom: `Przepraszamy, pracujemy nad naprawą.`

## Template snippets

Commit message example:
```
feat(clubs): add clubs creation API
```

PR description template:
```md
Co robi ten PR?
- Krótkie: ...
Dlaczego?
- Powód: ...
Testy:
- [ ] unit
- [ ] integration
- [ ] e2e
```

`.env.example` minimal:
```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
ANALYTICS_URL=
```

## Acceptance & verification rules
- Task uznany za zamknięty jeśli:
  - wszystkie testy green,
  - preview deploy działa i dostępny URL w PR,
  - migracje przyjęte i backup wykonany,
  - manual smoke: signup, create club, join, create vote, submit vote (auth enforced).

## Human-in-the-loop gates
- Agent musi zatrzymać się i poprosić o review przy:
  - każdej migracji w prod,
  - wprowadzaniu billing/third-party paid integration,
  - security exceptions.

## Reporting & artifacts
- Po zadaniu agent załącza: `migration.sql`, `deploy-log.txt`, `test-report.html`, PR link. Zapis: `repo/docs/artifacts/`.

## Example scenarios (skrót)
1. Scaffold auth
  - kroki: init next app, add supabase client, add sign-up page, test signup.
2. Add clubs API
  - kroki: migration create clubs, endpoint POST /api/clubs, test integration.
3. Implement vote submit
  - kroki: migration votes/options/submissions, API POST /api/votes/:id/submit, enforce membership check, add unique constraint, add integration test verifying unauthenticated user receives 401.

## Final checklist (priorytetowe)
- [ ] Branch feature/<task> utworzony
- [ ] Commits atomiczne
- [ ] Lint i tests green
- [ ] Migration SQL dołączony
- [ ] Backup wykonany przed migracją (staging/prod)
- [ ] Preview deploy dostępny
- [ ] PR ma opis i checklistę
- [ ] Artifacts zapisane w `docs/artifacts`

## Metadata
- Wersja: 1.0
- Data: 2026-03-26
- Autor: Agent-Programista
- Odśwież reguły: po zmianie stacku lub co 3 miesiące.

---

Zalecana nazwa branch i PR dla pierwszego dużego taska:
- Branch: `feature/scaffold-auth`
- PR title: `feat(scaffold): nextjs14 + tailwind + supabase auth`

Przykładowe 6 commit messages:
1. `chore: init nextjs14 scaffold`
2. `feat(lib): add supabase client`
3. `feat(auth): add sign-up and sign-in pages`
4. `feat(clubs): add clubs API`
5. `db(migrations): add initial schema`
6. `test: add vote submit integration test`
