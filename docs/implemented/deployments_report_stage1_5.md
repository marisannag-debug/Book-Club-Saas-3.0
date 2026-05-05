# Raport implementacji — Stage 1.5

Data: 2026-05-05

Podsumowanie
-----------
Ten dokument podsumowuje wykonane prace związane ze Stage 1.5: przygotowaniem migracji bazy danych, integracją z Supabase, dodaniem CI do wykonywania backupu i uruchamiania migracji oraz stanem bieżących uruchomień CI.

Co zostało wykonane
-------------------
- Utworzono SQL-owe migracje w katalogu `supabase/migrations` i skopiowano je do backendu.
- Dodano serwerowy helper: `book_club_saas_3/lib/supabase.server.ts`.
- Zaktualizowano `book_club_saas_3/.env.example` (przykładowe zmienne środowiskowe).
- Dodano polityki RLS i pliki rollback dla migracji.
- Dodano dokumentację i plany w `docs/` opisujące scope Stage 1.5.
- Dodano workflow CI: `.github/workflows/supabase-migrations.yml` — tworzy backup (`pg_dump`) i uruchamia `npx supabase db push`.
- Dodałem obsługę IPv4-fallback w workflow (rezolucja A-record, zastąpienie hosta adresem IPv4 gdy dostępne).
- Ustawiono i dodano do repozytorium GitHub Secrets niezbędne zmienne: `SUPABASE_DB_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_URL`.
- Workflow został dodany i zmergowany do `main` (PR #4).

Stan uruchomień CI i napotkane problemy
------------------------------------
- Pierwsze uruchomienia zwróciły błąd połączenia na IPv6: `pg_dump` próbował łączyć się z adresem IPv6 i kończyło się to `Network is unreachable`.
- Wprowadzono IPv4-fallback, ale kolejne runy również zakończyły się `failure` (trzeba sprawdzić szczegółowe logi kroków).
- Kilka runów zwracało przez API `log not found` przy próbie pobrania logów przez `gh`, co utrudniło bezpośrednią diagnozę w CLI.

Wstępna analiza
---------------
- Przyczyna: różne środowiska rozwiązują DNS różnie — niekiedy dostępny jest tylko rekord AAAA (IPv6) lub runner próbuje użyć IPv6 bez dostępnej ścieżki sieciowej.
- Rozwiązanie częściowe: wymuszenie użycia adresu IPv4 (A record) w workflow; nadal potrzebne dodatkowe debugowanie.

Zalecane kolejne kroki
----------------------
1. Dodać debug-echo w workflow (wydrukować wynik `dig +short A`, wartość `SUPABASE_DB_URL_IPV4`, oraz próbę `pg_isready`/`nc` na porcie 5432) — zapewni to jasny ślad w logach CI.
2. Sprawdzić logi runów w Actions Web UI (gdy API zwraca `log not found`), ściągnąć pełne logi i zidentyfikować krok zawieszający się/kończący błędem.
3. Jeśli problemy z routingiem IPv6 utrzymują się, rozważyć uruchomienie migracji z maszyny z pewnym IPv4 lub self-hosted runnera z dostępem IPv4.
4. Po udanym wdrożeniu uzupełnić seedy i napisać testy integracyjne backendu.

Referencje
----------
- Workflow: `.github/workflows/supabase-migrations.yml`
- Migrations: `supabase/migrations/` oraz `book_club_saas_3/supabase/migrations/`
- PR (workflow -> main): https://github.com/marisannag-debug/Book-Club-Saas-3.0/pull/4

Autorem raportu jest zespół techniczny — dokument może być aktualizowany w miarę postępów.
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

## Aktualizacja: 2026-05-05
- 2026-05-05: Poprawka dotycząca workflow CI — plik
  `.github/workflows/supabase-migrations.yml` był zapisany w formacie UTF-16 (z BOM),
  co mogło powodować problemy z parsowaniem i zapisem logów przez GitHub Actions.
  Plik został przekonwertowany do UTF-8 (bez BOM) przy zachowaniu istniejącej
  logiki (IPv4-fallback, debug, upload-artifact).

- Zmiana została zapisana w branchu `feature/stage1-backend` i została wypchnięta
  do zdalnego repozytorium (commit + push wykonane przez agenta).

- Rekomendacje po zmianie:
  1. Wyzwolić workflow ręcznie (`workflow_dispatch`) i pobrać pełne logi z Actions Web UI.
  2. Jeśli API nadal zwraca `log not found`, dodać krok w workflow, który
     zapisze debug-output do pliku i wyśle go za pomocą `actions/upload-artifact` —
     zapewni to dostępność diagnostyki niezależnie od problemów z API.

Plik wygenerowany automatycznie na prośbę użytkownika. Jeśli chcesz, mogę:
- uruchomić migracje teraz (wymaga potwierdzenia i backupu),
- dodać seed migrations,
- dodać szablon CI do `.github/workflows/` dla migracji preview.

## Dodatkowa aktualizacja: 2026-05-05 — cofnięcie backendu i backup

- 2026-05-05: W odpowiedzi na żądanie cofnięcia zmian backendowych, agent przywrócił
  zawartość gałęzi `feature/stage1-backend` do stanu `main`, jednocześnie zachowując
  raporty i pliki związane z Supabase w osobnym backupie. Operacja została wykonana z
  poszanowaniem historii — nic nie zostało trwale usunięte.

- Utworzone i wypchnięte branchy:
  - `backup/feature/stage1-backend-bd74f6d` — backup zawierający wcześniejsze zmiany (commit `bd74f6d`).
  - `feature/stage1-backend` — zaktualizowany (zresetowany do `main`, commit cofający: `4db670e`).

- Link do utworzenia PR z backupem (przegląd/przywrócenie zmian):
  https://github.com/marisannag-debug/Book-Club-Saas-3.0/pull/new/backup/feature/stage1-backend-bd74f6d

- Rekomendowane następne kroki:
  1. Przejrzeć backup i przywrócić wybrane pliki/commity (np. `git checkout backup/... -- <ścieżka>` lub `git cherry-pick <sha>`).
  2. Otworzyć PR z backupem, jeśli chcesz przeprowadzić code review przed ponownym połączeniem.
  3. Nie usuwać backupu ani historii — mogą być potrzebne do analizy lub odtworzenia danych.

Operacja wykonana automatycznie przez agenta: backup utworzono i wypchnięto do zdalnego repozytorium;
bieżący branch `feature/stage1-backend` został zaktualizowany i wypchnięty.
