---
title: "PLAN_stage14_propozycje_terminu_i_glosowanie_na_termin"
status: draft
authors: ["AI (wygenerowane)"]
date: 2026-06-07
references:
  - docs/plans/mvp-file-structure-plan.md
  - docs/plans/PLAN_stage12_propozycje_ksiazek.md
  - docs/plans/PLAN_stage13_glosowanie.md
  - docs/plans/PLAN_stage10_role_czlonek_i_prowadzacy.md
  - docs/plans/PLAN_stage11_brakujace_funkcje_czlonkostwa.md
  - docs/workflows/Agent-plany.md
  - docs/workflows/Agent-programowanie.md
  - docs/architecture/01-makiety.md
  - docs/architecture/03-zasady-ux.md
  - docs/business/bookclub-pro-user-journey-map.md
  - docs/plans/bookclub-pro-mvp-scoping.md
---

# Stage 14 - Propozycje terminu spotkania i glosowanie na termin

## 1. Cel
Dostarczyc lekki, czytelny flow planowania spotkania: prowadzacy lub czlonek moze zaproponowac kilka terminow, pozostali czlonkowie glosuja na preferowany termin, a finalny termin spotkania da sie zatwierdzic bez opuszczania strony klubu. Stage 14 domyka czesc MVP dotyczaca harmonogramu spotkan z makiety i przygotowuje grunt pod powiadomienia e-mail oraz przyszle przypomnienia.

## 2. Zakres
### Wchodzi w zakres
- Widok tworzenia propozycji terminu pod `app/club/[id]/meetings/create/page.tsx`.
- Widok pojedynczego glosowania / szczegolow spotkania pod `app/club/[id]/meetings/[meetingId]/page.tsx`.
- Formularz dodawania wielu propozycji terminow dla jednego spotkania.
- Lista terminow z liczba glosow i stanem aktywnego wyboru uzytkownika.
- Finalizacja wybranego terminu przez prowadzacego lub tworce spotkania.
- Backendowy model danych dla propozycji terminow i glosow.
- API do tworzenia, listowania, glosowania i finalizacji terminu.
- RLS / policies oparte o czlonkostwo w klubie i role `host` / `member`.
- Testy unit, integracyjne i smoke E2E dla planowania spotkania.

### Nie wchodzi w zakres
- Kalendarz z integracja Google Calendar.
- Recurring meetings, timezone UI i automatyczne przypomnienia.
- Zaawansowane konflikty terminow, przeplatanie kilku spotkan naraz i optymalizacja AI.
- Publiczne glosowanie bez logowania.
- Powiadomienia e-mail i przypomnienia push. To jest Stage 15.

## 3. Wymagania funkcjonalne
- Zalogowany czlonek klubu moze utworzyc propozycje spotkania z wieloma kandydatami na termin.
- Kazdy termin w ramach jednej ankiety spotkania moze otrzymac glosy od czlonkow klubu.
- Uzytkownik widzi, na ktory termin juz zaglosowal, i moze zmienic wybor, jesli ankieta jest otwarta.
- Prowadzacy lub tworca spotkania moze zamknac glosowanie i zatwierdzic termin finalny.
- Uzytkownik spoza klubu nie ma dostepu do ankiety ani glosowania.
 - Kazdy zalogowany czlonek klubu moze takze dodawac nowe propozycje slotow do juz utworzonej ankiety (nie tylko prowadzacy podczas tworzenia ankiety).
 - Prowadzacy klubu lub uzytkownik, ktory dodal dany slot, moze usunac te propozycje.
- Uzytkownik bez sesji dostaje `401` i przekierowanie do logowania z powrotem do trasy spotkania.
- Finalny widok spotkania pokazuje wybrany termin, liczbe glosow i status ankiety.
- UI musi byc responsywny i zrozumialy przy szybkim przejrzeniu z dashboardu klubu.

## 4. Wymagania niefunkcjonalne
- Wydajnosc: listowanie terminow i glosow ma dzialac na indeksach po `club_id`, `meeting_id`, `slot_start_at`.
- Bezpieczenstwo: tworzenie, glosowanie i finalizacja musza byc egzekwowane server-side oraz przez RLS.
- UX: formularz ma ograniczac sie do kilku pol i nie rozciagac uzytkownika na wiele ekranow.
- Dostepnosc: przyciski glosowania, finalizacji i edycji musza byc keyboard friendly oraz miec jasne stany disabled.
- Utrzymanie: model spotkan ma byc prosty i spójny z Stage 15-18, bez osobnych systemow permissions.

## 5. Kontekst techniczny
- Frontend:
  - `app/club/[id]/meetings/create/page.tsx`
  - `app/club/[id]/meetings/[meetingId]/page.tsx`
  - `app/components/meetings/MeetingPollWorkspace.tsx` (frontend demo that persists to sessionStorage until backend is available)
  - opcjonalnie `app/components/meetings/MeetingPollForm.tsx`
  - opcjonalnie `app/components/meetings/MeetingPollBoard.tsx`
  - opcjonalnie `app/components/meetings/MeetingPollOptionCard.tsx`
- Backend:
  - `app/api/meetings/route.ts`
  - `app/api/meetings/[meetingId]/route.ts`
  - `app/api/meeting-slots/route.ts` (POST, DELETE) — manage individual slot proposals
  - `app/api/meeting-votes/route.ts`
  - `lib/meetings.ts`
  - `lib/db/meetings.ts`
  - reuse helperow z `lib/db/roles.ts` i `lib/db/membership.ts`
- Dane:
  - nowa tabela `club_meetings` jako kontener dla jednej ankiety lub jednego finalnego spotkania
  - tabela `club_meeting_slots` z propozycjami terminow
  - tabela `club_meeting_slot_votes` z glosami uzytkownikow
- Kontrakt:
  - `docs/contracts/meeting-polls.json`
- Testy:
  - unit dla walidacji i helperow
  - integracyjne dla API i RLS
  - E2E dla utworzenia ankiety, glosowania i finalizacji terminu

## Preconditions
- Stage 10 jest wdrozony: role `host` i `member` dzialaja.
- Stage 11 jest wdrozony: czlonkostwo jest egzekwowane i mozna odczytac status uzytkownika.
- Stage 12 i Stage 13 sa wdrozone: interfejs propozycji ksiazek i glosowania dzialaja jako wzorzec UI / API.
- Lokalne Supabase ma zastosowane migracje Stage 8-13.
- `.env.example` zawiera standardowy zestaw zmiennych Supabase.
- Zespol akceptuje, ze Stage 14 dotyczy jednego aktywnego flow planowania spotkania na klub.

## PYTANIA / NIEJASNOSCI
- Czy jedna ankieta spotkania ma byc zawsze przypisana do jednego klubu, czy dopuszczamy kilka otwartych ankiet naraz?
  - PROPOZYCJA: 1 otwarta ankieta na klub, reszta przechodzi w status `closed` lub `finalized`.
- Czy finalny termin ma byc wybierany automatycznie po najwiekszej liczbie glosow, czy zatwierdzany recznie przez prowadzacego?
  - PROPOZYCJA: reczne zatwierdzenie przez prowadzacego, z opcja podpowiedzi zwyciezcy wedlug glosow.
- Czy glos ma byc pojedynczy (1 wybor na uzytkownika), czy dopuszczamy ranking terminow?
  - PROPOZYCJA: pojedynczy wybor, bo jest szybszy w MVP i prostszy w RLS / UI.

## 6. Kroki implementacji
### 6.1 Frontend
1. Dodac widok `app/club/[id]/meetings/create/page.tsx` z formularzem ankiety i lista proponowanych slotow.
2. Dodac widok `app/club/[id]/meetings/[meetingId]/page.tsx` z podsumowaniem, lista terminow, stanem glosu uzytkownika i CTA finalizacji.
3. Dodac komponent formularza terminu z polami: tytul spotkania, opis / notatka, data, godzina, strefa czasowa lub lokalny opis.
4. Dodac obsluge wielu propozycji terminu w jednej ankiecie.
5. Pokazac aktualna liczbe glosow przy kazdym terminie i wyróżnic wybor uzytkownika.
6. Umozliwic dodawanie nowych propozycji slotow bezposrednio w widoku szczegolow ankiety (`meeting/:meetingId`) dla wszystkich czlonkow.
7. Dodac przycisk usuwania propozycji widoczny tylko dla prowadzacego lub autora danej propozycji.
8. Dla prowadzacego pokazac przycisk finalizacji lub zamkniecia glosowania.
9. Dodac testy komponentow dla empty state, tworzenia slotow, glosowania, usuwania i finalizacji.

### 6.2 Backend
1. Dodac migracje `supabase/migrations/009_create_meetings.sql` oraz rollback `009_create_meetings_rollback.sql`.
2. Utworzyc `club_meetings`, `club_meeting_slots` i `club_meeting_slot_votes`.
3. Dodatkowo dodac indeksy po `club_id`, `meeting_id`, `slot_start_at`, `created_by`.
4. Dodac RLS/policies pozwalajace czytac ankiety tylko czlonkom klubu.
5. Dodac RLS/policies pozwalajace tworzyc ankiete czlonkowi, a finalizowac tylko hostowi lub tworce.
  - Polityka zarzadzania slotami (`allow_member_manage_slots`) powinna dopuszczac wstawianie slotow przez czlonkow, a usuwanie slotu tylko przez autora (created_by) lub hosta klubu.
6. Zaimplementowac helpery `createMeetingPoll`, `listMeetingPoll`, `voteMeetingSlot`, `finalizeMeetingSlot`.
7. Zaimplementowac walidacje Zod dla payloadow spotkania, slotu i glosu.
8. Zabezpieczyc duplikaty glosow, zmiane wyboru i zamkniecie ankiety po finalizacji.
9. Dodac testy integracyjne dla `401`, `403`, happy-path create/vote/finalize i blokad po zamknieciu.

### 6.3 Minimalny podzial pracy
- 1x frontend dev: formularz ankiety, lista slotow, widok finalny, stany UI i testy komponentow.
- 1x backend dev: migracje, RLS, helpery DB, API i testy integracyjne.

## 7. Rekomendowana kolejnosc prac
1. Najpierw ustalic finalny model danych ankiety spotkania i jednego glosu na uzytkownika.
2. Potem zbudowac migracje Supabase i helpery DB.
3. Nastepnie zrobic API i walidacje server-side.
4. Pozniej wdrozyc UI tworzenia ankiety i glosowania na termin.
5. Na koncu dopiac testy unit, integracyjne i smoke E2E.

## 8. Kryteria akceptacji
- Czlonek klubu moze utworzyc ankiete terminow i dodac kilka slotow.
- Czlonek klubu moze zaglosowac na jeden termin i zmienic wybor, jesli ankieta jest otwarta.
- Prowadzacy moze zamknac ankiete i zatwierdzic finalny termin.
- Uzytkownik spoza klubu nie widzi danych i dostaje poprawny kod bledu.
- Wszystkie zmiany sa pokryte testami i nie lamia Stage 12-13.

## 9. Testy
- Unit: walidacja formularza ankiety terminu i helpery glosowania.
- Integracyjne: API listowania, tworzenia, glosowania i finalizacji.
- E2E: utworzenie ankiety, oddanie glosu, zmiana glosu, finalizacja.

## 10. `.env.example`
Stage 14 nie wymaga nowych sekretow poza standardowym zestawem Supabase, ale `.env.example` powinien zawierac:

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

## 11. Komendy lokalne
```powershell
npm install
npx supabase start
npx supabase db push --db-url "$env:SUPABASE_DB_URL"
npm run dev
npm run lint
npm run test
npx playwright test tests/e2e/meetings.spec.ts --headed
npm run build
```

```bash
npm install
npx supabase start
npx supabase db push --db-url "$SUPABASE_DB_URL"
npm run dev
npm run lint
npm run test
npx playwright test tests/e2e/meetings.spec.ts --headed
npm run build
```

## 12. Zmiany DB / migracje
Stage 14 wprowadza model ankiety terminow. Proponowany szkic migracji `supabase/migrations/009_create_meetings.sql`:

```sql
BEGIN;

CREATE TABLE IF NOT EXISTS club_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  created_by uuid NOT NULL REFERENCES users(id),
  status text NOT NULL DEFAULT 'draft',
  finalized_slot_id uuid,
  finalized_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT club_meetings_status_check CHECK (status IN ('draft', 'open', 'closed', 'finalized'))
);

CREATE TABLE IF NOT EXISTS club_meeting_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL REFERENCES club_meetings(id) ON DELETE CASCADE,
  start_at timestamptz NOT NULL,
  end_at timestamptz,
  label text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS club_meeting_slot_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL REFERENCES club_meetings(id) ON DELETE CASCADE,
  slot_id uuid NOT NULL REFERENCES club_meeting_slots(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT club_meeting_slot_votes_unique UNIQUE (meeting_id, user_id)
);

CREATE INDEX IF NOT EXISTS club_meetings_club_status_idx
  ON club_meetings (club_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS club_meeting_slots_meeting_start_idx
  ON club_meeting_slots (meeting_id, start_at);

CREATE INDEX IF NOT EXISTS club_meeting_slot_votes_meeting_slot_idx
  ON club_meeting_slot_votes (meeting_id, slot_id);

ALTER TABLE club_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_meeting_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_meeting_slot_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY allow_member_read_meetings ON club_meetings
  FOR SELECT
  USING (user_is_member_of_club(club_id) OR user_is_host_of_club(club_id));

CREATE POLICY allow_member_create_meetings ON club_meetings
  FOR INSERT
  WITH CHECK (auth.uid() = created_by AND user_is_member_of_club(club_id));

CREATE POLICY allow_owner_or_host_manage_meetings ON club_meetings
  FOR UPDATE
  USING (auth.uid() = created_by OR user_is_host_of_club(club_id))
  WITH CHECK (auth.uid() = created_by OR user_is_host_of_club(club_id));

CREATE POLICY allow_member_read_meeting_slots ON club_meeting_slots
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM club_meetings m
      WHERE m.id = club_meeting_slots.meeting_id
        AND (user_is_member_of_club(m.club_id) OR user_is_host_of_club(m.club_id))
    )
  );

CREATE POLICY allow_member_manage_slots ON club_meeting_slots
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM club_meetings m
      WHERE m.id = club_meeting_slots.meeting_id
        AND (auth.uid() = m.created_by OR user_is_host_of_club(m.club_id))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM club_meetings m
      WHERE m.id = club_meeting_slots.meeting_id
        AND (auth.uid() = m.created_by OR user_is_host_of_club(m.club_id))
    )
  );

CREATE POLICY allow_member_vote_slots ON club_meeting_slot_votes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM club_meetings m
      WHERE m.id = club_meeting_slot_votes.meeting_id
        AND user_is_member_of_club(m.club_id)
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM club_meetings m
      WHERE m.id = club_meeting_slot_votes.meeting_id
        AND user_is_member_of_club(m.club_id)
        AND m.status = 'open'
    )
  );

COMMIT;
```

Rollback `supabase/migrations/009_create_meetings_rollback.sql`:

```sql
BEGIN;

DROP POLICY IF EXISTS allow_member_vote_slots ON club_meeting_slot_votes;
DROP POLICY IF EXISTS allow_member_manage_slots ON club_meeting_slots;
DROP POLICY IF EXISTS allow_member_read_meeting_slots ON club_meeting_slots;
DROP POLICY IF EXISTS allow_owner_or_host_manage_meetings ON club_meetings;
DROP POLICY IF EXISTS allow_member_create_meetings ON club_meetings;
DROP POLICY IF EXISTS allow_member_read_meetings ON club_meetings;

DROP TABLE IF EXISTS club_meeting_slot_votes;
DROP TABLE IF EXISTS club_meeting_slots;
DROP TABLE IF EXISTS club_meetings;

COMMIT;
```

Przykładowa komenda zastosowania migracji:

```powershell
npx supabase db push --db-url "$env:SUPABASE_DB_URL"
```

## 13. Kontrakt API
Plik kontraktu: `docs/contracts/meeting-polls.json`.

```json
{
  "feature": "meeting-polls",
  "routes": {
    "GET /api/meetings?clubId=:clubId": {
      "auth": "required",
      "response": {
        "items": [
          {
            "id": "uuid",
            "clubId": "uuid",
            "title": "string",
            "description": "string|null",
            "status": "draft|open|closed|finalized",
            "slots": [
              {
                "id": "uuid",
                "startAt": "iso-datetime",
                "endAt": "iso-datetime|null",
                "label": "string|null",
                "votesCount": 0,
                "currentUserHasVoted": false,
                "createdById": "uuid|null",
                "createdByLabel": "string|null",
                "createdByIsCurrentUser": false
              }
            ]
          }
        ]
      }
    },
    "POST /api/meetings": {
      "auth": "required",
      "body": "clubId,title,description?,slots[]",
      "response": {
        "meetingId": "uuid"
      }
    },
    "POST /api/meeting-slots": {
      "auth": "required",
      "body": "meetingId,startAt,endAt?,label?",
      "response": {
        "slotId": "uuid"
      }
    },
    "DELETE /api/meeting-slots/:slotId": {
      "auth": "required",
      "response": {
        "ok": true,
        "message": "string"
      }
    },
    "POST /api/meeting-votes": {
      "auth": "required",
      "body": "meetingId,slotId",
      "response": {
        "ok": true,
        "message": "string"
      }
    },
    "PATCH /api/meetings/:meetingId": {
      "auth": "required",
      "body": "status|finalizedSlotId",
      "response": {
        "ok": true,
        "message": "string"
      }
    }
  }
}
```

## 14. Branch / PR
- Rekomendowany branch: `feature/plans/stage14_meetings_poll`
- Commit: `docs(plans): add stage 14 meeting poll plan`
- PR title: `PLAN: stage 14 - proposals and voting for meeting time`

## 15. Acceptance E2E test (krok po kroku)
```powershell
npm run dev
npx playwright test tests/e2e/meetings.spec.ts --headed
```

Scenariusz:
1. Zalogowac sie jako czlonek klubu.
2. Wejsc na `/club/[id]/meetings/create` i utworzyc ankiete z 2-3 slotami.
3. Otworzyc `/club/[id]/meetings/[meetingId]` i oddac glos na termin.
4. Zmienic glos na inny slot i potwierdzic aktualizacje licznika.
5. Wejsc jako prowadzacy i zamknac ankiete albo zatwierdzic finalny slot.
6. Zweryfikowac, ze finalny termin wyswietla sie w widoku szczegolow.
7. Zalogowac sie jako uzytkownik spoza klubu i potwierdzic brak dostepu.

## 16. Gotowe do review?
- [ ] Preconditions
- [ ] Kroki implementacji
- [ ] Migration SQL
- [ ] Acceptance E2E
- [ ] `.env.example`
- [ ] Tests added

## 17. Uwagi / nastepne kroki
- Stage 14 powinien byc budowany po Stage 13, bo korzysta z tego samego modelu klub/czlonkostwo i tego samego wzorca glownego flow glosowania.
- Jesli finalny UX ma byc bardziej prosty, mozna zredukowac Stage 14 do jednej ankiety terminu zamiast pelnego CRUD spotkan.
- Po wdrozeniu Stage 14 Stage 15 moze subskrybowac event finalizacji terminu i wysylac e-mail z przypomnieniem.