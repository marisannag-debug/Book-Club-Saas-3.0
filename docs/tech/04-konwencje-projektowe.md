---
title: "Konwencje projektowe"
description: "Repo structure, naming, API contracts, branching/PR conventions i checklisty"
status: draft
version: 0.1
authors: ["AI (wygenerowane)"]
references:
  - docs/workflows/Agent-programowanie.md
  - docs/workflows/Agent-plany.md
date: 2026-05-04
---

# Konwencje projektowe

## 2. Nazewnictwo plików i komponentów
- React components: `PascalCase.tsx` (np. `ClubCard.tsx`).
- Filenames dla routingu/komponentów pomocniczych: `kebab-case.tsx` lub `kebab-case.ts` tam gdzie wygodne.
- Hooks: `useSomething.ts` (np. `useAuth.ts`).
- Types: `xyz.types.ts` lub `types.ts` w module.
- Zod schemas: `schemas/<feature>.ts` lub obok endpointu `route.schema.ts`.

## 3. Konwencje kodu i modułowość
- Każdy feature minimalny: `feature/<short>-frontend` i `feature/<short>-backend` — małe, review-friendly PRy.
- Single Responsibility: małe komponenty, testable units.

## 4. API contract conventions
- Contract-first: definiuj expected payloads w `docs/contracts/<feature>.(json|graphql)`.
- Walidacja: Zod schemas jako single source of truth, eksportuj TS types z Zod.
- Example pattern:
  - `src/lib/schemas/user.schema.ts` → `export const userSchema = z.object({...})`
  - `export type User = z.infer<typeof userSchema>`

## 5. Branching i PR conventions
- Branch names: `feature/<short>-frontend`, `feature/<short>-backend`, `chore/<desc>`, `fix/<desc>`.
- Commit messages: Conventional Commits (e.g., `feat(auth): add sign-up page`).
- PR title: `feat(<scope>): short description` or `PLAN: <feature_key> — <short>` for plan-based PR.

## 6. PR checklist (obowiązkowe)
 - [ ] Lint green (`npm run lint`)
 - [ ] Unit tests green (`npm test`)
- [ ] Integration tests added/green (if backend changes)
- [ ] E2E smoke (signup/create club/submit vote) for preview
- [ ] Migration SQL + rollback included (if schema changed)
- [ ] `docs/implemented/implemented_plan_<feature>.md` and `docs/implemented/implemented_feature_<feature>.md` added/updated
- [ ] Mapping to `docs/plans/PLAN_<feature>.md` included in PR description

## 7. Tests naming and placement
- Unit tests next to source: `Component.test.tsx` or `component.spec.ts`.
- Integration tests: `tests/integration/<feature>.test.ts`.
- E2E tests: `tests/e2e/<feature>.spec.ts` (Playwright).

## 8. Examples (commit/PR)
- Commit: `feat(clubs): add create-club form and client-side validation`
- PR title: `feat(clubs): create club flow — frontend + contract` (link to backend PR in description)

## 9. Mapping to PLAN
- Każda zmiana powinna jawnie wskazywać plan: `docs/plans/PLAN_<feature>.md`.

## 10. PYTANIA / ZAŁOŻENIA
- Czy preferujemy PascalCase zawsze dla komponentów (zgoda zalecana)?
- Potwierdzić preferencje monorepo (packages) vs single app.
