# PLAN_stage13_glosowanie

## 1. Cel
Umożliwienie członkom klubu oddawania głosów na zaproponowane książki (wprowadzone w Stage 12). Funkcjonalność ta obejmuje mechanizm głosowania, ograniczania liczby głosów per użytkownik oraz wyświetlanie wyników w czasie rzeczywistym lub po zakończeniu głosowania. Jest to kluczowy element procesu wyboru kolejnej lektury w klubie.

## 2. Zakres
### Wchodzi w zakres
- Widok aktualnego głosowania pod `app/club/[id]/voting/page.tsx`.
- Możliwość oddania głosu na jedną lub więcej propozycji (zależnie od konfiguracji).
- Cofnięcie własnego głosu przed zakończeniem głosowania.
- Backendowa tabela `votes` w Supabase.
- Polityki RLS zapewniające, że tylko członkowie klubu mogą głosować.
- API do zarządzania głosami (`POST` / `DELETE`).
- Wyświetlanie statystyk głosowania (liczba głosów na każdą propozycję).

### Nie wchodzi w zakres
- Automatyczne zamykanie głosowania o określonej godzinie (zostanie dodane w Stage 14/15 wraz z harmonogramem).
- Zaawansowane systemy wagowe głosów (np. 1-5 gwiazdek) – stosujemy prosty model "1 głos = 1 punkt".
- Głosowanie na terminy spotkań (to zakres Stage 14).
- Powiadomienia o rozpoczęciu/zakończeniu głosowania (Stage 15).

## 3. Wymagania funkcjonalne
- Członek klubu może oddać głos na wybraną propozycję książki.
- Użytkownik widzi, na które książki już zagłosował.
- Użytkownik może zmienić zdanie i wycofać głos.
- System blokuje możliwość wielokrotnego głosowania na tę samą propozycję przez tego samego użytkownika (unique constraint).
- Prowadzący klub może zobaczyć pełne wyniki głosowania.
- Wyniki są odświeżane po oddaniu głosu.

## 4. Wymagania niefunkcjonalne
- **Wydajność**: Agregacja głosów powinna być szybka (indeksy na `proposal_id`).
- **Bezpieczeństwo**: RLS musi uniemożliwić głosowanie osobom spoza klubu oraz głosowanie "za kogoś".
- **UX**: Interakcja oddania głosu powinna być natychmiastowa (optimistic updates na froncie).
- **Spójność**: Usunięcie propozycji książki musi skutkować usunięciem powiązanych głosów (ON DELETE CASCADE).

## 5. Kontekst techniczny
- **Komponenty**:
  - `app/club/[id]/voting/page.tsx` (główny widok głosowania)
  - `app/components/voting/VotingCard.tsx` (indywidualna karta książki z przyciskiem głosuj)
  - `app/components/voting/VotingResults.tsx` (podsumowanie wyników)
- **API**:
  - `app/api/votes/route.ts` (obsługa `POST` i `GET`)
- **Dane (Supabase)**:
  - Tabela `votes(id, proposal_id, user_id, created_at)`
- **Zależności**:
  - Wymaga działającego modelu `book_proposals` z Stage 12.

## 6. Kroki implementacji

### Krok 1: Backend - Struktura bazy danych
1. Utworzyć migrację `008_create_votes_table.sql`.
   - Frontend: Brak.
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

### Krok 2: API i Typy
1. Zdefiniować typy w `lib/voting.ts`.
2. Utworzyć `app/api/votes/route.ts` obsługujący:
   - `POST` - oddanie głosu.
   - `DELETE` (param: `proposalId`) - wycofanie głosu.
3. Dodać helper `getVotesCount(proposalId)` w `lib/db/votes.ts`.

### Krok 3: Frontend - Widok Głosowania
1. Utworzyć stronę `app/club/[id]/voting/page.tsx` wyświetlającą listę propozycji z możliwością oddania głosu.
2. Dodać komponent `VotingCard.tsx` z indykatorem (czy zagłosowano) i licznikami.
3. Zaimplementować optimistic UI dla przycisku głosowania.

## 7. Kryteria akceptacji
- Użytkownik może oddać głos na książkę, a liczba głosów wzrasta o 1.
- Użytkownik nie może zagłosować dwa razy na tę samą książkę (błąd bazy/API).
- Po odświeżeniu strony informacja o oddanym głosie jest zachowana.
- Użytkownik może wycofać swój głos.
- Użytkownik spoza klubu nie ma dostępu do strony głosowania (403/404).

## 8. Testy
- **Unit**: Walidacja uprawnień do głosowania (czy użytkownik jest członkiem).
- **Integracyjne**: Test API `POST /api/votes` z poprawnym i błędnym tokenem JWT.
- **E2E**:
  1. Zaloguj jako Członek A.
  2. Wejdź na stronę głosowania klubu.
  3. Kliknij "Głosuj" przy propozycji "Hobbit".
  4. Sprawdź, czy przycisk zmienił stan na "Zagłosowano".
  5. Odśwież stronę i sprawdź, czy stan się utrzymał.
  6. Kliknij "Zagłosowano" (cofnij głos) i sprawdź, czy licznik spadł.

---
**Preconditions**:
- Działający Stage 12 (tabela `book_proposals` z danymi).
- Aktywna sesja użytkownika będącego członkiem klubu.

**Branch**: `feature/voting-system`
**PR Title**: `PLAN: Stage 13 - Voting System`
