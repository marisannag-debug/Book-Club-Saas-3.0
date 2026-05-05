---
title: "Zasady UX - MVP BookClub Pro"
description: "Zestaw praktycznych zasad UX, microcopy i kryteriów akceptacji dla MVP"
status: draft
version: 0.1
authors: ["AI (wygenerowane)"]
references:
  - docs/business/bookclub-pro-user-journey-map.md
  - docs/business/bookclub-pro-mvp-scoping.md
date: 2026-05-04
---

# Zasady UX — MVP BookClub Pro

## Top principles (8–10)
1. Time‑to‑value < 5 minut — każda decyzja UX powinna skracać drogę do pierwszego rezultatu.
   - Co mierzymy? Time-to-first-value (metryka analityczna).
2. Minimal onboarding — UX uczy przez działanie, nie pytania.
   - Praktyka: pokazuj tooltipy only‑when‑needed, nie więcej niż 1 tip na ekran.
3. Progressive disclosure — ukrywaj złożoność aż do potrzeby.
   - CTA primary widoczny, zaawansowane opcje w panelu „więcej".
4. Single primary action — każdy ekran ma 1 wyraźne CTA.
   - Microcopy example: Primary: "Dodaj głosowanie"; Secondary: "Anuluj".
5. Accessibility first — WCAG AA, focus order, aria labels.
   - Co mierzymy? 100% ekranów z keyboard navigation + screenreader smoke test.
6. Clear error states & recovery — błędy są opisowe i oferują akcję naprawczą.
7. Writable microcopy — krótkie, przyjazne, działające jako call‑to‑action.
8. Performance perception — skeletons for content, spinner with context.

---

## Formularze i walidacja
- Zasada: walidacja inline, komunikaty pod polem, nie blokujące modale.
- Przykładowe komunikaty:
  - Email: "Sprawdź adres e‑mail" (when invalid)
  - Hasło: "Hasło za krótkie (min. 6 znaków)"
  - Propozycje książek: "Dodaj co najmniej 2 propozycje"

## CTA i priorytetyzacja
- Primary CTA: akcja prowadząca do wartości (np. `Zarejestruj się`, `Dodaj głosowanie`).
- Secondary CTA: pomocnicze (np. `Zaloguj się`, `Anuluj`).
- Umiejscowienie: góra ekranu (hero) lub w kontekście (card actions).

## Onboarding (minimalny)
- Flow: Landing → Quick sign-up → Suggest first action → Short tooltip.
- Microcopy example (after club creation): "Twój klub jest gotowy — zaproś pierwszych członków lub dodaj głosowanie".
- Success metric: 70% użytkowników tworzy pierwsze głosowanie w sesji.

## Accessibility (must-have)
- Kontrast: AA dla tekstu i elementów interaktywnych.
- Focus states: widoczne outliney dla wszystkich elementów interaktywnych.
- ARIA: modal dialogs, alerts (aria‑live), descriptive labels for inputs.
- Manual tests: keyboard nav, NVDA/VoiceOver quick pass.

## Performance & Loading states
- Use skeleton loaders for lists (members, votes) instead of opaque spinner.
- Show progress text: "Tworzymy głosowanie..." + est. time <5s.

## Tone of voice i microcopy
- Ton: przyjazny, zorientowany na akcję, krótki.
- Przykłady:
  - Empty state: "Jeszcze tutaj nic nie ma — dodaj pierwsze głosowanie".
  - Success: "Głosowanie utworzone! Udostępnij link członkom".

## Heurystyki i checklisty do szybkiej oceny zmian UX
- Czy ekran ma 1 primary CTA?
- Czy błędy są opisowe i naprawialne?
- Czy flow prowadzi do first value <5 min?

## Acceptance criteria (UX)
- Onboarding: 80% użytkowników kończy tworzenie klubu i pierwsze głosowanie bez pomocy.
- Formularze: wszystkie pola mają inline validation i aria labels.
- Accessibility: key screens pass keyboard navigation manual smoke tests.

## PYTANIA / NIEJASNOŚCI (UX decisions)
1. Anonimowość głosów? (wpływa na microcopy i komunikaty wyników)
   - PROPOZYCJA: wyniki publiczne, ale opcja anonimowego głosowania w ustawieniach klubu.

## Źródła / Cytaty
- "Value Proposition: Jedno miejsce do zarządzania book clubem zamiast 5 różnych narzędzi." — docs/business/bookclub-pro-mvp-scoping.md
- Rekomendacja viralności: "Public link - każdy głosuje bez konta." — docs/business/bookclub-pro-user-journey-map.md

## Next steps
- Przejść do klikalnego prototypu dla 2‑3 kluczowych ekranów (Landing, Create Voting, Club Page).
- Ustalić decyzję dotyczącą anonimowości głosów i public linków.

## Gotowe do review?
- [ ] Zasady zawarte i zrozumiałe dla PM/Designer/Dev
- [ ] Microcopy zaakceptowane lub przygotowane do iteracji
