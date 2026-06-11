## Stage 14 â€” Planer terminu spotkania (Implemented)

- **Status:** Completed
- **Data:** 2026-06-11

- **Co zrealizowano:**
  - Przebudowano widok `app/club/[id]/meetings/create/page.tsx` tak, aby działał jako planer pojedynczych propozycji terminu, a nie formularz całej ankiety.
  - Podpięto backend Supabase: planowanie korzysta z istniejących tras `app/api/meeting-slots/route.ts` i `app/api/meeting-votes/route.ts`, a inicjalny stan planera jest pobierany z helpera `lib/db/meetings.ts`.
  - Dodano backendowy snapshot planera dla klubu, który tworzy albo aktywuje otwarty planer spotkania po stronie serwera.
  - Dopisano test jednostkowy dla nowego flow planera, obejmujący zapis pojedynczej propozycji i głosowanie przez API.

- **Testy:**
  - `tests/unit/meeting-planner-workspace.test.tsx` â€” pass

- **Uwagi i dalsze kroki:**
  - Jeśli środowisko Supabase nie ma zastosowanej migracji `009_create_meetings.sql`, planer nie będzie mógł zapisywać slotów i głosów.
  - Po wdrożeniu warto zweryfikować, czy widok `meetings/create` pokazuje prawdziwy stan backendowy dla użytkowników zalogowanych w klubie.
