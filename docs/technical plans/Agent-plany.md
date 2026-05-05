# Agent Deploy Runbook Prompt

Jesteś agentem technicznym odpowiedzialnym za przygotowanie szczegółowych, wykonawczych planów wdrożenia dla kolejnych etapów budowy aplikacji BookClub Pro. Twoim celem jest wygenerować dokumenty „deploy runbook” dla każdego etapu (milestone), które pozwolą zespołowi deweloperskiemu i DevOps wdrożyć, przetestować i opublikować funkcjonalne środowisko (preview/prod), oraz cofnąć zmiany w razie potrzeby.

Wymagania wejściowe:
- Bazuj na specyfikacji: docs/technical plans/bookclub-pro-ui-ux-spec.md i docs/technical plans/mvp-build-plan.md
 - Tech stack: Frontend: `react` ^18.0.0, `react-dom` ^18.0.0, `@apollo/client` ^3.0.0, `graphql` ^16.0.0, `react-oidc-context` ^3.0.0, `oidc-client-ts` ^3.0.0, `@ifelse/shared-ui` >=0.4.0, `react-i18next` ^13.0.0, `i18next` ^23.0.0, `lucide-react` >=0.400.0, Tailwind CSS, TypeScript. Backend: GraphQL API compatible with Apollo Client (np. Apollo Server / GraphQL Yoga / Hasura) with JWT/ODIC-compatible auth. Email: Resend. Deploy: Vercel (frontend) + serverless/managed GraphQL backend as appropriate.  
  
   Uwaga: plik pierwotnie sugerował Next.js; można nadal użyć Next.js jeśli potrzebny SSR/SSG/App Router, ale wymaganiem nadrzędnym jest zastosowanie wymienionych bibliotek w warstwie frontend (React + Apollo + OIDC + shared UI + i18n).  
- Ograniczenia: głosowania tylko dla zalogowanych członków (na etapie MVP), Free tier do 10 członków (backend must enforce), brak multi-club i ról w MVP.
- Format wyjścia: Markdown (UTF-8), pliki zapisz w `docs/technical plans/` jako `stage-<n>-deploy-plan.md`.
- Język: polski.

Dostarcz dla każdego etapu (milestone) następujące sekcje i wymagania (dokładnie, wykonawczo):
1. Nagłówek: `# Stage N — <nazwa stage>` i jednozdaniowy cel.
2. Zestaw preconditions: co musi być gotowe przed startem (env, secrets, DB, branch).
3. Szczegółowy krok-po-kroku runbook wdrożenia:
   - komendy terminala (bash/PNPM/CLI), przykładowe outputy,
   - pliki do utworzenia/zmodyfikowania (ścieżka + krótki opis zawartości),
   - migracje bazy danych (SQL) z komendami uruchomienia,
   - dokładne instrukcje konfiguracji env (co wstawić w Vercel),
   - jak uruchomić lokalnie i jak wykonać preview deploy na Vercel.
4. Testy akceptacyjne (kroki E2E) z dokładnymi scenariuszami i oczekiwanymi rezultatami (np. signup → create club → invite → join → create vote → member votes → see results). Dodaj polecenia uruchomienia testów (Playwright/Jest).
5. Checklista post-deploy (smoke checks) — co sprawdzić w UI i w DB, jak weryfikować logi i eventy.
6. Rollback plan: jak cofnąć deploy (Vercel revert / DB rollback SQL), punkty krytyczne i troubleshooting hints.
7. Bezpieczeństwo i zgłoszenia (short): wymagane ACL/walidacje (np. membership check przed submit vote), rate limits, env secrets management.
8. Automatyzacja: Git branch naming, PR checklist, GitHub Actions job (snippet workflow) do triggerowania preview i testów, oraz kroki do release na production.
9. Monitoring i alerty: listę eventów, jak podłączyć prosty monitoring (Vercel logs + analytics calls).
10. Output artifacts: lista plików i dokumentów generowanych w tym etapie (np. migration.sql, deploy-log.txt, test-report.html) i gdzie je zapisać w repo.
11. Acceptance criteria: jasne, mierzalne warunki akceptacji etapu (co musi działać).
12. Estymaty i zasoby: wskazówki ile osób/umiejętności potrzebnych (np. 1 frontend, 1 backend, 1 devops) — krótkie.
13. Backout checklist: kroki do szybkiego zatrzymania ruchu i przywrócenia poprzedniego stanu.
14. Change log entry template: gotowa treść do wpisania przy zakończeniu etapu.

Dodatkowe wymagania do promptu:
- Generuj też przykładowy plik `docs/technical plans/stage-<n>-deploy-plan.md` z zawartością zgodną z powyższymi sekcjami (dla pierwszego etapu: scaffolding & auth).
- Użyj zwięzłych bloków kodu dla komend, JSON, SQL i YAML.
- Wymuś, by każdy plan kończył się sekcją „Acceptance E2E test (krok po kroku)” z kopiowalnymi komendami testowymi.
- Podaj listę zmiennych środowiskowych (`.env.example`) wymaganych dla tego etapu.
- Dodaj minimalne wskazówki bezpieczeństwa (przechowywanie kluczy, ograniczenia API keys).
- Na końcu dodaj sugestię nazwy branch i PR title (np. `feature/deploy-stage-1-scaffold`).

Tone/Style:
- Bądź dokładny, rozkazowy i wykonawczy — dokument ma być używalny przez inżyniera bez dodatkowych konsultacji.
- Unikaj ogólników; wszędzie, gdzie możliwe, daj przykłady komend/plików/kodów.

Wywołanie:
- Wygeneruj teraz plik dla Stage 1 (scaffold + auth) jako pełny Markdown zgodny z powyższymi regułami i zapisz go w `docs/technical plans/stage-1-deploy-plan.md`.  
- Dodatkowo zwróć w odpowiedzi krótki summary (3 zdania) co zawiera wygenerowany plik i jak go użyć.

Koniec promptu.
