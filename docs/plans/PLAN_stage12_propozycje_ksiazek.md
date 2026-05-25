---
title: "PLAN_stage12_propozycje_ksiazek"
status: draft
authors: ["AI (wygenerowane)"]
date: 2026-05-25
references:
  - docs/plans/mvp-file-structure-plan.md
  - docs/plans/PLAN_stage10_role_czlonek_i_prowadzacy.md
  - docs/plans/PLAN_stage11_brakujace_funkcje_czlonkostwa.md
  - docs/workflows/Agent-plany.md
  - docs/workflows/Agent-programowanie.md
  - docs/architecture/01-makiety.md
  - docs/architecture/03-zasady-ux.md
  - docs/business/bookclub-pro-user-journey-map.md
  - docs/plans/bookclub-pro-mvp-scoping.md
---

# Stage 12 — Propozycje książek do głosowania

## 1. Cel
Dostarczyć prosty, działający mechanizm dodawania, przeglądania i zarządzania propozycjami książek w obrębie klubu, zanim zacznie działać pełne głosowanie. Stage 12 domyka część `Propozycje książek` z makiety S005 i przygotowuje stabilny model danych dla Stage 13, który będzie już oddawał głosy na gotową listę propozycji.

## 2. Zakres
### Wchodzi w zakres
- Widok propozycji książek w obrębie klubu pod `app/club/[id]/voting/create/page.tsx`.
- Komponenty UI dla listy propozycji i formularza dodawania nowej propozycji.
- Backendowy model danych dla propozycji książek.
- API do listowania, dodawania, edycji i usuwania propozycji.
- RLS/policies dla dostępu członków klubu do propozycji.
- Testy unit, integracyjne i smoke E2E dla przepływu proposal CRUD.
- Przygotowanie kontraktu danych dla Stage 13, który będzie używał tych samych rekordów jako źródła głosowania.

### Nie wchodzi w zakres
- Oddawanie głosów, zliczanie wyników i finałowe uruchamianie głosowania. To jest Stage 13.
- Harmonogram spotkań i rezerwacja dat. To pozostaje na Stage 14.
- Zaawansowane rankingi, rekomendacje AI, komentarze do propozycji i załączniki.
- Publiczne, anonimowe dodawanie propozycji bez autoryzacji.

## 3. Wymagania funkcjonalne
- Zalogowany członek klubu może dodać propozycję książki składającą się z tytułu, autora i opcjonalnego opisu.
- Członek klubu może zobaczyć listę aktualnych propozycji dla swojego klubu.
- Autor propozycji może edytować i usuwać własną propozycję.
- Prowadzący klubu może moderować wszystkie propozycje w obrębie swojego klubu.
- Użytkownik bez sesji nie ma dostępu do zapisu propozycji.
- Użytkownik spoza klubu nie widzi propozycji i dostaje `403` lub `404` zależnie od ścieżki API.
- Pusta lista propozycji pokazuje czytelny empty state z CTA do dodania pierwszej książki.
- UI musi być w pełni obsługiwalne klawiaturą i czytelne dla czytników ekranu.

## 4. Wymagania niefunkcjonalne
- Wydajność: lista propozycji ma być pobierana read-only, z indeksami po `club_id` i `created_at`.
- Bezpieczeństwo: zapis i modyfikacja propozycji muszą być egzekwowane server-side i przez RLS.
- UX: formularz dodawania propozycji ma być krótki, z jasną walidacją i bez przeładowania ekranów.
- Dostępność: formularz, lista i akcje na propozycjach muszą mieć focus states, labelki i komunikaty błędów.
- Utrzymanie: model propozycji ma być na tyle prosty, żeby Stage 13 mógł go użyć bez przebudowy struktury danych.

## 5. Kontekst techniczny
- Komponenty:
  - `app/club/[id]/voting/create/page.tsx`
  - `app/components/voting/ProposalList.tsx`
  - opcjonalnie `app/components/voting/ProposalForm.tsx`
  - opcjonalnie `app/components/voting/ProposalCard.tsx`
- API:
  - `app/api/book-proposals/route.ts`
  - `app/api/book-proposals/[proposalId]/route.ts`
- Backend helpery:
  - `lib/book-proposals.ts`
  - `lib/db/book-proposals.ts`
  - `lib/db/roles.ts` jako źródło permissions dla host/member
  - `lib/db/membership.ts` jako źródło dostępu do klubu i członkostwa
- Dane:
  - nowa tabela `book_proposals` albo równoważna tabela klubowych propozycji książek
  - relacja do `clubs(id)` i `users(id)`
- Kontrakt:
  - `docs/contracts/book-proposals.json`
- Testy:
  - unit dla walidacji i helperów
  - integracyjne dla API CRUD
  - E2E dla dodawania i zarządzania propozycjami

## Preconditions
- Stage 10 jest wdrożony: role `host` i `member` są już dostępne.
- Stage 11 jest wdrożony: członkostwo działa, a własne akcje członka są obsługiwane.
- Dashboard klubu i linki nawigacyjne do obszaru klubu są już dostępne.
- Lokalne Supabase ma zastosowane migracje Stage 8-11.
- `.env.example` zawiera standardowy zestaw zmiennych Supabase.
- Zespół akceptuje, że Stage 12 dotyczy tylko propozycji książek, a nie samego głosowania.

## 6. Kroki implementacji
### 6.1 Frontend
1. Dodać widok `app/club/[id]/voting/create/page.tsx` jako ekran propozycji książek do głosowania.
2. Utworzyć `ProposalList` z listą propozycji, stanem pustym i CTA do dodania pierwszej książki.
3. Dodać formularz dodawania propozycji z polami: tytuł, autor, opis opcjonalny.
4. Pokazać akcje edycji i usuwania tylko dla autora lub prowadzącego.
5. Ustawić czytelne stany loading/success/error dla zapisu propozycji.
6. Dodać testy komponentów dla renderowania listy, walidacji formularza i blokady akcji dla użytkownika bez uprawnień.

### 6.2 Backend
1. Dodać migrację `supabase/migrations/007_create_book_proposals.sql` oraz rollback `007_create_book_proposals_rollback.sql`.
2. Utworzyć tabelę `book_proposals` z polami:
   - `id`
   - `club_id`
   - `title`
   - `author`
   - `description`
   - `created_by`
   - `created_at`
   - `updated_at`
3. Dodać indeksy po `club_id`, `created_by` i `created_at`.
4. Dodać RLS/policies, które pozwalają członkom klubu czytać propozycje, a autorowi i prowadzącemu je tworzyć/edytować/usuwać.
5. Zaimplementować helpery `listBookProposals`, `createBookProposal`, `updateBookProposal`, `deleteBookProposal`.
6. Dodać walidację Zod dla payloadów: `clubId`, `title`, `author`, `description`, `proposalId`.
7. Współdzielić check memberships z Stage 10 i Stage 11 zamiast budować osobny system uprawnień.
8. Dodać testy integracyjne dla `401`, `403`, `404`, happy-path create/update/delete oraz listowania.

### 6.3 Minimalny podział pracy
- 1x frontend dev: ekran propozycji książek, formularz, lista, empty states, stany błędów i testy UI.
- 1x backend dev: migracja, RLS, helpery, API CRUD i testy integracyjne.

## 7. Rekomendowana kolejność prac
1. Najpierw ustalić kontrakt danych propozycji książek i podstawową tabelę `book_proposals`.
2. Następnie zbudować API CRUD i walidację server-side.
3. Potem wdrożyć UI listy propozycji i formularz dodawania.
4. Na końcu dopiąć testy unit, integracyjne i smoke E2E.
5. Gdy Stage 12 działa stabilnie, Stage 13 może użyć `book_proposals` jako źródła głosowania.

## 8. `.env.example`
Stage 12 nie wymaga nowych sekretów poza standardowym zestawem Supabase, ale `.env.example` powinien nadal zawierać:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=development
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_DB_URL=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
INVITE_TOKEN_TTL_HOURS=168
```

## 9. Komendy lokalne
```powershell
npm install
npx supabase start
npx supabase db push --db-url "$env:SUPABASE_DB_URL"
npm run dev
npm run lint
npm run test
npx playwright test tests/e2e/book-proposals.spec.ts --headed
npm run build
```

```bash
npm install
npx supabase start
npx supabase db push --db-url "$SUPABASE_DB_URL"
npm run dev
npm run lint
npm run test
npx playwright test tests/e2e/book-proposals.spec.ts --headed
npm run build
```

## 10. Zmiany DB / migracje
Stage 12 wprowadza nową tabelę propozycji książek, która ma być źródłem danych dla Stage 13.

Proponowany szkic migracji `supabase/migrations/007_create_book_proposals.sql`:

```sql
BEGIN;

CREATE TABLE IF NOT EXISTS book_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  title text NOT NULL,
  author text NOT NULL,
  description text,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS book_proposals_club_created_at_idx
  ON book_proposals (club_id, created_at DESC);

CREATE INDEX IF NOT EXISTS book_proposals_club_created_by_idx
  ON book_proposals (club_id, created_by);

ALTER TABLE book_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY allow_member_read_book_proposals ON book_proposals
  FOR SELECT
  USING (
    user_is_member_of_club(club_id)
    OR user_is_host_of_club(club_id)
  );

CREATE POLICY allow_member_create_book_proposals ON book_proposals
  FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    AND user_is_member_of_club(club_id)
  );

CREATE POLICY allow_owner_or_host_update_book_proposals ON book_proposals
  FOR UPDATE
  USING (
    auth.uid() = created_by
    OR user_is_host_of_club(club_id)
  )
  WITH CHECK (
    auth.uid() = created_by
    OR user_is_host_of_club(club_id)
  );

CREATE POLICY allow_owner_or_host_delete_book_proposals ON book_proposals
  FOR DELETE
  USING (
    auth.uid() = created_by
    OR user_is_host_of_club(club_id)
  );

COMMIT;
```

Rollback `supabase/migrations/007_create_book_proposals_rollback.sql`:

```sql
BEGIN;

DROP POLICY IF EXISTS allow_owner_or_host_delete_book_proposals ON book_proposals;
DROP POLICY IF EXISTS allow_owner_or_host_update_book_proposals ON book_proposals;
DROP POLICY IF EXISTS allow_member_create_book_proposals ON book_proposals;
DROP POLICY IF EXISTS allow_member_read_book_proposals ON book_proposals;

DROP TABLE IF EXISTS book_proposals;

COMMIT;
```

Przykładowa komenda zastosowania migracji:

```powershell
npx supabase db push --db-url "$env:SUPABASE_DB_URL"
```

## 11. Kontrakt API
Plik kontraktu: `docs/contracts/book-proposals.json`.

```json
{
  "feature": "book-proposals",
  "routes": {
    "GET /api/book-proposals?clubId=:clubId": {
      "auth": "required",
      "response": {
        "clubId": "uuid",
        "items": [
          {
            "id": "uuid",
            "title": "string",
            "author": "string",
            "description": "string|null",
            "createdBy": "uuid",
            "createdAt": "iso-date",
            "updatedAt": "iso-date"
          }
        ]
      }
    },
    "POST /api/book-proposals": {
      "auth": "required",
      "body": {
        "clubId": "uuid",
        "title": "string",
        "author": "string",
        "description": "string|null"
      },
      "errors": ["400", "401", "403"]
    },
    "PATCH /api/book-proposals/:proposalId": {
      "auth": "required",
      "body": {
        "title": "string",
        "author": "string",
        "description": "string|null"
      },
      "errors": ["400", "401", "403", "404"]
    },
    "DELETE /api/book-proposals/:proposalId": {
      "auth": "required",
      "errors": ["401", "403", "404"]
    }
  }
}
```

W praktyce kontrakt będzie obsługiwany przez `app/api/book-proposals/route.ts`, `app/api/book-proposals/[proposalId]/route.ts` i helpery w `lib/db/book-proposals.ts`.

## 12. Branch, commit i PR
- Branch planu: `feature/plans/PLAN_stage12_propozycje_ksiazek`
- Commit planu: `docs(plans): add PLAN_stage12_propozycje_ksiazek.md`
- PR title: `PLAN: stage 12 propozycje książek — implementation plan`

## 13. Kryteria akceptacji
- Istnieje osobny plan Stage 12 zapisany w `docs/plans/`.
- Plan dotyczy propozycji książek, a nie jeszcze pełnego głosowania.
- Zakres obejmuje ekran, listę propozycji, formularz i akcje CRUD.
- Plan zawiera migrację SQL, rollback, kontrakt API, testy i acceptance E2E.
- Plan nie miesza propozycji z mechaniką oddawania głosów.
- Stage 13 może korzystać z tego modelu danych bez przebudowy Stage 12.

## 14. Testy
- Unit: walidacja payloadu `clubId`, `title`, `author`, `description`.
- Unit: `ProposalList` renderuje listę, empty state i akcje właściciela.
- Unit: formularz propozycji blokuje pusty tytuł i autora.
- Integracyjne: członek może dodać propozycję.
- Integracyjne: autor może edytować i usunąć własną propozycję.
- Integracyjne: host może moderować propozycje w swoim klubie.
- Integracyjne: anonim dostaje `401`.
- Integracyjne: użytkownik spoza klubu dostaje `403`.
- E2E: członek tworzy propozycję, edytuje ją i usuwa.

## 15. Acceptance E2E test (krok po kroku)
```powershell
npx supabase start
```

```powershell
npx supabase db push --db-url "$env:SUPABASE_DB_URL"
```

```powershell
npm run dev
```

```powershell
npx playwright test tests/e2e/book-proposals.spec.ts
```

```powershell
npx playwright test tests/e2e/book-proposals.spec.ts --headed
```

```bash
npx supabase start
```

```bash
npx supabase db push --db-url "$SUPABASE_DB_URL"
```

```bash
npm run dev
```

```bash
npx playwright test tests/e2e/book-proposals.spec.ts
```

```bash
npx playwright test tests/e2e/book-proposals.spec.ts --headed
```

Weryfikacja manualna po wdrożeniu:
1. Zalogować się jako członek klubu i wejść do `app/club/[id]/voting/create/page.tsx`.
2. Dodać nową propozycję książki i potwierdzić, że pojawia się na liście.
3. Edytować własną propozycję i sprawdzić aktualizację w UI.
4. Usunąć własną propozycję i potwierdzić empty state, jeśli lista się opróżni.
5. Zalogować się jako użytkownik spoza klubu i potwierdzić brak dostępu do listy.
6. Wywołać `POST /api/book-proposals` bez sesji i potwierdzić `401`.

## 16. Gotowe do review?
- Preconditions są opisane.
- Kroki implementacji obejmują frontend, backend, DB i testy.
- Migration SQL i rollback są dołączone.
- `.env.example` jest opisany.
- Acceptance E2E ma kopiowalne komendy.
- Branch, commit i PR title są zdefiniowane.

## 17. PYTANIA / ZAŁOŻENIA
- Założenie: propozycje książek są klubowe, a nie przypięte do osobnej instancji głosowania. PROPOZYCJA: utrzymać `book_proposals` jako wspólną listę klubową, którą Stage 13 wykorzysta jako bazę do głosowania.
- Założenie: tytuł i autor są wymagane, opis jest opcjonalny. PROPOZYCJA: nie rozszerzać formularza o dodatkowe pola MVP, dopóki Stage 13 nie będzie tego potrzebował.
- Założenie: host może moderować wszystkie propozycje, ale zwykły członek tylko swoje. PROPOZYCJA: zachować ten prosty model permissions do czasu Stage 13.
