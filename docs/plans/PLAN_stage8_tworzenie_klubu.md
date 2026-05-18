---
title: "PLAN_stage8_tworzenie_klubu"
status: draft
authors: ["AI (wygenerowane)"]
date: 2026-05-13
references:
  - docs/plans/mvp-file-structure-plan.md
  - docs/plans/mvp-stage-outline.md
  - docs/workflows/Agent-plany.md
  - docs/architecture/01-makiety.md
  - docs/architecture/02-przeplywy-uzytkownika.md
  - docs/architecture/03-zasady-ux.md
  - docs/architecture/bookclub-pro-user-journey-map.md
  - docs/plans/bookclub-pro-mvp-scoping.md
  - app/club/create/page.tsx
  - app/components/DashboardNav.tsx
  - app/club/[id]/page.tsx
  - lib/supabase.browser.ts
  - lib/auth.ts
  - supabase/migrations/README.md
  - supabase/migrations/002_create_clubs.sql
  - supabase/migrations/002_create_clubs_rollback.sql
---

# Stage 8 — Tworzenie klubu

## 1. Cel
Umożliwić zalogowanemu organizatorowi szybkie utworzenie klubu z poziomu `/club/create`, zapisanie minimalnych danych klubu w Supabase oraz natychmiastowy redirect do świeżo utworzonego widoku klubu `/club/[id]`. Stage 8 ma domknąć core flow MVP: „załóż klub → przejdź do klubu → zacznij zapraszać ludzi”.

## 2. Zakres
### Wchodzi w zakres
- Nowa, właściwa strona tworzenia klubu w `app/club/create/page.tsx`.
- Komponent formularza `app/components/club/CreateClubForm.tsx`.
- Kontrakt wejścia/wyjścia dla tworzenia klubu w `docs/contracts/create-club.json`.
- Walidacja pól, stany loading/success/error i dostępność formularza.
- Zapis nowego klubu do Supabase przez istniejący klient browser-side z RLS.
- Migracja SQL dla tabeli `clubs` oraz rollback.
- Podstawowe testy jednostkowe i smoke E2E dla happy path i błędów.
- Obsługa wielu klubów na jedno konto bez blokady tworzenia kolejnego klubu.

### Nie wchodzi w zakres
- Zaproszenia e-mail i kody zaproszeń.
- Członkostwo, role, moderacja i permissions beyond creator.
- Tworzenie propozycji książek, głosowania i terminy spotkań.
- Rozbudowany edytor klubu, avatar, branding, cover image.
- Blokowanie wieloklubowości na konto.

## 3. Wymagania funkcjonalne
- Strona `/club/create` ma być dostępna dla zalogowanego użytkownika.
- Formularz ma zawierać co najmniej: nazwę klubu jako pole wymagane oraz opis jako pole opcjonalne.
- Nazwa klubu ma mieć prostą walidację długości i nie może być pusta.
- Po poprawnym zapisie aplikacja ma przekierować użytkownika do `/club/[id]` nowo utworzonego klubu.
- Po błędzie użytkownik ma zobaczyć czytelny komunikat, bez surowego błędu Supabase.
- Jeśli użytkownik ma już inne kluby, formularz nadal ma pozwalać na utworzenie kolejnego klubu i po sukcesie przekierować do nowego `/club/[id]`.
- Po sukcesie ekran ma zasugerować następny krok: zaproszenie pierwszych członków lub przejście do dashboardu klubu.

## 4. Wymagania niefunkcjonalne
- Wydajność: formularz i zapis mają działać szybko, bez dodatkowej ciężkiej warstwy serwerowej.
- Bezpieczeństwo: zapis ma być ograniczony przez RLS do zalogowanego użytkownika i jego własnego rekordu klubu.
- UX: 1 primary CTA, czytelny fallback, brak zbędnych pól i prosty feedback po submit.
- Dostępność: pola muszą mieć label, fokus, aria-live dla błędów i statusów oraz obsługę klawiatury.
- Utrzymanie: kontrakt danych ma być mały i opisany w osobnym pliku `docs/contracts/`, żeby backend i frontend nie rozjechały się w kolejnych stage’ach.
- Utrzymanie: lista klubów użytkownika ma być łatwa do pobrania po `created_by`, bo konto może mieć wiele klubów.

## 5. Kontekst techniczny
- Komponenty: `app/club/create/page.tsx`, `app/components/club/CreateClubForm.tsx`.
- Klient danych: `lib/supabase.browser.ts` oraz pomocnicza walidacja formularza w warstwie klienta.
- Dane: tabela `clubs` z polami `id`, `name`, `description`, `created_by`, `created_at`, `updated_at`.
- API / kontrakt: zapis przez Supabase PostgREST na tabeli `clubs`; kontrakt payloadu w `docs/contracts/create-club.json`.
- Integracja z dashboardem: redirect do `app/club/[id]/page.tsx` po utworzeniu klubu.
- Integracja z dashboardem: przyszłe listowanie wielu klubów użytkownika po `created_by`.
- Migracje: `supabase/migrations/002_create_clubs.sql` i `supabase/migrations/002_create_clubs_rollback.sql`.
- Testy: Vitest + React Testing Library dla formularza i walidacji, Playwright dla pełnego flow create club.

## Preconditions
- Branch roboczy utworzony od `main` albo od funkcjonalnego branchu stage 7.
- Stage 7 jest już wdrożony i `/club/[id]` renderuje dashboard klubu.
- Lokalnie działają zmienne Supabase z `.env.example`.
- Dostępna jest działająca instancja Supabase, z której można odczytać i zapisać klub przez `lib/supabase.browser.ts`.
- Istnieje decyzja MVP, że jeden użytkownik może mieć wiele klubów. PROPOZYCJA: pozwolić na wieloklubowość od stage 8 i nie blokować drugiego klubu.
- Zespół akceptuje browser-side insert do Supabase z RLS jako najkrótszą ścieżkę dla tego stage’а.
- Jeśli baza nie ma jeszcze tabeli `clubs`, przed testami należy zastosować migrację `supabase/migrations/002_create_clubs.sql` oraz mieć gotowy rollback `supabase/migrations/002_create_clubs_rollback.sql`.

## 6. Kroki implementacji
### 6.1 Frontend
1. Przerobić `app/club/create/page.tsx` z placeholdera na pełną stronę tworzenia klubu z krótkim intro, CTA i osadzonym formularzem.
2. Zbudować `app/components/club/CreateClubForm.tsx` jako komponent client-side z polami `name` i `description`, stanem loading i komunikatami inline.
3. Dodać walidację lokalną przez Zod lub równoważny zestaw reguł po stronie klienta, tak aby submit był blokowany dla pustej lub zbyt krótkiej nazwy.
4. Dodać czytelne stany: pusty formularz, submitting, success i error; po sukcesie pokazać status oraz wykonać redirect do `/club/[id]`.
5. Dodać po sukcesie link powrotny do dashboardu oraz skrót do nowo utworzonego klubu, aby użytkownik mógł od razu utworzyć kolejny lub przejść dalej.
6. Dopisać unit testy formularza: walidacja, blokada submitu, komunikat sukcesu, komunikat błędu i możliwość ponownego utworzenia klubu na tym samym koncie.
7. Przygotować mały kontrakt w `docs/contracts/create-club.json`, żeby testy i ewentualny późniejszy endpoint miały wspólny shape payloadu.

### 6.2 Backend
1. Dodać migrację tworzącą tabelę `clubs` z minimalnym zestawem pól: `id`, `name`, `description`, `created_by`, `created_at`, `updated_at`.
2. Ustawić ograniczenia: wymagane `name`, sensowną długość nazwy, opcjonalny opis z limitem znaków i jednoznaczny link do autora przez `created_by`.
3. Dodać RLS do tabeli `clubs`, tak aby insert i select były dozwolone tylko dla zalogowanego właściciela rekordu.
4. Dodać zwykły indeks po `created_by`, żeby dashboard stage 7 mógł szybko pobierać wiele klubów jednego użytkownika. PROPOZYCJA: indeks, nie unique constraint.
5. Utrzymać rollback SQL obok migracji, żeby dało się bezpiecznie cofnąć etap na lokalnym środowisku i preview.
6. Podłączyć działającą instancję Supabase do helpera `lib/club-create.ts`, aby zapis klubu działał na realnym backendzie, a nie tylko w mocku.
7. Dodać test integracyjny logiki backendowej i polityk RLS w lokalnym Supabase lub w preview DB: authenticated insert allowed, anonymous insert denied, oraz dwa kluby dla tego samego organizatora są dozwolone.
8. Nie dodawać jeszcze zaproszeń, członkostwa ani tabel ról, bo to jest zakres kolejnych stage’ów.

### 6.3 Minimalny podział pracy
- 1x frontend dev: strona `/club/create`, formularz, walidacja, statusy, redirect i testy UI.
- 1x backend dev: migracja `clubs`, RLS, rollback, kontrakt danych i testy integracyjne na lokalnym Supabase.

## 7. Rekomendowana kolejność prac
1. Najpierw ustalić kontrakt payloadu i zasady wieloklubowości na konto.
2. Następnie zbudować frontend formularza i stanów komunikatów bez podpinania jeszcze zapisu.
3. Potem dołożyć migrację `clubs` oraz polityki RLS.
4. Na końcu spiąć insert przez Supabase browser client, redirect do `/club/[id]` i testy E2E.

## 8. `.env.example`
Stage 8 nie wymaga nowych zmiennych środowiskowych, ale wzorzec musi nadal zawierać wartości potrzebne do autoryzacji i pracy z Supabase.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=development
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_DB_URL=
```

## 9. Komendy lokalne
```powershell
npm install
npx supabase start
npx supabase db push --db-url "$env:SUPABASE_DB_URL"
npm run dev:test
npm run lint
npm run test
npx playwright test tests/e2e/create-club.spec.ts --headed
npm run build
```

```bash
npm install
npx supabase start
npx supabase db push --db-url "$SUPABASE_DB_URL"
npm run dev:test
npm run lint
npm run test
npx playwright test tests/e2e/create-club.spec.ts --headed
npm run build
```

## 10. Zmiany DB / migracje
Stage 8 wymaga wprowadzenia nowej tabeli `clubs` i polityk RLS. Konkretna migracja znajduje się w `supabase/migrations/002_create_clubs.sql`, a rollback w `supabase/migrations/002_create_clubs_rollback.sql`. Minimalny szkic migracji powinien wyglądać tak:

```sql
BEGIN;

CREATE TABLE IF NOT EXISTS clubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT clubs_name_length CHECK (char_length(name) BETWEEN 3 AND 60),
  CONSTRAINT clubs_description_length CHECK (description IS NULL OR char_length(description) <= 240)
);

ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated insert own club" ON clubs
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow authenticated select own club" ON clubs
  FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Allow authenticated update own club" ON clubs
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow authenticated delete own club" ON clubs
  FOR DELETE
  USING (auth.uid() = created_by);

CREATE INDEX IF NOT EXISTS clubs_created_by_idx ON clubs (created_by);

COMMIT;
```

Rollback powinien usunąć polityki, indeks i tabelę `clubs` w odwrotnej kolejności. Przed uruchomieniem create flow na działającej instancji Supabase należy wgrać `supabase/migrations/002_create_clubs.sql`, a w razie potrzeby odtworzyć stan przez `supabase/migrations/002_create_clubs_rollback.sql`.

## 11. Branch, commit i PR
- Branch: `feature/plans/PLAN_stage8_tworzenie_klubu`
- Commit: `docs(plans): add PLAN_stage8_tworzenie_klubu.md`
- PR title: `PLAN: stage 8 tworzenie klubu — implementation plan`

## 12. Kryteria akceptacji
- Istnieje osobny plan stage 8 zapisany w `docs/plans/`.
- Plan obejmuje frontend formularza i backend Supabase dla tworzenia klubu.
- Zapis klubu ma jednoznaczny kontrakt, walidację i polityki RLS.
- Formularz po sukcesie redirectuje do `/club/[id]`.
- Plan zawiera migrację SQL, rollback, `.env.example`, komendy lokalne i testy.
- Plan zakłada działającą instancję Supabase oraz zastosowanie `supabase/migrations/002_create_clubs.sql` przed testami write-path.
- Zdefiniowano, że konto może mieć wiele klubów i że backend nie blokuje kolejnego tworzenia.

## 13. Testy
- Unit: render `CreateClubForm` i blokada submitu przy błędnych danych.
- Unit: walidacja nazwy klubu, opcjonalnego opisu i komunikatów error/success.
- Integracyjne: insert do `clubs` dla zalogowanego użytkownika oraz denial dla anonymous/no session.
- Integracyjne: weryfikacja, że drugi klub dla tego samego organizatora jest dozwolony i zapisuje się jako osobny rekord.
- E2E: happy path create club od `/club/create` do redirectu na `/club/[id]`.

## 14. Acceptance E2E test (krok po kroku)
```powershell
npx supabase start
```

```powershell
npx supabase db push --db-url "$env:SUPABASE_DB_URL"
```

```powershell
npm run dev:test
```

```powershell
npx playwright test tests/e2e/create-club.spec.ts
```

```powershell
npx playwright test tests/e2e/create-club.spec.ts --headed
```

```bash
npx supabase start
```

```bash
npx supabase db push --db-url "$SUPABASE_DB_URL"
```

```bash
npm run dev:test
```

```bash
npx playwright test tests/e2e/create-club.spec.ts
```

```bash
npx playwright test tests/e2e/create-club.spec.ts --headed
```

Kroki ręczne do potwierdzenia:
1. Zalogować się i otworzyć `/club/create`.
2. Wpisać poprawną nazwę i opcjonalny opis klubu.
3. Kliknąć submit i potwierdzić, że pojawia się stan sukcesu oraz redirect do `/club/[id]`.
4. Spróbować utworzyć klub z pustą nazwą i potwierdzić walidację inline.
5. Jeśli użytkownik ma już inne kluby, potwierdzić, że nowy klub nadal zapisuje się jako osobny rekord.

## 15. Gotowe do review?
- Preconditions są opisane.
- Kroki implementacji są rozdzielone na frontend i backend.
- Migracja SQL i rollback są dołączone.
- Acceptance E2E ma kopiowalne komendy.
- `.env.example`, branch, commit i PR title są zdefiniowane.

## 16. PYTANIA / ZAŁOŻENIA
- Założenie: MVP pozwala jednemu użytkownikowi tworzyć wiele klubów. PROPOZYCJA: dodać indeks po `created_by` i zostawić wieloklubowość bez constraintu unique.
- Założenie: opis klubu jest opcjonalny, żeby skrócić czas do wartości. PROPOZYCJA: tylko nazwa jest wymagana.
- Założenie: zapis przez Supabase browser client z RLS jest wystarczający dla stage 8. PROPOZYCJA: nie dodawać jeszcze osobnego backend endpointu, dopóki nie pojawi się potrzeba serwerowej walidacji.
- Założenie: dostępna instancja Supabase powinna mieć zastosowaną migrację `002_create_clubs.sql`, zanim zespół uzna stage 8 za gotowy do integracji.