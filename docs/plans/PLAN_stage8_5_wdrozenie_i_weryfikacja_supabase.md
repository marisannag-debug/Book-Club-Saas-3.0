---
title: "PLAN_stage8_5_wdrozenie_i_weryfikacja_supabase"
status: draft
authors: ["AI (wygenerowane)"]
date: 2026-05-13
references:
  - docs/plans/mvp-file-structure-plan.md
  - docs/plans/mvp-stage-outline.md
  - docs/workflows/Agent-plany.md
  - docs/plans/PLAN_stage8_tworzenie_klubu.md
  - docs/implemented/implemented_stage8_tworzenie_klubu.md
  - lib/club-create.ts
  - lib/dashboard-clubs.ts
  - lib/supabase.browser.ts
  - supabase/migrations/002_create_clubs.sql
  - supabase/migrations/002_create_clubs_rollback.sql
---

# Stage 8.5 - Wdrożenie i weryfikacja Supabase

## 1. Cel
Dopiąć etap techniczny między implementacją stage 8 a dalszym rozwojem produktu: wdrożyć migrację `clubs` do działającej instancji Supabase, potwierdzić dostępność API oraz zweryfikować, że tworzenie klubu i szybki dostęp na dashboardzie korzystają z realnej bazy, a nie z fallbacków lub danych demo.

## 2. Zakres
### Wchodzi w zakres
- Wgranie migracji `supabase/migrations/002_create_clubs.sql` do live Supabase.
- Weryfikacja, że tabela `clubs` istnieje i jest widoczna przez REST API.
- Weryfikacja polityk RLS, indeksu na `created_by` i kolumn technicznych tabeli.
- Sprawdzenie, że flow create club zapisuje rekord i redirectuje do `/club/[id]`.
- Sprawdzenie, że dashboard pobiera kluby użytkownika po `created_by` i pokazuje je w szybkim dostępie.
- Przygotowanie rollbacku i potwierdzenie, że da się bezpiecznie cofnąć zmianę w środowisku testowym lub preview.
- Udokumentowanie wyniku wdrożenia w notatce implementacyjnej po zakończeniu stage 8.5.

### Nie wchodzi w zakres
- Dodawanie nowych pól do tabeli `clubs`.
- Rozbudowa UI tworzenia klubu lub dashboardu.
- Wprowadzanie zaproszeń, członkostwa, ról i uprawnień poza właścicielem klubu.
- Budowa nowego endpointu backendowego poza Supabase.

## 3. Wymagania funkcjonalne
- Live Supabase ma mieć wdrożoną tabelę `clubs` zgodną z migracją.
- REST endpoint dla `clubs` nie może zwracać `404` po wdrożeniu migracji.
- Zalogowany użytkownik ma móc utworzyć klub przez istniejący flow stage 8.
- Po utworzeniu klubu rekord ma być widoczny na dashboardzie w sekcji szybkiego dostępu.
- Weryfikacja ma objąć zarówno pozytywny scenariusz, jak i czytelny fallback przy błędzie infrastruktury.
- W razie niepowodzenia wdrożenia plan ma przewidywać szybki rollback i ponowny test.

## 4. Wymagania niefunkcjonalne
- Bezpieczeństwo: weryfikacja nie może wymagać publikowania sekretów ani kopiowania ich do repo.
- Powtarzalność: kroki wdrożenia i weryfikacji mają działać tak samo w lokalnym preview i na live Supabase.
- Obserwowalność: każdy etap ma mieć jasny sygnał sukcesu lub porażki, najlepiej przez pojedyncze zapytanie SQL lub REST.
- Minimalizacja ryzyka: najpierw weryfikacja odczytu, potem write-path, potem smoke E2E.
- Utrzymanie: jeśli wykryty zostanie fallback `clubs` bez realnej tabeli, stage 8.5 ma to jednoznacznie zamknąć.

## 5. Kontekst techniczny
- Aplikacja już ma helper `lib/club-create.ts`, który zapisuje klub przez Supabase browser client.
- Dashboard pobiera kluby użytkownika przez `lib/dashboard-clubs.ts`.
- Tabela `clubs` i rollback są opisane w `supabase/migrations/002_create_clubs.sql` oraz `supabase/migrations/002_create_clubs_rollback.sql`.
- `.env.example` zawiera standardowy zestaw zmiennych Supabase.
- W aktualnym środowisku host Supabase odpowiada, ale endpoint `clubs` zwracał `404`, co wskazuje na brak wdrożonej tabeli lub brak odświeżenia schematu w live projekcie.
- W planie zakładamy, że źródłem prawdy jest live Supabase, nie lokalny fallback.

## Preconditions
- Dostęp do działającego projektu Supabase i uprawnień do wgrywania migracji.
- Ustawione zmienne `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` i `SUPABASE_DB_URL`.
- Lokalnie dostępny Supabase CLI lub możliwość wykonania SQL w Supabase SQL Editor.
- Zaimplementowany stage 8 jest już obecny w kodzie.
- Dostępny login testowy do weryfikacji write-path i dashboardu.
- Brak niezatwierdzonych zmian w migracji `002_create_clubs.sql`.

## 6. Kroki implementacji
### 6.1 Wdrożenie
1. Zweryfikować, czy bieżące środowisko wskazuje na właściwy projekt Supabase i czy `NEXT_PUBLIC_SUPABASE_URL` jest spójny z `.env.example`.
2. Wgrać migrację `supabase/migrations/002_create_clubs.sql` do live bazy przez Supabase CLI albo SQL Editor.
3. Potwierdzić, że tabela `clubs`, indeks `clubs_created_by_idx` i polityki RLS zostały utworzone.
4. Jeśli wdrożenie nie przejdzie, zachować log błędu i nie kontynuować do write-path, dopóki schema nie będzie widoczna.

### 6.2 Weryfikacja read-path
1. Sprawdzić health hosta Supabase przez `/auth/v1/health`.
2. Sprawdzić endpoint REST dla `clubs` i potwierdzić, że odpowiedź nie jest już `404`.
3. Wykonać SQL lub REST query kontrolne dla `clubs`, aby potwierdzić istnienie tabeli, polityk i indeksu.
4. Potwierdzić, że selekt po `created_by` zwraca tylko rekordy właściciela.

### 6.3 Weryfikacja write-path i dashboardu
1. Zalogować testowego użytkownika przez istniejący mechanizm auth.
2. Utworzyć nowy klub przez `/club/create`.
3. Potwierdzić redirect do `/club/[id]` i zgodność nazwy/slug.
4. Wrócić do dashboardu i sprawdzić, że nowo utworzony klub pojawia się w szybkim dostępie.
5. Dla drugiego klubu na tym samym koncie powtórzyć scenariusz, aby potwierdzić wieloklubowość.

### 6.4 Rollback i recovery
1. Jeśli migracja lub weryfikacja wykaże problem z tabelą `clubs`, uruchomić rollback SQL z `supabase/migrations/002_create_clubs_rollback.sql` w środowisku testowym lub preview.
2. Potwierdzić, że po rollbacku endpoint `clubs` wraca do stanu zgodnego z oczekiwaniem dla pustego schematu.
3. Zanotować wynik i powtórzyć wdrożenie po poprawce, jeśli problem był konfiguracyjny.

### 6.5 Minimalny podział pracy
- 1x backend/devops: migracja, RLS, rollback, kontrola dostępności REST.
- 1x tester/fullstack: smoke E2E dla create club i dashboard quick access.

## 7. Rekomendowana kolejność prac
1. Najpierw potwierdzić dostęp do live Supabase i gotowość konfiguracji środowiskowej.
2. Następnie wdrożyć migrację `002_create_clubs.sql`.
3. Potem sprawdzić read-path przez REST i SQL.
4. Na końcu wykonać write-path i smoke E2E dla create club oraz dashboardu.

## 8. `.env.example`
Stage 8.5 nie wymaga nowych zmiennych, ale wzorzec musi umożliwiać wdrożenie i kontrolę live Supabase.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_ENV=development
SUPABASE_DB_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

## 9. Komendy lokalne
```powershell
npx supabase db push --db-url "$env:SUPABASE_DB_URL"

Invoke-WebRequest "$env:NEXT_PUBLIC_SUPABASE_URL/auth/v1/health" -Method Get -UseBasicParsing

Invoke-WebRequest "$env:NEXT_PUBLIC_SUPABASE_URL/rest/v1/clubs?select=id&limit=1" `
  -Headers @{ apikey = $env:SUPABASE_SERVICE_ROLE_KEY; Authorization = "Bearer $($env:SUPABASE_SERVICE_ROLE_KEY)" } `
  -Method Get -UseBasicParsing

npm run test
npx playwright test tests/e2e/create-club.spec.ts tests/e2e/club-dashboard.spec.ts
```

```bash
npx supabase db push --db-url "$SUPABASE_DB_URL"

curl -i "$NEXT_PUBLIC_SUPABASE_URL/auth/v1/health"

curl -i "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/clubs?select=id&limit=1" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"

npm run test
npx playwright test tests/e2e/create-club.spec.ts tests/e2e/club-dashboard.spec.ts
```

## 10. Zmiany DB / migracje
Stage 8.5 nie projektuje nowego modelu danych, ale wymaga realnego wdrożenia istniejącej migracji `supabase/migrations/002_create_clubs.sql`. Minimalny szkic tego, co musi być obecne w live bazie, wygląda tak:

```sql
CREATE TABLE IF NOT EXISTS clubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated insert own club" ON clubs
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow authenticated select own club" ON clubs
  FOR SELECT
  USING (auth.uid() = created_by);

CREATE INDEX IF NOT EXISTS clubs_created_by_idx ON clubs (created_by);
```

Rollback powinien używać `supabase/migrations/002_create_clubs_rollback.sql`. Jeżeli live Supabase zwraca `404` dla `/rest/v1/clubs`, to etap wdrożenia nie jest zamknięty i nie wolno przechodzić do etapów zależnych.

## 11. Branch, commit i PR
- Branch: `feature/stage8-5-supabase-deploy-verify`
- Commit: `docs(plans): add PLAN_stage8_5_wdrozenie_i_weryfikacja_supabase.md`
- PR title: `PLAN: stage 8.5 wdrożenie i weryfikacja Supabase`

## 12. Kryteria akceptacji
- Migracja `002_create_clubs.sql` została wdrożona do live Supabase.
- Endpoint REST dla `clubs` nie zwraca już `404`.
- Kontrolne zapytanie SQL potwierdza istnienie tabeli, polityk i indeksu.
- Create-club flow tworzy rekord w live bazie.
- Dashboard szybki dostęp pokazuje nowo utworzony klub.
- Rollback jest gotowy i działa w środowisku testowym lub preview.
- Po zakończeniu stage 8.5 istnieje krótka notatka implementacyjna z wynikiem wdrożenia.

## 13. Testy
- Smoke: health endpoint Supabase.
- Smoke: REST `clubs` endpoint z anon i service role.
- Integracyjne: SQL `to_regclass('public.clubs')`, polityki i indeks.
- E2E: utworzenie klubu i redirect do `/club/[id]`.
- E2E: powrót do dashboardu i widoczność klubu w szybkim dostępie.
- E2E: drugi klub na tym samym koncie, bez blokady wieloklubowości.

## 14. Acceptance E2E test (krok po kroku)
```powershell
npx supabase db push --db-url "$env:SUPABASE_DB_URL"
```

```powershell
Invoke-WebRequest "$env:NEXT_PUBLIC_SUPABASE_URL/auth/v1/health" -Method Get -UseBasicParsing
```

```powershell
Invoke-WebRequest "$env:NEXT_PUBLIC_SUPABASE_URL/rest/v1/clubs?select=id&limit=1" `
  -Headers @{ apikey = $env:SUPABASE_SERVICE_ROLE_KEY; Authorization = "Bearer $($env:SUPABASE_SERVICE_ROLE_KEY)" } `
  -Method Get -UseBasicParsing
```

```powershell
npx playwright test tests/e2e/create-club.spec.ts
```

```powershell
npx playwright test tests/e2e/club-dashboard.spec.ts
```

```bash
npx supabase db push --db-url "$SUPABASE_DB_URL"
```

```bash
curl -i "$NEXT_PUBLIC_SUPABASE_URL/auth/v1/health"
```

```bash
curl -i "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/clubs?select=id&limit=1" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
```

```bash
npx playwright test tests/e2e/create-club.spec.ts
```

```bash
npx playwright test tests/e2e/club-dashboard.spec.ts
```

Kroki ręczne do potwierdzenia:
1. Otworzyć health i REST dla `clubs` i potwierdzić, że Supabase odpowiada bez `404` dla tabeli.
2. Utworzyć klub jako zalogowany użytkownik.
3. Potwierdzić redirect do strony klubu.
4. Wrócić do dashboardu i sprawdzić szybki dostęp.
5. Utworzyć drugi klub na tym samym koncie i potwierdzić, że oba są widoczne jako osobne rekordy.

## 15. Gotowe do review?
- Preconditions są opisane.
- Kroki wdrożenia i weryfikacji są rozdzielone.
- W planie jest migracja SQL, rollback i komendy do testów.
- Acceptance E2E obejmuje write-path oraz dashboard quick access.
- Branch, commit i PR title są zdefiniowane.

## 16. PYTANIA / ZAŁOŻENIA
- Założenie: aktualny blokujący problem to brak wdrożonej tabeli `clubs` w live Supabase. PROPOZYCJA: traktować `404` jako kryterium niezaliczenia stage 8.5.
- Założenie: stage 8.5 ma zamknąć techniczne ryzyko wdrożeniowe, a nie rozszerzać funkcje produktu. PROPOZYCJA: ograniczyć zakres do migracji, weryfikacji i smoke testów.
- Założenie: lokalny fallback w `createClub` pozostaje tylko awaryjny, ale stage 8.5 ma potwierdzić ścieżkę realną. PROPOZYCJA: po pozytywnej weryfikacji traktować fallback jako ścieżkę pomocniczą, nie domyślną.
