---
title: "PLAN_stage7_strona_klubu"
status: draft
authors: ["AI (wygenerowane)"]
date: 2026-05-12
references:
  - docs/plans/mvp-file-structure-plan.md
  - docs/plans/mvp-stage-outline.md
  - docs/workflows/Agent-plany.md
  - docs/architecture/01-makiety.md
  - docs/business/bookclub-pro-user-journey-map.md
  - app/club/[id]/page.tsx
  - app/dashboard/page.tsx
  - app/components/DashboardNav.tsx
---

# Stage 7 — Strona klubu

## 1. Cel
Stworzyć centralny dashboard klubu, czyli ekran pod adresem `/club/[id]`, na którym członek lub organizator widzi najważniejsze informacje i szybkie akcje: aktywne głosowanie, najbliższe spotkanie oraz zaproszenie kolejnych osób. Stage 7 ma zastąpić tymczasowy ekran z `app/club/[id]/page.tsx` pełnym, spójnym shell’em klubu zgodnym z makietą S004.

## 2. Zakres
### Wchodzi w zakres
- Nowa, właściwa strona klubu w `app/club/[id]/page.tsx`.
- Layout dla obszaru klubu w `app/club/[id]/layout.tsx`.
- Zestaw komponentów dashboardu w `app/components/ClubDashboard/`.
- Widok nagłówka klubu z nazwą, krótkim opisem i prostą nawigacją powrotną.
- Trzy główne sekcje dashboardu: `Active voting`, `Next meeting`, `Invite members`.
- Stany pusty, loading i not found / access denied dla nieprawidłowego dostępu do klubu.
- Minimalne testy jednostkowe dla komponentów dashboardu i smoke E2E dla wejścia na stronę klubu.

### Nie wchodzi w zakres
- Tworzenie klubu jako osobny flow formularza.
- Role członka i prowadzącego.
- System zaproszeń e-mail i kodów zaproszeń.
- CRUD głosowań, spotkań i członkostwa.
- Prosty chat oraz powiadomienia e-mail.
- Rozbudowa schematu bazy danych o pełny model domenowy klubu, jeśli nie jest jeszcze potrzebny do samego shell’a dashboardu.

## 3. Wymagania funkcjonalne
- Strona `/club/[id]` ma pokazywać nazwę klubu, krótki opis i podstawowe metadane, jeśli są dostępne.
- Dashboard ma prezentować trzy główne karty akcji: aktywne głosowanie, najbliższe spotkanie i zaproszenie członków.
- Każda karta ma mieć jasny stan pusty, gdy odpowiedni fragment danych nie istnieje jeszcze w klubie.
- Użytkownik ma mieć szybki powrót do listy klubów lub dashboardu nawigacyjnego.
- Jeśli użytkownik nie ma dostępu do klubu, strona ma pokazać czytelny stan access denied albo not found.
- Layout ma być gotowy pod przyszłe rozszerzenia bez przebudowy całego ekranu.

## 4. Wymagania niefunkcjonalne
- Wydajność: strona ma renderować się szybko, z minimalną liczbą danych pobieranych server-side.
- Bezpieczeństwo: dostęp do danych klubu ma być ograniczony do użytkownika zalogowanego i uprawnionego do oglądania danego klubu.
- UX: priorytetem jest czytelny podział na sekcje, szybkie CTA i brak przeładowania treścią.
- Dostępność: karty i akcje mają być obsługiwalne klawiaturą, a komunikaty pustych stanów muszą być zrozumiałe dla czytników ekranu.
- Utrzymanie: komponenty dashboardu mają być małe, nazwane po domenie i łatwe do rozszerzenia w stage 8-14.

## 5. Kontekst techniczny
- Komponenty: `app/club/[id]/page.tsx`, `app/club/[id]/layout.tsx`, nowy katalog `app/components/ClubDashboard/`.
- UI contract: `ClubDashboardHeader`, `ClubStatsGrid`, `ActiveVotingCard`, `NextMeetingCard`, `InviteMembersCard`, albo równoważny zestaw komponentów.
- Dane: read-only view model klubu, np. `{ id, name, description, memberCount, activeVoting, nextMeeting, inviteState }`.
- Backend: minimalny helper server-side, np. w `lib/supabase.server.ts` albo nowym helperze domenowym w `lib/`, który zwraca dane dashboardu dla danego `clubId`.
- Testy: Vitest + React Testing Library dla komponentów oraz Playwright dla smoke E2E.
- Integracje przyszłe: linki z dashboardu mają prowadzić do stage 8, 10, 12 i 14 bez zmiany struktury samego club shell’a.

## Preconditions
- Branch roboczy utworzony od `main`.
- Istnieje tymczasowy ekran klubowy w `app/club/[id]/page.tsx`, który można zastąpić.
- Zmienne Supabase z `.env.example` są dostępne lokalnie.
- Zespół akceptuje, że stage 7 buduje shell dashboardu i read-only kontrakt, a nie pełny model tworzenia i zarządzania klubem.
- Dostępne jest lokalne środowisko testowe dla Next.js i Playwright.

## 6. Kroki implementacji
### 6.1 Frontend
1. Zastąpić tymczasowy ekran w `app/club/[id]/page.tsx` pełnym układem dashboardu klubu.
2. Dodać `app/club/[id]/layout.tsx`, aby zapewnić spójny shell, właściwe odstępy, nagłówek i prostą nawigację.
3. Utworzyć katalog `app/components/ClubDashboard/` i przenieść do niego logikę sekcji dashboardu.
4. Zbudować główny widok z trzema kartami: aktywne głosowanie, najbliższe spotkanie i zaproszenie członków.
5. Dodać stany pusty i fallback, np. komunikat o braku aktywnego głosowania albo braku zaplanowanego spotkania.
6. Zapewnić czytelny link powrotny do `/dashboard` oraz spójne CTA do przyszłych etapów.
7. Dodać testy jednostkowe dla renderowania kart, stanów pustych i podstawowej dostępności.

### 6.2 Backend
1. Ustalić minimalny read-only kontrakt danych klubu, który dostarcza nazwę, opis i metadane potrzebne do dashboardu.
2. Jeśli dane nie są jeszcze dostępne w Supabase, użyć kontrolowanego mocka lub adaptera testowego zamiast wprowadzać nowe tabele tylko na potrzeby shell’a.
3. Jeżeli backend już posiada odpowiedni model klubu, pobierać dane serwerowo tylko dla jednego `clubId` i tylko w zakresie potrzebnym do renderu.
4. Nie dodawać operacji zapisu, migracji ani polityk RLS w stage 7, jeśli nie są one bezpośrednio wymagane przez sam dashboard.
5. Przygotować kontrakt, który później można rozszerzyć o stage 8-14 bez zmiany API komponentów.

### 6.3 Minimalny podział pracy
- 1x frontend dev: layout klubu, sekcje dashboardu, stany pusty i fallback.
- 1x backend/fullstack dev: read-only kontrakt danych klubu, helper server-side i mocki testowe.

## 7. Rekomendowana kolejność prac
1. Najpierw zastąpić placeholder w `app/club/[id]/page.tsx` podstawowym shell’em i layoutem.
2. Następnie zbudować komponenty kart dashboardu w `app/components/ClubDashboard/`.
3. Potem podłączyć read-only kontrakt danych lub mock adapter, żeby UI nie był sztywny względem danych.
4. Na końcu dopiąć testy jednostkowe i smoke E2E dla wejścia na stronę klubu.

## 8. `.env.example`
Stage 7 nie wymaga nowych zmiennych środowiskowych. Plik wzorcowy powinien nadal zawierać zmienne używane przez wcześniejsze etapy.

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
npm run dev
npm run lint
npm run test
npx playwright test tests/e2e/club-dashboard.spec.ts --headed
npm run build
```

```bash
npm install
npm run dev
npm run lint
npm run test
npx playwright test tests/e2e/club-dashboard.spec.ts --headed
npm run build
```

## 10. Zmiany DB / migracje
Stage 7 nie wymaga nowych migracji SQL. Jeśli do renderowania dashboardu okaże się potrzebny istniejący model klubu, należy podłączyć go read-only i odłożyć wszelkie zmiany schematu do późniejszych stage’ów.

## 11. Branch, commit i PR
- Branch: `feature/plans/PLAN_stage7_strona_klubu`
- Commit: `docs(plans): add PLAN_stage7_strona_klubu.md`
- PR title: `PLAN: stage 7 strona klubu — implementation plan`

## 12. Kryteria akceptacji
- Istnieje osobny plan stage 7 zapisany w `docs/plans/`.
- Plan odnosi się do dashboardu klubu, a nie do tworzenia klubu.
- Zakres obejmuje layout, trzy karty dashboardu i stany pusty / access denied.
- Plan nie wprowadza niepotrzebnych migracji ani zapisów do bazy.
- Zdefiniowano podział na frontend i backend/testy oraz kolejność prac.
- Komendy lokalne, `.env.example`, branch i PR title są opisane.

## 13. Testy
- Unit: render `ClubDashboardHeader` i kart dashboardu z danymi oraz bez danych.
- Unit: sprawdzenie stanów pustych i fallbacków dla aktywnego głosowania oraz najbliższego spotkania.
- Unit: test dostępności podstawowych CTA i linku powrotnego do `/dashboard`.
- E2E: smoke dla wejścia na `/club/[id]` z zalogowanym użytkownikiem.
- E2E: scenariusz access denied lub not found dla nieuprawnionego wejścia na klub.

## 14. Acceptance E2E test (krok po kroku)
```powershell
npm run dev
```

```powershell
npx playwright test tests/e2e/club-dashboard.spec.ts
```

```powershell
npx playwright test tests/e2e/club-dashboard.spec.ts --headed
```

```bash
npm run dev
```

```bash
npx playwright test tests/e2e/club-dashboard.spec.ts
```

```bash
npx playwright test tests/e2e/club-dashboard.spec.ts --headed
```

Kroki ręczne do potwierdzenia:
1. Otworzyć `/club/[id]` dla istniejącego klubu.
2. Sprawdzić, że widoczne są trzy główne sekcje dashboardu.
3. Potwierdzić, że brak danych dla aktywnego głosowania lub spotkania pokazuje czytelny stan pusty.
4. Kliknąć link powrotny i wrócić do `/dashboard`.
5. Wejść na nieprawidłowy `clubId` i potwierdzić stan access denied lub not found.

## 15. Gotowe do review?
- Preconditions są opisane.
- Kroki implementacji obejmują frontend, backend i testy.
- Nie ma zbędnych migracji ani write-pathów.
- Acceptance E2E ma kopiowalne komendy.
- Branch, commit i PR title są zdefiniowane.

## 16. PYTANIA / ZAŁOŻENIA
- Założenie: stage 7 dowozi shell dashboardu klubu, a nie pełny system zarządzania klubem. PROPOZYCJA: ograniczyć zakres do odczytu i nawigacji.
- Założenie: dane dashboardu mogą być chwilowo mockowane, jeśli model bazy nie jest jeszcze gotowy. PROPOZYCJA: nie dodawać migracji tylko po to, żeby wyrenderować UI.
- Założenie: aktywne głosowanie, najbliższe spotkanie i zaproszenie członków są kartami summary, nie pełnymi workflowami. PROPOZYCJA: zostawić pełne operacje na stage 8-14.