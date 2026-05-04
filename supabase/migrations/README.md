# Supabase migrations — instrukcja

Ten katalog zawiera SQL migracje dla projektu Book-Club-Saas.

Pliki:
- `000_init_users.sql` — inicjalna migracja tworząca tabelę `users`.
- `revert_000_init_users.sql` — rollback (usuwa tabelę `users`).

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

5) Reguły bezpieczeństwa:
- Nigdy nie commituj sekretów (`SUPABASE_SERVICE_ROLE_KEY`) do repo.
- Migracje produkcyjne aplikuj tylko po zatwierdzeniu (PR) i wykonanym backupie.

6) Gdzie zapisać artefakty:
- Po wykonanych migracjach i testach zapisz `migration.sql`, `rollback.sql` i `deploy-log.txt` w `docs/artifacts/`.

Kontakt / notes:
- Jeśli chcesz, mogę utworzyć branch `feature/db-migrations/init-users` z tymi plikami i otworzyć PR.
