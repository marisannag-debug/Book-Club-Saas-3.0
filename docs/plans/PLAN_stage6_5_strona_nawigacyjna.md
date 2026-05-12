---
title: "PLAN_stage6_5_strona_nawigacyjna"
status: draft
authors: ["AI (wygenerowane)"]
date: 2026-05-12
references:
  - docs/plans/mvp-file-structure-plan.md
  - docs/plans/mvp-stage-outline.md
  - docs/workflows/Agent-plany.md
  - app/components/Header.tsx
  - lib/auth.ts
  - lib/supabase.server.ts
---

# Stage 6.5 — Strona nawigacyjna

## 1. Cel
Stworzyć centralną stronę nawigacyjną, do której użytkownik trafia bezpośrednio po zalogowaniu. Strona umożliwia użytkownikowi łatwy dostęp do trzech głównych ścieżek: tworzenia nowego klubu, dołączania do istniejącego klubu oraz otworzenia klubu, którego jest już członkiem.

## 2. Zakres
### Wchodzi w zakres
- Nowa ruta `/dashboard` jako główna strona po zalogowaniu.
- Komponent `app/components/DashboardNav.tsx` z trzema kartami/przyciskami akcji.
- Pobranie listy klubów, które użytkownik już prowadzi/ma (server-side fetch).
- Prosta lista klubów jako karty/elements w komponencie lub oddzielny sub-komponent.
- Redyrekacja z `/login` na `/dashboard` po sukcesie logowania.
- Test jednostkowy dla renderowania `DashboardNav`.
- Smoke E2E dla wejścia i nawigacji z `/dashboard`.

### Nie wchodzi w zakres
- Implementacja pełnego panelu klubu (stage 7).
- Formularz tworzenia klubu (stage 8).
- Formularz dołączania do klubu i system zaproszeń (stage 10).
- Przeprojektowanie istniejących stron logowania i rejestracji.
- Zmiany schematów bazy poza minimalnym zapytaniem SELECT.

## 3. Wymagania funkcjonalne
- Strona `/dashboard` powinna być dostępna tylko dla zalogowanych użytkowników (protected route).
- Wyświetlić trzy główne opcje: "Utwórz nowy klub", "Dołącz do klubu" i "Moje kluby".
- Jeśli użytkownik ma już kluby, wyświetlić je jako listę z bezpośrednimi linkami do stron klubów.
- Karty akcji mają być jasne, nie zagmatwane i łatwe w nawigacji.
- Po zalogowaniu użytkownik powinien automatycznie trafić na `/dashboard` zamiast na stronę główną.
- Linki z dashboard mają prowadzić do właściwych stron (do określenia w stage 8, 10 i 7).

## 4. Wymagania niefunkcjonalne
- Wydajność: pobranie listy klubów nie powinno blokować renderowania głównego UI.
- Bezpieczeństwo: tylko zalogowany użytkownik może widzieć `/dashboard` i swoją listę klubów.
- Dostępność: prawidłowa hierarchia nagłówków, semantic HTML, alt-texty dla ikon, dostępne do klawiatury karty.
- UX: czytelny layout, wyraźne CTA, responsive design, brak rozpraszaczy.

## 5. Kontekst techniczny
- Komponenty: 
  - `app/dashboard/page.tsx` (nowa ruta)
  - `app/components/DashboardNav.tsx` (nowy komponent karty akcji)
  - `app/components/ClubCard.tsx` (nowy komponent dla listy klubów, opcjonalnie)
- Logika: 
  - Protected route — middleware albo server check w `page.tsx`.
  - Server-side fetch listy klubów z Supabase za pośrednictwem `lib/supabase.server.ts`.
  - Mapper dla danych klubów na UI.
- Dane i DB:
  - Zapytanie SELECT do tabeli `clubs` filtrując po `user_id` (z auth context).
  - Zapytanie SELECT do tabeli `club_members` dla sprawdzenia roli/statusu (opcjonalnie dla stage 6.5).
  - Nie dodawać nowych tabel dla tego stage.
- Testy: Vitest + React Testing Library dla unit testów, Playwright dla smoke E2E.

## Preconditions
- Branch roboczy utworzony od `main` albo `rejestracja_i_logowanie`.
- Zalogowany użytkownik ma dostęp do Supabase auth i potrafi pobrać swoje user ID.
- Istniejące tabele `clubs` i `club_members` są w bazie (lub będą dodane w stage 8/10, ale dla stage 6.5 zakładamy ich obecność do testowania).
- Zmienne env mają wszystkie klucze Supabase (por. `.env.example`).
- Middleware lub server-side auth sprawdzenie jest już zaimplementowane (z stage 5).

## 6. Kroki implementacji

### 6.1 Frontend
1. **Utwórz nową stronę** `app/dashboard/page.tsx` jako protected route.
   - Sprawdzenie autentykacji: pobranie aktualnego użytkownika z Supabase auth.
   - Jeśli brak zalogowania, redirect na `/login`.
   - Jeśli zalogowany, pobrać dane użytkownika (ID) do serverFS getServerSideProps albo server component.

2. **Utwórz komponent** `app/components/DashboardNav.tsx` z trzema kartami:
   - Karta "Utwórz nowy klub" → link do `/club/create` (stage 8).
   - Karta "Dołącz do klubu" → link do `/club/join` albo modal (stage 10).
   - Sekcja "Moje kluby" → lista klubów z linkami do `/club/[id]` (stage 7).

3. **Utwórz opcjonalny komponent** `app/components/ClubCard.tsx` do wyświetlania każdego klubu.
   - Wyświetlić nazwę klubu, opis, liczbę członków (opcjonalnie).
   - Link do `/club/[id]` do pełnego widoku klubu.

4. **Integracja danych** w `app/dashboard/page.tsx`:
   - Server-side: pobrać listę klubów użytkownika z `lib/supabase.server.ts`.
   - Przekazać listę do komponentu `DashboardNav`.
   - Fallback: jeśli brak klubów, wyświetlić komunikat "Nie masz jeszcze klubów" z zachętą do tworzenia.

5. **Aktualizacja logowania** (stage 4, ale przeniesienie tutaj dla jasności):
   - Po sukcesnym logowaniu, zamiast redirect na `/` lub `/page`, redirect na `/dashboard`.

6. **Testy jednostkowe** w `tests/unit/dashboard-nav.test.tsx`:
   - Render komponentu z pustą listą klubów.
   - Render komponentu z przykładową listą 2-3 klubów.
   - Sprawdzenie obecności trzech głównych opcji (Utwórz, Dołącz, Moje kluby).
   - Sprawdzenie dostępności (labele, role przycisków).

### 6.2 Backend
1. **Zapytanie SELECT** do tabeli `clubs`:
   ```sql
   SELECT id, name, description, created_at 
   FROM clubs 
   WHERE created_by = ? 
   ORDER BY created_at DESC;
   ```

2. **Zapytanie SELECT** do tabeli `club_members` (opcjonalnie dla stage 6.5):
   ```sql
   SELECT cm.club_id, c.name, c.description, cm.role 
   FROM club_members cm 
   JOIN clubs c ON cm.club_id = c.id 
   WHERE cm.user_id = ? AND cm.status = 'active'
   ORDER BY cm.joined_at DESC;
   ```

3. **Helper w `lib/supabase.server.ts`**:
   - Funkcja `getClubsByUser(userId: string)` zwracająca listę klubów.
   - Obsługa błędów: jeśli brak dostępu, zwrócić pustą listę zamiast rzucać błąd.

4. **Brak nowych migracji SQL** dla stage 6.5.
   - Założenie: tabele `clubs`, `club_members` będą dostępne w stage 7-8, ale dla stage 6.5 można ich jeszcze nie mieć (fallback na puste listy).

5. **Jeśli potrzeba protected route**:
   - Middleware w Next.js (np. `lib/middleware.ts`) lub server check w `page.tsx`.
   - Weryfikacja, że cookie/token autentykacji istnieje i jest ważny.

### 6.3 Minimalny podział pracy
- 1x frontend dev: layout dashboard, komponenty, routing, testy UI.
- 1x backend/fullstack dev: protected route, server-side fetch, helper Supabase, query SELECT.

## 7. Rekomendowana kolejność prac
1. Najpierw utwórz `app/dashboard/page.tsx` z básową autentykacją i stub UI.
2. Następnie zbuduj komponent `DashboardNav.tsx` z trzema kartami i stub listą klubów.
3. Integruj real dane z Supabase (helper w `lib/supabase.server.ts`).
4. Aktualizuj redirecta w logowaniu, aby trafiał na `/dashboard`.
5. Dodaj testy jednostkowe dla dostępności i renderowania.
6. Na końcu dopracuj Smoke E2E dla całego flow: login → dashboard → nawigacja.

## 8. `.env.example`
Nie są potrzebne nowe zmienne środowiskowe dla stage 6.5. Plik powinien zawierać wszystkie zmienne z stage 5:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_DB_URL=
NEXT_PUBLIC_APP_ENV=development
```

## 9. Komendy lokalne
```powershell
# Uruchomienie aplikacji w deweloperskim trybie
npm run dev
```

```powershell
# Uruchomienie testów jednostkowych
npm run test
```

```powershell
# Uruchomienie lintingu
npm run lint
```

```powershell
# Smoke E2E test dla dashboard (jeśli test istnieje)
npx playwright test tests/e2e/dashboard.spec.ts --headed
```

## 10. Zmiany DB / migracje
Brak nowych migracji SQL dla stage 6.5. 

**Założenie**: Tabele `clubs` i `club_members` będą tworzone w stage 7-8. Na potrzeby stage 6.5, komponent `DashboardNav` może pracować z pustą listą klubów (fallback).

Jeśli chcemy testować z rzeczywistymi danymi klubów lokalnie, trzeba wcześniej uruchomić migracje z stage 7-8.

## 11. Branch, commit i PR
- Branch: `feature/dashboard-navigation-stage6-5`
- Commit: `docs(plans): add PLAN_stage6_5_strona_nawigacyjna.md`
- PR title: `PLAN: stage 6.5 dashboard navigation page`

## 12. Kryteria akceptacji
- Strona `/dashboard` renderuje bez błędów i jest dostępna tylko dla zalogowanych użytkowników.
- Wyświetlane są trzy główne opcje: "Utwórz nowy klub", "Dołącz do klubu", "Moje kluby".
- Linki z dashboard prowadzą do prawidłowych tras (do uzupełnienia w stage 7-10).
- Jeśli użytkownik ma kluby, są wyświetlone jako lista z linkami do `/club/[id]`.
- Po zalogowaniu użytkownik trafia na `/dashboard` zamiast na `/`.
- Testy jednostkowe przechodzą dla `DashboardNav` i dostępności.
- Smoke E2E potwierdza: login → redirect na `/dashboard` → widoczne opcje nawigacji.

## 13. Testy
### Unit tests (`tests/unit/dashboard-nav.test.tsx`)
- Render komponentu `DashboardNav` z pustą listą klubów.
- Render komponentu z 2-3 przykładowymi klubami.
- Sprawdzenie obecności trzech głównych przycisków/kart.
- Sprawdzenie, że nazwy klubów są wyświetlone.
- Asercje dostępności: labele przycisków, role, tabulacja.

### Integration test (`tests/unit/dashboard.page.test.tsx`)
- Render `app/dashboard/page.tsx` z mockowanym auth kontextem.
- Sprawdzenie, że nielogowany użytkownik nie widzi dashboard (redirect).
- Sprawdzenie, że zalogowany użytkownik widzi dashboard i trzy opcje.

### Smoke E2E (`tests/e2e/dashboard.spec.ts`)
- Login na istniejące konto testowe.
- Weryfikacja redirecta na `/dashboard`.
- Sprawdzenie widoczności trzech głównych sekcji.
- Kliknięcie w "Moje kluby" i sprawdzenie, czy lista klubów się wyświetla.

## 14. Acceptance E2E test (krok po kroku)

### Scenariusz 1: Zalogowany użytkownik bez klubów
```powershell
# 1. Uruchomić app w dev mode
npm run dev

# 2. W przeglądarce: http://localhost:3000/login
# Zalogować się na testowe konto bez klubów

# 3. Powinien być redirect na http://localhost:3000/dashboard
# 4. Powinny być widoczne trzy karty akcji
# 5. Sekcja "Moje kluby" powinna pokazać komunikat "Nie masz jeszcze klubów"
```

### Scenariusz 2: Zalogowany użytkownik z klubami
```powershell
# 1. Zalogować się na konto z co najmniej jednym klubem
# 2. Wejść na /dashboard
# 3. W sekcji "Moje kluby" powinna być lista klubów
# 4. Kliknąć na dowolny klub
# 5. Powinien być redirect na /club/[id] (jeśli stage 7 jest już wdrożony)
```

### Scenariusz 3: Nielogowany użytkownik
```powershell
# 1. Wejść na http://localhost:3000/dashboard bez zalogowania
# 2. Powinien być redirect na http://localhost:3000/login
```

### Automatyczne testy E2E (Playwright)
```powershell
# Jeśli test E2E istnieje
npx playwright test tests/e2e/dashboard.spec.ts --headed

# Pełny suite E2E z auth flow
npx playwright test tests/e2e/auth.spec.ts tests/e2e/dashboard.spec.ts --headed
```

## 15. Gotowe do review?
Checklist przed push:
- [ ] Preconditions są jasno opisane (zmienne env, auth context).
- [ ] Kroki implementacji obejmują frontend, backend i testy.
- [ ] Brak nowych migracji SQL jest uzasadniony.
- [ ] `.env.example` nie wymagaje zmian.
- [ ] Komendy lokalne są konkretne i przetestowane na Windows/PowerShell.
- [ ] Acceptance E2E ma krok-po-kroku scenariusze.
- [ ] Kryteria akceptacji są mierzalne.
- [ ] PYTANIA / ZAŁOŻENIA są wskazane.

## 16. PYTANIA / ZAŁOŻENIA

### Założenia
- **Assumption 1**: Tabele `clubs` i `club_members` będą dostępne w stage 7-8. Na potrzeby stage 6.5, fallback to pusta lista jest OK.
- **Assumption 2**: Protected route można zaimplementować prostym server-side check w `app/dashboard/page.tsx`, bez dodatkowego middleware (jeśli stage 5 auth jest już gotowy).
- **Assumption 3**: Redyrekta z `/login` na `/dashboard` będzie zrobiona w stage 4 update albo tutaj w 6.5 (do wyjaśnienia).
- **Assumption 4**: Linki z dashboard do `/club/create`, `/club/join` i `/club/[id]` będą dostępne w stage 7-10 (OK jeśli linki nie zadziałają teraz).

### Otwarte pytania
1. **Czy użytkownik powinien mieć osobny widok dla "klubów, które prowadzi" vs. "klubów, do których dołączył"?**
   - PROPOZYCJA: Na początek wyświetlić razem wszystkie kluby, do których użytkownik ma dostęp (created_by LUB member status = active).

2. **Czy trzeba pokazać role użytkownika w każdym klubie (owner vs. member)?**
   - PROPOZYCJA: Nie dla stage 6.5. Role będą ważne w stage 9.

3. **Czy dashboard powinien zawierać statystyki (liczba klubów, ostatnia aktywność)?**
   - PROPOZYCJA: Nie dla stage 6.5. Statystyki to etap stage 17. Stage 6.5 to czysta nawigacja.

4. **Czy "Dołącz do klubu" powinien otworzyć modal, formularz czy nową stronę?**
   - PROPOZYCJA: Na początek: link do `/club/join` (nowa strona). Modal albo inline form w stage 10.

---

## Notatki implementacyjne
- Struktura `app/dashboard/page.tsx` powinna być lean i focus na nawigację, a nie na logikę biznesową.
- Komponent `DashboardNav.tsx` powinien być reusable, jeśli będzie potrzebny w innych miejscach.
- Jeśli lista klubów się ładuje asynchronicznie, dodać loading state i error fallback.
- Test E2E może być prosty: wystarczy zalogowanie + sprawdzenie trzech przycisków.

---

