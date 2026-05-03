---
title: "Prompt generatora: Tech guidelines (stack, choices, constraints, conventions, code-standards)"
description: "Prompt dla agenta-developera, który wygeneruje 5 plików MD w folderze docs/tech zgodnych z wymaganiami projektu"
status: draft
version: 0.1
authors: ["AI (wygenerowane)"]
references:
  - docs/workflows/Agent-programowanie.md
  - docs/workflows/Agent-plany.md
date: 2026-05-04
---

Rola i cel
- Jesteś doświadczonym full-stack developerem i prompt-engineerem. Twoim zadaniem jest wygenerować pięć plików Markdown w katalogu docs/tech/ opisujących techniczne założenia projektu. Pliki muszą być praktyczne, wykonalne i kompatybilne z istniejącymi workflowami projektu.

Wymagane pliki (dokładne nazwy plików):
- docs/tech/01-stack.md — Stack technologiczny (runtime, infra, zależności, komendy deva i deploy)
- docs/tech/02-uzasadnienie-wyborow.md — Uzasadnienie kluczowych wyborów (trade-offs, alternatywy)
- docs/tech/03-ograniczenia-technologiczne.md — Ograniczenia technologiczne i granice implementacji
- docs/tech/04-konwencje-projektowe.md — Konwencje projektowe (struktur, naming, PLAN format)
- docs/tech/05-standardy-kodu.md — Standardy kodu, linting, testy, CI/PR gating

Wstępne założenia i obowiązkowe przeczytanie
- PRZED wygenerowaniem plików: przeczytaj i zastosuj się do docs/workflows/Agent-programowanie.md oraz docs/workflows/Agent-plany.md — wszystkie rekomendacje muszą być z nimi spójne. W szczególności:
  - Każda rekomendacja powinna wskazywać, jak mapuje się na format PLAN_<feature>.md i wymagania implementacyjne z Agent-programowanie.md.
  - Jeśli jakiś aspekt nie jest określony w planach/wytycznych, dodaj sekcję PYTANIA / ZAŁOŻENIA i PRZESTAŃ — nie implementuj założeń bez potwierdzenia.

Format i konwencje plików
- Każdy plik musi zaczynać się od YAML frontmatter z polami: title, description, status, version, authors, references (co najmniej wskazać oba pliki workflow), date.
- Użyj języka polskiego, zrozumiałego tonu technicznego i krótkich przykładów kopiowalnych do wklejenia (komendy, przykładowe snippet'y SQL/curl/Playwright).
- Dodaj sekcję Mapping to PLAN w każdym pliku — lista funkcji/plans/feature keys które dokument odnosi.
- Na końcu każdego pliku dodaj PYTANIA / ZAŁOŻENIA z jasnymi next steps.

Szczegółowy zakres treści dla każdego pliku
- 01-stack.md — musi zawierać:
  - Krótkie podsumowanie architektury (frontend, backend, DB, auth, storage, messaging)
  - Konkretne technologie (Next.js 14, TypeScript, Tailwind, Supabase, Zod, Playwright, pnpm, Vercel itp. jeśli pasują)
  - Komendy deva i debugowania (np. pnpm dev, npx supabase start, pnpm test)
  - Deploy: kroki wdrożenia (migrations, env, preview), wskazówki dotyczące migracji DB
  - Operacyjne uwagi: monitoring, backup, cost considerations, skalowanie
  - Krótkie diagramy/ASCII lub linki do diagramów (jeśli dotyczy)

- 02-uzasadnienie-wyborow.md — musi zawierać:
  - Lista kluczowych decyzji (frontend framework, backend, DB, auth, hosting, storage, queueing)
  - Dla każdej decyzji: alternatives considered, pros/cons, trade-offs, migration path, impact on tests/CI and Agent-programowanie requirements

- 03-ograniczenia-technologiczne.md — musi zawierać:
  - Hard constraints (co jest narzucone, np. Supabase + RLS, hosting na Vercel itp.)
  - Soft constraints (preferencje, budżetowe ograniczenia)
  - Known limitations (no long-running server processes, file size limits, browser support, data residency)
  - Required workarounds / recommended mitigations

- 04-konwencje-projektowe.md — musi zawierać:
  - Repo structure conventions (apps/, packages/, app/apps/web/ etc.)
  - Naming conventions (files, folders, components, hooks, tests)
  - API contract conventions (Zod + types, GraphQL/REST style, codegen rules)
  - Branching/PR conventions (branch names, PR titles, commit message format)
  - PR checklist — must include: tests green, docs/implemented/ files added when implementing features, mapping to PLAN_<feature>, update migrations, run linters

- 05-standardy-kodu.md — musi zawierać:
  - ESLint/Prettier/formatting rules, TypeScript strict policy, no any policy
  - Runtime validation rules (Zod schemas required for public API boundaries)
  - Error handling patterns, logging levels, observability hooks
  - Testing standards: unit/integration/e2e coverage expectations, required smoke E2E for preview
  - CI gating: linters, tests, coverage thresholds, accessibility checks
  - Pre-commit hooks (lint-staged), commit message convention (Conventional Commits suggested)

Quality gates i artefakty
- Każdy plik powinien wskazywać konkretne komendy do weryfikacji (lint, test, e2e smoke) i przykładowe pliki do utworzenia przy wdrożeniu feature:
  - pnpm lint / pnpm test / npx playwright test --project=chromium
- W treści doprecyzuj, jakie pliki docs/implemented/implemented_plan_<feature>.md i docs/implemented/implemented_feature_<feature>.md należy dodać przy implementacji.

Zasady bezpieczeństwa i prywatności
- Wymień krytyczne wymagania bezpieczeństwa: RLS w Supabase, brak ujawniania SERVICE_ROLE_KEY, polityki backup/restore, obsługa PII.

Wersjonowanie i commity (opcjonalnie — wykonaj jeśli repo jest dostępne)
- Jeśli masz uprawnienia do repo: zapisz pliki w lokalnym repo, utwórz branch docs/tech/generate-guidelines, commituj z komunikatem:
  - docs(tech): add tech guidelines (stack, choices, constraints, conventions, code-standards)
- Wypchnij branch i otwórz PR opisując zgodność z docs/workflows/Agent-programowanie.md i docs/workflows/Agent-plany.md.

Oczekiwany output
- 5 plików Markdown w docs/tech/ z wymienionymi nazwami i strukturą opisano powyżej.
- Krótka notka w odpowiedzi: lista wygenerowanych plików + ewentualne PYTANIA / ZAŁOŻENIA wymagające decyzji.

Zachowaj ostrożność
- Nie dopisuj implementacyjnych zmian do kodu bez planu PLAN_<feature>.md i potwierdzenia. Jeśli brakuje danych, wstrzymaj się i wypisz PYTANIA / ZAŁOŻENIA.

Język: polski. Długość: wystarczająco wyczerpująca, ale możliwa do przeczytania w ~5–10 minut.

Powodzenia — wygeneruj pliki i zwróć ścieżki do zapisanych plików oraz krótkie podsumowanie zmian.
