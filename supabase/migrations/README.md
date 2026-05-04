Supabase migrations for Stage 1 (placeholders)

Apply migration locally (requires `supabase` CLI and `SUPABASE_DB_URL`):

```bash
npx supabase start
npx supabase db push --db-url $SUPABASE_DB_URL
```

Rollback example (use with caution):

```bash
psql "$SUPABASE_DB_URL" -f supabase/migrations/000_init_users_rollback.sql
```

Do NOT commit secrets. Use `.env.example` for required env names.
