---
title: "PLAN_stage1_bazowa_wersja_aplikacji"
status: draft
authors: ["AI (wygenerowane)"]
date: 2026-05-04
---

# Stage 1 — Bazowa wersja aplikacji

## 1. Cel
Zbudować stabilny szkielet aplikacji Next.js, w którym frontend rozwija się etapami, a backend dokładamy tylko w minimalnym zakresie potrzebnym do obsługi aktualnego UI.

## 2. Założenia
- Repozytorium to pojedyncza aplikacja Next.js App Router, nie monorepo.
- Wspólne komponenty UI trzymamy w `app/components/`.
- Backend budujemy stopniowo: najpierw placeholdery, później minimalne migracje i helpery, a dopiero potem kolejne funkcje domenowe.
- Nie commitujemy sekretów. Wartości środowiskowe dokumentujemy w `.env.example`.

## 3. Aktualny zakres Stage 1
### Frontend
- `app/layout.tsx`
- `app/page.tsx`
- `app/components/Header.tsx`
- `app/components/Hero.tsx`
- `app/components/FeatureCards.tsx`
- `app/components/Footer.tsx`
- `app/register/page.tsx`
- `app/login/page.tsx`
- `app/components/auth/RegisterForm.tsx`
- `app/components/auth/LoginForm.tsx`

### Minimalny backend dla Stage 1
- `lib/auth.ts` jako placeholder helperów auth.
- `lib/supabase.server.ts` jako placeholder server client.
- `supabase/migrations/000_init_users.sql`
- `supabase/migrations/001_enable_rls_and_policies.sql`
- `supabase/migrations/000_init_users_rollback.sql`
- `supabase/migrations/001_enable_rls_and_policies_rollback.sql`

### Dokumentacja i DX
- `README.md`
- `docs/README.md`
- `supabase/migrations/README.md`
- `.env.example`
- `vitest.config.ts`
- `vitest.setup.ts`
- `tests/unit/header.test.tsx`

## 4. Kolejność prac
1. Frontend shell.
   - Uporządkować `app/layout.tsx`, `app/page.tsx` i wspólne komponenty.
   - W tym kroku landing ma być gotowy wizualnie, nawet jeśli backend jest jeszcze placeholderem.
2. Auth UI.
   - Dowozić `app/register/page.tsx` i `app/login/page.tsx` oraz ich formularze.
   - Zostawić lokalną walidację po stronie klienta.
3. Minimalny backend auth.
   - Utrzymać `lib/auth.ts` i `lib/supabase.server.ts` jako cienkie placeholdery.
   - Dodać tylko bazowe migracje, które umożliwią dalszą rozbudowę.
4. Dokumentacja i testy.
   - Uzupełnić `README.md`, `docs/README.md` i `supabase/migrations/README.md`.
   - Dodać podstawowy test unit dla `Header`.

## 5. Wymagania funkcjonalne
- Strona główna (`/`) renderuje `Header`, `Hero`, `FeatureCards` i `Footer`.
- `/register` i `/login` renderują formularze UI i wykonują podstawową walidację po stronie klienta.
- Minimalne placeholdery backendowe nie blokują rozwoju frontendowego.
- `npm run dev` uruchamia aplikację bez błędów.

## 6. Wymagania niefunkcjonalne
- Bezpieczeństwo: nie commitować sekretów; serwerowe klienty Supabase trzymać w `*.server.ts`.
- Dostępność: podstawowe atrybuty ARIA w formularzach.
- Czytelność: feature-first layout w `app/`.
- Skalowalność: backend wprowadzany etapami, tylko do poziomu niezbędnego dla aktualnej funkcji.

## 7. Kroki implementacji
1. Frontend — base shell.
   - Uaktualnić `app/layout.tsx` i `app/page.tsx`.
   - Spójnie ustawić `Header`, `Hero`, `FeatureCards`, `Footer`.
2. Frontend — auth UI.
   - Utrzymać `app/register/page.tsx` i `app/login/page.tsx` jako gotowe ekrany.
   - Formularze mają zostać połączone z lokalną walidacją.
3. Backend — minimalny poziom wsparcia.
   - Zachować `lib/auth.ts` jako helper dla UI.
   - Zachować `lib/supabase.server.ts` jako placeholder do późniejszej integracji.
   - Włączyć tylko bazowe migracje `supabase/migrations/000_init_users.sql` i `supabase/migrations/001_enable_rls_and_policies.sql`.
4. Docs i tests.
   - Zaktualizować `README.md`, `docs/README.md`, `supabase/migrations/README.md`.
   - Dodać i utrzymać `tests/unit/header.test.tsx`.

## 8. Kryteria akceptacji
- `npm run dev` działa.
- `/` pokazuje komplet podstawowego UI.
- `/register` i `/login` renderują formularze i ich podstawowe stany.
- `.env.example` dokumentuje zmienne środowiskowe.
- `supabase/migrations/README.md` opisuje aktualne migracje.
- Jest minimum jeden test unit dla `Header`.

## 9. Testy
- Unit: `tests/unit/header.test.tsx`.
- Opcjonalnie później: `tests/unit/auth.test.ts`.
- Opcjonalnie później: `tests/e2e/auth.spec.ts`.

## 10. `.env.example` (minimum)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_DB_URL=
NEXT_PUBLIC_APP_ENV=development
```

## 11. Notatka o rozwoju backendu
- Backend powinien rosnąć razem z frontendem, ale tylko do minimalnego poziomu potrzebnego dla następnego kroku UI.
- Kiedy dochodzi nowy ekran lub nowy flow, dodajemy najpierw niezbędny helper lub migrację, a dopiero potem pełną logikę domenową.

## 12. Przykładowa kolejność commitów
- `chore(stage1): add base layout and landing`
- `chore(stage1): add auth screens and placeholders`
- `chore(stage1): add migrations and docs`
- `test(stage1): add Header unit test`
