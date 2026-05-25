---
title: "PLAN_stage11_brakujace_funkcje_czlonkostwa"
status: draft
authors: ["AI (wygenerowane)"]
date: 2026-05-21
references:
  - docs/plans/mvp-file-structure-plan.md
  - docs/plans/mvp-stage-outline.md
  - docs/plans/PLAN_stage10_role_czlonek_i_prowadzacy.md
  - docs/workflows/Agent-plany.md
  - docs/workflows/Agent-programowanie.md
  - docs/architecture/01-makiety.md
  - docs/architecture/03-zasady-ux.md
  - docs/plans/bookclub-pro-mvp-scoping.md
  - docs/implemented/implemented_plan_stage10_role_czlonek_i_prowadzacy.md
---

# Stage 11 - Brakujące funkcje członkostwa

## 1. Cel
Domknąć brakujące funkcje członkostwa po stage 10, tak aby klub działał jako pełny, ale nadal prosty mechanizm uczestnictwa. Stage 11 ma umożliwić akceptację dołączenia do klubu, opuszczenie klubu, zarządzanie własną nazwą członka oraz techniczny CRUD członkostwa potrzebny do kolejnych etapów produktu.

## 2. Zakres
### Wchodzi w zakres
- Akceptacja członkostwa po dołączeniu do klubu przez zaproszenie lub kod.
- Opuszczenie klubu przez zalogowanego członka.
- Zmiana własnej nazwy wyświetlanej przez członka.
- Pobieranie i edycja rekordu członkostwa w obrębie własnego konta.
- Widok i akcje w obrębie `/club/[id]/members/[memberId]/actions` dla operacji członkowskich.
- Endpoint API do obsługi członkostwa z walidacją server-side.
- RLS/policies egzekwujące, że członek może modyfikować tylko własne dane, a prowadzący może wykonywać akcje administracyjne w obrębie klubu.
- Testy unit, integracyjne i smoke E2E dla scenariuszy członkostwa.

### Nie wchodzi w zakres
- Zarządzanie rolami `host` i `member`. To zostało już dowiezione w stage 10.
- Dodawanie propozycji książek i głosowania. To powinno zostać zrobione w kolejnych stage’ach.
- Zaawansowany panel administracyjny członków, przypisywanie wielu ról, grupy użytkowników i role globalne.
- Moderacja treści, blokady członków, eksporty i audit log poza minimalnym `updated_at`.

## 3. Wymagania funkcjonalne
- Zalogowany użytkownik może zaakceptować członkostwo w klubie, jeśli ma aktywne zaproszenie lub jest już zapisanym członkiem oczekującym.
- Zalogowany członek może opuścić klub, jeśli nie jest ostatnim wymaganym prowadzącym.
- Członek może zmienić własną nazwę wyświetlaną, a system zapisuje tę zmianę po stronie bazy.
- Użytkownik bez sesji dostaje `401` dla akcji członkostwa.
- Użytkownik spoza klubu lub bez uprawnień dostaje `403`.
- Próba opuszczenia klubu przez ostatniego prowadzącego lub usunięcia ostatniego aktywnego członka prowadzącego ma zwrócić `400`.
- UI ma pokazywać aktualny status członkostwa, akcje dostępne dla bieżącego użytkownika oraz stany loading/success/error.
- Akcje członkostwa mają być dostępne z klawiatury i opisane etykietami ARIA.

## 4. Wymagania niefunkcjonalne
- Wydajność: odczyt członkostwa ma korzystać z indeksów po `club_id`, `user_id` i `status` / `role`.
- Bezpieczeństwo: każda operacja musi być egzekwowana server-side i przez RLS, nie tylko przez ukrycie przycisków.
- UX: komunikaty o akceptacji, opuszczeniu klubu i zmianie nazwy mają być jednoznaczne i nieblokujące.
- Dostępność: formularze muszą mieć etykiety, focus states i czytelne komunikaty błędów.
- Utrzymanie: helpery permissions z stage 10 muszą być użyte ponownie, zamiast dublować logikę klubową.

## 5. Kontekst techniczny
- Komponenty:
  - `app/club/[id]/members/[memberId]/actions/page.tsx`
  - `app/components/club/MembershipActions.tsx`
- API:
  - `app/api/membership/route.ts`
- Backend helpery:
  - `lib/membership.ts`
  - `lib/db/membership.ts`
  - `lib/db/roles.ts`
  - `lib/club-invite.server.ts`
- Dane:
  - `clubs.created_by`
  - `club_members(club_id, user_id, role, display_name, membership_status, joined_at, updated_at)`
  - powiązanie członkostwa z zaproszeniami z stage 9
- Kontrakt:
  - `docs/contracts/membership.json`
- Testy:
  - unit dla walidacji, helperów i UI
  - integracyjne dla endpointu akceptacji, opuszczenia klubu i zmiany nazwy
  - E2E dla ekranów członkostwa

## Preconditions
- Stage 8 jest wdrożony: klub istnieje i ma własność `created_by`.
- Stage 9 jest wdrożony: zaproszenia i flow dołączania działają.
- Stage 10 jest wdrożony: role `host` i `member` są już dostępne.
- Lokalne Supabase ma zastosowane migracje stage 8-10.
- `.env.example` zawiera standardowy zestaw zmiennych Supabase.
- Zespół akceptuje, że ten etap nie dodaje nowych ról, tylko domyka członkostwo.

## 6. Kroki implementacji
### 6.1 Frontend
1. Dodać widok akcji członkostwa pod `app/club/[id]/members/[memberId]/actions/page.tsx`.
2. Użyć aliasu `memberId=me` jako skrótu do własnego członkostwa.
3. Pokazać stan bieżącego członkostwa, akcję opuszczenia klubu i formularz zmiany własnej nazwy.
4. Wydzielić komponent `app/components/club/MembershipActions.tsx` jako klientowy ekran akcji.
5. Pokazać stan tylko do odczytu dla użytkownika bez praw do edycji.
6. Dodać testy komponentów dla poprawnego renderowania akcji i blokad uprawnień.

### 6.2 Backend
1. Dodać migrację `supabase/migrations/005_update_membership_flow.sql` oraz rollback `005_update_membership_flow_rollback.sql`.
2. Rozszerzyć `club_members` o `display_name`, `membership_status` i `updated_at`.
3. Dodać indeksy po `club_id`, `user_id` i `membership_status`.
4. Zaimplementować `app/api/membership/route.ts` z operacjami akceptacji, opuszczenia klubu i zmiany własnej nazwy.
5. Dodać helpery `acceptMembership`, `leaveClub`, `renameMembership`, `getMembershipDetails`.
6. Wykorzystać istniejące helpery stage 10 do sprawdzania roli `host` / `member`.
7. Dodać walidację Zod dla payloadów wszystkich akcji.
8. Dodać testy integracyjne dla `401`, `403`, `400` i happy-pathu dla członka klubu.

### 6.3 Stan końcowy po wdrożeniu
1. Ekran członkostwa działa jako własny widok dla zalogowanego użytkownika.
2. Akceptacja, opuszczenie i zmiana nazwy są obsługiwane server-side.
3. RLS i helpery DB egzekwują uprawnienia także poza UI.
4. API i UI mają pokrycie unit testami.

### 6.4 Minimalny podział pracy
- 1x frontend dev: ekran akcji członkostwa, formularz zmiany nazwy, stany UI i testy komponentów.
- 1x backend dev: migracje, RLS, helpery permissions, API i testy integracyjne.

## 7. Rekomendowana kolejność prac
1. Uzgodnić, czy model członkostwa ma trzymać własną nazwę w tabeli `club_members`, czy w osobnym polu profilu.
2. Dodać migrację DB i rollback dla członkostwa.
3. Zaimplementować endpoint API i helpery backendowe.
4. Zbudować UI akcji członkostwa i formularz zmiany nazwy.
5. Dopiąć testy unit, integracyjne i smoke E2E.
6. Zweryfikować, że stage 12 może czytać status członkostwa bez dodatkowego przepisywania logiki.

## 8. `.env.example`
Stage 11 nie wymaga nowych sekretów poza standardowym zestawem Supabase, ale `.env.example` powinien nadal zawierać:

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
npx playwright test tests/e2e/membership.spec.ts --headed
npm run build
```

```bash
npm install
npx supabase start
npx supabase db push --db-url "$SUPABASE_DB_URL"
npm run dev
npm run lint
npm run test
npx playwright test tests/e2e/membership.spec.ts --headed
npm run build
```

## 10. Zmiany DB / migracje
Stage 11 domyka model członkostwa, ale nie wprowadza nowych ról. Docelowa migracja została już dodana jako `supabase/migrations/005_update_membership_flow.sql`, a rollback jako `supabase/migrations/005_update_membership_flow_rollback.sql`.

Zakres migracji:

```sql
BEGIN;

ALTER TABLE club_members
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS membership_status text NOT NULL DEFAULT 'active';

ALTER TABLE club_members
  DROP CONSTRAINT IF EXISTS club_members_membership_status_check;

ALTER TABLE club_members
  ADD CONSTRAINT club_members_membership_status_check
  CHECK (membership_status IN ('pending', 'active', 'left'));

CREATE INDEX IF NOT EXISTS club_members_club_status_idx
  ON club_members (club_id, membership_status);

CREATE INDEX IF NOT EXISTS club_members_user_status_idx
  ON club_members (user_id, membership_status);

ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY allow_member_read_own_membership ON club_members
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR user_is_host_of_club(club_id)
    OR user_is_member_of_club(club_id)
  );

CREATE POLICY allow_member_update_own_membership ON club_members
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY allow_host_manage_membership ON club_members
  FOR ALL
  USING (user_is_host_of_club(club_id))
  WITH CHECK (user_is_host_of_club(club_id));

COMMIT;
```

Rollback `supabase/migrations/005_update_membership_flow_rollback.sql`:

```sql
BEGIN;

DROP POLICY IF EXISTS allow_host_manage_membership ON club_members;
DROP POLICY IF EXISTS allow_member_update_own_membership ON club_members;
DROP POLICY IF EXISTS allow_member_read_own_membership ON club_members;

DROP INDEX IF EXISTS club_members_user_status_idx;
DROP INDEX IF EXISTS club_members_club_status_idx;

ALTER TABLE club_members
  DROP CONSTRAINT IF EXISTS club_members_membership_status_check;

ALTER TABLE club_members
  DROP COLUMN IF EXISTS membership_status,
  DROP COLUMN IF EXISTS display_name;

COMMIT;
```

Uwaga: plan zakłada, że `display_name` jest przechowywane w `club_members`, czyli tam, gdzie członkostwo jest już egzekwowane.

## 11. Kontrakt API
Plik kontraktu: `docs/contracts/membership.json`.

```json
{
  "feature": "membership",
  "routes": {
    "GET /api/membership?clubId=:clubId": {
      "auth": "required",
      "response": {
        "clubId": "uuid",
        "currentUserRole": "host|member|null",
        "membership": {
          "status": "pending|active|left",
          "displayName": "string|null",
          "joinedAt": "iso-date|null"
        }
      }
    },
    "PATCH /api/membership": {
      "auth": "required",
      "body": {
        "clubId": "uuid",
        "displayName": "string|null",
        "action": "accept|leave|rename"
      },
      "errors": ["400", "401", "403", "404"]
    }
  }
}
```

W praktyce kontrakt jest obsługiwany przez `app/api/membership/route.ts` i współdzielone helpery w `lib/db/membership.ts`.

## 12. Branch, commit i PR
- Branch planu: `feature/plans/PLAN_stage11_brakujace_funkcje_czlonkostwa`
- Branch frontend: `feature/stage11-membership-frontend`
- Branch backend: `feature/stage11-membership-backend`
- Commit planu: `docs(plans): add PLAN_stage11_brakujace_funkcje_czlonkostwa.md`
- PR title: `PLAN: stage 11 brakujące funkcje członkostwa`

## 13. Kryteria akceptacji
- Istnieje plan Stage 11 zapisany w `docs/plans/`.
- Plan dotyczy brakujących funkcji członkostwa, a nie ról.
- Plan zawiera migrację SQL, rollback, kontrakt API, testy i sekcję acceptance E2E.
- Użytkownik może zaakceptować członkostwo, opuścić klub i zmienić własną nazwę.
- Nie da się wykonać akcji członkostwa bez sesji lub bez uprawnień.
- Stage 12 może z tego planu korzystać bez przebudowy modelu członkostwa.
- Implementacja Stage 11 jest opisana też w [docs/implemented/implemented_plan_stage11_brakujace_funkcje_czlonkostwa.md](../implemented/implemented_plan_stage11_brakujace_funkcje_czlonkostwa.md).

## 14. Testy
- Unit: walidacja payloadu `clubId`, `action`, `displayName`.
- Unit: formularz zmiany nazwy blokuje pusty input i pokazuje komunikat błędu.
- Unit: akcje członkostwa ukrywają się dla użytkownika bez uprawnień.
- Integracyjne: członek może zaakceptować członkostwo.
- Integracyjne: członek może opuścić klub, jeśli nie łamie to reguł biznesowych.
- Integracyjne: anonim dostaje `401`.
- Integracyjne: użytkownik spoza klubu dostaje `403`.
- Integracyjne: zmiana nazwy zapisuje się tylko dla własnego konta.
- E2E: członek klubu akceptuje członkostwo, zmienia nazwę i opuszcza klub.
- W repo istnieją testy dla [tests/unit/membership.test.ts](../../tests/unit/membership.test.ts), [tests/unit/membership-route.test.ts](../../tests/unit/membership-route.test.ts) i [tests/unit/membership-actions.test.tsx](../../tests/unit/membership-actions.test.tsx).

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
npx playwright test tests/e2e/membership.spec.ts
```

```powershell
npx playwright test tests/e2e/membership.spec.ts --headed
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
npx playwright test tests/e2e/membership.spec.ts
```

```bash
npx playwright test tests/e2e/membership.spec.ts --headed
```

Weryfikacja manualna po wdrożeniu:
1. Zalogować się jako członek klubu i wejść do ekranu akcji członkostwa.
2. Zmienić własną nazwę i potwierdzić zapis.
3. Akceptować członkostwo i sprawdzić, że status zmienia się na aktywny.
4. Opuścić klub i potwierdzić odpowiedni komunikat.
5. Zalogować się jako użytkownik spoza klubu i potwierdzić brak dostępu do akcji.
6. Wysłać `PATCH /api/membership` bez sesji i potwierdzić `401`.

## 16. Stan wdrożenia
- Stage 11 został zrealizowany w kodzie i opisany również w [docs/implemented/implemented_plan_stage11_brakujace_funkcje_czlonkostwa.md](../implemented/implemented_plan_stage11_brakujace_funkcje_czlonkostwa.md).
- Ekran własnych akcji członkostwa działa przez alias `memberId=me`.
- `display_name` i `membership_status` są trzymane w `club_members`.
- Migracja `005_update_membership_flow.sql` jest częścią repo i ma rollback.
- Kontrakt API i testy są już spięte z implementacją.

## 17. Deviations / Notatki
- Rozbieżność numeracji stage w dokumentach planistycznych została zachowana lokalnie tylko dla Stage 11, żeby nie rozbijać istniejących odniesień w repo.
- `display_name` w Stage 11 jest przechowywane w `club_members`, co upraszcza MVP i nie wymaga osobnego profilu użytkownika.
- Wspólny endpoint `app/api/membership/route.ts` pozostaje jedynym punktem wejścia dla akceptacji, opuszczenia i zmiany nazwy.
- W aktualnej implementacji nie ma historii poprzednich nazw członka; tylko bieżąca nazwa wyświetlana.
