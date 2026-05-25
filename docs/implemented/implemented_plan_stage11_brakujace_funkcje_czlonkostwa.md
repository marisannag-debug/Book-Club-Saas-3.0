---
title: "Implemented Plan: stage11_brakujace_funkcje_czlonkostwa"
plan: docs/plans/PLAN_stage11_brakujace_funkcje_czlonkostwa.md
feature_key: stage11_brakujace_funkcje_czlonkostwa
branches: {}
pr_urls: {}
commits: {}
date: 2026-05-21
status: implemented
---

# Podsumowanie

Stage 11 domyka brakujące funkcje członkostwa: akceptację członkostwa, opuszczenie klubu oraz zmianę własnej nazwy wyświetlanej. Zmiany są spięte przez wspólną walidację, warstwę DB, kontrakt API, ekran w App Routerze, migrację Supabase oraz testy jednostkowe.

## Zmiany w kodzie

- [docs/plans/PLAN_stage11_brakujace_funkcje_czlonkostwa.md](../plans/PLAN_stage11_brakujace_funkcje_czlonkostwa.md) - plan stage 11 zgodny z [docs/plans/mvp-file-structure-plan.md](../plans/mvp-file-structure-plan.md).
- [lib/membership.ts](../../lib/membership.ts) - wspólna walidacja i normalizacja akcji członkostwa.
- [lib/db/membership.ts](../../lib/db/membership.ts) - helpery DB dla pobrania szczegółów członkostwa, akceptacji, opuszczenia i zmiany nazwy.
- [app/api/membership/route.ts](../../app/api/membership/route.ts) - kontrakt API `GET` i `PATCH` dla członkostwa.
- [app/components/club/MembershipActions.tsx](../../app/components/club/MembershipActions.tsx) - klientowy ekran akcji członkostwa.
- [app/club/[id]/members/[memberId]/actions/page.tsx](../../app/club/[id]/members/[memberId]/actions/page.tsx) - strona App Router dla własnych akcji członkostwa.
- [app/components/ClubDashboard/ClubDashboard.tsx](../../app/components/ClubDashboard/ClubDashboard.tsx) - CTA prowadzące do ekranu "Moje członkostwo".
- [lib/db/roles.ts](../../lib/db/roles.ts) - obsługa `display_name` i `membership_status` w listach członków.
- [lib/club-invite.server.ts](../../lib/club-invite.server.ts) - aktywacja członkostwa przy redeem zaproszenia.
- [package.json](../../package.json) - dodane `zod` dla współdzielonej walidacji.
- [tests/unit/membership.test.ts](../../tests/unit/membership.test.ts) - testy walidacji i normalizacji.
- [tests/unit/membership-route.test.ts](../../tests/unit/membership-route.test.ts) - testy kontraktu API.
- [tests/unit/membership-actions.test.tsx](../../tests/unit/membership-actions.test.tsx) - test ekranu klientowego.
- [lib/club-dashboard.server.ts](../../lib/club-dashboard.server.ts) - poprawione liczenie członków dashboardu z uwzględnieniem `created_by`.

## Migracje

- [supabase/migrations/005_update_membership_flow.sql](../../supabase/migrations/005_update_membership_flow.sql) - dodanie `display_name`, `membership_status`, `updated_at`, indeksów, triggera i polityk RLS dla własnych akcji oraz hostów.
- [supabase/migrations/005_update_membership_flow_rollback.sql](../../supabase/migrations/005_update_membership_flow_rollback.sql) - rollback dla zmian Stage 11.
- [supabase/migrations/006_dedupe_club_members.sql](../../supabase/migrations/006_dedupe_club_members.sql) - cleanup duplikatów i unikalny indeks `club_id + user_id`.
- [supabase/migrations/006_dedupe_club_members_rollback.sql](../../supabase/migrations/006_dedupe_club_members_rollback.sql) - rollback dla indeksu Stage 11 dedupe.
- Migracja została zastosowana na zdalnej bazie przez pooler Supabase z obejściem ograniczeń CLI, a stan końcowy zweryfikowano przez `information_schema.columns` oraz `pg_policies`.

## Testy

- Unit: `npm.cmd run test -- tests/unit/membership.test.ts tests/unit/membership-route.test.ts tests/unit/membership-actions.test.tsx` - passed.
- Lint: `npx eslint lib/membership.ts lib/db/membership.ts app/api/membership/route.ts app/components/club/MembershipActions.tsx app/club/[id]/members/[memberId]/actions/page.tsx tests/unit/membership.test.ts tests/unit/membership-route.test.ts tests/unit/membership-actions.test.tsx` - passed.

## Acceptance E2E (krok po kroku)

- Zastosować migrację Stage 11 w Supabase.
- Otworzyć ekran "Moje członkostwo" z poziomu dashboardu klubu.
- Zmienić własną nazwę i potwierdzić zapis w UI oraz w bazie.
- Dla oczekującego członkostwa wywołać akceptację i potwierdzić zmianę statusu na aktywny.
- Opuścić klub jako zwykły członek i potwierdzić przekierowanie do dashboardu.
- Spróbować opuścić klub jako twórca i potwierdzić blokadę akcji.

## Deviations / PYTANIA

- Plan stage 11 jest oparty o [docs/plans/mvp-file-structure-plan.md](../plans/mvp-file-structure-plan.md), bo [docs/plans/mvp-stage-outline.md](../plans/mvp-stage-outline.md) ma inną numerację następnego etapu.
- Ekran `memberId=me` działa jako alias własnego członkostwa; jeśli w przyszłości pojawi się potrzeba admin-view dla innych członków, będzie to osobny zakres.
- Migracja i helpery zakładają, że `club_members` ma teraz jawny stan członkostwa (`pending`, `active`, `left`) i nazwę wyświetlaną per członek.

## Notes / Next steps

- Następny etap może użyć tego samego modelu `club_members` do zaproszeń, moderacji i przyszłych akcji członkowskich.
- Jeśli pojawią się dodatkowe typy członkostwa, warto rozszerzać kontrakt w [lib/membership.ts](../../lib/membership.ts), a nie rozpraszać walidacji po UI.

## Późniejsze zmiany 

- Poprawiony błąd zawężania typów odpowiedzi API w ekranie ról i akcjach członkostwa,
- Dodane typy Supabase dla używanych tabel, żeby next build nie wpadał w never / unknown,
- Poprawiona składnia migracji 004_add_club_member_roles.sql,
- Dodane wymagane przez Next 16 granice Suspense dla stron używających useSearchParams,
- Przywrócone linki akcji w DashboardNav, żeby testy dashboardu przechodziły.
- Poprawione liczenie liczby członków w dashboardzie klubu, żeby nie doliczać twórcy drugi raz.