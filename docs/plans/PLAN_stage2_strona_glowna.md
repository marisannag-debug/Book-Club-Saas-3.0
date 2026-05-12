---
title: "PLAN_stage2_strona_glowna"
status: draft
authors: ["AI (wygenerowane)"]
date: 2026-05-12
references:
  - docs/plans/mvp-file-structure-plan.md
  - docs/plans/mvp-stage-outline.md
  - docs/architecture/01-makiety.md
  - docs/business/bookclub-pro-user-journey-map.md
---

# Stage 2 — Strona główna

## 1. Cel
Zbudować landing page, który jasno komunikuje wartość BookClub Pro, prowadzi użytkownika do rejestracji i wspiera szybkie przejście do dalszych etapów MVP.

## 2. Zakres
### Wchodzi w zakres
- Aktualizacja strony głównej w `app/page.tsx`.
- Dopracowanie sekcji `Header`, `Hero`, `FeatureCards` i `Footer`.
- Uporządkowanie CTA tak, aby prowadziło do `/register` jako primary action.
- Weryfikacja podstawowego renderowania i nawigacji na desktopie oraz mobile.

### Nie wchodzi w zakres
- Logika rejestracji i logowania.
- Zmiany w Supabase, schematach DB i politykach RLS.
- Panel klubu, tworzenie klubu i dalsze flow MVP.

## 3. Wymagania funkcjonalne
- Strona główna musi renderować pełny landing zgodny z makietą S001.
- Primary CTA ma prowadzić do `/register`.
- Secondary CTA ma prowadzić do `/login`.
- Sekcja feature cards ma prezentować 3 kluczowe korzyści produktu.
- Layout ma być czytelny, responsywny i spójny wizualnie z resztą aplikacji.

## 4. Wymagania niefunkcjonalne
- Wydajność: brak ciężkich zależności, brak zbędnego client-side state.
- Dostępność: poprawna hierarchia nagłówków, czytelny focus, kontrast i semantyczne linki.
- UX: CTA widoczne bez przewijania, krótki komunikat wartości, brak rozpraszaczy.
- Bezpieczeństwo: bez sekretów po stronie UI, bez nowych endpointów API.

## 5. Kontekst techniczny
- Komponenty: `app/page.tsx`, `app/components/Header.tsx`, `app/components/Hero.tsx`, `app/components/FeatureCards.tsx`, `app/components/Footer.tsx`.
- Nawigacja: linki do `/register` i `/login`.
- Dane: brak nowych tabel i brak migracji SQL.
- Testy: istniejące testy unit można rozszerzyć o sprawdzenie renderowania landing page i CTA.

## Preconditions
- Branch roboczy utworzony od `main`.
- Dostępne środowisko lokalne z działającym `npm install`.
- Istniejące trasy `/register` i `/login` są dostępne do linkowania.
- Brak blokujących zmian w Supabase dla tego stage.

## 6. Kroki implementacji
### 6.1 Frontend
1. Uporządkować strukturę `app/page.tsx`, tak aby składała landing z istniejących komponentów.
2. Dopracować `Header` pod landing: logo, linki nawigacyjne i wyraźne CTA.
3. Przebudować `Hero` tak, aby zawierał mocniejszy headline, krótki opis wartości i dwa przyciski akcji.
4. Uczytelnić `FeatureCards` jako trzy wyraźne korzyści MVP.
5. Uporządkować `Footer` pod prosty marketingowy landing.
6. Dodać podstawowe testy renderowania dla strony głównej i kluczowych CTA.

### 6.2 Backend
1. Nie dodawać nowych endpointów ani migracji.
2. Utrzymać aktualne placeholdery backendowe bez zmian, jeśli landing nie wymaga integracji.
3. Zweryfikować, że brak nowych zależności backendowych nie blokuje deployu.

### 6.3 Minimalny podział pracy
- 1x frontend dev: layout, copy, CTA, responsywność, testy UI.
- 0.5x backend dev: tylko walidacja, że stage nie wymaga nowych zależności server-side.

## 7. Rekomendowana kolejność prac
1. Najpierw odświeżyć `Hero` i CTA, bo to główny punkt wejścia z makiety S001.
2. Następnie uporządkować `Header` i `FeatureCards`, żeby landing miał pełną strukturę komunikacyjną.
3. Na końcu dopracować `Footer`, responsywność i testy.

## 8. `.env.example`
Nie są potrzebne nowe zmienne środowiskowe dla stage 2. Jeśli plik `.env.example` już istnieje, nie dodawać do niego nowych wpisów wyłącznie na potrzeby landingu.

## 9. Komendy lokalne
```powershell
npm run dev
```

```powershell
npm run test
```

```powershell
npm run lint
```

## 10. Zmiany DB / migracje
Brak zmian w bazie danych. Nie uruchamiać `supabase db push` dla tego stage.

## 11. Branch, commit i PR
- Branch: `feature/landing-page-stage2`
- Commit: `docs(plans): add PLAN_stage2_strona_glowna.md`
- PR title: `PLAN: stage 2 landing page`

## 12. Kryteria akceptacji
- Strona główna renderuje komplet sekcji landingu bez błędów.
- Primary CTA prowadzi do `/register`.
- Secondary CTA prowadzi do `/login`.
- Układ jest czytelny na desktopie i mobile.
- Testy dla landingu przechodzą lokalnie.

## 13. Testy
- Unit: render `app/page.tsx` i sprawdzenie obecności CTA oraz 3 feature cards.
- Integracyjne: sprawdzenie, że linki z nagłówka i hero prowadzą do poprawnych tras.
- Smoke UI: szybka walidacja layoutu po uruchomieniu aplikacji lokalnie.

## 14. Acceptance E2E test (krok po kroku)
```powershell
npm run dev
```

```powershell
npx playwright test tests/e2e/landing.spec.ts
```

```powershell
npx playwright test tests/e2e/landing.spec.ts --headed
```

Jeśli test E2E dla landingu nie istnieje jeszcze w repo, najpierw dodać go jako prosty smoke test: wejście na `/`, weryfikacja nagłówka, hero, feature cards i kliknięcie CTA do `/register`.

## 15. Gotowe do review?
- Preconditions są opisane i nie wymagają nowych sekretów.
- Kroki implementacji obejmują frontend i jawnie wykluczają backend.
- Brak zmian DB i brak potrzeby migracji są jasno zapisane.
- Acceptance E2E ma konkretne komendy do uruchomienia.
- Testy i kryteria akceptacji są zgodne z zakresem stage 2.

## 16. PYTANIA / ZAŁOŻENIA
- Założenie: landing page ma zostać oparty na istniejących komponentach w `app/components/`, bez przenoszenia ich do nowej warstwy design systemu.
- Założenie: CTA primary ma prowadzić bezpośrednio do rejestracji, a nie do dodatkowego onboarding flow.
- Założenie: stage 2 nie wymaga dodatkowych danych marketingowych ani sekcji pricing.