---
title: "Stage 1 — Instrukcja krok po kroku"
date: 2026-05-04
author: "AI (wygenerowane)"
---

# Instrukcja wykonania Stage 1 (krok po kroku)

Krótka, praktyczna instrukcja wykonania wszystkich kroków potrzebnych do zrealizowania Stage 1 zgodnie z planem i regułami w [docs/workflows/Agent-programowanie.md](docs/workflows/Agent-programowanie.md).

**Szybkie założenia**
- Pracujemy w katalogu repo: `Book-Club-Saas-3.0`.
- Domyślny projekt app znajduje się w `book_club_saas_3`.
- Używamy Node.js 18+ i `npm` (patrz `book_club_saas_3/package.json`).

---

## 0. Przygotowanie lokalne

- Zaktualizuj `main` i utwórz parowane branche:

```bash
git fetch origin
git checkout main
git pull origin main
git checkout -b feature/stage1-frontend
git push -u origin feature/stage1-frontend
git checkout -b feature/stage1-backend
git push -u origin feature/stage1-backend
```

- Zainstaluj zależności (w katalogu projektu frontend):

```bash
cd book_club_saas_3
npm ci
```

---

## 1. Frontend — implementacja szkieletonu (done/verify)

- Sprawdź/utwórz pliki:
  - [book_club_saas_3/app/layout.tsx](book_club_saas_3/app/layout.tsx)
  - [book_club_saas_3/app/page.tsx](book_club_saas_3/app/page.tsx)
  - [book_club_saas_3/app/components/Header.tsx](book_club_saas_3/app/components/Header.tsx)
  - [book_club_saas_3/app/components/Footer.tsx](book_club_saas_3/app/components/Footer.tsx)
  - [book_club_saas_3/app/components/Hero.tsx](book_club_saas_3/app/components/Hero.tsx)
  - [book_club_saas_3/app/components/FeatureCards.tsx](book_club_saas_3/app/components/FeatureCards.tsx)

- Dodaj/zweryfikuj strony i formularze:
  - [book_club_saas_3/app/register/page.tsx](book_club_saas_3/app/register/page.tsx)
  - [book_club_saas_3/app/login/page.tsx](book_club_saas_3/app/login/page.tsx)
  - [book_club_saas_3/app/components/auth/RegisterForm.tsx](book_club_saas_3/app/components/auth/RegisterForm.tsx)
  - [book_club_saas_3/app/components/auth/LoginForm.tsx](book_club_saas_3/app/components/auth/LoginForm.tsx)

- Uruchom dev i sprawdź podstawowe rendery:

```bash
cd book_club_saas_3
npm run dev
# Otwórz http://localhost:3000 — sprawdź Header, Hero, FeatureCards
# Przejdź do /register i /login — sprawdź formularze i walidację kliencką
```

Jeśli pojawią się błędy: napraw brakujące importy/typy, uruchom ponownie `npm ci`.

---

## 2. Backend — placeholdery Supabase (done)

- Utwórz server-side klienta Supabase (placeholder):
  - Plik dodany: [book_club_saas_3/lib/supabase.server.ts](book_club_saas_3/lib/supabase.server.ts)
  - Upewnij się, że  `.env.example` zawiera wymagane zmienne: [book_club_saas_3/.env.example](book_club_saas_3/.env.example)

- Jeśli chcesz zaktualizować/rozszerzyć klienta, edytuj powyższy plik i commituj do `feature/stage1-backend`.

---

## 3. Migracje (supabase) — co utworzyć

- Na branchu backend (`feature/stage1-backend`) dodaj katalog `supabase/migrations/` i plik inicjalny:

`supabase/migrations/000_init_users.sql` przykładowo:

```sql
BEGIN;
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);
COMMIT;
```

- Dodaj rollback/invert:
  - `supabase/migrations/revert_000_init_users.sql` zawierający `DROP TABLE IF EXISTS users;` lub invert SQL.

- Commituj i pushuj zmiany na `feature/stage1-backend`:

```bash
git add supabase/migrations
git commit -m "db(migrations): add initial users migration"
git push origin feature/stage1-backend
```

Uwaga: nie aplikuj migracji do produkcji bez backupu i review.

---

## 4. Testy — unit i E2E (dodane/rozszerzyć)

- Unit tests (Vitest) — dodano przykładowe pliki:
  - [tests/unit/header.test.tsx](tests/unit/header.test.tsx)
  - [tests/unit/forms.test.tsx](tests/unit/forms.test.tsx)

- Uruchom testy lokalnie:

```bash
cd book_club_saas_3
npm test
```

- E2E (Playwright) — dodaj konfigurację i plik smoke:
  - `tests/e2e/smoke/auth.spec.ts` — scenariusz: otwórz `/`, `/register`, `/login`.

Przykład instalacji Playwright:

```bash
npm i -D @playwright/test
npx playwright install
npx playwright test tests/e2e/smoke/auth.spec.ts
```

---

## 5. CI — GitHub Actions (dodane)

- Prostą workflow dodano: [.github/workflows/ci-stage1.yml](.github/workflows/ci-stage1.yml)
- Workflow wykonuje: `npm ci`, `npm run lint`, `npm test`, `npm run build`.
- Jeśli chcesz uruchamiać migracje w preview, dodaj zmienną `SUPABASE_PREVIEW_DB_URL` jako secret i rozbuduj workflow.

---

## 6. PR / Review / Cross-reference

- Otwórz PRy:
  - Frontend: `feature/stage1-frontend` → PR tytuł: `feat(stage1): frontend skeleton — Stage 1` (PR #2 istnieje)
  - Backend: `feature/stage1-backend` → PR tytuł: `feat(stage1): backend placeholders + migrations — Stage 1` (PR #3)

- Zaktualizuj opisy PR, dołącz linki do raportów:
  - [docs/implemented/deployments_report_stage1.md](docs/implemented/deployments_report_stage1.md)
  - [docs/plans/stage1_remaining_tasks.md](docs/plans/stage1_remaining_tasks.md)

- Jeśli używasz GitHub CLI, możesz stworzyć PR z poleceniem:

```bash
gh pr create --base main --head feature/stage1-frontend --title "feat(stage1): frontend skeleton — Stage 1" --fill
gh pr create --base main --head feature/stage1-backend --title "feat(stage1): backend placeholders + migrations — Stage 1" --fill
```

---

## 7. GH auth / GH_TOKEN (szybkie przypomnienie)

- Najprościej: zaloguj `gh` interaktywnie:

```bash
gh auth login
```

- Alternatywnie utwórz PAT (Personal Access Token) w GitHub → Settings → Developer settings → Personal access tokens → Fine-grained token, nadaj minimalne uprawnienia.

- Aby użyć tokena chwilowo w PowerShell:

```powershell
$env:GH_TOKEN="ghp_..."
echo $env:GH_TOKEN | gh auth login --with-token
```

---

## 8. Acceptance checks (kryteria akceptacji)

- `npm run dev` startuje i strona główna (`/`) renderuje bez błędów.
- `/register` i `/login` renderują formularze z client-side walidacją.
- `.env.example` dokumentuje wymagane zmienne.
- PRy frontend + backend cross-referenced i green CI.

---

## 9. Git maintenance (opcjonalne)

Jeżeli lokalne repo zgłasza dużo nieużywanych obiektów, uruchom:

```bash
git prune
git gc --aggressive --prune=now
```

Uwaga: wykonuj te komendy lokalnie i ostrożnie.

---

## 10. Szybka checklista plików do weryfikacji

- [book_club_saas_3/app/layout.tsx](book_club_saas_3/app/layout.tsx)
- [book_club_saas_3/app/page.tsx](book_club_saas_3/app/page.tsx)
- [book_club_saas_3/app/components/Header.tsx](book_club_saas_3/app/components/Header.tsx)
- [book_club_saas_3/app/components/Hero.tsx](book_club_saas_3/app/components/Hero.tsx)
- [book_club_saas_3/app/register/page.tsx](book_club_saas_3/app/register/page.tsx)
- [book_club_saas_3/app/login/page.tsx](book_club_saas_3/app/login/page.tsx)
- [book_club_saas_3/app/components/auth/RegisterForm.tsx](book_club_saas_3/app/components/auth/RegisterForm.tsx)
- [book_club_saas_3/lib/supabase.server.ts](book_club_saas_3/lib/supabase.server.ts)
- [book_club_saas_3/.env.example](book_club_saas_3/.env.example)
- [.github/workflows/ci-stage1.yml](.github/workflows/ci-stage1.yml)
- [tests/unit/forms.test.tsx](tests/unit/forms.test.tsx)
- [docs/implemented/deployments_report_stage1.md](docs/implemented/deployments_report_stage1.md)

---

Plik instrukcji został dodany do repo. Jeśli chcesz, mogę teraz:
- uruchomić lokalnie `npm test` i zgłosić wynik, lub
- rozwinąć przykładowy Playwright E2E spec oraz dodać do CI.
