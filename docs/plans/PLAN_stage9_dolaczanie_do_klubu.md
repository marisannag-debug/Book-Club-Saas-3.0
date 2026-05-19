---
title: "PLAN_stage9_dolaczanie_do_klubu"
status: draft
authors: ["AI (wygenerowane)"]
date: 2026-05-18
references:
  - docs/plans/mvp-file-structure-plan.md
  - docs/plans/mvp-stage-outline.md
  - docs/workflows/Agent-plany.md
  - docs/architecture/01-makiety.md
  - docs/architecture/bookclub-pro-user-journey-map.md
  - app/club/join/page.tsx
  - app/club/[id]/page.tsx
  - app/components/DashboardNav.tsx
  - lib/supabase.server.ts
  - lib/supabase.browser.ts
---

# Stage 9 — Dołączanie do klubu

## 1. Cel
Umożliwić członkowi lub nowemu użytkownikowi dołączenie do istniejącego klubu przez link zaproszenia lub kod zaproszenia wysyłany na maila. Stage 9 ma domknąć najważniejszy fragment viralu MVP: organizator tworzy klub, wysyła zaproszenie, a odbiorca może wejść do klubu bez ręcznego przepisywania danych i bez niejasnych kroków pośrednich.

## 2. Zakres
### Wchodzi w zakres
- Nowy, właściwy flow dołączania do klubu w `app/club/join/page.tsx`.
- Widok akceptacji zaproszenia z linku lub z kodu, z obsługą stanu logged out / logged in.
- Komponenty UI dla podglądu zaproszenia, formularza kodu i stanów success/error.
- Backend do generowania zaproszeń, kodu i linku join.
- Wysyłka zaproszenia e-mail z linkiem oraz kodem do ręcznego wpisania.
- Minimalny model danych dla zaproszeń i członkostwa potrzebny do join flow.
- RLS oraz polityki zabezpieczające dostęp do zaproszeń i rekordów membership.
- Smoke E2E dla happy path, błędnego kodu, wygasłego zaproszenia i join po zalogowaniu.

### Nie wchodzi w zakres
- Pełny panel zarządzania członkostwem.
- Zmiana ról członków i prowadzących.
- Usuwanie członków, masowe akcje moderacyjne i zaawansowana administracja.
- Publiczne głosowanie bez konta.
- Rozbudowany system powiadomień e-mail dla innych zdarzeń niż zaproszenie.

## 3. Wymagania funkcjonalne
- Użytkownik ma móc wejść na `/club/join` i wpisać kod zaproszenia albo otworzyć link z tokenem.
- Jeśli użytkownik nie jest zalogowany, aplikacja ma poprosić o logowanie lub rejestrację i wrócić do join flow po uwierzytelnieniu.
- Zaproszenie ma mieć unikalny kod oraz bezpieczny token w linku.
- Zaproszenie ma wskazywać klub, status i datę ważności.
- Po poprawnym użyciu zaproszenia użytkownik ma zostać dodany do klubu i przekierowany do `/club/[id]`.
- Jeśli kod jest błędny, wygasły albo już użyty, użytkownik ma zobaczyć czytelny komunikat i możliwość ponowienia akcji.
- E-mail z zaproszeniem ma zawierać link join oraz kod awaryjny do wpisania ręcznie.
- Organizator ma mieć prosty flow generowania zaproszenia z poziomu dashboardu klubu.

## 4. Wymagania niefunkcjonalne
- Wydajność: join flow ma działać bez ciężkich zapytań i bez dodatkowych roundtripów, jeśli token z linku już identyfikuje zaproszenie.
- Bezpieczeństwo: token w linku ma być jednorazowy lub ograniczony czasowo, a kod ma być odporny na proste zgadywanie.
- UX: użytkownik ma widzieć jasny stan sukcesu, błąd i informację, co zrobić dalej.
- Dostępność: formularz kodu, linki i komunikaty muszą działać z klawiatury i mieć poprawne etykiety.
- Utrzymanie: model zaproszeń ma być prosty i gotowy do rozszerzenia o późniejsze funkcje członkostwa.

## 5. Kontekst techniczny
- Komponenty: `app/club/join/page.tsx`, nowy komponent formularza join, np. `app/components/club/JoinClubForm.tsx`, oraz prosty komponent podglądu zaproszenia.
- Backend: helper domenowy, np. `lib/club-join.ts` i `lib/invite.ts`, do generowania, walidacji i akceptacji zaproszeń.
- Dane: minimalne tabele `club_invites` i `club_members` albo równoważny model, żeby join kończył się realnym członkostwem w klubie.
- API: możliwy route handler lub server action dla akceptacji zaproszenia, plus endpoint do generowania zaproszeń dla organizatora.
- E-mail: lekki provider transakcyjny lub server-side send, z linkiem i kodem w treści wiadomości.
- Testy: Vitest dla logiki tokenów/kodu i Playwright dla pełnego przepływu join.

## Preconditions
- Branch roboczy utworzony od `main` lub od gałęzi po stage 8.
- Stage 8 jest już wdrożony i `app/club/[id]/page.tsx` działa jako dashboard klubu.
- W repo istnieje minimalny model klubów i użytkownik może zostać przypisany do klubu jako członek.
- Dostępne są lokalne zmienne Supabase z `.env.example` oraz konfiguracja dla wysyłki e-mail.
- Zespół akceptuje, że stage 9 dostarcza join/invite flow end-to-end, ale bez pełnego panelu członkostwa.
- Dostępne jest środowisko testowe, w którym można uruchomić Playwright i lokalny Supabase.

## 6. Kroki implementacji
### 6.1 Frontend
1. Zastąpić placeholder w `app/club/join/page.tsx` pełnym ekranem join z dwoma ścieżkami: wpisanie kodu i wejście z linku.
2. Dodać `JoinClubForm` z polami dla kodu, obsługą submitu, loadingiem, komunikatami błędów i czytelnym CTA.
3. Dodać stan dla użytkownika niezalogowanego: link do logowania/rejestracji oraz powrót do zaproszenia po auth.
4. Pokazać podgląd zaproszenia, jeśli URL zawiera token, aby użytkownik wiedział, do jakiego klubu dołącza.
5. Dodać komunikaty success/error oraz redirect do `/club/[id]` po poprawnym dołączeniu.
6. Dopisać testy komponentu join: walidacja kodu, stany sukcesu, błędu i logged out.

### 6.2 Backend
1. Wprowadzić tabelę `club_invites` z tokenem, kodem, `club_id`, `invited_email`, `invited_by`, statusem i datą wygaśnięcia.
2. Wprowadzić minimalną tabelę członkostwa `club_members`, aby join mógł zakończyć się realnym przypisaniem użytkownika do klubu.
3. Dodać RLS tak, aby zaproszenia i membership były czytelne dla właściciela klubu i samego użytkownika, ale nie dla przypadkowych osób.
4. Zbudować helper tworzący zaproszenie, generujący krótki kod oraz bezpieczny token do linku.
5. Zbudować helper akceptacji zaproszenia, który sprawdza ważność kodu/tokenu, tworzy membership i oznacza zaproszenie jako użyte.
6. Podłączyć wysyłkę e-mail z zaproszeniem, zawierającą link join i kod awaryjny.
7. Dodać testy integracyjne dla happy path, tokenu wygasłego, kodu niepoprawnego i ponownego użycia zaproszenia.

### 6.3 Minimalny podział pracy
- 1x frontend dev: ekran join, stany auth, formularz kodu, preview zaproszenia i testy UI.
- 1x backend dev: modele `club_invites` / `club_members`, helpery tokenów, wysyłka e-mail, RLS i testy integracyjne.

## 7. Rekomendowana kolejność prac
1. Najpierw ustalić kontrakt zaproszenia: token, kod, expiry i to, czy zaproszenie jest przypisane do konkretnego e-maila.
2. Następnie zbudować frontend join z obsługą tokenu z URL i formularza kodu.
3. Potem dodać migracje SQL, RLS i helpery backendowe do generowania/akceptacji zaproszeń.
4. Na końcu podłączyć e-mail, redirect po success i testy E2E.

## 8. `.env.example`
Stage 9 wymaga standardowych zmiennych Supabase oraz minimalnej konfiguracji do wysyłki zaproszeń e-mail.

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
npx playwright test tests/e2e/join-club.spec.ts --headed
npm run build
```

```bash
npm install
npx supabase start
npx supabase db push --db-url "$SUPABASE_DB_URL"
npm run dev
npm run lint
npm run test
npx playwright test tests/e2e/join-club.spec.ts --headed
npm run build
```

## 10. Zmiany DB / migracje
Stage 9 wymaga wprowadzenia modelu zaproszeń i minimalnego członkostwa. Proponowany szkic migracji:

```sql
BEGIN;

CREATE TABLE IF NOT EXISTS club_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  invited_email text,
  invited_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_code text NOT NULL UNIQUE,
  invite_token_hash text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  accepted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT club_invites_status_check CHECK (status IN ('pending', 'accepted', 'revoked', 'expired'))
);

CREATE TABLE IF NOT EXISTS club_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  joined_via_invite_id uuid REFERENCES club_invites(id) ON DELETE SET NULL,
  CONSTRAINT club_members_unique UNIQUE (club_id, user_id)
);

ALTER TABLE club_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow club owner to manage invites" ON club_invites
  FOR ALL
  USING (EXISTS (SELECT 1 FROM clubs c WHERE c.id = club_invites.club_id AND c.created_by = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM clubs c WHERE c.id = club_invites.club_id AND c.created_by = auth.uid()));

CREATE POLICY "Allow invited user to read matching invite" ON club_invites
  FOR SELECT
  USING (
    auth.uid() = accepted_by
    OR (invited_email IS NOT NULL AND lower(invited_email) = lower(coalesce(auth.email(), '')))
    OR EXISTS (SELECT 1 FROM clubs c WHERE c.id = club_invites.club_id AND c.created_by = auth.uid())
  );

CREATE POLICY "Allow user to read own membership" ON club_members
  FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM clubs c WHERE c.id = club_members.club_id AND c.created_by = auth.uid()));

CREATE INDEX IF NOT EXISTS club_invites_club_id_idx ON club_invites (club_id);
CREATE INDEX IF NOT EXISTS club_invites_invite_code_idx ON club_invites (invite_code);
CREATE INDEX IF NOT EXISTS club_members_club_id_idx ON club_members (club_id);

COMMIT;
```

Rollback powinien usuwać polityki, indeksy i tabele w odwrotnej kolejności. Przed testami join flow należy wgrać migrację przez `supabase db push`, a w razie potrzeby cofnąć ją rollbackiem stage-9.

## 11. Branch, commit i PR
- Branch: `feature/plans/PLAN_stage9_dolaczanie_do_klubu`
- Commit: `docs(plans): add PLAN_stage9_dolaczanie_do_klubu.md`
- PR title: `PLAN: stage 9 dołączanie do klubu — implementation plan`

## 12. Kryteria akceptacji
- Istnieje osobny plan stage 9 zapisany w `docs/plans/`.
- Plan dotyczy dołączania do klubu przez zaproszenie na maila i kod, a nie ról.
- Zakres obejmuje frontend join, backend tokenów, e-mail i membership.
- Plan zawiera migrację SQL, rollback, `.env.example`, komendy lokalne i testy.
- Plan opisuje oba wejścia: link z tokenem i kod wpisywany ręcznie.
- Zdefiniowano podział na frontend i backend oraz kolejność prac.

## 13. Testy
- Unit: walidacja kodu zaproszenia, stanu expired i stanu already used.
- Unit: render `JoinClubForm` dla logged in i logged out.
- Integracyjne: generowanie zaproszenia przez organizatora dla konkretnego klubu.
- Integracyjne: akceptacja zaproszenia i utworzenie membership dla zalogowanego użytkownika.
- Integracyjne: denial dla błędnego kodu, nieprawidłowego tokenu i wygasłego zaproszenia.
- E2E: join flow od `/club/join` do przekierowania na `/club/[id]`.

## 14. Acceptance E2E test (krok po kroku)
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
npx playwright test tests/e2e/join-club.spec.ts
```

```powershell
npx playwright test tests/e2e/join-club.spec.ts --headed
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
npx playwright test tests/e2e/join-club.spec.ts
```

```bash
npx playwright test tests/e2e/join-club.spec.ts --headed
```

Kroki ręczne do potwierdzenia:
1. Otworzyć `/club/join` bez sesji i potwierdzić link do logowania lub rejestracji.
2. Wpisać poprawny kod zaproszenia i potwierdzić przekierowanie do `/club/[id]`.
3. Otworzyć link z tokenem i potwierdzić podgląd klubu oraz sukces dołączenia.
4. Wpisać błędny albo wygasły kod i sprawdzić czytelny komunikat błędu.
5. Użyć tego samego zaproszenia drugi raz i potwierdzić, że flow pokazuje stan already used.

## 15. Gotowe do review?
- Preconditions są opisane.
- Kroki implementacji obejmują frontend, backend i testy.
- Nie ma nadmiarowych funkcji poza join/invite flow.
- Acceptance E2E ma kopiowalne komendy.
- Branch, commit i PR title są zdefiniowane.

## 16. PYTANIA / ZAŁOŻENIA
- Założenie: stage 9 ma wspierać zarówno link z tokenem, jak i ręczne wpisanie kodu. PROPOZYCJA: utrzymać oba wejścia, bo to zmniejsza tarcie i poprawia odzyskiwalność zaproszenia.
- Założenie: zaproszenie może być przypisane do konkretnego adresu e-mail, ale nie musi. PROPOZYCJA: traktować e-mail jako opcjonalny ogranicznik, a nie twardy warunek, żeby nie blokować flow przy zmianie skrzynki.
- Założenie: token w linku ma być jednorazowy i wygasać po określonym czasie. PROPOZYCJA: TTL 7 dni i możliwość regeneracji przez organizatora.