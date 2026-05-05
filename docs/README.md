# Book Club SaaS — Instrukcja uruchomienia lokalnego

Poniższe instrukcje opisują jak uruchomić frontend aplikacji BookClub lokalnie na maszynie deweloperskiej (Windows). Zakładają, że projekt został sklonowany i znajdujesz się w głównym katalogu repozytorium.

Przykładowe, przetestowane środowisko:
- Node: v24.12.0
- npm: 11.6.2
- Next.js: 16.2.4 (dev używa Turbopack)

1) Zainstaluj zależności i uruchom dev-server dla subprojeku `book_club_saas_3`:

```powershell
cd book_club_saas_3
npm install
npm run dev
```

Po uruchomieniu Next dev powinien wyświetlić informacje podobne do:
- Local: http://localhost:3000
- Network: http://<twoje-lokalne-ip>:3000

2) Otwórz przeglądarkę:

```powershell
# W PowerShell
Start-Process 'http://localhost:3000'
# lub jeśli Local nie działa, użyj pokazanej w logach adresacji Network:
Start-Process 'http://<twoje-lokalne-ip>:3000'
```

3) Jeśli nie masz pliku `.env`, skopiuj przykładowy plik i uzupełnij wartości (nie commituj sekretów):

```powershell
cd book_club_saas_3
copy .env.example .env
# edytuj .env i wstaw wartości (SUPABASE_URL, SUPABASE_ANON_KEY / SERVICE_ROLE_KEY, itp.)
```

4) Szybkie debugowanie problemów:
- Błąd „Nie można połączyć się z serwerem zdalnym” / `ERR_CONNECTION_REFUSED` — dev-server nie działał w momencie żądania. Uruchom `npm run dev` i sprawdź, czy pojawia się `Local: http://localhost:3000`.
- Jeśli `Local` pokazuje IP sieciowe (np. `http://10.0.2.211:3000`) — otwórz tę adresację zamiast `localhost`.
- Sprawdź, czy proces Node nasłuchuje na porcie 3000:

```powershell
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
# lub:
netstat -aon | Select-String ':3000'
```

- Jeśli port jest zajęty, znajdź PID i zabij proces:

```powershell
# jeśli masz PID np. 1234:
taskkill /PID 1234 /F
```

- Ostrzeżenie w logach o `experimental.turbopack` w `next.config.js` to informacja — nie blokuje uruchomienia.

5) Uruchamianie migracji (informacja):
- Najpierw wykonaj backup bazy:

```bash
pg_dump --format=custom -f backup.dump "$SUPABASE_DB_URL"
```

- Aby zastosować migracje za pomocą supabase CLI (wymaga zainstalowanego `supabase` lub użycia `npx`):

```bash
npx supabase db push --db-url "$SUPABASE_DB_URL"
```

Uwaga: uruchamianie migracji wymaga ustawionych zmiennych środowiskowych (np. `SUPABASE_DB_URL`) oraz odpowiednich sekretów w CI.

6) Najważniejsze pliki i lokalizacje:
- Strona główna: `book_club_saas_3/app/page.tsx` (renderuje `Header`, `Hero`, `FeatureCards`, `Footer`).
- Komponenty UI: `book_club_saas_3/app/components/`
- Przykładowe zmienne środowiskowe: `book_club_saas_3/.env.example`

7) Polecenia skrótowe (podsumowanie):

```powershell
cd book_club_saas_3
npm install
npm run dev
Start-Process 'http://localhost:3000'
```

Jeśli chcesz, mogę również:
- dodać w root `package.json` skrypt `dev:bookclub` uruchamiający powyższe kroki,
- przygotować szczegółową instrukcję uruchamiania migracji i tworzenia preview DB.

Plik zaktualizowano na podstawie ostatniej próby uruchomienia dev-servera i logów Next.js.

