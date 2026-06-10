---
title: "Implemented Plan: stage12_propozycje_ksiazek"
plan: docs/plans/PLAN_stage12_propozycje_ksiazek.md
feature_key: stage12_propozycje_ksiazek
branches: ["feature/book-proposals"]
date: 2026-05-26
status: implemented
---

# Podsumowanie

Stage 12 dostarcza pełną funkcjonalność propozycji książek w obrębie klubu. Umożliwia członkom dodawanie propozycji z okładkami, opisami i informacją o autorze, a także zarządzanie nimi (edycja/usuwanie) zgodnie z uprawnieniami (autorzy oraz prowadzący klub). Funkcjonalność została zintegrowana z dashboardem klubu, który wyświetla teraz rzeczywistą liczbę propozycji z bazy danych.

## Zmiany w kodzie

- [lib/book-proposals.ts](../../lib/book-proposals.ts) - Definicja typów, schematów Zod oraz modelu widoku `BookProposalViewModel` z wyliczanymi uprawnieniami `canEdit` i `canDelete`.
- [lib/db/book-proposals.ts](../../lib/db/book-proposals.ts) - Implementacja warstwy dostępu do danych (CRUD) w Supabase.
- [app/components/voting/ProposalList.tsx](../../app/components/voting/ProposalList.tsx) - Refaktoryzacja komponentu listy na natywny `FormData`, obsługa uploadu okładek jako Data URL oraz odświeżanie stanu po mutacjach.
- [app/api/book-proposals/route.ts](../../app/api/book-proposals/route.ts) - Endpointy API dla listowania i tworzenia propozycji.
- [app/api/book-proposals/[proposalId]/route.ts](../../app/api/book-proposals/[proposalId]/route.ts) - Endpointy API dla edycji i usuwania konkretnych propozycji.
- [lib/club-dashboard.server.ts](../../lib/club-dashboard.server.ts) - Integracja liczników propozycji w dashboardzie klubu.
- [supabase/migrations/007_create_book_proposals.sql](../../supabase/migrations/007_create_book_proposals.sql) - Struktura tabeli `book_proposals` z RLS dla członków i prowadzących.

## Naprawione błędy i usprawnienia (Hotfixes - 26.05.2026)

- **Fix 400 Bad Request**: Rozwiązano problem z niezgodnością typów przy tworzeniu propozycji przez użycie poprawnego mapowania pól.
- **Uprawnienia**: Naprawiono logikę, dzięki której prowadzący klub (host) może teraz edytować i usuwać propozycje innych członków, a autorzy mają prawo do zarządzania tylko swoimi.
- **Daty i formatowanie**: Wprowadzono jednolite formatowanie dat (YYYY-MM-DD) po stronie serwera, eliminując problemy z lokalnym czasem w przeglądarce.
- **Dashboard**: Naprawiono krytyczny błąd składniowy w `club-dashboard.server.ts`, który uniemożliwiał renderowanie strony głównej klubu.
- **Upload zdjęć**: Przejście z JSON na `multipart/form-data` (via FormData API) dla niezawodnego przesyłania dużych danych okładek.

## Migracje

- **007_create_book_proposals**: Tabela zawiera polia `id`, `club_id`, `user_id`, `title`, `author`, `description`, `cover_url`, `created_at`.
- **Polityki RLS**:
  - `SELECT`: Dla członków klubu (uczestnicy + prowadzący).
  - `INSERT`: Dla aktywnych członków klubu.
  - `UPDATE/DELETE`: Dla autorów rekordu LUB prowadzących klub.

## Testy i weryfikacja

- Ręczna weryfikacja flow CRUD: dodanie propozycji -> edycja -> wyświetlenie na dashboardzie -> usunięcie.
- Sprawdzenie polityk RLS pod kątem użytkowników bez uprawnień (spoza klubu).
- Weryfikacja wyświetlania etykiety "Dodał(a): [Nazwa]" na liście propozycji.

## Uwagi / Następne kroki

- Przygotowano grunt pod **Stage 13 (Głosowanie)**: Tabela `book_proposals` jest gotowa do bycia celem relacji w tabeli `votes`.
- System okładek przechowuje obecnie Data URL w bazie; w przyszłości (przy dużej skali) warto rozważyć migrację do Supabase Storage.

