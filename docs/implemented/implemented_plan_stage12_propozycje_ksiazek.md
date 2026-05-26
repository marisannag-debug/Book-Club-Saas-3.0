---
title: "implemented_plan_stage12_propozycje_ksiazek"
status: implemented
date: 2026-05-25
references:
  - docs/plans/PLAN_stage12_propozycje_ksiazek.md
  - docs/contracts/book-proposals.json
  - supabase/migrations/007_create_book_proposals.sql
---

# Stage 12 — propozycje książek

## Zakres zrealizowany
- Dodano backend CRUD dla propozycji książek: listowanie, tworzenie, aktualizacja i usuwanie.
- Dodano tabelę `book_proposals` z RLS, indeksami i rollbackiem.
- Dodano kontrakt API dla `book-proposals`.
- Dodano testy helperów i route handlerów dla Stage 12.

## Uwagi
- Backend wykorzystuje te same zasady dostępu co Stage 10 i Stage 11: członek widzi listę, autor i prowadzący mogą modyfikować własne propozycje, a host może moderować wszystkie.
- API akceptuje także opcjonalną grafikę okładki jako dane tekstowe albo upload pliku przez `multipart/form-data`.
