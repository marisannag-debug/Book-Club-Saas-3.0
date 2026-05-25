---
title: "PLAN_stage10_role_czlonek_i_prowadzacy"
status: draft
authors: ["AI (wygenerowane)"]
date: 2026-05-21
references:
  - docs/plans/mvp-file-structure-plan.md
  - docs/plans/mvp-stage-outline.md
  - docs/plans/PLAN_stage9_dolaczanie_do_klubu.md
  - docs/workflows/Agent-plany.md
  - docs/workflows/Agent-programowanie.md
  - docs/architecture/bookclub-pro-user-journey-map.md
  - docs/plans/bookclub-pro-mvp-scoping.md
  - supabase/migrations/002_create_clubs.sql
  - supabase/migrations/003_create_club_invites.sql
---

# Stage 10 - Role: czlonek i prowadzacy

## 1. Cel
Wprowadzic prosty, bezpieczny model rol w klubie ksiazkowym: `member` dla zwyklego czlonka oraz `host` dla prowadzacego. Stage 10 ma pozwolic prowadzacemu zobaczyc liste czlonkow, nadawac lub odbierac role prowadzacego oraz przygotowac fundament permissions dla kolejnych etapow: czlonkostwa, glosowan, spotkan i moderacji czatu.

## 2. Zakres
### Wchodzi w zakres
- Rozszerzenie istniejacej tabeli `club_members` o kolumne `role`.
- Ujednolicenie roli wlasciciela klubu z rola prowadzacego (`host`) bez rozbijania MVP na admin/moderator/guest.
- Helpery backendowe do odczytu roli uzytkownika w klubie i zmiany roli czlonka.
- Route handler albo server action do zarzadzania rolami z walidacja server-side.
- Widok zarzadzania czlonkami pod `/club/[id]/members/manage`.
- UI listy czlonkow z oznaczeniem roli i akcja zmiany `member` <-> `host`.
- RLS/policies blokujace zmiane rol przez osoby bez uprawnien.
- Testy unit, integracyjne i smoke E2E dla permissions.

### Nie wchodzi w zakres
- Pelny CRUD czlonkostwa, usuwanie czlonkow i opuszczanie klubu. To nalezy do Stage 11.
- Role `admin`, `moderator`, `guest`, role globalne oraz permission matrix spoza klubu.
- Billing, limity planow i role organizacyjne poza pojedynczym klubem.
- Zaawansowany audit log zmian rol. W Stage 10 wystarczy `updated_at`.
- Delegowanie wlasnosci `clubs.created_by`; Stage 10 dodaje wspolprowadzacych, ale nie przenosi autora klubu.

## 3. Wymagania funkcjonalne
- Kazdy rekord `club_members` ma miec role `member` albo `host`.
- Nowy czlonek dodany przez zaproszenie ma domyslnie role `member`.
- Tworca klubu ma byc traktowany jako prowadzacy nawet wtedy, gdy nie ma jeszcze rekordu w `club_members`.
- Prowadzacy moze wejsc na `/club/[id]/members/manage` i zobaczyc liste czlonkow klubu.
- Prowadzacy moze zmienic role innego czlonka z `member` na `host` oraz z `host` na `member`.
- Zwykly czlonek moze zobaczyc swoja role, ale nie moze zmieniac rol innych osob.
- System nie moze dopuscic do odebrania ostatniej roli prowadzacego w klubie.
- API ma zwracac `401` dla braku sesji, `403` dla braku uprawnien oraz `400` dla niepoprawnej roli lub proby pozostawienia klubu bez prowadzacego.

## 4. Wymagania niefunkcjonalne
- Wydajnosc: odczyt listy czlonkow ma korzystac z indeksow po `club_id`, `user_id` i `role`.
- Bezpieczenstwo: zmiana rol musi byc egzekwowana server-side oraz przez RLS/policy, a nie tylko przez ukrycie przyciskow w UI.
- UX: akcje zmiany roli maja miec jasne stany loading, success i error; nie pokazywac akcji, ktorych uzytkownik nie moze wykonac.
- Dostepnosc: tabela/lista czlonkow, przyciski i komunikaty musza byc obslugiwalne klawiatura oraz opisane etykietami.
- Utrzymanie: helper permissions ma byc prosty i mozliwy do ponownego uzycia w Stage 11-16.

## 5. Kontekst techniczny
- Komponenty:
  - `app/club/[id]/members/manage/page.tsx`
  - `app/components/club/MembersRoleManager.tsx`
  - `app/components/club/MemberRoleBadge.tsx`
- Backend:
  - `lib/db/roles.ts`
  - `app/api/club-roles/route.ts` albo server action przy widoku zarzadzania.
- Kontrakt:
  - `docs/contracts/club-roles.json`
- Dane:
  - istnieje `clubs.created_by`
  - istnieje `club_members(club_id, user_id, joined_via_invite_id)`
  - Stage 10 dodaje `club_members.role`, indeksy i helpery SQL.
- Testy:
  - unit dla walidacji roli i helperow permissions
  - integracyjne dla API/RLS
  - E2E dla widoku zarzadzania rolami.

## Preconditions
- Branch roboczy utworzony od `main` albo od stabilnej galezi po Stage 9.
- Stage 8 jest wdrozony: tabela `clubs` istnieje i `created_by` wskazuje tworce klubu.
- Stage 9 jest wdrozony: tabela `club_members` istnieje i join flow tworzy rekord czlonkostwa.
- Lokalne Supabase ma zastosowane migracje `002_create_clubs.sql` i `003_create_club_invites.sql`.
- `.env.example` zawiera zmienne Supabase, a `SUPABASE_SERVICE_ROLE_KEY` jest uzywany tylko server-side.
- Zespol akceptuje ograniczenie MVP do dwoch rol: `host` i `member`.

## 6. Kroki implementacji
### 6.1 Frontend
1. Dodac trase `app/club/[id]/members/manage/page.tsx` jako server component pobierajacy aktualna role uzytkownika i liste czlonkow.
2. Dodac `MembersRoleManager` z lista czlonkow, badge roli i akcja zmiany roli dostepna tylko dla prowadzacych.
3. Dodac `MemberRoleBadge` z wariantami `Prowadzacy` i `Czlonek`.
4. Pokazac stan read-only dla zwyklego czlonka: lista i rola bez przyciskow administracyjnych.
5. Dla braku sesji przekierowac do `/login` z powrotem do aktualnej trasy.
6. Dla braku czlonkostwa pokazac stan `403` lub przekierowac do dashboardu uzytkownika.
7. Dodac testy komponentow: render roli, brak akcji dla `member`, akcje dla `host`, obsluga bledu API.

### 6.2 Backend
1. Dodac migracje `supabase/migrations/004_add_club_member_roles.sql` oraz rollback `004_add_club_member_roles_rollback.sql`.
2. Rozszerzyc `club_members` o `role text NOT NULL DEFAULT 'member'` z CHECK `role IN ('member', 'host')`.
3. Dodac indeks `club_members_club_role_idx` po `(club_id, role)`.
4. Dodac funkcje SQL `user_is_host_of_club(target_club_id uuid)` jako `SECURITY DEFINER`, aby RLS mogl bezpiecznie sprawdzac uprawnienia bez cyklu policies.
5. Zaktualizowac RLS dla `club_members`, aby tylko tworca klubu lub `host` mogl zarzadzac rolami.
6. Dodac `lib/db/roles.ts` z funkcjami:
   - `getCurrentUserClubRole(clubId)`
   - `listClubMembersWithRoles(clubId)`
   - `updateClubMemberRole(clubId, memberUserId, role)`
   - `assertClubHost(clubId)`
7. Dodac walidacje Zod dla payloadu zmiany roli.
8. Zabezpieczyc przypadek ostatniego prowadzacego: nie pozwolic zdegradowac ostatniego `host`, jesli nie zostaje `clubs.created_by`.
9. Dodac testy integracyjne: host moze zmienic role, member dostaje `403`, anonim dostaje `401`, niepoprawna rola dostaje `400`.

### 6.3 Minimalny podzial pracy
- 1x frontend dev: widok `/club/[id]/members/manage`, komponenty roli, stany UI, testy komponentow i E2E.
- 1x backend dev: migracje, RLS, helpery `lib/db/roles.ts`, kontrakt API i testy integracyjne.

## 7. Rekomendowana kolejnosc prac
1. Najpierw zatwierdzic kontrakt roli: tylko `host` i `member`.
2. Dodac migracje DB, rollback i funkcje permissions.
3. Zaimplementowac helpery backendowe oraz endpoint/server action.
4. Zbudowac UI zarzadzania rolami na kontrakcie API.
5. Dopiac testy permissions i smoke E2E.
6. Zaktualizowac linki w dashboardzie klubu, jesli istnieje sekcja czlonkow lub zaproszen.

## 8. `.env.example`
Stage 10 nie wymaga nowych zmiennych srodowiskowych poza standardowym zestawem Supabase. Plik `.env.example` powinien nadal zawierac:

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
npx playwright test tests/e2e/club-roles.spec.ts --headed
npm run build
```

```bash
npm install
npx supabase start
npx supabase db push --db-url "$SUPABASE_DB_URL"
npm run dev
npm run lint
npm run test
npx playwright test tests/e2e/club-roles.spec.ts --headed
npm run build
```

## 10. Zmiany DB / migracje
Stage 10 rozszerza istniejacy model `club_members`, zamiast tworzyc osobna tabele rol.

Proponowany szkic migracji `supabase/migrations/004_add_club_member_roles.sql`:

```sql
BEGIN;

ALTER TABLE club_members
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'member';

ALTER TABLE club_members
  DROP CONSTRAINT IF EXISTS club_members_role_check;

ALTER TABLE club_members
  ADD CONSTRAINT club_members_role_check
  CHECK (role IN ('member', 'host'));

CREATE INDEX IF NOT EXISTS club_members_club_role_idx
  ON club_members (club_id, role);

CREATE OR REPLACE FUNCTION user_is_host_of_club(target_club_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM clubs c
    WHERE c.id = target_club_id
      AND c.created_by = auth.uid()
  )
  OR EXISTS (
    SELECT 1
    FROM club_members cm
    WHERE cm.club_id = target_club_id
      AND cm.user_id = auth.uid()
      AND cm.role = 'host'
  );
END;
$$;

DROP POLICY IF EXISTS "Allow club owner to manage members" ON club_members;
CREATE POLICY "Allow host to manage members" ON club_members
  FOR ALL
  USING (user_is_host_of_club(club_members.club_id))
  WITH CHECK (user_is_host_of_club(club_members.club_id));

DROP POLICY IF EXISTS "Allow user to read own membership" ON club_members;
CREATE POLICY "Allow member to read club membership" ON club_members
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR user_is_host_of_club(club_members.club_id)
    OR user_is_member_of_club(club_members.club_id)
  );

COMMIT;
```

Rollback `supabase/migrations/004_add_club_member_roles_rollback.sql`:

```sql
BEGIN;

DROP POLICY IF EXISTS "Allow host to manage members" ON club_members;
DROP POLICY IF EXISTS "Allow member to read club membership" ON club_members;

CREATE POLICY "Allow club owner to manage members" ON club_members
  FOR ALL
  USING (EXISTS (SELECT 1 FROM clubs c WHERE c.id = club_members.club_id AND c.created_by = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM clubs c WHERE c.id = club_members.club_id AND c.created_by = auth.uid()));

CREATE POLICY "Allow user to read own membership" ON club_members
  FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM clubs c WHERE c.id = club_members.club_id AND c.created_by = auth.uid()));

DROP FUNCTION IF EXISTS user_is_host_of_club(uuid);
DROP INDEX IF EXISTS club_members_club_role_idx;

ALTER TABLE club_members
  DROP CONSTRAINT IF EXISTS club_members_role_check;

ALTER TABLE club_members
  DROP COLUMN IF EXISTS role;

COMMIT;
```

Uwaga implementacyjna: jezeli Stage 8/9 ma juz dane produkcyjne, przed migracja staging/prod trzeba wykonac backup przez `pg_dump`, a po migracji sprawdzic, czy `created_by` nadal wystarcza do rozpoznania prowadzacego.

## 11. Kontrakt API
Proponowany plik: `docs/contracts/club-roles.json`.

```json
{
  "feature": "club-roles",
  "routes": {
    "GET /api/club-roles?clubId=:clubId": {
      "auth": "required",
      "response": {
        "clubId": "uuid",
        "currentUserRole": "host|member",
        "members": [
          {
            "userId": "uuid",
            "email": "string|null",
            "role": "host|member",
            "joinedAt": "iso-date"
          }
        ]
      }
    },
    "PATCH /api/club-roles": {
      "auth": "required",
      "body": {
        "clubId": "uuid",
        "userId": "uuid",
        "role": "host|member"
      },
      "errors": ["400", "401", "403", "404"]
    }
  }
}
```

## 12. Branch, commit i PR
- Branch planu: `feature/plans/PLAN_stage10_role_czlonek_i_prowadzacy`
- Branch frontend: `feature/stage10-roles-frontend`
- Branch backend: `feature/stage10-roles-backend`
- Commit planu: `docs(plans): add PLAN_stage10_role_czlonek_i_prowadzacy.md`
- PR title: `PLAN: stage 10 role czlonka i prowadzacego`

## 13. Kryteria akceptacji
- Istnieje plan Stage 10 zapisany w `docs/plans/`.
- Plan zaklada tylko dwie role MVP: `host` i `member`.
- Plan rozszerza `club_members`, zamiast dublowac membership w osobnej tabeli.
- Plan zawiera migracje SQL, rollback, RLS, helper permissions, kontrakt API, komendy lokalne i testy.
- UI zarzadzania rolami jest ograniczony do prowadzacych.
- Zwykly czlonek nie moze zmieniac rol przez UI ani przez bezposrednie wywolanie API.
- Nie da sie zostawic klubu bez prowadzacego.
- Stage 11 moze na tym modelu budowac usuwanie czlonkow i akcje czlonkostwa.

## 14. Testy
- Unit: walidacja payloadu `clubId`, `userId`, `role`.
- Unit: `MemberRoleBadge` renderuje poprawne etykiety roli.
- Unit: `MembersRoleManager` ukrywa akcje dla `member` i pokazuje je dla `host`.
- Integracyjne: `host` moze zmienic role czlonka na `host`.
- Integracyjne: `member` przy `PATCH /api/club-roles` dostaje `403`.
- Integracyjne: anonim przy `GET` i `PATCH` dostaje `401`.
- Integracyjne: payload z rola spoza `host|member` dostaje `400`.
- Integracyjne: proba zdegradowania ostatniego prowadzacego dostaje `400`.
- E2E: prowadzacy wchodzi na `/club/[id]/members/manage`, zmienia role i widzi zaktualizowany badge.

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
npx playwright test tests/e2e/club-roles.spec.ts
```

```powershell
npx playwright test tests/e2e/club-roles.spec.ts --headed
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
npx playwright test tests/e2e/club-roles.spec.ts
```

```bash
npx playwright test tests/e2e/club-roles.spec.ts --headed
```

Kroki reczne do potwierdzenia:
1. Zalogowac sie jako tworca klubu i wejsc na `/club/[id]/members/manage`.
2. Potwierdzic, ze lista czlonkow pokazuje role `Prowadzacy` i `Czlonek`.
3. Nadac zwyklemu czlonkowi role prowadzacego i sprawdzic komunikat sukcesu.
4. Zalogowac sie jako zwykly czlonek i potwierdzic brak akcji administracyjnych.
5. Wyslac bezposrednie `PATCH /api/club-roles` jako zwykly czlonek i potwierdzic `403`.
6. Sprobowac zdegradowac ostatniego prowadzacego i potwierdzic blad walidacji.

## 16. Gotowe do review?
- Preconditions sa opisane.
- Kroki implementacji obejmuja frontend, backend, DB i testy.
- Migration SQL i rollback sa dolaczone.
- `.env.example` jest opisany.
- Acceptance E2E ma kopiowalne komendy.
- Branch, commit i PR title sa zdefiniowane.
- Pytania i zalozenia sa jawnie oznaczone.

## 17. PYTANIA / ZALOZENIA
- Zalozenie: `clubs.created_by` pozostaje niezmiennym wlascicielem klubu. PROPOZYCJA: traktowac go zawsze jako `host`, nawet bez rekordu w `club_members`.
- Zalozenie: Stage 10 nie przenosi wlasnosci klubu. PROPOZYCJA: przenoszenie wlasciciela odlozyc poza MVP albo do osobnego planu po Stage 11.
- Zalozenie: czlonkowie klubu moga widziec liste czlonkow i role, ale tylko `host` moze je zmieniac. PROPOZYCJA: utrzymac liste czytelna dla czlonkow, bo wspiera przejrzystosc klubu i przyszle funkcje spotkan/glosowan.
- Otwarte pytanie: czy zaproszenie w Stage 9 powinno umozliwiac od razu zaproszenie jako `host`? PROPOZYCJA: nie w Stage 10; najpierw zaproszenie tworzy `member`, a awans nastepuje w panelu zarzadzania.
