# Stage 1 — Scaffolding & Auth (app scaffold, OIDC client, initial mock API)

Cel: Szybkie przygotowanie spójnego szkieletu repozytorium i frontendowej aplikacji oraz integracja OIDC w trybie mock (frontend‑first). Ten runbook daje inżynierowi kroki wykonawcze, zmienne środowiskowe, testy akceptacyjne i checklisty potrzebne do rozpoczęcia prac nad MVP.

---

## 1. Preconditions
- Branch: utwórz i pracuj na `feature/deploy-stage-1-scaffold`.
- Narzędzia lokalne: Node.js LTS (18.x/20.x), pnpm, Git, opcjonalnie Vercel CLI, psql (jeśli testujesz migracje).
- Konta/testy: testowy OIDC issuer (Keycloak, Auth0 test tenant lub lokalny provider) z `issuer`, `client_id`, `redirect_uri`.
- Secrets: lokalny plik `.env` (na podstawie `.env.example` niżej); Vercel secrets (dla preview/prod) jeśli dostępne.
- Uprawnienia: dostęp do repo i możliwość tworzenia PR/preview (Vercel/GitHub integration).

Uwaga projektowa: Stage 1 używa mocków (MSW / mock server) zamiast produkcyjnego backendu; wszystkie kontrakty GraphQL trzymamy w `mock-api/schema.graphql` i generujemy typy (`graphql-codegen`).

---

## 2. Krok‑po‑kroku runbook wdrożenia

1) Utwórz branch:

```bash
git checkout -b feature/deploy-stage-1-scaffold
```

2) Inicjalizacja workspace i katalogów (jeśli projekt nowy):

```bash
pnpm init -w
mkdir -p apps/web packages/shared-ui mock-api migrations tests/e2e
```

3) Zainstaluj zależności (frontend + devtools):

```bash
pnpm add -w react@^18.0.0 react-dom@^18.0.0 @apollo/client@^3.0.0 graphql@^16.0.0 react-oidc-context@^3.0.0 oidc-client-ts@^3.0.0 @ifelse/shared-ui@^0.4.0 @ifelse/customer-features@^1.0.0 react-i18next@^13.0.0 i18next@^23.0.0 lucide-react@^0.400.0 tailwindcss postcss autoprefixer
pnpm add -w -D typescript eslint prettier msw @playwright/test graphql-codegen @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations @graphql-codegen/typescript-react-apollo
```

---

## Integracja: IfElse App Framework (`@ifelse/*`)

(omitted — already added in repo runbook)

---

4) Stwórz minimalne `apps/web/package.json` (scripty):

```json
{
  "name": "web",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "mock:start": "node ../../mock-api/server.js",
    "codegen": "graphql-codegen --config codegen.yml",
    "e2e": "playwright test",
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write ."
  }
}
```

5) Dodaj pliki konfiguracyjne (szablony):
- `apps/web/tsconfig.json` — TS config
- `next.config.js` (lub `vite.config.ts` jeśli Vite)
- `tailwind.config.js`, `postcss.config.js`
- `codegen.yml` (schemat poniżej)

Przykładowy `codegen.yml`:

```yaml
schema: ./mock-api/schema.graphql
generates:
  apps/web/src/__generated__/graphql.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-react-apollo
```

6) Dodaj kontrakt GraphQL dla mocków: `mock-api/schema.graphql` (minimum):

```graphql
type User { id: ID!, email: String!, name: String }
type Club { id: ID!, name: String!, ownerId: ID! }
type Query { me: User, clubs: [Club!]! }
type Mutation { createClub(name: String!): Club! }
```

7) Utwórz mock server (MSW) — `mock-api/server.js` (node/msw):

```js
const { setupServer } = require('msw/node');
const { graphql } = require('msw');

const server = setupServer(
  graphql.query('me', (req, res, ctx) => res(ctx.data({ me: { id: 'u-1', email: 'alice@example.com', name: 'Alice' } }))),
  graphql.query('clubs', (req, res, ctx) => res(ctx.data({ clubs: [] })) ),
  graphql.mutation('createClub', (req, res, ctx) => {
    const { name } = req.variables;
    return res(ctx.data({ createClub: { id: 'c-1', name, ownerId: 'u-1' } }));
  })
);

server.listen({ onUnhandledRequest: 'warn' });
console.log('Mock API (MSW) running');
```

8) Dodaj podstawową konfigurację Apollo i OIDC w `apps/web/src/lib`:

`apps/web/src/lib/apollo.ts`:

```ts
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

export const createApolloClient = (uri = process.env.NEXT_PUBLIC_GRAPHQL_URL) =>
  new ApolloClient({ link: new HttpLink({ uri }), cache: new InMemoryCache() });
```

`apps/web/src/lib/oidc.ts`:

```ts
import { createAuth } from 'react-oidc-context';

export const oidcConfig = {
  authority: process.env.NEXT_PUBLIC_OIDC_ISSUER,
  client_id: process.env.NEXT_PUBLIC_OIDC_CLIENT_ID,
  redirect_uri: typeof window !== 'undefined' ? window.location.origin + '/callback' : undefined,
};

export const auth = createAuth(oidcConfig);
```

9) Uruchom codegen i sprawdź typy:

```bash
pnpm --filter ./apps/web codegen
```

10) Uruchom środowisko deweloperskie (mock + frontend):

Terminal A — mock server:
```bash
pnpm --filter ./apps/web mock:start
```

Terminal B — frontend:
```bash
pnpm --filter ./apps/web dev
```

11) Preview deploy (opcjonalnie):
- Push branch i otwórz PR — Vercel wygeneruje preview.
- Alternatywnie CLI:

```bash
pnpm dlx vercel --token $VERCEL_TOKEN --confirm
# rollback
pnpm dlx vercel rollback <deployment-id> --token $VERCEL_TOKEN
```

---

## 3. Pliki do utworzenia / zmiany (lista + opis)
- `apps/web/package.json` — scripty dev/build/codegen/mock
- `apps/web/src/lib/apollo.ts` — Apollo client factory
- `apps/web/src/lib/oidc.ts` — OIDC config
- `mock-api/schema.graphql` — GraphQL contract for mocks
- `mock-api/server.js` — MSW node handlers
- `apps/web/src/mocks/browser.ts` — MSW browser handlers (dev)
- `codegen.yml` — GraphQL Codegen config
- `migrations/001_init.sql` — placeholder migration
- `.env.example` — env variables for dev/preview

---

## 4. Migracje DB (placeholder)
(omitted — same as source runbook)

---

## 5. `.env.example` (zmienne środowiskowe)

```
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
GRAPHQL_URL=http://localhost:4000/graphql
NEXT_PUBLIC_OIDC_ISSUER=https://example-issuer.com
NEXT_PUBLIC_OIDC_CLIENT_ID=bookclub-web
OIDC_CLIENT_SECRET=***
RESEND_API_KEY=***
DATABASE_URL=postgres://user:pass@localhost:5432/bookclub
VERCEL_TOKEN=***
NODE_ENV=development
```

---

## 6. Testy akceptacyjne (E2E) — scenariusze + polecenia
(omitted — same as source runbook)

---

## 7. Checklista post-deploy (smoke checks)
- Landing ładuje się bez błędów (HTTP 200).
- Mock OIDC udostępnia `me` i UI wyświetla imię.
- Można otworzyć i wysłać formularz tworzenia klubu; MSW zwraca utworzoną encję.
- `pnpm --filter ./apps/web codegen` generuje typy.
- Preview URL (Vercel) zwraca 200 i zawiera podstawowe elementy.

---

## 8. Rollback plan
(omitted)

---

## 9. Bezpieczeństwo (minimalne wymagania)
- Nie commitować sekretów; używaj `.env` lokalnie i Vercel secrets w deploy.
- OIDC client secret tylko po stronie serwera (nie w `NEXT_PUBLIC_`).
- Planować rate limits/anty-spam dla publicznych endpointów (w Stage 1 mock może ignorować).
- Po przejściu na backend: wymuszać ograniczenia Free tier (max 10 members) na backendzie.

---

## 10. Automatyzacja (CI snippet)
(omitted — same as source runbook)

---

## 11. Monitoring i alerty (zalecenia)
- Dodaj Sentry (DSN jako secret `SENTRY_DSN`).
- Monitoruj: uncaught errors (5xx), auth failures, unhandled GraphQL errors.
- Vercel logs + Sentry issues do szybkich triage.

---

## 12. Output artifacts
- `mock-api/schema.graphql`
- `mock-api/server.js`
- `apps/web/.env.example`
- `migrations/001_init.sql`
- `apps/web/src/__generated__/graphql.ts` (po codegen)
- `docs/technical plans/stage-1-changes-summary.md` (wygeneruj po ukończeniu prac)

---

## 13. Acceptance criteria (mierzalne)
- Lokalny dev start bez błędów: `pnpm --filter ./apps/web dev` (HTTP 200).
- `pnpm --filter ./apps/web codegen` generuje typy (exit 0).
- Playwright E2E: happy path auth + create club → `passed`.
- Preview URL dostępny i zawiera landing + create club flow (MSW).

---

## 14. Estymaty i zasoby
- Wysiłek: 16–28 roboczogodzin (1 frontend dev + 0.25 devops konsultacyjnie).
- Role: frontend developer (React + Apollo + OIDC), devops (CI/Vercel minimalna konfiguracja).

---

## 15. Backout checklist
- Cofnij PR / revert merge commit: `git revert <merge-commit>` → otwórz PR naprawczy.
- Cofnij preview na Vercel (rollback) i wyślij komunikat do testerów.

---

## 16. Change log entry template

```
## Stage 1 — Scaffolding & Auth
- Zainicjalizowano repo (apps/web)
- Dodano mock API (MSW) i schema.graphql
- Dodano konfigurację Apollo + OIDC
- Dodano minimalne e2e tests
```

---

## 17. Branch / PR suggestions
- Branch: `feature/deploy-stage-1-scaffold`
- PR title: `feat(stage-1): scaffold + auth + mock API`

---

## 18. Acceptance E2E test (krok po kroku) — kopiowalne

1) Uruchom mock i frontend:

```bash
pnpm --filter ./apps/web mock:start &
pnpm --filter ./apps/web dev
```

2) W oddzielnym terminalu uruchom E2E:

```bash
pnpm --filter ./apps/web e2e
```

Oczekiwane rezultaty:
- Testy Playwright kończą się `passed`.
- Widoczny mock user (np. "Alice").
- Możesz utworzyć klub przez UI i zobaczyć go na liście.

---

Plik zapisany: docs/technical plans/plany-etapy-i-full/stage-1-deploy-plan.md

Koniec Stage 1 runbooku.
