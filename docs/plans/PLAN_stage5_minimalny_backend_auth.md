---
title: "PLAN_stage5_minimalny_backend_auth"
status: draft
authors: ["AI (wygenerowane)"]
date: 2026-05-12
references:
  - docs/plans/mvp-file-structure-plan.md
  - docs/plans/mvp-stage-outline.md
  - docs/workflows/Agent-plany.md
  - docs/architecture/01-makiety.md
  - docs/business/bookclub-pro-user-journey-map.md
  - supabase/migrations/README.md
  - supabase/migrations/000_init_users.sql
  - supabase/migrations/001_enable_rls_and_policies.sql
  - lib/auth.ts
  - lib/supabase.server.ts
  - tests/unit/auth.test.ts
  - tests/e2e/auth.spec.ts
---

# Stage 5 — Minimalny backend auth

## 1. Cel
Domknąć minimalny backend dla auth w BookClub Pro: utrwalić integrację z Supabase Auth, zapewnić server-side punkt wejścia dla przyszłych operacji backendowych oraz dopiąć bazowe tabele i polityki RLS, które wspierają obecny flow rejestracji i logowania.

## 2. Zakres
### Wchodzi w zakres
- Serwerowy wrapper Supabase w `lib/supabase.server.ts` jako kontrolowany punkt integracji po stronie backendu.
- Weryfikacja i utrwalenie migracji `users` oraz RLS/polityk w `supabase/migrations/`.
- Uzupełnienie `lib/auth.ts` o stabilny kontrakt dla rejestracji i logowania, bez zmiany publicznego API helperów.
- Dopasowanie konfiguracji środowiskowej do pracy z Supabase CLI i lokalnym backendem.
- Aktualizacja testów helperów auth i smoke E2E, jeśli kontrakt odpowiedzi wymaga doprecyzowania.

### Nie wchodzi w zakres
- Nowe funkcje produktu poza auth, takie jak klub, zaproszenia, voting, chat czy profile biznesowe.
- Rozbudowa tabel domenowych poza minimalny `users` i RLS potrzebne do obecnego etapu.
- Full server actions, API routes albo własny auth backend poza Supabase.
- Social login, MFA, reset hasła i magic link.

## 3. Wymagania funkcjonalne
- Backend ma umożliwiać rejestrację i logowanie w oparciu o Supabase Auth bez mocków w warstwie produkcyjnej.
- Helpery `registerUser` i `loginUser` mają zwracać stabilny, czytelny kontrakt `{ ok, message }`.
- `lib/supabase.server.ts` ma być gotowym, jednoznacznym miejscem na przyszły server-side dostęp do Supabase.
- Migrations mają tworzyć minimalny model danych dla użytkownika i podstawowe polityki RLS.
- Błędy środowiskowe i konfiguracja Supabase mają być komunikowane jednoznacznie, bez cichych awarii.
- Testy mają potwierdzać, że auth działa na publicznym anon key i że kontrakt odpowiedzi nie rozjeżdża się między warstwami.

## 4. Wymagania niefunkcjonalne
- Wydajność: pojedynczy klient Supabase na proces, bez niepotrzebnego tworzenia nowych instancji.
- Bezpieczeństwo: anon key tylko po stronie klienta, service role tylko tam, gdzie jest faktycznie potrzebny.
- UX: brak zmian w UI poza tym, co konieczne do poprawnego odczytu odpowiedzi backendu.
- Dostępność: komunikaty błędów z backendu muszą pozostać czytelne i możliwe do ogłoszenia przez region statusu.
- Stabilność: migracje i helpery muszą być odtwarzalne lokalnie i w CI.

## 5. Kontekst techniczny
- Komponenty: `lib/auth.ts`, `lib/supabase.server.ts`, `supabase/migrations/000_init_users.sql`, `supabase/migrations/001_enable_rls_and_policies.sql`.
- Integracja backendowa: Supabase Auth jako źródło logowania i rejestracji, Supabase Postgres jako minimalna warstwa danych użytkownika.
- Dane: tabela `users` z kluczem UUID, e-mailem i timestampem utworzenia, plus polityki RLS dla operacji własnych.
- Testy: `tests/unit/auth.test.ts` dla helperów i mapowania błędów, `tests/e2e/auth.spec.ts` jako smoke dla flow auth.
- Konfiguracja: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_DB_URL`, opcjonalnie `SUPABASE_SERVICE_ROLE_KEY` dla przyszłych operacji admin.

## Preconditions
- Branch roboczy utworzony od `main`.
- Lokalnie ustawione `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` i `SUPABASE_DB_URL`.
- Dostępny projekt Supabase z włączonym Auth i możliwością wykonania `db push`.
- Istniejące UI `/register` i `/login` już korzystają z helperów auth.
- Zespół ma decyzję, że stage 5 nie wprowadza jeszcze pełnych tabel domenowych poza `users`.

## 6. Kroki implementacji
### 6.1 Frontend
1. Utrzymać kontrakt helperów auth tak, aby formularze nie musiały znać szczegółów Supabase poza `ok` i `message`.
2. Sprawdzić, czy komunikaty backendowe są poprawnie renderowane w `LoginForm` i `RegisterForm`, bez dodawania nowej logiki UI.
3. Rozszerzyć lub dostroić testy unit formularzy tylko tam, gdzie kontrakt odpowiedzi backendu wymaga potwierdzenia.
4. Zachować obecne trasy i układ stron bez dodatkowych ekranów technicznych.

### 6.2 Backend
1. Utrwalić `lib/supabase.server.ts` jako przyszły punkt wejścia dla server-side klienta Supabase, ale bez włączania nadmiarowej logiki.
2. Zweryfikować i ewentualnie ujednolicić `lib/auth.ts`, tak aby `registerUser` i `loginUser` korzystały z tego samego wzorca tworzenia klienta i mapowania błędów.
3. Potwierdzić, że migracja `000_init_users.sql` tworzy minimalną tabelę `users` i że `001_enable_rls_and_policies.sql` daje polityki zgodne z założeniem własności wiersza.
4. W razie potrzeby dopisać brakujące rollbacki albo doprecyzować komentarze w migrations README, żeby `supabase db push` był jednoznaczny dla zespołu.
5. Nie dodawać nowych tabel domenowych, dopóki stage 5 ma pozostać minimalnym backendem auth.

### 6.3 Minimalny podział pracy
- 1x frontend dev: potwierdzenie kontraktu odpowiedzi i drobne dostosowania renderowania komunikatów.
- 1x backend dev: Supabase client wrapper, migracje, RLS i konfiguracja środowiskowa.

## 7. Rekomendowana kolejność prac
1. Najpierw ustalić i zamknąć kontrakt helperów auth, żeby frontend i backend mówiły tym samym językiem.
2. Następnie dopiąć `lib/supabase.server.ts` oraz sprawdzić, czy migrations są wykonywalne w lokalnym środowisku.
3. Na końcu uruchomić testy unit i E2E, żeby potwierdzić, że obecny flow auth nadal działa po dopięciu backendu.

## 8. `.env.example`
W Stage 5 plik `.env.example` powinien zawierać zarówno zmienne publiczne dla auth, jak i zmienne potrzebne do pracy z Supabase CLI oraz przyszłym server-side dostępem.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_DB_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Jeśli zespół nie planuje jeszcze używać service role po stronie backendu, zmienna może pozostać pusta, ale powinna być zarejestrowana w pliku wzorcowym, żeby nie blokować kolejnych etapów.

## 9. Komendy lokalne
```powershell
npm install
npm run dev
npm run lint
npm run test
npm run test:e2e
npm run build
npx supabase db push --db-url "$env:SUPABASE_DB_URL"
```

```bash
npm install
npm run dev
npm run lint
npm run test
npm run test:e2e
npm run build
npx supabase db push --db-url "$SUPABASE_DB_URL"
```

## 10. Zmiany DB / migracje
Stage 5 zakłada zastosowanie minimalnego modelu użytkownika i polityk RLS. Jeśli pliki migracji mają zostać odtworzone lub porównane, bazowy kształt powinien wyglądać tak:

```sql
-- 000_init_users.sql
BEGIN;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

COMMIT;
```

```sql
-- 001_enable_rls_and_policies.sql
BEGIN;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated select own" ON users
  FOR SELECT USING (auth.role() = 'authenticated' AND auth.uid() = id);

CREATE POLICY "Allow authenticated insert" ON users
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update own" ON users
  FOR UPDATE USING (auth.role() = 'authenticated' AND auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow authenticated delete own" ON users
  FOR DELETE USING (auth.role() = 'authenticated' AND auth.uid() = id);

COMMIT;
```

Rollbacki należy utrzymać jako osobne pliki w `supabase/migrations/`, a komendą wdrożeniową dla lokalnej bazy pozostaje `npx supabase db push --db-url ...`.

## 11. Branch, commit i PR
- Branch: `feature/plans/PLAN_stage5_minimalny_backend_auth`
- Commit: `docs(plans): add PLAN_stage5_minimalny_backend_auth.md`
- PR title: `PLAN: stage 5 minimalny backend auth — implementation plan`

## 12. Kryteria akceptacji
- `lib/supabase.server.ts` jest opisany jako gotowy punkt integracji po stronie serwera.
- `lib/auth.ts` ma stabilny kontrakt dla rejestracji i logowania.
- Migracje `users` i RLS są jednoznacznie opisane i możliwe do odtworzenia lokalnie.
- `.env.example` zawiera zmienne potrzebne do auth i Supabase CLI.
- Testy unit i E2E mają jasny zakres potwierdzający, że auth działa po stronie backendu.
- Plan nie wprowadza przedwcześnie nowych tabel domenowych ani pełnego backendu produktu.

## 13. Testy
- Unit: weryfikacja mapowania błędów auth, kontraktu `{ ok, message }` i zachowania helperów przy braku env.
- Integracyjne: mock Supabase Auth dla `registerUser` i `loginUser` z potwierdzeniem zgodności odpowiedzi.
- E2E: smoke dla `/register` i `/login`, żeby upewnić się, że frontend nadal konsumuje backend w przewidywalny sposób.
- DB: lokalne `supabase db push` jako weryfikacja składni i kolejności migracji.

## 14. Acceptance E2E test (krok po kroku)
```powershell
npm run dev:test
```

```powershell
npx playwright test tests/e2e/auth.spec.ts
```

```powershell
npx playwright test tests/e2e/auth.spec.ts --headed
```

```powershell
npx supabase db push --db-url "$env:SUPABASE_DB_URL"
```

```bash
npm run dev:test
```

```bash
npx playwright test tests/e2e/auth.spec.ts
```

```bash
npx playwright test tests/e2e/auth.spec.ts --headed
```

```bash
npx supabase db push --db-url "$SUPABASE_DB_URL"
```

Kroki ręczne do potwierdzenia:
1. Uruchomić lokalną aplikację i otworzyć `/register`.
2. Zarejestrować użytkownika testowego i potwierdzić, że helper auth zwraca czytelny komunikat sukcesu.
3. Otworzyć `/login` i sprawdzić, że logowanie używa tego samego kontraktu odpowiedzi.
4. Uruchomić `supabase db push` i potwierdzić, że migracje tworzą `users` oraz polityki RLS bez błędów.
5. Zweryfikować, że błędy konfiguracji env są zgłaszane jasno, a nie jako pusty crash UI.

## 15. Gotowe do review?
- Preconditions obejmują branch, env i dostęp do Supabase.
- Kroki implementacji są rozdzielone na frontend i backend, nawet jeśli frontend ma tylko minimalne dostosowania.
- Migracje i rollbacki są uwzględnione wraz z komendą `supabase db push`.
- `.env.example` zawiera zmienne dla auth, DB i przyszłego server-side klienta.
- Acceptance E2E ma kopiowalne komendy dla PowerShell i Bash.
- Zakres nie rozmywa stage 5 w pełny backend produktu.

## 16. PYTANIA / ZAŁOŻENIA
- Założenie: stage 5 ma utrwalić minimalny backend auth, a nie budować kolejnych funkcji domenowych. PROPOZYCJA: trzymać się tylko auth, migracji users i server wrappera.
- Założenie: `lib/supabase.server.ts` pozostaje lekkim punktem integracji do kolejnych etapów. PROPOZYCJA: nie włączać jeszcze ciężkiej logiki server-side.
- Założenie: tabela `users` jest wystarczająca dla tego etapu. PROPOZYCJA: nie dodawać profile tables, dopóki nie pojawi się realna potrzeba biznesowa.