# WF_MVP_Scoping - BookClub Pro

**Cel:** Drastyczne cięcie funkcji do absolutnego minimum, które pozwoli zwalidować hipotezę rynkową w 4-8 tygodni.

**Uwaga:** Subskrypcje i płatności zapewnione są z zewnątrz
 
**Podejście deweloperskie (ważne):** Frontend będzie budowany równolegle z backendem (fragment frontendu, za nim odpowiadający mu backend w osobnych etapach budowy). Budowa backendu będzie się odbywać z wykorzystaniem Supabase

---

## 1. Core Problem Definition

**Problem:** Organizatorzy lokalnych book clubów używają rozproszonych narzędzi (WhatsApp, Google Docs, Excel, Doodle) do zarządzania członkami, głosowania na książki i planowania spotkań. Jest to chaotyczne i nieefektywne.

**Value Proposition:** Jedno miejsce do zarządzania book clubem zamiast 5 różnych narzędzi.

**Target User:** Indywidualni organizatorzy lokalnych book clubi (5-20 członków)

---

## 2. Feature Audit (Brutal Cuts)

### Analiza przez filtry MVP

| Funkcja | Niezbędna? | <4h? | Traci klienta? | Walidacja bez budowy? | Decyzja |
|---------|------------|------|----------------|----------------------|---------|
| Tworzenie/zarządzanie klubem | ✅ TAK | ✅ TAK | ✅ TAK | ❌ NIE | **Tier 1** |
| Dodawanie członków (zaproszenia + dołączanie) | ✅ TAK | ✅ TAK | ✅ TAK | ❌ NIE | **Tier 1** |
| Głosowania na książki | ✅ TAK | ✅ TAK | ✅ TAK | ❌ NIE | **Tier 1** |
| Harmonogram spotkań | ✅ TAK | ✅ TAK | ❌ NIE | ❌ NIE | **Tier 1** |
| Dyskusje (proste wątki) | ✅ TAK | ⚠️ 8h | ❌ NIE | ❌ NIE | **Tier 1 (z hackiem)** |
| Powiadomienia email | ✅ TAK | ✅ TAK | ❌ NIE | ❌ NIE | **Tier 1** |
| Role użytkowników (admin/member) | ❌ NIE | ❌ NIE | ❌ NIE | ❌ NIE | **Tier 3 CUT** |
| Wiele klubów na konto | ❌ NIE | ❌ NIE | ❌ NIE | ❌ NIE | **Tier 3 CUT** |
| Zaawansowane statystyki | ❌ NIE | ❌ NIE | ❌ NIE | ❌ NIE | **Tier 3 CUT** |
| Integracja z Google Calendar | ❌ NIE | ❌ NIE | ❌ NIE | ❌ NIE | **Tier 2** |
| Załączniki do dyskusji | ❌ NIE | ❌ NIE | ❌ NIE | ❌ NIE | **Tier 3 CUT** |
| Moderacja dyskusji | ❌ NIE | ❌ NIE | ❌ NIE | ❌ NIE | **Tier 2** |
| Dark Mode | ❌ NIE | ❌ NIE | ❌ NIE | ❌ NIE | **Tier 3 CUT** |
| Mobile responsive | ❌ NIE | ❌ NIE | ❌ NIE | ❌ NIE | **Tier 3 CUT** |

---

## 3. The 80/20 Analysis

### Pytanie: "Czy mogę dostarczyć 80% wartości dla użytkownika, obcinając 80% złożoności?"

| Feature | Pełne rozwiązanie | Hack/MVP | Wartość dostarczona |
|---------|------------------|----------|---------------------|
| Dyskusje | Threaded comments z odpowiedziami, polubienia, załączniki | Prosty czat (jedna linia na wiadomość) bez wątków | 80% |
| Role | Admin, Moderator, Member, Guest | Tylko 2 role: Organizator (twórca) + Członek | 90% |
| Harmonogram | Kalendarz z recurring events, przypomnienia | Lista spotkań z datą, czasem, miejscem | 70% |
| Głosowania | Zaawansowane z deadline, wynikami automatycznymi | Proste głosowanie tak/nie/abstain + wyniki ręczne | 85% |
| Powiadomienia | Per-thread, per-event, konfigurowalne | Jeden email tygodniowo z podsumowaniem | 60% |

---

## 4. MVP Scope Document

## 🎯 MVP Scope: BookClub Pro

### Target Metrics (Co chcesz walidować?)

- [ ] Czy 10 użytkowników zapłaci za subskrypcję? (lub 20 darmowych użytkowników aktywnych)
- [ ] Czy time-to-value wynosi <5 minut?
- [ ] Czy organizator może założyć klub i zaprosić członków w <3 minuty?
- [ ] Czy użytkownicy wracają po 7 dniach?

### Core Loop (User Journey w MVP)

1. **Organizator zakłada klub** (przez external auth) → 30 sekund
2. **Organizator dodaje pierwsze spotkanie** (data, czas, miejsce, książka) → 1 minuta
3. **Organizator zaprasza członków** (link lub email) → 30 sekund
4. **Członkowie dołączają i głosują nad książkami** → 2 minuty
5. **Organizator widzi wyniki głosowania** → 10 sekund
6. **Członkowie dyskutują** (prosty czat) → dowolny czas

### Tier 1 Features (Must-Have)

**Total Build Time: ~40-50 godzin**

| Funkcja | Opis | Szacowany czas |
|---------|------|----------------|
| [x] Tworzenie klubu | Nazwa, opis, jeden organizator | 2h |
| [x] Zaproszenia członków | Link do dołączania + opcjonalne zaproszenia email | 4h |
| [x] Dołączanie do klubu | Członkowie dołączają przez link, rejestrują się i mogą dołączyć do klubu za pomocą kodu | 3h |
| [x] Lista członków | Wyświetlanie członków klubu | 2h |
| [x] Propozycje książek | Dodawanie propozycji (tytuł, autor, opis) | 4h |
| [x] Głosowania na książki | Proste głosowanie TAK/NIE/ABSTAIN | 6h |
| [x] Harmonogram spotkań | Dodawanie spotkań (data, czas, miejsce, temat) | 4h |
| [x] Lista spotkań | Wyświetlanie nadchodzących spotkań | 2h |
| [x] Prosty czat dyskusyjny | Jedna globalna przestrzeń na wiadomości | 8h |
| [x] Podstawowe powiadomienia | Email przy nowym spotkaniu, zakończeniu głosowania | 4h |
| [x] Dashboard organizatora | Podsumowanie: członkowie, głosowania, spotkania | 3h |
| [x] Dashboard członka | Widok: moje kluby, nadchodzące spotkania | 2h |

### Tier 2 Features (First Update - po feedbacku)

| Funkcja | Szacowany czas | Uzasadnienie |
|---------|---------------|--------------|
| Integracja z Google Calendar | 8h | Duży pain - ręczne wpisywanie spotkań |
| Moderacja wiadomości | 6h | Spam w dyskusjach |
| Powiadomienia push/in-app | 4h | Lepsza retencja |
| Statystyki głosowań | 4h | Organizatorzy chcą wiedzieć kto głosował |
| Wiele klubów na konto | 12h | Organizator z >1 klubu |

### Tier 3 Features (Post-Launch)

- Dark Mode
- Mobile responsive (PWA)
- Załączniki do dyskusji
- Threaded comments (odpowiedzi w dyskusjach)
- Role użytkowników (moderatorzy)
- Raporty i eksport danych
- Integracja z WhatsApp/Telegram
- AI Book Club Facilitator (pivot!)

---

## 5. What's Intentionally Cut (Red Lines)

### ❌ CUT z Tier 1:

1. **Role użytkowników** → Wszyscy członkowie mają równe prawa poza prowadzącym klub
2. **Wiele klubów na konto** → Tylko 1 klub na organizatora w MVP
3. **Threaded comments** → Prosty czat, nie wątki
4. **Załączniki** → Brak w MVP
5. **Mobile UI** → Desktop-first, mobile nie jest priorytetem
6. **Dark Mode** → Nie teraz
7. **Zaawansowane powiadomienia** → Tylko 1 email tygodniowo
8. **Integracje** → Brak w MVP (Google Calendar w Tier 2)

---

## 6. Tech Stack (Solo-Dev Optimized)

| Kategoria | Rekomendacja | Uzasadnienie |
|-----------|--------------|--------------|
| **Frontend** | `react` ^18.0.0 + `react-dom` ^18.0.0, TypeScript, Tailwind CSS, `@ifelse/shared-ui` >=0.4.0, `@apollo/client` ^3.0.0, `graphql` ^16.0.0, `react-oidc-context` ^3.0.0, `oidc-client-ts` ^3.0.0, `react-i18next` ^13.0.0 + `i18next` ^23.0.0, `lucide-react` >=0.400.0 | Component-driven stack, i18n + OIDC + GraphQL klient, reuse shared UI components |
| **Backend** | Początkowo: mockowanie API (frontend‑first) — lokalne mocki, IndexDB/LocalStorage; Docelowo: GraphQL API (Apollo Server / GraphQL Yoga / Hasura) z JWT/OIDC auth | Szybka walidacja hipotez przy mockach; GraphQL ułatwia iterację frontend↔backend |
| **Hosting** | Vercel (frontend) + serverless/managed GraphQL backend (np. serverless functions lub dedykowany GraphQL host) | Darmowy tier dla frontend; backend jako service lub serverless |
| **Email** | Resend (free tier) | 3,000 emaili/miesiąc free |
| **Styling** | Tailwind CSS | Szybki development |

---

## 7. Estimated Build Time

| Etap | Czas | Opis |
|------|------|------|
| Setup projektu | 2h | Next.js + Supabase + Tailwind |
| Database schema | 4h | Tabele: clubs, members, books, votes, meetings, messages |
| Auth integration | 2h | Podłączenie external auth |
| Club management | 4h | Tworzenie, edycja klubu |
| Member management | 6h | Zaproszenia, dołączanie |
| Book proposals & voting | 10h | Propozycje, głosowania |
| Meetings | 6h | Harmonogram spotkań |
| Simple chat | 8h | Prosty czat |
| Notifications | 4h | Email powiadomienia |
| Dashboards | 5h | Organizator + członek |
| **TOTAL** | **~51h** | |

---

## 8. Pre-Launch Checklist

- [ ] Całkowity time estimate: ~51h (w budżecie <200h ✅)
- [ ] 70%+ czasu idzie na core features, nie infrastructure ✅
- [ ] Masz plan na pozyskanie 10-20 beta-testers (lokalne grupy na Facebooku, Meetup)
- [ ] Umiesz wyjaśnić produkt w 1 zdaniu: "Jedno miejsce do zarządzania book clubem zamiast 5 narzędzi"
- [ ] Wiesz za co ludzie będą płacić (~$9-19/mies)
- [ ] Masz Plan B: jeśli pivot nie zadziała → AI Book Club Facilitator

---

## 9. Post-Launch Metrics to Track

| Metric | Cel | Akcja jeśli fail |
|--------|-----|------------------|
| Time-to-First-Value | <5 min | Uprościć onboarding |
| Weekly Active Users | >50% zarejestrowanych | Poprawić powiadomienia |
| Club Retention (30d) | >60% | Dodać więcej wartości (głosowania) |
| Member Engagement | >3 wiadomości/tydzień/club | Dodać trigger events |

---

## 10. Pivot Paths (z dokumentu Kill-The-Idea)

MVP jest zaprojektowane tak, aby mogło ewoluować w:

1. **Reading Challenge Platform for Teams** → Dodaj: yearly goals, progress tracking, HR reports
2. **AI Book Club Facilitator** → Dodaj: AI-generated discussion questions, chapter summaries
3. **BookClub for Publishers** → Dodaj: author sessions, publisher integrations

---

## 📝 Podsumowanie

**MVP BookClub Pro to:**
- ✅ Zarządzanie członkami (zaproszenia + dołączanie)
- ✅ Głosowania na książki (proste TAK/NIE)
- ✅ Harmonogram spotkań (lista)
- ✅ Prosty czat dyskusyjny
- ✅ Podstawowe powiadomienia email

**NIE to:**
- ❌ Role użytkowników
- ❌ Wiele klubów
- ❌ Threaded comments
- ❌ Mobile UI
- ❌ Dark Mode
- ❌ Integracje

**Czas budowy:** ~51 godzin

**Cena:** External (auth + billing provided)

---

*Document created: 2026-03-25*
*Mode: Architect - WF_MVP_Scoping*