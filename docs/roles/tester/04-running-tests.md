---
title: "Instrukcja przeprowadzenia testów"
description: "Krok po kroku: jak uruchomić unit testy, E2E testy, debugować wolne ładowanie i troubleshootować błędy"
status: draft
version: 0.1
authors: ["Tester"]
date: 2026-05-12
---

# Instrukcja przeprowadzenia testów — BookClub Pro

Dokument opisuje jak uruchamiać testy lokalne, na CI/CD, debugować problemy wydajnościowe i interpretować wyniki.

## Spis treści
1. [Konfiguracja wstępna](#konfiguracja-wstępna)
2. [Unit testy (Vitest)](#unit-testy-vitest)
3. [E2E testy (Playwright)](#e2e-testy-playwright)
4. [Debugging powolnego ładowania](#debugging-powolnego-ładowania)
5. [Troubleshooting](#troubleshooting)
6. [Best practices](#best-practices)

---

## Konfiguracja wstępna

### 1. Zainstaluj zależności
```bash
npm install
```

Weryfikacja: sprawdź czy są zainstalowane `vitest` i `@playwright/test`
```bash
npm ls vitest @playwright/test
```

### 2. Przygotuj zmienne środowiskowe
Testy mogą wymagać zmiennych env dla Supabase (E2E) lub API.

Plik `.env.local` lub `.env.test.local`:
```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321      # dla lokalnego Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-test-key
SUPABASE_DB_URL=postgresql://...  # jeśli potrzeba (integration tests)
```

Jeśli testujesz bez backendu: możesz użyć wartości mockowych, gdyż unit testy używają jsdom zamiast przeglądarki.

### 3. Upewnij się, że kod się buduje
```bash
npm run build
```

Jeśli build się nie powiodzie: testy też się nie uruchomią (Next.js setup faza).

---

## Unit testy (Vitest)

### Uruchomienie wszystkich unit testów
```bash
npm test
```

**Co się dzieje:**
- Vitest skanuje `tests/unit/**/*.test.ts` i `tests/unit/**/*.test.tsx`
- Uruchamia je w środowisku `jsdom` (symulacja DOM)
- Raportuje wyniki + coverage (jeśli skonfigurowany)

### Uruchomienie pojedynczego testu
```bash
npm test -- auth.test.ts
```

### Uruchomienie z watch mode (podczas development)
```bash
npm test -- --watch
```

### Uruchomienie z verbose output (więcej informacji)
```bash
npm test -- --reporter=verbose
```

### Uruchomienie z coverage report
```bash
npm test -- --coverage
```

### Oczekiwane wyniki ✅

Dla obecnych testów (`auth.test.ts`, `header.test.tsx`):
```
✓ tests/unit/auth.test.ts (X passes)
✓ tests/unit/header.test.tsx (Y passes)

Test Files  2 passed (2)
Tests      X passed (X)
```

---

## E2E testy (Playwright)

### Warunki wstępne
- Dev server musi działać LUB Playwright będzie go startować automatycznie
- Port `3000` musi być dostępny
- Przeglądarki (Chromium, Firefox, WebKit) będą pobrane automatycznie przy pierwszym uruchomieniu

### Uruchomienie wszystkich E2E testów
```bash
npm run test:e2e
```

**Co się dzieje:**
1. Playwright uruchamia `npm run dev` (Next.js dev server)
2. Czeka na dostępność `http://127.0.0.1:3000`
3. Skanuje `tests/e2e/**/*.spec.ts`
4. Uruchamia każdy test w przeglądarce (domyślnie Chromium)
5. Raportuje wyniki

### Uruchomienie pojedynczego testu
```bash
npm run test:e2e -- auth.spec.ts
```

### Uruchomienie w UI mode (wizualne)
```bash
npx playwright test --ui
```

Pozwala obserwować i debugować testy w realtime — **bardzo przydatne do nauki i troubleshootingu**.

### Uruchomienie w headless mode (bez GUI)
```bash
npm run test:e2e
```

### Uruchomienie tylko w przeglądarce Chromium
```bash
npx playwright test --project=chromium
```

### Debug mode - krok po kroku
```bash
npx playwright test --debug
```

Uruchamia Playwright Inspector — możesz przejść przez każdy krok testu.

### Oczekiwane wyniki ✅

Dla `auth.spec.ts`:
```
✓ tests/e2e/auth.spec.ts (X passes)
  ✓ /register - should render register form
  ✓ /register - should submit and redirect
  ✓ /login - should render login form
  ✓ /login - should handle login

Test Files  1 passed (1)
Tests      X passed (X)
```

---

## Debugging powolnego ładowania

### Problem: Testy trwają zbyt długo (>30s dla unit, >2min dla E2E)

#### Krok 1: Sprawdź gdzie jest "czekanie"

**Dla unit testów:**
```bash
npm test -- --reporter=verbose 2>&1 | tee test-log.txt
```

Szukaj linii z czasami `[XXms]` — które testy trwają najdłużej?

```bash
# Profil setup time
npm test -- --reporter=verbose --globals false
```

**Dla E2E:**
```bash
npm run test:e2e -- --reporter=verbose
```

Szukaj:
- `Starting dev server...` — Playwright startuje Next.js dev server (może trwać 10-30s)
- `Timeout waiting for "http://127.0.0.1:3000"...` — serwer się nie startuje
- Indywidualne testy (sprawdź Playwright Trace, patrz niżej)

#### Krok 2: Profil dev server startup (E2E)

Dev server musi załadować Next.js + Tailwind. Jeśli trwa dłużej niż 15s:

```bash
# Uruchom dev server ręcznie i sprawdź logi
npm run dev
```

Szukaj wiadomości takich jak:
```
▲ Next.js 16.2.4
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

Jeśli brakuje, może być problem z build:

```bash
npm run build
# Sprawdź czy kompilacja się nie zawiesi
```

#### Krok 3: Profil setup files (unit tests)

Vitest ładuje `vitest.setup.ts` przed każdym testem:

```bash
cat vitest.setup.ts
```

Jeśli import `@testing-library/jest-dom` trwa długo:

```bash
# Zamiast tego:
npm test

# Spróbuj bez globalnych fixtures:
npm test -- --globals false
```

#### Krok 4: Zbierz Playwright Trace (E2E)

Trace pokazuje dokładnie gdzie test się zawiesza:

1. Włącz trace w `playwright.config.ts`:
```typescript
use: {
  trace: 'on-first-retry',  // lub 'on' (zawsze)
}
```

2. Uruchom test:
```bash
npm run test:e2e
```

3. Otworz Trace Viewer:
```bash
npx playwright show-trace <trace-file>
# Przykład:
npx playwright show-trace test-results/auth.spec.ts-Chromium/trace.zip
```

#### Krok 5: Włącz reuse existing server

Jeśli dev server już działa, Playwright go nie restartuje:

```bash
# Terminal 1: uruchom serwer raz
npm run dev

# Terminal 2: uruchom E2E
npm run test:e2e
```

Konfiguracja w `playwright.config.ts` to umożliwia automatycznie:
```typescript
webServer: {
  reuseExistingServer: true,  // ← już jest ustawione
}
```

---

## Troubleshooting

### ❌ Unit test: `Cannot find module '@testing-library/react'`
```bash
npm install --save-dev @testing-library/react
```

### ❌ Unit test: `jsdom environment not found`
```bash
npm install --save-dev jsdom
```

### ❌ E2E test: `Error: TIMEOUT waiting for "http://127.0.0.1:3000"`

**Przyczyna:** Dev server się nie startuje.

**Rozwiązanie:**
```bash
# Sprawdź czy Next.js się buduje
npm run build

# Sprawdź czy port 3000 jest zajęty
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Jeśli zajęty, zabij proces
kill -9 <PID>  # lub Stop-Process w PowerShell
```

### ❌ E2E test: `Error: Protocol error (Target.setAutoAttach): Target closed.`

**Przyczyna:** Przeglądarka się zawiesiła lub session wypadł.

**Rozwiązanie:**
1. Zwiększ timeout w `playwright.config.ts`:
```typescript
webServer: {
  timeout: 180000,  // 3 minuty zamiast 2
}
```

2. Uruchom test w debug mode:
```bash
npx playwright test --debug
```

### ❌ E2E test: `Error: net::ERR_CONNECTION_REFUSED`

**Przyczyna:** Aplikacja web nie odpowiada na port 3000.

**Rozwiązanie:**
```bash
# Uruchom dev server ręcznie w osobnym terminalu
npm run dev

# Czekaj aż zobaczysz:
# ✓ Ready in 5s

# Potem uruchom testy w innym terminalu
npm run test:e2e
```

### ❌ Playwright: `Error: Timeout of XXXms exceeded`

Test czeka zbyt długo na element. Przyczyny:
- Element nie istnieje (selektor złe)
- Element załadowuje się asynchronicznie

**Debugowanie:**
```typescript
// W teście, dodaj log:
await page.pause();  // zatrzymaj test, uruchom go w debug mode
```

Lub sprawdź czy element rzeczywiście istnieje:
```bash
# Otwórz test w UI mode i przejrzyj DOM
npx playwright test --ui
```

### ❌ Build error: `TypeError: Cannot read property 'tailwindConfig' of undefined`

**Przyczyna:** Tailwind CSS nie jest załadowany prawidłowo.

**Rozwiązanie:**
```bash
# Zweryfikuj tailwind.config.js istnieje
ls -la tailwind.config.js

# Jeśli nie, przywróć z Next.js defaults
npx tailwindcss init -p
```

---

## Best practices

### 1. **Zawsze uruchamiaj unit testy przed E2E**
```bash
# Najpierw unit (szybko, ~5-10s)
npm test

# Jeśli zielone, potem E2E
npm run test:e2e
```

Unit testy łapią błędy logiki wcześnie. E2E to potwierdza.

### 2. **Używaj UI mode do nauki**
```bash
npx playwright test --ui
```

Pozwala Ci:
- Obserwować testy w akcji
- Pauzować i inspekcjonować DOM
- Debugować selektory

### 3. **Pisz testy dla krytycznych flowów**

Priorytet (patrz [scenariusze testowe](./02-test-scenarios.md)):
1. ✅ Sign-up/Login (auth.spec.ts, auth.test.ts)
2. ✅ Create Club
3. ✅ Invite + Join
4. ✅ Create Voting
5. ✅ Vote + See Results

### 4. **Isoluj testy — każdy powinien być niezależny**

Przykład: E2E test powinien:
- Stworzyć own test data (user, club, etc.)
- Nie polegać na stanie z innego testu
- Posprzątać po sobie (cleanup)

```typescript
test('register and join club', async ({ page }) => {
  // Setup
  const testEmail = `user-${Date.now()}@test.local`;
  
  // Test flow
  await page.goto('/register');
  // ...
  
  // Cleanup (opcjonalnie, jeśli backend wspiera)
  // await cleanupUser(testEmail);
});
```

### 5. **Miej watch mode włączony podczas developmentu**

Terminal 1 - Dev server:
```bash
npm run dev
```

Terminal 2 - Unit testy (watch):
```bash
npm test -- --watch
```

Terminal 3 - E2E (jeśli potrzeba):
```bash
npm run test:e2e
```

### 6. **Dokumentuj flaky testy**

Jeśli test czasem przechodzi, czasem nie:
```typescript
test.describe('flaky but critical', () => {
  test.use({ retries: 2 });  // retry raz, jeśli fail
  
  test('should handle slow network', async ({ page }) => {
    // ... test
  });
});
```

### 7. **Używaj Playwright fixtures do setup**

```typescript
// Na początku pliku:
const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Setup: zaloguj
    await page.goto('/login');
    // ...
    await use(page);
    // Cleanup: wyloguj
  },
});

test('user can create club', async ({ authenticatedPage }) => {
  // authenticatedPage jest już zalogowany
  await authenticatedPage.goto('/clubs/create');
});
```

---

## Checklist przed committem

- [ ] `npm test` przechodzi (wszyscy unit testy zielone)
- [ ] `npm run test:e2e` przechodzi (wszystkie E2E testy zielone)
- [ ] Nie ma `console.error` / `console.warn` w terminal output
- [ ] Nowe testy dokumentują kluczowe flowy
- [ ] Selektory testowe (data-testid) są dostępne w komponencie
- [ ] Testy nie polega na hardcoded czasy (sleep, delays)

---

## Szybka referenca komend

```bash
npm test                                    # Unit testy (Vitest)
npm test -- --watch                         # Unit testy w watch mode
npm test -- auth.test.ts                    # Tylko jeden test
npm test -- --coverage                      # Z coverage report

npm run test:e2e                            # E2E testy (Playwright)
npm run test:e2e -- auth.spec.ts            # Jeden E2E test
npx playwright test --ui                    # E2E w UI mode
npx playwright test --debug                 # E2E w debug mode
npx playwright test --project=chromium      # Tylko Chromium

npm run build                               # Build aplikacji (wymagane przed E2E)
npm run dev                                 # Dev server (może być startowany przez E2E)
```

---

## Linki

- [Vitest docs](https://vitest.dev)
- [Playwright docs](https://playwright.dev)
- [Testing Library docs](https://testing-library.com)
- [Scenariusze testowe](./02-test-scenarios.md)
- [Test Strategy](./01-test-strategy.md)
