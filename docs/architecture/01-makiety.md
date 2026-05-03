---
title: "Makiety - MVP BookClub Pro"
description: "Anotowane makiety kluczowych ekranów MVP"
status: draft
version: 0.1
authors: ["AI (wygenerowane)"]
references:
  - docs/business/bookclub-pro-user-journey-map.md
  - docs/business/bookclub-pro-mvp-scoping.md
date: 2026-05-04
---

# Makiety — MVP BookClub Pro

## Krótkie streszczenie kontekstu
- Cel produktu: umożliwić organizatorowi założenie klubu i osiągnięcie „time-to-value" w <5 minut.
- MVP skupia się na: tworzeniu klubu, zapraszaniu członków, tworzeniu głosowań oraz prostym czacie.
- Priorytet: desktop‑first, szybka walidacja hipotezy rynkowej, prosty front‑end z mockami backendu.
- Kluczowy sukces: "W 3 minuty założę book club, zaproszę członków i przeprowadzę głosowanie..." (źródło: user journey map).

## Indeks ekranów

| ID | Nazwa ekranu | Cel | Priorytet | Powiązany przepływ |
|----|--------------|-----|----------:|------------------|
| S001 | Landing / Home | Szybkie zarejestrowanie lub wejście do klubu | MVP | Sign-up, Dashboard |
| S002 | Rejestracja / Logowanie | Minimalny formularz email+hasło | MVP | Sign-up |
| S003 | Create Club | Utworzenie nowego klubu (nazwa, opis) | MVP | Create club |
| S004 | Club Page (dashboard klubu) | Zarządzanie członkami, głosowaniami, spotkaniami | MVP | Club flows |
| S005 | Create Voting | Formularz tworzenia głosowania na książkę | MVP | Voting |
| S006 | Members / Invite | Dodawanie członków przez link/email | MVP | Invite |

---

## Szczegółowe makiety ekranów

### S001 — Landing / Home
**Cel:** Przyciągnąć, wyjaśnić wartość i skierować do rejestracji.

**Komponenty:** header (logo, search, profile), hero (headline + sub‑headline + primary CTA), sekcja features, footer.

Wireframe:
```
+------------------------------------------------+
| Header: logo | CTA: Zaloguj | CTA: Zarejestruj |
+------------------------------------------------+
| HERO: "Zorganizuj swój book club w jednym miejscu" |
| Sub: "Zamiast 5 narzędzi - jedna platforma"    |
| [Zarejestruj się i załóż klub] [Masz konto? Zaloguj] |
+------------------------------------------------+
| Features (Cards): szybkie głosowania | zaproszenia | kalendarz |
+------------------------------------------------+
```

**Anotacje:**
- CTA primary prowadzi do `S002` (rejestracja). Minimalizować pola rejestracji (email + hasło).
- Nie pokazywać pełnego pricingu na hero (przykładowo: opcje Pro/Free wyświetlić po rejestracji).

**Responsive notes:** mobile: hero + jedna kolumna; desktop: 2‑kolumny z feature cards.

---

### S002 — Rejestracja / Logowanie
**Cel:** Szybkie założenie konta (<2 pola).

**Komponenty:** Email, Hasło (min 6), CTA Submit, link do logowania.

Wireframe:
```
+-----------------------------
| Logo                      |
| Email [__________]        |
| Hasło [__________]       |
| [Zarejestruj się]         |
| link: Masz już konto?     |
+-----------------------------
```

**Walidacja / dostępność:**
- Walidacja pola email przy blur; komunikat błędu pod polem (ARIA live region).
- Pola mają `aria-label` i `autocomplete`.

---

### S004 — Club Page (dashboard klubu)
**Cel:** Centralne miejsce zarządzania klubem: członkowie, głosowania, spotkania, czat.

Wireframe (desktop):
```
+------------------------------------------------+
| Header: klub.logo | nazwa klubu | actions      |
+------------------------------------------------+
| Sidebar | Main area (Cards: Active voting, Next meeting) |
|         | - CTA: Add Voting  - CTA: Invite Members         |
+------------------------------------------------+
```

**Anotacje:**
- Kliknięcie karty „Add Voting" otwiera `S005` (Create Voting) w modalu.
- CTA „Invite" otwiera `S006` (Invite) — opcja copy link i email invite.

**Accessibility:** focus order: sidebar → main → modal. Przy zamykaniu modalu focus powraca do CTA.

---

### S005 — Create Voting
**Cel:** Szybkie przygotowanie głosowania na książkę (prefill possible).

**Pola:** Tytuł głosowania (prefill), Propozycje książek (min 2), Deadline (calendar), Allow members to add proposals? (toggle)

Wireframe:
```
+-----------------------------
| Title [Wybór książki na marzec]
| Proposals: [Tytuł - Autor] [+Add]
| Deadline [calendar]
| [Create voting] [Cancel]
+-----------------------------
```

**Anotacje i Walidacja:**
- Real‑time validation: brak tytułu → komunikat pod polem.
- Po utworzeniu: pokaż modal z linkiem „COPY" i przyciskiem „Udostępnij".

---

## Design tokens / kolorystyka (propozycja)
- Primary: #0B5FFF (przyjazny niebieski) — CTA
- Secondary: #6B7280 (neutralny szary)
- Success: #10B981, Error: #EF4444
- Kontrast: zapewnić WCAG AA dla wszystkich CTA vs background

## Assets
- Zapis grafik i ikon: `docs/architecture/images/` (np. `club-dashboard.png`).

## Acceptance criteria (Makiety)
- Każdy ekran ma wireframe i listę komponentów.
- Wszystkie CTA mapowane do powiązanych przepływów.
- Walidacja pól i komunikaty błędów zdefiniowane.
- Accessibility: aria labels + focus order opisane.

## PYTANIA / NIEJASNOŚCI
1. Czy głosowania mają być anonimowe (tak/nie)?
   - Opcje: A) anonimowe; B) publiczne z identyfikacją; C) hybryda.
   - PROPOZYCJA: B (publiczne), ale umożliwić anonimowe w przyszłym update.
2. Czy goście (bez konta) mogą oddawać głosy przez publiczny link?
   - Opcje: A) Tak, bez logowania; B) Nie, tylko konto.
   - PROPOZYCJA: A (public link) — szybsza wiralność (zgodnie z rekomendacją w journey map).

## Mapa powiązań (cross‑reference)
| Ekran | Powiązany flow | MVP feature |
|-------|---------------|-------------|
| S001 | Sign-up → Dashboard | Rejestracja |
| S004 | Create Voting | Głosowania |
| S006 | Invite | Zaproszenia |

## Gotowe do review?
- [ ] Diagramy są czytelne
- [ ] Każdy ekran ma acceptance criteria
- [ ] Brak otwartych pytań krytycznych (anonimowość, public link)

## Źródła / Cytaty
- "W 3 minuty założę book club, zaproszę członków i przeprowadzę głosowanie na książkę bez przekopywania się przez 500 wiadomości w WhatsAppie" — docs/business/bookclub-pro-user-journey-map.md
- "Problem: Organizatorzy lokalnych book clubów używają rozproszonych narzędzi (WhatsApp, Google Docs, Excel, Doodle)" — docs/business/bookclub-pro-mvp-scoping.md
