# PLAN_stage13_glosowanie

## 1. Cel
Umożliwienie członkom klubu oddawania głosów na zaproponowane książki w ramach tego samego widoku, w którym dodawane są propozycje. Funkcjonalność ta łączy zarządzanie listą lektur (z Stage 12) z aktywnym wyborem kolejnej książki poprzez mechanizm głosowania, ograniczania liczby głosów per użytkownik oraz wyświetlanie wyników na żywo.

## 2. Zakres
### Wchodzi w zakres
- Integracja mechanizmu głosowania z istniejącym widokiem propozycji pod `app/club/[id]/voting/page.tsx` (przeniesienie/zmiana z `voting/create`).
- Rozszerzenie karty propozycji książki o przyciski głosowania i licznik głosów.
- Możliwość oddania głosu na jedną lub więcej propozycji (zależnie od konfiguracji).
- Cofnięcie własnego głosu przed zakończeniem głosowania.
- Backendowa tabela `votes` w Supabase.
- Polityki RLS zapewniające, że tylko członkowie klubu mogą głosować.
- API do zarządzania głosami (`POST` / `DELETE`).
- Wyświetlanie statystyk głosowania bezpośrednio na liście propozycji.

### Nie wchodzi w zakres
- Automatyczne zamykanie głosowania o określonej godzinie (zostanie dodane w Stage 14/15 wraz z harmonogramem).
- Zaawansowane systemy wagowe głosów (np. 1-5 gwiazdek) – stosujemy prosty model "1 głos = 1 punkt".
- Głosowanie na terminy spotkań (to zakres Stage 14).
- Powiadomienia o rozpoczęciu/zakończeniu głosowania (Stage 15).

## 3. Wymagania funkcjonalne
- Członek klubu może oddać głos na wybraną propozycję książki bezpośrednio na liście propozycji.
- Użytkownik widzi na karcie książki, czy już na nią zagłosował.
- Użytkownik może zmienić zdanie i wycofać głos (klikając ponownie w przycisk głosowania).
- System blokuje możliwość wielokrotnego głosowania na tę samą propozycję przez tego samego użytkownika (unique constraint).
- Liczba głosów per książka jest widoczna dla wszystkich członków w czasie rzeczywistym (po odświeżeniu/akcji).
- Dodanie nowej propozycji automatycznie udostępnia ją do głosowania na tym samym ekranie.

## 4. Wymagania niefunkcjonalne
- **Wydajność**: Agregacja głosów powinna być szybka (indeksy na `proposal_id`). Głosy powinny być dołączane do propozycji w jednym zapytaniu na serwerze.
- **Bezpieczeństwo**: RLS musi uniemożliwić głosowanie osobom spoza klubu oraz głosowanie "za kogoś".
- **UX**: Interakcja oddania głosu powinna być natychmiastowa (optimistic updates na froncie). Brak przeładowania strony przy głosowaniu.
- **Spójność**: Usunięcie propozycji książki musi skutkować usunięciem powiązanych głosów (ON DELETE CASCADE).

## 5. Kontekst techniczny
- **Strona**:
  - `app/club/[id]/voting/page.tsx` (centralny hub: dodawanie + lista + głosowanie)
- **Komponenty**:
  - `app/components/voting/ProposalList.tsx` (rozszerzony o obsługę głosów)
  - `app/components/voting/ProposalCard.tsx` (integracja przycisku głosowania w karcie książki)
- **API**:
  - `app/api/votes/route.ts` (obsługa `POST` i `DELETE`)
  - `app/api/book-proposals/route.ts` (GET rozszerzony o informację o głosach)
- **Dane (Supabase)**:
  - Tabela `votes(id, proposal_id, user_id, created_at)`
- **Zależności**:
  - Wymaga rozbudowanego modelu `BookProposalViewModel` z informacjami o `votesCount` i `currentUserHasVoted`.

## 6. Kroki implementacji

### Krok 1: Backend - Struktura bazy danych
1. Utworzyć migrację `008_create_votes_table.sql`.
   - Backend:
     ```sql
     CREATE TABLE votes (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       proposal_id UUID NOT NULL REFERENCES book_proposals(id) ON DELETE CASCADE,
       user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
       created_at TIMESTAMPTZ DEFAULT now(),
       UNIQUE(proposal_id, user_id)
     );

     -- RLS
     ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

     -- Widoczność: członek klubu widzi głosy w swoim klubie
     CREATE POLICY "Members can view votes in their club" ON votes
       FOR SELECT USING (
         EXISTS (
           SELECT 1 FROM book_proposals bp
           JOIN club_members cm ON bp.club_id = cm.club_id
           WHERE bp.id = votes.proposal_id AND cm.user_id = auth.uid()
         )
       );

     -- Głosowanie: tylko aktywny członek klubu może dodać głos na własne UID
     CREATE POLICY "Members can vote for proposals in their club" ON votes
       FOR INSERT WITH CHECK (
         auth.uid() = user_id AND
         EXISTS (
           SELECT 1 FROM book_proposals bp
           JOIN club_members cm ON bp.club_id = cm.club_id
           WHERE bp.id = votes.proposal_id AND cm.user_id = auth.uid() AND cm.membership_status = 'active'
         )
       );

     -- Usuwanie: tylko autor głosu może go usunąć
     CREATE POLICY "Users can remove their own votes" ON votes
       FOR DELETE USING (auth.uid() = user_id);
     ```

### Krok 2: API i Model Danych
1. Zaktualizować `lib/book-proposals.ts` o pola `votesCount: number` i `currentUserHasVoted: boolean`.
2. Zaktualizować `lib/db/book-proposals.ts` (funkcja `listBookProposals`), aby pobierała zagregowane liczby głosów (np. przez `count()` w Supabase query).
3. Utworzyć `app/api/votes/route.ts` obsługujący:
   - `POST` - oddanie głosu.
   - `DELETE` (param `proposalId`) - wycofanie głosu.

### Krok 3: Frontend - Integracja w jednej karcie
1. Przenieść stronę z `app/club/[id]/voting/create/page.tsx` do `app/club/[id]/voting/page.tsx`.
2. Zaktualizować komponent `ProposalList.tsx`, aby przyjmował funkcję obsługi głosowania (action/callback).
3. Wewnątrz `ProposalList.tsx` (lub wydzielonym `ProposalCard.tsx`) dodać przycisk "Głosuj" (lub ikonę serca/kciuka).
4. Przycisk powinien zmieniać kolor, gdy użytkownik już zagłosował, i wyświetlać obok liczbę wszystkich głosów.
5. Zaimplementować optimistic UI: po kliknięciu "Głosuj" stan lokalny zmienia się natychmiast, a zapytanie API biegnie w tle.

## 7. Kryteria akceptacji
- Na jednym ekranie można dodać propozycję książki i od razu na nią (lub inną) zagłosować.
- Karta książki pokazuje aktualną liczbę głosów oraz stan głosu bieżącego użytkownika.
- Użytkownik może wycofać swój głos, co skutkuje natychmiastowym zmniejszeniem licznika na karcie.
- Usunięcie propozycji przez hosta poprawnie usuwa też wszystkie głosy z bazy.
- Próba głosowania przez osobę spoza klubu kończy się błędem 403.

## 8. Testy
- **Unit**: Test mapowania propozycji na widok z poprawną agregacją głosów.
- **Integracyjne**: Test API `POST /api/votes` z weryfikacją unikalności (nie można oddać dwóch głosów na ten sam ID propozycji).
- **E2E**:
  1. Zaloguj jako Członek A.
  2. Wejdź na `/club/[id]/voting`.
  3. Dodaj nową książkę "Wiedźmin".
  4. Po pojawieniu się karty kliknij przycisk głosowania na tej samej karcie.
  5. Sprawdź, czy licznik zmienił się z 0 na 1.
  6. Odśwież stronę i upewnij się, że licznik nadal wynosi 1, a przycisk jest aktywny (zagłosowano).

---
**Preconditions**:
- Działający Stage 12 (tabela `book_proposals` with data).
- Aktywna sesja użytkownika będącego członkiem klubu.

**Branch**: `feature/voting-system`
**PR Title**: `PLAN: Stage 13 - Voting System`
