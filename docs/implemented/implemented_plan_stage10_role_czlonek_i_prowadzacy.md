---
title: "Implemented Plan: stage10_role_czlonek_i_prowadzacy"
plan: docs/plans/PLAN_stage10_role_czlonek_i_prowadzacy.md
feature_key: stage10_role_czlonek_i_prowadzacy
branches:
  frontend: feature/stage10-roles-frontend
  backend: feature/stage10-roles-backend
pr_urls: {}
commits: {}
date: 2026-05-21
status: implemented
---

# Podsumowanie

Stage 10 został zrealizowany w dwóch spójnych częściach: frontendowej i backendowej. Plan zakładający role `host` i `member` został domknięty przez widok zarządzania rolami, kontrakt API, helpery permissions, migracje Supabase, rollback oraz testy jednostkowe i smoke dla najważniejszych ścieżek.

## Zmiany w kodzie

- [docs/plans/PLAN_stage10_role_czlonek_i_prowadzacy.md](../plans/PLAN_stage10_role_czlonek_i_prowadzacy.md) - plan stage 10 zgodny z workflow.
- [docs/implemented/implemented_stage10_role_czlonek_i_prowadzacy_frontend.md](implemented_stage10_role_czlonek_i_prowadzacy_frontend.md) - podsumowanie realizacji frontendowej.
- [docs/implemented/implemented_stage10_role_czlonek_i_prowadzacy_backend.md](implemented_stage10_role_czlonek_i_prowadzacy_backend.md) - podsumowanie realizacji backendowej.
- [app/club/[id]/members/manage/page.tsx](../app/club/[id]/members/manage/page.tsx) - widok zarządzania rolami.
- [app/components/club/MembersRoleManager.tsx](../app/components/club/MembersRoleManager.tsx) - lista członków i akcje zmiany roli.
- [app/components/club/MemberRoleBadge.tsx](../app/components/club/MemberRoleBadge.tsx) - badge dla ról `host` i `member`.
- [app/components/club/roles.ts](../app/components/club/roles.ts) - typy kontraktu frontendowego.
- [lib/club-roles.mock.ts](../lib/club-roles.mock.ts) - mock dla warstwy frontendowej.
- [lib/db/roles.ts](../lib/db/roles.ts) - helpery permissions i operacje na rolach.
- [app/api/club-roles/route.ts](../app/api/club-roles/route.ts) - kontrakt API `GET` i `PATCH`.
- [app/components/club/ClubMembersRolesClient.tsx](../app/components/club/ClubMembersRolesClient.tsx) - klientowy loader danych ról z API.
- [tests/unit/member-role-badge.test.tsx](../tests/unit/member-role-badge.test.tsx) - test badge roli.
- [tests/unit/members-role-manager.test.tsx](../tests/unit/members-role-manager.test.tsx) - testy widoku zarządzania rolami.
- [tests/unit/club-roles.test.ts](../tests/unit/club-roles.test.ts) - testy helperów i walidacji backendowej.
- [tests/unit/club-roles-display-name.test.ts](../tests/unit/club-roles-display-name.test.ts) - test deterministycznego formatu nazw członków.

## Migracje

- [supabase/migrations/004_add_club_member_roles.sql](../supabase/migrations/004_add_club_member_roles.sql) - rozszerzenie `club_members` o kolumnę `role`, indeks, helper `user_is_host_of_club(...)` i polityki RLS.
- [supabase/migrations/004_add_club_member_roles_rollback.sql](../supabase/migrations/004_add_club_member_roles_rollback.sql) - rollback dla zmian Stage 10.
- Komenda aplikowania: `npx supabase db push --db-url "$env:SUPABASE_DB_URL"`.

## Testy

- Unit: `npm.cmd run test -- tests/unit/club-roles.test.ts tests/unit/members-role-manager.test.tsx tests/unit/member-role-badge.test.tsx` - passed.
- Lint: `npx.cmd eslint lib\db\roles.ts app\api\club-roles\route.ts app\components\club\MembersRoleManager.tsx tests\unit\club-roles.test.ts` - passed.
- Unit: `npm.cmd run test -- tests/unit/club-roles-display-name.test.ts` - passed.
- Lint: `npx.cmd eslint lib\db\roles.ts tests\unit\club-roles-display-name.test.ts` - passed.
- Frontend smoke: ręczne wejście na `/club/[id]/members/manage` zwraca HTTP 200 w dev serverze.
- Backend contract: `GET /api/club-roles?clubId=:clubId` oraz `PATCH /api/club-roles` pokrywają odczyt i zmianę ról.

## Acceptance E2E (krok po kroku)

- Uruchomić Supabase lokalnie i zastosować migracje Stage 10.
- Wystartować aplikację lokalnie.
- Wejść jako prowadzący na `/club/[id]/members/manage`.
- Zmienić rolę członka i potwierdzić aktualizację badge w UI.
- Zalogować się jako zwykły członek i potwierdzić brak akcji administracyjnych.
- Wysłać bezpośrednie `PATCH /api/club-roles` jako zwykły członek i potwierdzić `403`.
- Spróbować zdegradować ostatniego prowadzącego i potwierdzić `400`.
- Sprawdzić, że nazwy członków nie zawierają już prefiksu `Członek` i są wyliczane jednolicie dla wszystkich kont.

## Deviations / PYTANIA

- Backend Stage 10 jest już wykonany, ale pełne stosowanie migracji do lokalnej lub zdalnej bazy nadal wymaga ręcznego uruchomienia komend Supabase.
- Nazwy członków są już wyliczane deterministycznie bez prefiksu `Członek`; jeśli później pojawi się potrzeba bardziej czytelnych etykiet, trzeba będzie to zrobić w osobnym kroku.
- Jeśli projekt dostanie server-side auth cookies dla App Router, można w kolejnym kroku uprościć loader początkowej listy członków na stronie zarządzania rolami.

## Notes / Next steps

- Stage 11 może bezpośrednio korzystać z `assertClubHost(...)` i `getCurrentUserClubRole(...)` jako warstwy permissions.
- Jeśli pojawi się potrzeba rozbudowy uprawnień, model `host` / `member` pozostaje minimalną bazą do dalszych etapów.
