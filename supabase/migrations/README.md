# Supabase Migrations

This folder contains the database migrations used by Book Club SaaS.

## Files

- `000_init_users.sql`
- `000_init_users_rollback.sql`
- `001_enable_rls_and_policies.sql`
- `001_enable_rls_and_policies_rollback.sql`

## Apply migrations

Use the Supabase CLI with a database URL in `SUPABASE_DB_URL`:

```bash
npx supabase db push --db-url "$SUPABASE_DB_URL"
```

If you are on PowerShell, use:

```powershell
npx supabase db push --db-url "$env:SUPABASE_DB_URL"
```

## Rollback

Rollback scripts are stored alongside the forward migrations. Apply them manually in reverse order if you need to revert a change.

## Notes

- Do not commit secrets to the repository.
- Keep `SUPABASE_DB_URL` in your local `.env` or CI secret store.
- This stage only includes the initial users table and RLS/policy setup.