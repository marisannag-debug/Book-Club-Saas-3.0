# MVP — Plan etapowy (zarys)

Data: 2026-04-28

Cel dokumentu: krótki, spójny zarys etapów budowy całego MVP BookClub Pro. Ten plik jest bazą do tworzenia szczegółowych runbooków etapów (`docs/technical plans/stage-<n>-deploy-plan.md`). Nie rozpisuję tu szczegółów implementacyjnych — tylko to, co wystarczy, by zachować spójność prac.

---

## Cross‑cutting assumptions
- Podejście: frontend‑first z początkowym mockowaniem backendu (MSW / mock server / IndexDB), produkcyjny backend (GraphQL) budowany w kolejnych etapach.
- Wymagany stack frontend: React ^18, react-dom ^18, @apollo/client, graphql, react-oidc-context, oidc-client-ts, @ifelse/shared-ui >=0.4.0, react-i18next + i18next, lucide-react, Tailwind CSS, TypeScript.
- Deploy: Vercel (frontend) + serverless/managed GraphQL backend (po etapie mocków).
- Konwencje: branch `feature/deploy-stage-<n>-<short>`, PR <300 LOC, `pnpm` scripts, codegen po zmianie schemy, każdy etap ma `stage-<n>-changes-summary.md`.

---

## Stage 1 — Scaffolding & Auth (0–2 tygodnie)
- Cel: przygotować repo i szkielet aplikacji oraz integrację OIDC w trybie mock (frontend + MSW).
- Kluczowe deliverables: repo layout, `apps/web` scaffold, `.env.example`, `src/lib/apollo.ts`, `src/lib/oidc.ts`, mock API (schema.graphql + MSW handlers), minimalny E2E (Playwright).
- Acceptance criteria: dev start (`pnpm dev`) + mock API działa; `pnpm codegen` generuje typy; Playwright happy-path przechodzi (login mock, create club UI).
- Zależności: brak (nowy scaffold).
- Szacunek: 16–28 h.
- Artefakty: `mock-api/schema.graphql`, `mock-api/server.js`, `apps/web/.env.example`, `stage-1-deploy-plan.md`.
- Owner: frontend + 0.25 devops.

## Stage 2 — Club creation, invites & membership (2–3 tygodnie)
- Cel: implementować UI i kontrakt GraphQL dla tworzenia klubu, generowania linków zaproszeń i mechanizmu dołączania (początkowo mock→GraphQL transition).
- Deliverables: GraphQL schema (mutations/queries), frontend forms, invite link flow (public/private), migrations placeholder, basic acceptance tests.
- Acceptance criteria: organizator może utworzyć klub i wygenerować link; użytkownik dołącza przez link; zmiany spisane w `stage-2-changes-summary.md`.
- Zależności: Stage 1.
- Szacunek: 40–60 h.
- Artefakty: `schema` updates, `migrations/*`, frontend feature folder.
- Owner: frontend + backend (GraphQL) konsultacje.

## Stage 3 — Book proposals & Voting (3 tygodnie)
- Cel: dodać model propozycji książek i mechanikę głosowania (TAK/NIE/ABSTAIN); wymusić głosowanie dla zalogowanych (MVP constraint).
- Deliverables: `vote_sessions` schema, frontend vote UI, backend resolvers/mutations (or mock equivalents), results view, tests.
- Acceptance criteria: utworzenie głosowania, członkowie oddają głosy, wyniki poprawnie agregowane i widoczne.
- Zależności: Stage 2.
- Szacunek: 40–80 h.
- Owner: frontend + backend.

## Stage 4 — Meetings scheduling & Notifications (2–3 tygodnie)
- Cel: harmonogram spotkań, prosty model RSVP oraz powiadomienia email (Resend).
- Deliverables: `meetings` schema, meeting CRUD UI, scheduled email on creation/deadline, `.env` mail config, e2e flows.
- Acceptance criteria: utworzenie spotkania i wysłanie testowego emaila; RSVP zapisane w DB.
- Zależności: Stage 2, Stage 3.
- Szacunek: 30–50 h.
- Owner: frontend + backend + ops.

## Stage 5 — Simple chat (realtime) (2–4 tygodnie)
- Cel: dodać prosty chat w klubie (realtime via GraphQL subscriptions lub fallback polling) oraz podstawy moderacji.
- Deliverables: messages schema, subscriptions or polling implementation, simple moderation toggle, e2e conversation tests.
- Acceptance criteria: wysyłanie/odbieranie wiadomości w czasie rzeczywistym; podstawowa moderacja działa.
- Zależności: Stage 2.
- Szacunek: 40–80 h (zależnie od wyboru realtime tech).
- Owner: frontend + backend.

## Stage 6 — Dashboards, polish & i18n (2–3 tygodnie)
- Cel: zebrać dane na dashboardach (organizer/member), UX polish, i18n (react-i18next), accessibility basics.
- Deliverables: organizer dashboard, member dashboard, translations scaffold, minor UI polish, accessibility checklist.
- Acceptance criteria: dashboard pokazuje kluczowe dane; podstawowy coverage i18n dla PL + EN.
- Zależności: Stages 1–5.
- Szacunek: 20–40 h.
- Owner: frontend + product.

## Stage 7 — QA, load tests & release (2 tygodnie)
- Cel: finalne testy, load testing, monitoring, production release checklist i cutover.
- Deliverables: Playwright full-suite, k6/Artillery load script, Sentry + Vercel monitoring config, `CHANGELOG`, release PR.
- Acceptance criteria: E2E green, load test baseline acceptable, monitoring alerts configured, rollback tested.
- Zależności: wszystkie wcześniejsze.
- Szacunek: 16–40 h.
- Owner: devops + qa + tech lead.

---

## Repo / process conventions (krótkie)
- Branching: `feature/deploy-stage-<n>-<short>`; PR do `main` po review.
- Commity: małe, atomiczne; każda funkcja + test; max ~300 LOC.
- Tests: każdy etap — minimalny unit + e2e happy path.
- Codegen: uruchamiaj `pnpm codegen` po zmianach schemy; typy commitować do `src/__generated__` lub ignorować i generować w CI.
- Migrations: zapisuj w `/migrations`, każda migracja ma rollback script.
- Stage changes: po zakończeniu etapu stwórz `docs/technical plans/stage-<n>-changes-summary.md` z krótkim podsumowaniem i artifactami.

---

## Mapping runbook files
- Stage 1 → `docs/technical plans/stage-1-deploy-plan.md` (szczegółowy runbook)
- Stage 2 → `docs/technical plans/stage-2-deploy-plan.md`
- Stage 3 → `docs/technical plans/stage-3-deploy-plan.md`
- Stage 4 → `docs/technical plans/stage-4-deploy-plan.md`
- Stage 5 → `docs/technical plans/stage-5-deploy-plan.md`
- Stage 6 → `docs/technical plans/stage-6-deploy-plan.md`
- Stage 7 → `docs/technical plans/stage-7-deploy-plan.md`

---

## Next steps
1. Potrzebujesz, żebym wygenerował szczegółowy `stage-2-deploy-plan.md` teraz?  
2. Mogę też utworzyć szablony issue GitHub dla Sprint 1 z zadaniami z każdego etapu.

---

Plik zapisany w: docs/technical plans/plan/mvp-stage-outline.md
