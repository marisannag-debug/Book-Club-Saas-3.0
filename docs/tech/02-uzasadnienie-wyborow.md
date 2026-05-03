---
title: "Uzasadnienie wyborów technologicznych"
description: "Krótka analiza kluczowych decyzji technologicznych, alternatywy i trade-offs"
status: draft
version: 0.1
authors: ["AI (wygenerowane)"]
references:
  - docs/workflows/Agent-programowanie.md
  - docs/workflows/Agent-plany.md
date: 2026-05-04
---

# Uzasadnienie wyborów — kluczowe decyzje

Poniżej zestawiono główne decyzje technologiczne wraz z alternatywami, plusami/minusami i wpływem na proces implementacji (tests/CI/Agent-programowanie).

## 1) Frontend: Next.js 14 (App Router)
- Alternatywy: Remix, SvelteKit, Create React App
- Dlaczego: doskonałe wsparcie dla SSR/SSG, App Router ułatwia modularny routing i integrację z Edge Functions. Dobre wsparcie na Vercel.
- Trade-offs: większa złożoność wobec prostych SPA, wymaga disciplina w strukturze `app/`.
- Impact: E2E na preview prostsze, CI musi uruchamiać `pnpm build`.

## 2) Backend: Supabase (Postgres + Auth + RLS)
- Alternatywy: Firebase, Hasura, vernacular Node.js + Postgres
- Dlaczego: szybkie prototypowanie, RLS wbudowane, storage i edge functions. Minimalna operacyjna złożoność.
- Trade-offs: ograniczenia hostingu (funkcje krótkotrwałe), zależność od providera.
- Impact: wymaga migracji SQL, testów RLS (integration) i backupów przed migracją.

## 3) TypeScript
- Alternatywy: JavaScript
- Dlaczego: typy wymuszają kontrakty pomiędzy frontend/back i ułatwiają refactoring.
- Trade-offs: niewielki koszt początkowy przy bootstrappie; długoterminowy zysk w utrzymaniu.

## 4) UI: Tailwind CSS
- Alternatywy: CSS-in-JS (styled-components), MUI, Chakra
- Dlaczego: szybkie prototypowanie, mały CSS footprint, łatwe tworzenie design systemu.

## 5) Walidacja: Zod
- Alternatywy: Joi, Yup
- Dlaczego: dobrze współgra z TypeScript, łatwe inferowanie typów.

## 6) Testy E2E: Playwright
- Alternatywy: Cypress
- Dlaczego: wsparcie multi-browser, dobry runner, integracja z axe-core dla accessibility.

## 7) Package manager: pnpm
- Zaleta: szybkie instalacje, deterministyczne lockfile, monorepo-friendly.

## 8) Hosting: Vercel
- Alternatywy: Netlify, Render
- Dlaczego: tight integration z Next.js, wygodne preview deployy dla PR.

## Mapping to Agent-programowanie.md
- Supabase → konieczność: migrations + RLS tests + backups (patrz `Agent-programowanie.md`).
- Branching model → zgodny z parowaniem `frontend`/`backend` opisanym w `Agent-programowanie.md`.

## PYTANIA / ZAŁOŻENIA
- Czy akceptujemy zależność od Supabase jako provider (SLA, cost)?
- Czy preferujemy TypeScript strict = true (zalecane)?
