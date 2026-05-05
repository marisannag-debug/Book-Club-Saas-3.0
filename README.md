# Book Club SaaS

Next.js app for the Book Club SaaS prototype.

## Quick Start

```powershell
npm install
npm run dev
```

Open:

- http://localhost:3000

## Environment

Copy the template and fill in local values:

```powershell
copy .env.example .env
```

Required variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`
- `NEXT_PUBLIC_APP_ENV`

Do not commit secrets.

## Scripts

- `npm run dev` - start the development server
- `npm run build` - create a production build
- `npm run start` - run the production server
- `npm run lint` - run ESLint

## Project Structure

- `app/` - application routes and UI components
- `lib/` - shared helpers and placeholders
- `supabase/migrations/` - SQL migrations and rollback files
- `.env.example` - local environment template

## Notes

See [docs/README.md](docs/README.md) for a longer Windows-focused setup guide and migration commands.