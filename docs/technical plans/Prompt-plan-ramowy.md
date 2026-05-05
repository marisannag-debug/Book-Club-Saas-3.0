Cel: Wygeneruj szczegółowy, podzielony na etapy (stage) plan wdrożenia i „deploy runbook” dla każdej kluczowej funkcjonalności aplikacji BookClub Pro. Każdy etap ma być zapisywalny jako osobny plik Markdown: `docs/technical plans/stage-<n>-deploy-plan.md`.

Wejście (przed uruchomieniem):
- Przeczytaj i uwzględnij treść źródłowych dokumentów:
  - [docs/business plans/bookclub-pro-mvp-scoping.md](docs/business%20plans/bookclub-pro-mvp-scoping.md)
  - [docs/business plans/bookclub-pro-user-journey-map.md](docs/business%20plans/bookclub-pro-user-journey-map.md)
  - [docs/technical plans/agent-deploy-runbook-prompt.md](docs/technical%20plans/agent-deploy-runbook-prompt.md)

Wymóg technologiczny (sztywny): frontend i narzędzia muszą wykorzystywać poniższy stack:
```
"react": "^18.0.0",
"react-dom": "^18.0.0",
"@apollo/client": "^3.0.0",
"graphql": "^16.0.0",
"react-oidc-context": "^3.0.0",
"oidc-client-ts": "^3.0.0",
"@ifelse/shared-ui": ">=0.4.0",
"react-i18next": "^13.0.0",
"i18next": "^23.0.0",
"lucide-react": ">=0.400.0",
Tailwind CSS, TypeScript
```
Uwaga: Next.js może być użyty opcjonalnie (jeśli potrzebny SSR/Router), ale wymaganiem jest stosowanie powyższych bibliotek w warstwie aplikacji.

Zadanie agenta — outputy:
- Dla każdej funkcjonalności (feature) utwórz oddzielny etap (Stage N) i zapisz plik `docs/technical plans/stage-<N>-deploy-plan.md` z poniższymi sekcjami:
  1. Nagłówek: `# Stage N — <nazwa stage>` + jednozdaniowy cel.
 2. Preconditions: lista warunków wstępnych (branch, env, secrets, DB, role access).
 3. Krok‑po‑kroku runbook wdrożenia:
     - wszystkie komendy terminalowe (bash/PNPM/CLI) w blokach kodu;
     - pliki do utworzenia/zmiany (ścieżka + przykładowa zawartość lub snippet);
     - migracje bazy danych (SQL) z komendami uruchomienia;
     - konfiguracja env (lista zmiennych + przykład `.env.example`) i co umieścić w Vercel/hosting;
     - jak uruchomić lokalnie (dev) i jak zrobić preview deploy na Vercel.
 4. Testy akceptacyjne (E2E) — szczegółowe scenariusze + polecenia uruchomienia (Playwright / Jest / cURL). Każdy etap kończy się sekcją "Acceptance E2E test (krok po kroku)" ze skryptami do skopiowania.
 5. Checklista post-deploy (smoke checks) — co sprawdzić w UI i DB.
 6. Rollback plan: Vercel revert / DB rollback SQL / quick commands; troubleshooting hints.
 7. Bezpieczeństwo: ACL, walidacje (np. membership check przed submit vote), rate limits, storage of secrets.
 8. Automatyzacja: PR naming, branch naming (`feature/deploy-stage-<N>-<short>`), PR checklist, przykładowy GitHub Actions job (snippet) uruchamiający build → tests → preview deploy.
 9. Monitoring & alerty: lista eventów do monitorowania, Sentry/Vercel logs wskazówki.
 10. Output artifacts: co zapisać do repo (migration.sql, deploy-log.txt, test-report.html) i ścieżki.
 11. Acceptance criteria (mierzalne) dla etapu.
 12. Estymaty i zasoby (np. frontend dev, backend dev, devops) dla etapu.
 13. Backout checklist (szybkie zatrzymanie ruchu i przywrócenie poprzedniego stanu).
 14. Change log entry template (gotowy fragment do wstawienia w CHANGELOG / PR description).

Specyfika planu etapów (należy):
- Podziel etapy zgodnie z kluczowymi funkcjonalnościami opisanymi w dokumentach MVP (przykład proponowanego podziału):
  - Stage 1 — Scaffolding & Auth (app scaffold, OIDC client, initial mock API)
  - Stage 2 — Club creation + invite + membership flow (mock → real GraphQL)
  - Stage 3 — Book proposals + Voting (frontend + GraphQL schema + vote resolution)
  - Stage 4 — Meetings scheduling (meetings model + notifications)
  - Stage 5 — Simple chat (realtime via GraphQL subscriptions or fallback polling)
  - Stage 6 — Dashboards + polish + analytics
  - Stage 7 — QA, load tests, production release checklist

  Agent może zaproponować inne logiczne rozbicie w etapy, ale musi uzasadnić różnice i zachować porządek funkcjonalny.

Konwencje i wymagania dodatkowe:
- Każdy plik `stage-<N>-deploy-plan.md` musi kończyć się sekcją `Acceptance E2E test (krok po kroku)` zawierającą kopiowalne komendy.
- Jeśli podczas analizy źródeł znajdziesz rozbieżności dotyczące stosu technologicznego, zaktualizuj odpowiednie pliki źródłowe (np. [docs/business plans/bookclub-pro-mvp-scoping.md](docs/business%20plans/bookclub-pro-mvp-scoping.md)) i opisz zmiany w oddzielnym pliku `docs/technical plans/stage-<N>-changes-summary.md`.
- Generuj krótką checklistę dla DevOps (secrets, roles, monitoring) oraz `.env.example` dla każdego etapu.
- Dla komend używaj PNPM (np. `pnpm install`, `pnpm dev`, `pnpm build`) jeśli projekt korzysta z monorepo/package.json.

Deliverables (co zwrócić):
- Zbiór plików: `docs/technical plans/stage-1-deploy-plan.md`, `stage-2-deploy-plan.md`, ... (jeden plik na etap).
- `docs/technical plans/stages-index.md` — spis etapów z krótkim timeline i estymatami.
- Każdy etap z checklistą Acceptance E2E oraz przykładowymi komendami do uruchomienia testów.

Tone & style: rzeczowy, wykonawczy, krok‑po‑kroku — dokumenty mają być używalne bez dalszych konsultacji.

Start: Zacznij od wygenerowania pliku dla Stage 1 (Scaffold + Auth + mock API). Zapisz plik jako `docs/technical plans/stage-1-deploy-plan.md` i zwróć krótkie 3‑zdaniowe podsumowanie, jak go użyć.

Koniec promptu.

--

Uzupełnienia (Repo / App skeleton / potrzeby agenta kodującego)

1) Szkielet plików w repozytorium (proponowany)

```
/README.md
/package.json
/pnpm-workspace.yaml (opcjonalne jeśli monorepo)
/.github/
  /workflows/ci.yml
/docs/
  /technical plans/
  /business plans/
/apps/
  /web/                      # frontend app (Next.js or Vite)
    /package.json
    /tsconfig.json
    /next.config.js OR /vite.config.ts
    /public/
    /src/
      /app/ or /pages/        # depending on router choice
      /components/
      /features/
      /lib/
        apollo.ts
        oidc.ts
        i18n.ts
      /hooks/
      /styles/
    /.env.example
/packages/
  /shared-ui/                 # optional shared component library (`@ifelse/shared-ui` consumer or source)
/mock-api/                    # mock server or MSW handlers used in Stage 1
  server.js OR browser.ts
/server/                      # optional GraphQL backend (if included in repo)
  /schema/
  /migrations/
  package.json
/migrations/                  # DB migrations if applicable
/tests/
  /e2e/                       # Playwright configs and tests
  /unit/                      # Jest + RTL tests
```

2) Szkielet aplikacji (frontend minimal):

- `src/lib/apollo.ts` — konfiguracja Apollo Client (cache, httpLink, authLink).
- `src/lib/oidc.ts` — inicjalizacja `react-oidc-context` (OIDCProvider config).
- `src/lib/i18n.ts` — konfiguracja `react-i18next`.
- `src/pages/_app.tsx` lub `src/app/layout.tsx` — opakuj aplikację w `ApolloProvider`, `OidcProvider`, `I18nextProvider` oraz globalny `ErrorBoundary`.
- `src/pages/index.tsx` — landing.
- `src/features/club/*` — feature folder dla club creation, invites, votes.
- `src/components/ui/*` — małe komponenty (button, form, modal) korzystające z `@ifelse/shared-ui` wrapperów.
- `src/mocks/` — pliki z mockami API (MSW handlers) oraz skrypt uruchamiania mock servera w dev.

3) `.env.example` (minimalne zmienne środowiskowe)

```
NEXT_PUBLIC_GRAPHQL_URL=https://localhost:4000/graphql
GRAPHQL_URL=http://localhost:4000/graphql
NEXT_PUBLIC_OIDC_ISSUER=https://example-issuer.com
NEXT_PUBLIC_OIDC_CLIENT_ID=bookclub-web
OIDC_CLIENT_SECRET=*** (server only)
RESEND_API_KEY=***
DATABASE_URL=postgres://user:pass@localhost:5432/bookclub
NODE_ENV=development
```

4) Niezbędne skrypty w `package.json` (przykład)

``json
{
  "scripts": {
    "dev": "pnpm --filter ./apps/web dev",
    "build": "pnpm --filter ./apps/web build",
    "start": "pnpm --filter ./apps/web start",
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write .",
    "test": "pnpm -w test",
    "e2e": "playwright test",
    "codegen": "graphql-codegen --config codegen.yml",
    "migrate": "<db-migrate-command>"
  }
}
```

5) Pliki konfiguracyjne, które agent powinien sprawdzić/utworzyć
- `tsconfig.json`, `eslint` config, `prettier` config
- `codegen.yml` (GraphQL Code Generator)
- `playwright.config.ts` / `jest.config.ts`
- `.github/workflows/ci.yml` (build, lint, test, preview deploy)
- `pnpm-workspace.yaml` (jeśli monorepo)

6) Co agent piszący kod będzie potrzebował, by się nie pogubić

- 1) Pełny kontekst repo: przed tworzeniem plików agent powinien wylistować katalogi i odczytać `package.json`(y), `pnpm-workspace.yaml`, `tsconfig.json`, `README.md` aby nie dublować zależności.
- 2) Jasne konwencje nazewnictwa i style: preferowane formatowanie (`prettier`), ESLint rules, nazewnictwo folderów (`features/*`, `components/*`).
- 3) Polecenia do uruchomienia lokalnego: np. `pnpm install`, `pnpm dev` i wymagania środowiskowe (Node version). Dodaj `.nvmrc` lub `engines.node`.
- 4) Jak generować/aktualizować typy GraphQL: uruchamiaj `pnpm codegen` po każdej zmianie schemy.
- 5) Migrations workflow: jak tworzyć i uruchamiać migracje (prisma/supabase/migrations) oraz gdzie zapisać pliki migracji.
- 6) Test workflow: uruchamianie testów unit i e2e, uruchamianie lokalnego mock API przed testami.
- 7) Dev / Preview / Prod env mapping: które zmienne są `NEXT_PUBLIC_*` (exposed) a które serwerowe.
- 8) Bezpieczeństwo: nigdy nie wstawiać realnych sekretów do plików; używać `.env` lokalnie i Vercel secrets w deploy.
- 9) Granularne zadania: agent powinien dzielić pracę na małe commity/PRy (<300 LOC) z opisem i checklistą testów.
- 10) Instrumentacja zmian: na końcu każdej funkcji dodać minimalny test (unit + e2e happy path) oraz wpis do `docs/technical plans/stage-<N>-changes-summary.md` opisujący co zostało dodane.

7) Wskazówki dotyczące mockowania backendu (Stage 1)

- Umieść mocki w `/mock-api` i w `src/mocks` (MSW) oraz zapewnij skrypt `pnpm mock:start` uruchamiający je lokalnie.
- Mock powinien mieć kontrakt GraphQL (schema.graphql) i przykładowe odpowiedzi, a agent powinien generować typy z tej schemy (`codegen`).

8) Szablony plików (krótkie przykłady)

- `src/lib/apollo.ts` (schemat):

```ts
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

export const createApolloClient = (uri: string) => new ApolloClient({
  link: new HttpLink({ uri }),
  cache: new InMemoryCache(),
});
```

- `src/lib/oidc.ts` (schemat):

```ts
import { createAuth } from 'react-oidc-context';

export const oidcConfig = {
  authority: process.env.NEXT_PUBLIC_OIDC_ISSUER,
  client_id: process.env.NEXT_PUBLIC_OIDC_CLIENT_ID,
  redirect_uri: typeof window !== 'undefined' ? window.location.origin + '/callback' : undefined,
};

export const auth = createAuth(oidcConfig);
```

9) Checklista dla agenta przed commit/PR

- Odczytaj istniejące pliki konfiguracyjne i `package.json`.
- Uruchom `pnpm install` i `pnpm -w build` lokalnie (jeśli dotyczy).
- Dodaj testy jednostkowe dla nowych funkcji.
- Zaktualizuj `docs/technical plans/stage-<N>-changes-summary.md` z krótkim opisem zmian.
- Wygeneruj `CHANGELOG` entry (użyj podanego szablonu).

10) Co zapisać w repo po etapie (output artifacts)

- `migration.sql` lub migrowane pliki w `/migrations`
- `deploy-log.txt` (krótkie logi deploya + preview URL)
- `test-report.html` lub `tests/results.json`
- `docs/technical plans/stage-<N>-changes-summary.md`
