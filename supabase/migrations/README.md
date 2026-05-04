# Supabase migrations — instrukcja

Ten katalog zawiera SQL migracje dla projektu Book-Club-Saas.

Pliki:
- `000_init_users.sql` — inicjalna migracja tworząca tabelę `users`.
- `revert_000_init_users.sql` — rollback (usuwa tabelę `users`).
Additionally included in this branch:
- `001_create_clubs.sql` + `revert_001_create_clubs.sql`
- `002_create_members.sql` + `revert_002_create_members.sql`
- `003_create_books.sql` + `revert_003_create_books.sql`
- `004_create_votes.sql` + `revert_004_create_votes.sql`
- `005_create_vote_options.sql` + `revert_005_create_vote_options.sql`
- `006_create_submissions.sql` + `revert_006_create_submissions.sql`
- `007_create_meetings.sql` + `revert_007_create_meetings.sql`
- `008_create_messages.sql` + `revert_008_create_messages.sql`

Zasady i instrukcje:

1) Backup przed zastosowaniem migracji (staging/prod):

```bash
pg_dump --format=custom -f backup_$(date +%Y%m%d%H%M).dump "$DATABASE_URL"
```

2) Aplikowanie migracji lokalnie (supabase CLI):

```bash
# uruchom lokalny supabase (jeśli używasz emulatora)
npx supabase start

# zastosuj migracje do DB podanego w URL
npx supabase db push --db-url "$SUPABASE_DB_URL"
```

3) Alternatywa: użycie `psql` bezpośrednio:

```bash
psql "$DATABASE_URL" -f ./supabase/migrations/000_init_users.sql
```

4) Rollback (jeśli konieczne):

```bash
psql "$DATABASE_URL" -f ./supabase/migrations/revert_000_init_users.sql
```

Uwaga: rollbacky dostarczone dla każdej migracji jako `revert_*.sql` — uruchamiaj w odwrotnej kolejności migracji (najpierw revert_008... potem revert_000...).

5) Reguły bezpieczeństwa:
- Nigdy nie commituj sekretów (`SUPABASE_SERVICE_ROLE_KEY`) do repo.
- Migracje produkcyjne aplikuj tylko po zatwierdzeniu (PR) i wykonanym backupie.

6) Gdzie zapisać artefakty:
- Po wykonanych migracjach i testach zapisz `migration.sql`, `rollback.sql` i `deploy-log.txt` w `docs/artifacts/`.

Kontakt / notes:
- Jeśli chcesz, mogę utworzyć branch `feature/db-migrations/init-users` z tymi plikami i otworzyć PR.
