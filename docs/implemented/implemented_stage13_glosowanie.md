## Stage 13 — Głosowanie (Implemented)

- **Status:** Completed
- **Data:** 2026-06-07

- **Co zrealizowano:**
  - Dodano backend głosowania (`lib/voting.ts`, `lib/db/votes.ts`) wraz z trasą API: [`app/api/votes/route.ts`](app/api/votes/route.ts).
  - Dodano migrację tabeli `votes` w [`supabase/migrations/008_create_votes_table.sql`](supabase/migrations/008_create_votes_table.sql) + rollback.
  - Zaktualizowano helpery propozycji, aby uwzględniały podsumowania głosów (`lib/db/book-proposals.ts`, `lib/book-proposals.ts`).
  - Połączono interfejs: wspólny widok dodawania propozycji i głosowania na tej samej stronie (`app/club/[id]/voting/page.tsx`) i komponenty UI (`app/components/voting/ProposalList.tsx`, `ProposalCard.tsx`).
  - Przeprowadzono testy jednostkowe i integracyjne dla funkcji głosowania i listy propozycji.

- **Testy:**
  - `tests/unit/votes.test.ts` — pass
  - `tests/unit/votes-route.test.ts` — pass
  - `tests/unit/book-proposals.test.ts` — pass
  - `tests/unit/proposal-list.test.tsx` — pass

- **Uwagi i dalsze kroki:**
  - Upewnij się, że migracje zostały wypchnięte do środowiska Supabase (`npx supabase db push --db-url "$SUPABASE_DB_URL"`). Jeśli frontend zgłasza błędy po zapisie propozycji, sprawdź czy migracja `008_create_votes_table.sql` jest zastosowana na DB (brak tabeli `votes` może powodować problemy przy odświeżaniu listy z podsumowaniami głosów).
