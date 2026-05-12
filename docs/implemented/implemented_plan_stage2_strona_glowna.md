---
title: "Implemented Plan: stage2_strona_glowna"
plan: docs/plans/PLAN_stage2_strona_glowna.md
feature_key: stage2_strona_glowna
branches:
  intended: feature/landing-page-stage2
  present_local: main
pr_urls: {}
commits:
  head: d1c0828f
date: 2026-05-12
status: implemented
---

# Podsumowanie

Stage 2 został zrealizowany jako odświeżenie landing page'a BookClub Pro. Strona główna ma nowy układ, mocniejszy hero, dopracowany header i footer, poprawione metadane oraz spójniejsze globalne style. W trakcie dopracowania zmieniono także zakres widoku: sekcja `FeatureCards` została usunięta z renderu, a dodatkowy komunikat o dołączeniu do istniejącego klubu przeniesiono do opisu hero zgodnie z późniejszymi korektami copy.

## Zmiany w kodzie (zaimplementowane)

- `app/page.tsx` — landing składa się teraz z `Header`, `Hero` i `Footer`; sekcja `FeatureCards` nie jest już renderowana.
- `app/components/Header.tsx` — nowa, sticky nawigacja z linkami `Zaloguj` i `Zarejestruj się`.
- `app/components/Hero.tsx` — przebudowany hero z CTA, opisem wartości i trzema kartami metryk w nowym formacie typograficznym.
- `app/components/FeatureCards.tsx` — komponent pozostaje w repo, ale zwraca `null`, bo sekcja została usunięta z finalnego renderu.
- `app/components/Footer.tsx` — uproszczona stopka z linkami do logowania i rejestracji.
- `app/layout.tsx` — zaktualizowane metadata i `lang="pl"`.
- `app/globals.css` — nowe tło, kolory bazowe i poprawki font rendering.
- `tests/unit/header.test.tsx` — test dopasowany do nowego nagłówka i polskich etykiet.
- `tests/unit/homepage.test.tsx` — test landing page'a, CTA i regresji po usunięciu kart funkcji.
- `docs/plans/PLAN_stage2_strona_glowna.md` — plan stage 2 utworzony wcześniej i zrealizowany.

## Migracje

- Brak zmian w bazie danych.
- Nie uruchamiano `supabase db push` dla stage 2.

## Testy

- Unit: `npx vitest run tests/unit/header.test.tsx tests/unit/homepage.test.tsx` — pass.
- Unit: `npx vitest run tests/unit/homepage.test.tsx` — pass.
- Integration: brak osobnych testów integracyjnych dla tego stage.
- E2E: brak nowego pliku E2E; użyto weryfikacji lokalnej przez unit testy i kontrolę renderowania w komponencie.

## Acceptance E2E (krok po kroku)

1. W katalogu `Book-Club-Saas-3.0`:
```powershell
npm install
npm run dev
```

2. Otwórz `http://localhost:3000` i sprawdź:
- czy renderuje się odświeżony landing page,
- czy `Zarejestruj się` prowadzi do `/register`,
- czy `Zaloguj` prowadzi do `/login`,
- czy hero pokazuje opis z dopiskiem o dołączeniu do istniejącego klubu,
- czy nie renderuje się już sekcja feature cards.

## Deviations / PYTANIA

- Plan stage 2 zakładał sekcję feature cards, ale finalny UI po dopracowaniu nie renderuje już tej sekcji. Komponent pozostał w repo jako placeholder i zwraca `null`.
- Tekst o dołączeniu do istniejącego klubu został przeniesiony z CTA do opisu hero, aby przycisk rejestracji pozostał krótki i czytelny.
- Nie ma otwartych pytań blokujących tę implementację.

## Notes / Next steps

1. Jeśli stage 2 ma zostać rozwinięty dalej, kolejnym krokiem może być przywrócenie osobnej sekcji feature cards w odświeżonej wersji wizualnej.
2. Można dodać lekki smoke test E2E dla landing page'a, jeśli chcemy rozszerzyć pokrycie poza unit testy.
3. Następny etap funkcjonalny można budować bez zmian backendowych, bo landing nie wprowadza nowych zależności server-side.