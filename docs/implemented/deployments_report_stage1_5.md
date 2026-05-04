# Stage 1.5 — Wdrażanie backendu w Supabase — Raport postępów

Data: 2026-05-04
Autor: agent (automatyczne zapisy)

## 1. Cel
Wdrożenie podstawowego backendu w Supabase dla Stage 1.5: przygotowanie połączeń serwerowych, migracji schematu, polityk RLS, plików konfiguracyjnych (.env.example) oraz dokumentacji uruchomienia i rollbacku.

## 2. Zakres (co zrobiono)
- Dodano serwerowy klient Supabase (`book_club_saas_3/lib/supabase.server.ts`).
- Dodano `.env.example` z wymaganymi zmiennymi oraz lokalny, nieśledzony `book_club_saas_3/.env` (lokalna kopia, należy usunąć z repo jeśli niepożądane).
- Skopiowano migracje do folderu backend (`book_club_saas_3/supabase/migrations/`):
  - `000_init_users.sql` (+ rollback)
  - `001_enable_rls_and_policies.sql` (+ rollback)
- Zaktualizowano dokumentację migracji (`supabase/migrations/README.md` pozostaje w repo głównym).
- Zaktualizowano plan Stage 1.5: `docs/plans/PLAN_stage1_5_supabase_backend.md` (draft).

## 3. Wymagania funkcjonalne (zrealizowane)
- Stworzenie tabeli `users` z UUID PK i polem `email`.
- Włączenie Row Level Security na tabeli `users` oraz podstawowe polityki (select/insert/update/delete dla właściciela).
- Dostarczenie server-side clienta, gotowego do użycia w API/funcjach serverowych.

## 4. Wymagania niefunkcjonalne
- Bezpieczeństwo: klucze supabase nie powinny być commitowane; `.env.example` zawiera nazwy zmiennych, nie wartości produkcyjnych.
- Możliwość rollbacku: każda migracja ma odpowiadający plik rollback.

## 5. Kontekst techniczny
- Branch roboczy: `feature/stage1-backend` (push).
- Aktywny PR (zawiera wcześniejsze zmiany Stage 1 / placeholders): https://github.com/marisannag-debug/Book-Club-Saas-3.0/pull/3
- Główne pliki dodane/zmienione:
  - `book_club_saas_3/lib/supabase.server.ts`
  - `book_club_saas_3/.env.example`
  - `book_club_saas_3/.env` (lokalny — NIE śledzony)
  - `book_club_saas_3/supabase/migrations/000_init_users.sql`
  - `book_club_saas_3/supabase/migrations/000_init_users_rollback.sql`
  - `book_club_saas_3/supabase/migrations/001_enable_rls_and_policies.sql`
  - `book_club_saas_3/supabase/migrations/001_enable_rls_and_policies_rollback.sql`
  - `docs/plans/PLAN_stage1_5_supabase_backend.md`

## 6. Kroki wykonane (lista i krótkie komendy)
1. Utworzono branch: `feature/stage1-backend`.
2. Dodano `supabase.server.ts` — serwerowy klient supabase (w `book_club_saas_3/lib`).
3. Dodano `.env.example` i skopiowano wartości lokalne do `book_club_saas_3/.env` (lokalna kopia).
4. Dodano migracje i rollbacky (000_*, 001_*), wypchnięto do branchu.

Komendy użyte lub do powtórzenia lokalnie:

PowerShell (Windows):
```powershell
cd .\book_club_saas_3\
(Get-Content .env) | ForEach-Object {
  $p = $_ -split '='
  if ($p.Length -ge 2) { Set-Item -Path Env:\$($p[0].Trim()) -Value ($p[1..($p.Length-1)] -join '=').Trim() }
}
npx supabase db push --db-url $env:SUPABASE_DB_URL
```

Bash (Linux/macOS):
```bash
cd book_club_saas_3
export $(grep -v '^#' .env | xargs)
npx supabase db push --db-url "$SUPABASE_DB_URL"
```

Rollback (psql):
```bash
psql "$SUPABASE_DB_URL" -f book_club_saas_3/supabase/migrations/001_enable_rls_and_policies_rollback.sql
psql "$SUPABASE_DB_URL" -f book_club_saas_3/supabase/migrations/000_init_users_rollback.sql
```

Backup DB (pg_dump):
```bash
pg_dump "$SUPABASE_DB_URL" > backup_$(date +%F).sql
```

## 7. Kryteria akceptacji (Done / Ready-to-review)
- `book_club_saas_3/lib/supabase.server.ts` istnieje i importuje poprawne zmienne środowiskowe.
- `book_club_saas_3/supabase/migrations/` zawiera migracje i rollbacky (000, 001).
- Można z sukcesem uruchomić `supabase db push` lokalnie i zobaczyć utworzone tabele.
- RLS jest włączone na `users` i podstawowe polityki działają (testy manualne lub integracyjne).
- `.env.example` opisuje wymagane zmienne (bez commitowanych sekretów).

## 8. Testy (zalecane)
- Unit: testy pojedynczych helperów i factory dla Supabase client (mock).
- Integracja: prosty test tworzenia użytkownika przez admin client i weryfikacja polityki RLS.
- E2E: scenariusz rejestracji użytkownika po stronie frontend -> zapytanie do backend -> zapis w `users`.

## 9. PYTANIA / ZAŁOŻENIA
- Klucze Supabase zostały skopiowane do `book_club_saas_3/.env` lokalnie — potwierdź czy chcesz, żeby agent usunął lokalny `.env` z repo (zalecane: NIE trzymać sekretów w repo). PROPOZYCJA: zostawić tylko `book_club_saas_3/.env.example` w repo i skasować lokalny `.env` z commita.
- Czy chcesz, żeby agent uruchomił migracje teraz (w tym powiązane backupy) czy najpierw dodać seed + CI? (Propozycja: wykonać backup i uruchomić migracje na preview po dodaniu seedów.)

## 10. Ryzyka i rollback
- Ryzyko: przypadkowe wystawienie `SUPABASE_SERVICE_ROLE_KEY` w repo — jeżeli klucz jest publiczny, natychmiast zmień/rotuj klucz w panelu Supabase.
- Rollback: użyć plików `*_rollback.sql` przez `psql` lub przywrócić snapshot/backup.

## 11. Następne kroki (priorytety)
1. Dodać seed data i migracje seedujące (priorytet: niski/średni).
2. Dodać CI job, który wykona migracje na preview DB przy PR.
3. Napisać integracyjne testy backend (preview DB + CI).
4. Otworzyć PR review: `feature/stage1-backend` -> `main` (PR już istnieje: link powyżej).
5. Usunąć lokalne sekrety z repo i wprowadzić klucze do GitHub Secrets / Vercel env.

## 12. Checklist "Gotowe do review?"
- [x] Preconditions: env vars zdefiniowane (lokalnie)
- [x] Migracje: 000, 001 dodane + rollback
- [x] Server client: dodany
- [ ] Seeds: brak
- [ ] CI migracji: brak
- [ ] Integracyjne testy: brak

---

Plik wygenerowany automatycznie na prośbę użytkownika. Jeśli chcesz, mogę:
- uruchomić migracje teraz (wymaga potwierdzenia i backupu),
- dodać seed migrations,
- dodać szablon CI do `.github/workflows/` dla migracji preview.
