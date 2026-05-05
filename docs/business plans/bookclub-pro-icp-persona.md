# WF_ICP_Persona - BookClub Pro

**Cel:** Definiowanie Ideal Customer Profile (ICP) dla BookClub Pro - platformy do zarządzania lokalnymi book clubami.

---

## 1. Wstępne Założenia

| Element | Wartość |
|---------|---------|
| **Produkt** | BookClub Pro - platforma SaaS do zarządzania book clubami |
| **1-liner** | "Jedno miejsce do zarządzania book clubem zamiast 5 narzędzi" |
| **Etap** | MVP |
| **Wstępny ICP** | Organizatorzy lokalnych book clubi w Polsce |

---

## 2. ICP Card (Profil Idealnego Klienta)

### Krótki Profil (1 akapit)

**Kto:** Organizator lokalnego book clubu w Polsce (wolontariusz, nie płatny)

**Co:** Koordynuje regularne spotkania grupy czytelniczej (5-20 osób), zarządza wyborem książek, harmonogramem spotkań i komunikacją z członkami.

**Ból:** Używa 5+ narzędzi jednocześnie (WhatsApp, Google Docs, Excel, Doodle), co powoduje chaos w informacjach, ginące głosowania i frustrację przy planowaniu spotkań.

**Decision Criteria:**
- Prostota - "nie chcę uczyć się nowego skomplikowanego narzędzia"
- Szybkość - "chcę założyć klub w 3 minuty"
- Wartość - "musi mi zaoszczędzić czas, który teraz marnuję na zarządzanie"

---

### Persona Bullets

| Atrybut | Opis |
|---------|------|
| **Demografia** | 25-55 lat, częściej kobiety (70%), miasta 50k+ |
| **Rola** | Wolontariusz - poświęca 2-4h/tydzień na organizację |
| **Tech level** | Średni - używa Facebook, WhatsApp, Google, ale nie developer |
| **Motywacja** | Chce spędzać czas na dyskusjach o książkach, nie na logistyce |
| **Obecne narzędzia** | WhatsApp (główna), Google Docs (harmonogram), Excel (głosowania), Doodle (ankiety), Email |
| **Budżet** | 0 zł (używa darmowych) → 29 zł/mies (jeśli wartość oczywista) |
| **Trigger zakupowy** | "Mam dość przekopywania się przez 500 wiadomości w WhatsAppie" |

---

## 3. Job To Be Done (Job Snapshot)

### Job Snapshot 1: Planowanie spotkania

| Pole | Wartość |
|------|---------|
| **Context** | Organizator chce zaplanować następne spotkanie book clubu |
| **Trigger** | Minęło 4 tygodnie od ostatniego spotkania, trzeba ustalić nową datę |
| **Desired Outcome** | Wszyscy wiedzą kiedy, gdzie i co czytamy, potwierdzili obecność |
| **Current Solution** | Wysyła wiadomość w grupie WhatsApp → czeka na odpowiedzi → wpisuje w Excel → wysyła reminder |
| **Barriers** | Niektórzy nie odpowiadają, trzeba gonić, informacje giną w czacie |
| **Value (czas)** | 45 min na zaplanowanie 1 spotkania |
| **Confidence** | 8/10 |

### Job Snapshot 2: Głosowanie na książkę

| Pole | Wartość |
|------|---------|
| **Context** | Chcę aby członkowie zagłosowali na kolejną książkę do czytania |
| **Trigger** | Kończymy obecną książkę, potrzebujemy nową na kolejne spotkanie |
| **Desired Outcome** | Widzę wyniki głosowań, wygrywa książka z największą liczbą głosów |
| **Current Solution** | Tworzy ankietę w Doodle lub Google Forms → wysyła link w WhatsApp → czeka → liczy ręcznie |
| **Barriers** | Niektórzy nie głosują, wyniki są rozproszone, brak historii |
| **Value (czas)** | 30 min na przeprowadzenie głosowania |
| **Confidence** | 8/10 |

### Job Snapshot 3: Archiwizowanie dyskusji

| Pole | Wartość |
|------|---------|
| **Context** | Po spotkaniu chcę zachować najważniejsze punkty dyskusji |
| **Trigger** | Spotkanie się skończyło, za tydzień nikt nie pamięta o czym dyskutowaliśmy |
| **Desired Outcome** | Mam zapisane najważniejsze myśli, mogę do nich wrócić przed kolejnym spotkaniem |
| **Current Solution** | Robi notatki w Google Docs lub Evernote → link w WhatsApp → ginie w wiadomościach |
| **Barriers** | Nikt tego nie czyta, nie da się łatwo przeszukać |
| **Value (sentiment)** | Frustracja, "po co w ogóle prowadzę te notatki" |
| **Confidence** | 7/10 |

### Job Snapshot 4: Przyjmowanie nowego członka

| Pole | Wartość |
|------|---------|
| **Context** | Ktoś chce dołączyć do mojego book clubu |
| **Trigger** | Ktoś pisze na Facebooku lub poleca się znajomy |
| **Desired Outcome** | Nowa osoba ma dostęp do harmonogramu, historii i może uczestniczyć |
| **Current Solution** | Wysyła wiadomość z linkami do Google Docs, Excel, wyjaśnia zasady → często się gubi |
| **Barriers** | Nowy musi pytać o wszystko, nie ma jednego miejsca |
| **Value (czas)** | 20 min na onboardowanie nowego członka |
| **Confidence** | 6/10 |

### Job Snapshot 5: Przypomnienie o spotkaniu

| Pole | Wartość |
|------|---------|
| **Context** | Zbliża się spotkanie, chcę przypomnieć członkom |
| **Trigger** | Dzień przed spotkaniem |
| **Desired Outcome** | Większość potwierdziła obecność, wiem kto przyjdzie |
| **Current Solution** | Wysyła wiadomość w WhatsApp dzień przed → niektórzy nie widzą → przychodzi połowa |
| **Barriers** | Wiadomości giną, brak automatycznych przypomnień |
| **Value (czas)** | 15 min na przypomnienia |
| **Confidence** | 7/10 |

---

## 4. Problem Matrix (Problem Map)

### Zidentyfikowane Problemy

| # | Problem | Trigger | Obecne Rozwiązanie | Value |
|---|---------|---------|-------------------|-------|
| 1 | Chaos w komunikacji | 500+ wiadomości w grupie | WhatsApp | 2h/tydzień marnowane na szukanie informacji |
| 2 | Ginące głosowania | Po 2 tygodniach nikt nie pamięta o głosowaniu | Doodle, Google Forms | 30 min/głosowanie |
| 3 | Brak historii | Po spotkaniu notatki znikają | Google Docs | Frustracja, porzucenie notatek |
| 4 | Trudne onboardowanie | Nowy członek nie ma dostępu do historii | Ręczne linki | 20 min/nowy członek |
| 5 | Niska frekwencja | Nie ma automatycznych przypomnień | WhatsApp dzień przed | 50% frekwencja |
| 6 | Planowanie spotkań | Ciągle nowe propozycje dat | Wątek w WhatsApp | 45 min/spotkanie |
| 7 | Rozproszone dane | Ktoś ma w Excel, ktoś w Docs | Różne pliki | Czas na szukanie |

### Priorytetyzacja (Impact × Confidence × Ease)

| # | Problem | Impact (1-10) | Confidence (1-10) | Ease (1-10) | Priority (I×C×E) |
|---|---------|--------------|-------------------|-------------|-----------------|
| 1 | Chaos w komunikacji | 9 | 8 | 9 | **576** 🔴 |
| 2 | Ginące głosowania | 8 | 8 | 8 | **512** 🔴 |
| 3 | Brak historii | 7 | 7 | 8 | **392** 🟡 |
| 4 | Trudne onboardowanie | 6 | 6 | 9 | **324** 🟡 |
| 5 | Niska frekwencja | 7 | 7 | 8 | **392** 🟡 |
| 6 | Planowanie spotkań | 6 | 8 | 7 | **336** 🟡 |
| 7 | Rozproszone dane | 5 | 6 | 9 | **270** 🟢 |

### Analiza Problemów

**🔴 Najwyższy priorytet (Core Problems):**
- **#1 Chaos w komunikacji** - To główny ból, najwyższy impact
- **#2 Ginące głosowania** - Najwięcej "pain points" w feedbackach

**🟡 Średni priorytet:**
- #3, #5 - Warto rozwiązać, ale mniej krytyczne

**🟢 Niski priorytet:**
- #7 - Może poczekać na v2

---

## 5. Value Hypotheses (Kwantyfikacja Wartości)

| Hipoteza wartości | Metryka | Szacowana wartość | Uwagi |
|-------------------|---------|-------------------|-------|
| H1: Centralizacja komunikacji | Czas zaoszczędzony/tydzień | 2h = 12zł/godz | 60 zł/mies oszczędności czasu |
| H2: Automatyczne głosowania | Czas na głosowanie | 30 min → 5 min | 25 min oszczędności |
| H3:Historia dyskusji | Sentiment | Z frustracji w satysfakcję | Trudne do kwantyfikacji |
| H4: Automatyczne przypomnienia | Frekwencja | 50% → 75% | 50% więcej uczestników |
| H5: Szybsze onboardowanie | Czas na nowego członka | 20 min → 3 min | 17 min oszczędności |

**Szacowana wartość dla użytkownika:** 60-100 zł/mies (wartość czasu)

**Hipoteza willingness-to-pay:** 29 zł/mies (sweet spot - mniej niż wartość czasu, ale wystarczająco na darmowy cash flow)

---

## 6. Interview Script (7 pytań)

### Skrypt Wywiadu z Organizatorem Book Clubu

> "Cześć, przeprowadzam krótką ankietę o organizacji book clubi. Zajmie to 5 minut. Twoje odpowiedzi pomogą mi zrozumieć jak najlepiej pomóc organizatorom."

---

**Q1: Opowiedz o ostatnim razie, kiedy planowałeś spotkanie book clubu.**

*Szukaj: Procedura krok po kroku, ile narzędzi użył*

---

**Q2: Jak wygląda Twój typowy tydzień jako organizator?**

*Szukaj: Ile czasu poświęcasz na logistykę vs dyskusje o książkach*

---

**Q3: Co w tym procesie jest najbardziej frustrujące?**

*Szukaj: Pain points, emocje*

---

**Q4: Gdybyś miał narzędzie, które rozwiązuje ten problem - jak byś je rozpoznał, że działa?**

*Szukaj: Desired outcome, konkretne metryki*

---

**Q5: Ile czasu teraz marnujesz na te frustrujące rzeczy?**

*Szukaj: Czas, liczby*

---

**Q6: Co byś zapłacił za rozwiązanie, które oszczędza Ci ten czas?**

*Szukaj: WTP, ranges*

---

**Q7: Czy próbowałeś już jakichś narzędzi do zarządzania book clubem? Dlaczego nie zostały?**

*Szukaj: Alternatywy, bariery*

---

### Kontekst do wywiadu

| Miejsce | Kanał |
|---------|-------|
| Facebook Groups | "Książki", "Czytelnicze Hobby", lokalne grupy |
| Meetup | Grupy book clubowe w Polsce |
| Biblioteki | Organizatorzy spotkań w bibliotekach |
| Księgarnie | Kluby czytelnicze przy księgarniach |

---

## 7. Quick Experiments (Szybkie Eksperymenty)

### Eksperyment 1: Landing Page z Pre-Signup

| Element | Wartość |
|---------|---------|
| **Cel** | Walidacja messaging + willingness to sign up |
| **Hipoteza** | "Zorganizuj swój book club w jednym miejscu" przyciąga organizatorów |
| **Metryka** | >5% conversion na waitlist |
| **zasoby** | 2h setup (Framer/Notion), 0 zł |

### Eksperyment 2: Wywiady 1:1 (5 rozmów)

| Element | Wartość |
|---------|---------|
| **Cel** | Zbieranie Job Snapshot danych |
| **Hipoteza** | Potwierdzenie problemów z ICP Card |
| **Metryka** | Minimum 3/5 wywiadów potwierdza chaos w WhatsApp |
| **zasoby** | 5h outreach + rozmowy |

### Eksperyment 3: Concierge MVP (3 klientów)

| Element | Wartość |
|---------|---------|
| **Cel** | Sprawdzenie willingness to pay |
| **Hipoteza** | Organizatorzy zapłacą 29 zł za ręczne zarządzanie przez 1 miesiąc |
| **Metryka** | 3/3 płatności po concierge |
| **zasoby** | Google Sheets + email (manual) |

### Eksperyment 4: Small Ad Test (200 zł)

| Element | Wartość |
|---------|---------|
| **Cel** | Test CTR na ICP |
| **Hipoteza** | "Zarządzaj book clubem" > "book club app" |
| **Metryka** | >3% CTR na landing |
| **zasoby** | 200 zł Facebook/Instagram ads |

### Eksperyment 5: Referral Test (1 miesiąc)

| Element | Wartość |
|---------|---------|
| **Cel** | Test wiralności |
| **Hipoteza** | Organizatorzy polecają sobie jeśli wartość > 29 zł |
| **Metryka** | >10% użytkowników poleca |
| **zasoby** | 0 zł |

---

## 8. Checklista Końcowa

- [x] 1-stronicowa karta ICP
- [x] 5 Job Snapshotów
- [x] Problem Matrix z priorytetami
- [x] 7 pytań do wywiadu
- [x] 5 propozycji eksperymentów

---

## 9. Next Steps

| Kolejny workflow | Uzasadnienie |
|-----------------|--------------|
| **WF_Job_To_Be_Done** | Pogłębienie Job Snapshot z 5-10 wywiadów |
| **WF_GTM_STRATEGY** | Messaging + kanały do pozyskania ICP |
| **Build MVP** | Core features wg Problem Matrix (#1, #2 priorytet) |

---

## 10. Podsumowanie

**Core ICP:**
- Organizatorzy lokalnych book clubi w Polsce
- 25-55 lat, wolontariusze
- Używają WhatsApp + 4 inne narzędzia
- Pain: chaos, ginące informacje, czas na logistykę

**Top 2 Problemy do rozwiązania:**
1. Chaos w komunikacji (WhatsApp overflow)
2. Ginące głosowania (Doodle/Forms rozproszone)

**Key Metrics to Validate:**
- Time-to-value: <3 min
- Czas oszczędzony: >2h/tydzień
- Willingness-to-pay: 29 zł/mies

---

*Document created: 2026-03-25*
*Mode: Architect - WF_ICP_Persona*