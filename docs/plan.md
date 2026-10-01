# Masjid Al-Ihsan Website — Project Plan & Source of Truth

**Mosque:** Masjid Al-Ihsan, Felda Sungai (Sg) Panching Selatan, Kuantan, Pahang, Malaysia
**Document status:** Draft v1.5 — build-first; Phase 0 complete, Phase 1 in progress; to be presented to the committee alongside a working UAT site
**Prepared:** 30 September 2026 · **Revised:** 1 October 2026
**File:** `masjid-al-ihsan-website-plan.md`

> **How to use this document.** This is the single source of truth for design and build. Every decision lives in the **Decision Register (Section 12)** with an ID (e.g. `D-07`) and a status: **Recommended**, **Optional**, or **Needs confirmation**. Other sections reference those IDs. When a decision changes, update the register first, then the relevant section.
>
> **Labels used throughout**
> - **[Confirmed]** — stated in the project brief by the client.
> - **[Recommended]** — the author's recommendation; adopt unless the committee objects.
> - **[Assumption]** — a working assumption that must be validated.
> - **[Needs confirmation]** — a fact or decision only the committee can supply.
>
> No mosque contact details, bank account details, prices, policies, schedules or committee names appear in this document. Where they are needed, they are listed as questions in Section 2.5.

**Revision history**

| Version | Date | Change |
|---|---|---|
| 1.0 | 30 Sep 2026 | First draft for committee review |
| 1.1 | 1 Oct 2026 | Build-first delivery: infrastructure in Git and a working MVP on a non-custom UAT address (`*.workers.dev`) before the committee presentation; custom domain and account transfer at handover (Section 10, 9.6; D-08, D-09, D-73, D-74). Private storage for enquiries (D-45). Gallery renumbered to Phase 8. Corrected cross-references. |
| 1.2 | 1 Oct 2026 | Two MVP features added: **Waktu Solat** from JAKIM e-Solat (4.8; D-16, D-19) and **Derma** page with bank account and DuitNow QR under two-person change control (4.9; D-28, D-80–D-85). Phases, risks, maintenance and register updated to match. |
| 1.3 | 1 Oct 2026 | Account ownership revised: Cloudflare and Sanity are opened with the **mosque's official email** from day one (developer invited as a member); the code repo lives on the **developer's personal GitHub** during the build, with transfer to a mosque-owned GitHub organisation recommended at handover (D-73, D-28, D-75). |
| 1.4 | 1 Oct 2026 | Phase 0 findings built in: repo now lives at `docs/plan.md` (this file is the SSOT); e-Solat returns 8 daily times (incl. Dhuha) and next year's data only once JAKIM publishes it; content backups go to a private **R2 bucket** (not a private repo); branch-protection settings made explicit; Studio UI language limitation (D-29). Phase 0 status added. |
| 1.5 | 1 Oct 2026 | **No GitHub Actions** (developer's GitHub account is billing-locked; D-76): build and deploy move to **Cloudflare Workers Builds**; Sanity publish → Workers Builds **deploy hook** (no GitHub token needed); local pre-push checks; build-time Waktu Solat check; scheduled jobs (nightly rebuild, e-Solat check, backups) move to a Cloudflare cron Worker in Phase 2; yearly manual prayer-data sync. |
| 1.6 | 1 Oct 2026 | **Export to image for all content** brought forward from Phase 3 into Phase 2 (brief: "export selected content as attractive, readable images for WhatsApp and social media"): 10 templates, portrait + WhatsApp Status sizes, per-page link previews, "Simpan Gambar" panel with download + native file share (4.4; D-30, D-31, D-34, D-37). |

---

## Table of contents

1. [Executive summary and recommended direction](#1-executive-summary-and-recommended-direction)
2. [Audience, goals, assumptions and open questions](#2-audience-goals-assumptions-and-open-questions)
3. [Sitemap and key user journeys](#3-sitemap-and-key-user-journeys)
4. [Feature requirements and recommended behaviour](#4-feature-requirements-and-recommended-behaviour)
5. [Mobile-first design and accessibility guidance](#5-mobile-first-design-and-accessibility-guidance)
6. [Local SEO recommendations](#6-local-seo-recommendations)
7. [CMS and admin requirements](#7-cms-and-admin-requirements)
8. [Gallery storage and privacy](#8-gallery-storage-and-privacy)
9. [Technology options, comparison and recommendation](#9-technology-options-comparison-and-recommendation)
10. [Implementation plan](#10-implementation-plan)
11. [Risks, costs, maintenance, backups and handover](#11-risks-costs-maintenance-backups-and-handover)
12. [Decision register](#12-decision-register)
13. [Sources](#13-sources)

---

## 1. Executive summary and recommended direction

### 1.1 What we are building

A fast, Malay-language, mobile-first website that lets the Felda Sg Panching Selatan community and wider Kuantan public:

- see **this month's activities** and **weekly/monthly kuliah** at a glance;
- find and enquire about **mosque services** (homestay, dewan akad nikah, dewan serbaguna and others), including through **Google Search**;
- **share** any schedule, activity or service to WhatsApp — as a link *and* as a ready-made image;
- check **today's prayer times (Waktu Solat)** from JAKIM's official data;
- **donate** to the mosque using its official bank account or DuitNow QR;
- view the **organisation chart** and (later) **photo galleries**;
- be used comfortably by **older visitors**.

Committee members update everything through a **simple Malay-language admin panel**.

### 1.2 Recommended direction (summary)

| Area | Recommendation | Register |
|---|---|---|
| Front end | **Astro**, output as static HTML with almost no JavaScript | D-20 |
| Hosting | **Cloudflare** (static assets on Workers) | D-21 |
| CMS / admin | **Sanity** (hosted), Studio customised fully in Malay with task-based menus | D-22 |
| Gallery storage | **Cloudflare R2** for web-optimised copies; originals archived in the committee's Google Drive | D-40 |
| Enquiries & bookings | **WhatsApp-first enquiry** with pre-filled message + optional simple web form; no online payment or live availability at launch | D-13, D-14 |
| Share images | **Generated at build time** from fixed templates (portrait 1080×1350 and story 1080×1920), plus a "Kongsi ke WhatsApp" link share | D-30, D-31 |
| Accessibility | **WCAG 2.2 Level AA** as the formal target, plus selected age-friendly extras (44px tap targets, 18px base text, higher contrast) | D-50, D-51 |
| Local SEO | One page per service, Google Business Profile, schema.org `Mosque` / `Service` / `Event` markup, consistent name-address-phone | D-60–D-64 |
| Delivery approach | **Build first:** infrastructure in Git and a working MVP on a free, non-custom UAT address (`*.workers.dev`) with sample content; present it to the committee; custom domain only at handover. Cloudflare and Sanity are mosque-owned from day one; the repo moves from the developer's GitHub at handover | D-08, D-09, D-73, D-75; Section 10 |
| Waktu Solat | JAKIM **e-Solat** data for zone PHG02, fetched on a schedule and committed to the repo; the site never depends on the API at runtime | D-16, D-19; Section 4.8 |
| Derma | Display-only page with the official account and DuitNow QR; details kept in Git (not the CMS) with a two-person rule and automated QR check | D-80, D-81; Section 4.9 |
| Expected running cost | Domain fee only on free tiers at launch; the one likely paid upgrade is Cloudflare Workers Paid (USD 5/month) if limits are hit | Section 11.2 |

**Why this combination:** a small mosque's site is read far more than it is written. Pre-building every page as plain HTML makes it fast on weak mobile signals, cheap (static requests on Cloudflare are free and unlimited), and very hard to break or hack. A hosted CMS removes server maintenance from the committee's shoulders. Two credible alternatives (Payload CMS on Cloudflare, and WordPress) are compared in Section 9 and remain available if the committee's priorities differ.

### 1.3 What is deliberately *not* in scope at launch

- Online payments, deposits or real-time booking calendars (D-14, **Optional** later).
- User accounts for the public.
- Live-streaming, online donations gateway (card/FPX processing on the site), e-newsletter (listed as **Optional** in the register). The **display-only** Derma page (bank account + DuitNow QR) *is* in scope — Section 4.9.
- Azan audio, prayer notifications and qibla compass. Prayer **times** themselves are in scope (Section 4.8).

### 1.4 Delivery approach: build first, then present

Rather than asking the committee to approve a long document, the developer first builds the infrastructure and the core site (Phases 0–3, about 6–8 weeks) and deploys it to a free UAT address on Cloudflare, e.g. `masjid-al-ihsan.<subdomain>.workers.dev` (D-08). The committee then reviews a working site on their own phones (Phase 4), answers the open questions in Section 2.5, and supplies real content (Phase 5). Cloudflare and Sanity are owned by the mosque's official email from the start (D-73). Only after UAT sign-off are the custom domain, the repo transfer (D-75) and Search Console put in place and the website linked from Google Business Profile (Phase 6). GBP verification itself starts earlier, in Phase 4, because it can take weeks.

- **Why:** a working site gets faster, better-informed decisions than a document, and none of Phases 0–3 depends on committee answers.
- **Trade-off:** some rework may be needed if the committee changes scope or picks another technology option (A9). Structured schemas and sample content keep that rework small.
- **Safeguards on UAT:** not indexed by search engines, a visible "Laman Percubaan" banner on every page, and clearly fictional "CONTOH" content until real content is supplied (D-08, D-09).

---

## 2. Audience, goals, assumptions and open questions

### 2.1 Audiences

| Audience | Main needs | Device & context |
|---|---|---|
| **Local jemaah** (all ages, incl. elderly) | What's on this week; kuliah time and speaker; changes/cancellations | Phone, WhatsApp-heavy, often forwarded links |
| **Elderly jemaah** | Large readable text; simple steps; one clear action per screen; call/WhatsApp the mosque | Phone, often older/budget Android, larger system font |
| **Families planning events** (akad nikah, kenduri) | Is the dewan available? What's included? How do I book? | Phone; often searching Google first |
| **Visitors / travellers** | Homestay details, location, directions | Google Search → Maps → website |
| **Parents** | Children's classes (e.g. kelas mengaji, KAFA — *if offered, needs confirmation*) | Phone |
| **Committee (AJK)** | Update calendar/kuliah/services quickly without breaking anything | Phone or laptop; mixed digital confidence |

### 2.2 Goals and success measures

| Goal | Measure (proposed) |
|---|---|
| Community finds activities easily | ≥ 80% of test users find "next kuliah" within 30 s in usability test on UAT (Phase 5) |
| Schedules are current | Monthly calendar published before the 1st of each month; no past-dated "upcoming" items |
| Services discoverable on Google | Service pages indexed; appear for "dewan akad nikah Kuantan"-type searches within 3–6 months (monitor in Search Console) |
| Highly shareable | Share buttons used; WhatsApp is the top referral source in analytics |
| Fast | Content pages ≤ 2.5 s Largest Contentful Paint on a mid-range Android over 4G; Lighthouse Performance ≥ 90 on mobile |
| Accessible | Passes WCAG 2.2 AA checks; tested with at least 3 older users |
| Easy admin | A newly trained AJK member can publish an activity in ≤ 3 minutes unaided |

### 2.3 Confirmed requirements (from the brief)

- Monthly activity calendar. **[Confirmed]**
- Weekly and monthly kuliah schedules. **[Confirmed]**
- Services pages incl. homestay booking, dewan akad nikah, dewan serbaguna, others. **[Confirmed]**
- Services must be SEO-friendly for local Google searches. **[Confirmed]**
- Simple, intuitive, simple Malay, mobile-first; ~80% mobile traffic. **[Confirmed]**
- Highly shareable; items exportable as images for WhatsApp/social. **[Confirmed]**
- Elderly-friendly accessibility. **[Confirmed]**
- Admin panel/CMS usable by non-technical committee members. **[Confirmed]**
- Galleries (explore feasibility and storage impact). **[Confirmed — explore]**
- Editable organisation chart. **[Confirmed]**
- Lean, fast tech stack. **[Confirmed]**
- Waktu Solat from an official local source, in the MVP. **[Confirmed — added 1 Oct 2026]**
- Donation details: bank account name and number, and DuitNow QR, in the MVP. **[Confirmed — added 1 Oct 2026]**

### 2.4 Working assumptions

| # | Assumption | Impact if wrong |
|---|---|---|
| A1 | Traffic is modest: low thousands of visits/month, with spikes when links are forwarded (e.g. before Ramadan or big events). | Free tiers may be exceeded; move to paid tiers (small cost). |
| A2 | Budget is small; the committee prefers near-zero recurring cost. | Higher budget opens managed options (e.g. paid CMS support). |
| A3 | One developer builds it; after handover there may be no developer on call. | Favours hosted, low-maintenance components (drives D-22). |
| A4 | 3–8 committee members will need admin access. | Role design and seat limits (Sanity Free allows 20 seats). |
| A5 | Bookings are confirmed manually by a committee member; no online payment. | If online payment is required, scope and legal work increase. |
| A6 | Content is Malay only at launch. English is optional later. | Bilingual doubles content work; affects URL structure. |
| A7 | The mosque has, or can create, an official WhatsApp number and Google account owned by the institution (not a person). | Ownership/continuity risk (Section 11). |
| A8 | Kuliah times are often tied to prayer times ("selepas Maghrib"). | Schedule display must support relative times (Section 4.2). |
| A9 | The developer may build Phases 0–3 before committee approval, on mosque-owned Cloudflare and Sanity accounts, the developer's personal GitHub and sample content, and the committee is open to reviewing a working site rather than a document. | Rework if the committee changes scope or picks Option 2/3; if the committee objects to the developer building on the mosque's accounts before approval, move the UAT to developer-owned accounts and transfer at go-live. |
| A10 | The mosque has (or will open) a bank account in the mosque's own name with a DuitNow QR issued by the bank, and publishing it needs no approval beyond the committee (e.g. from the state religious authority). | If only a personal account exists, the Derma page must not launch; if external approval is needed, Derma may go live after the rest of the site. |

### 2.5 Open questions for the committee

These questions are put to the committee at the UAT presentation (Phase 4), alongside the working site. None of them blocks Phases 0–3. Questions 6, 7, 27, 28–31 and 34 must be answered before go-live (Phase 6).

**Identity & contact**
1. Official mosque name as it should appear everywhere (e.g. "Masjid Al-Ihsan Felda Sungai Panching Selatan")? Any logo?
2. Full postal address and exact map pin (Google Maps link).
3. Official phone number(s) and WhatsApp number(s). Which one for which service?
4. Official email (if any). Existing Facebook page / other social accounts?
5. Office/enquiry hours.
6. Who will own the domain, Google account, Cloudflare and CMS accounts? (Recommend an institutional email, with at least two AJK as owners. Cloudflare and Sanity are already opened with the mosque's official email, with the developer invited as a member — D-73. Which AJK should be added as second owners, and who controls the email's password and recovery?)
7. Preferred domain name (e.g. a `.my` or `.org.my` domain) — availability to be checked. Needed only at go-live; UAT uses a free `workers.dev` address. A `.org.my` domain may require proof of the organisation's registration, so allow lead time.

**Activities & kuliah**
8. Current list of recurring kuliah (day, frequency, time or "selepas Maghrib/Subuh", venue within mosque, usual penceramah, topic/kitab).
9. Who approves the monthly calendar, and by what date each month?
10. Should the website show the Hijri date next to the Gregorian date? (D-17)
11. Are there women-only or children's classes that need separate labelling?

**Services** (answer for each service: homestay, dewan akad nikah, dewan serbaguna, others)
12. Full list of services to publish (e.g. pengurusan jenazah, khidmat nikah, kelas, sewaan peralatan — *only if actually offered*).
13. Description, capacity, facilities included (PA system, chairs, kitchen, parking, air-conditioning, etc.).
14. Rates/donation/sumbangan structure — publish, publish "from", or "hubungi kami"? (D-15)
15. Rules and conditions (dress code, times, deposit, cancellation, cleaning).
16. Booking process today: who handles it, how far ahead, what documents are needed?
17. Should the site show "booked" dates? Who would keep that updated? (D-14)
18. Photos of each facility (and permission to publish them).
19. Homestay: number of rooms/units, amenities, check-in/out times, suitable for families/groups?

**Organisation chart**
20. Current positions and names; which positions to show (e.g. Pengerusi, Timbalan, Setiausaha, Bendahari, Imam, Bilal, Siak, AJK)?
21. Show photos of committee members? (Requires each person's consent — D-72.)
22. Term of office dates, and who updates the chart after changes?

**Gallery & privacy**
23. Does the mosque have a photo consent practice today? Any rules about photographing women or children?
24. Who takes photos, and where are originals stored now?

**Governance**
25. Who approves content before publishing (single approver or any editor)?
26. Who is the contact person for the website after launch?
27. Budget ceiling for one-off build and for annual running costs.

**Derma (donations)**
28. Official account holder name, bank and account number for donations. Is it in the mosque's own name? (Personal accounts must not be published — D-82.) Please provide the bank-issued DuitNow QR and a bank letter or statement header as proof.
29. One account, or separate tabung (e.g. Tabung Masjid, Anak Yatim) with separate accounts? (D-84)
30. Who authorises changes to the donation details? (Recommend Bendahari + Pengerusi — D-81.)
31. Does publishing donation details online need approval from the state religious authority or any other body? (A10)
32. Is the mosque approved for tax-exempt donation receipts? If yes, what exact wording and reference should be shown? (D-83)
33. How can donors request a receipt, and who handles it?

**Waktu Solat**
34. Confirm the mosque's prayer-time zone (assumed PHG02 — Kuantan, Pekan, Muadzam Shah). (D-19)
35. Should the site also show the mosque's own iqamah times? (D-85, Optional)

---

## 3. Sitemap and key user journeys

### 3.1 Sitemap

Malay URL slugs are recommended (D-03): short, readable, and match how people search.

```
/                              Utama (Home)
├── /aktiviti                  Kalendar Aktiviti (month view + list)
│   ├── /aktiviti/2026-10      Specific month (shareable)
│   └── /aktiviti/[slug]       Activity detail
├── /kuliah                    Jadual Kuliah (Mingguan & Bulanan)
│   └── /kuliah/[slug]         Kuliah series detail (speaker, kitab, time)
├── /perkhidmatan              Perkhidmatan (all services)
│   ├── /perkhidmatan/homestay
│   ├── /perkhidmatan/dewan-akad-nikah
│   ├── /perkhidmatan/dewan-serbaguna
│   └── /perkhidmatan/[slug]   Other services (added via CMS)
├── /waktu-solat               Waktu Solat (today + monthly table)
├── /derma                     Derma (bank account + DuitNow QR)
├── /galeri                    Galeri (Phase 8)
│   └── /galeri/[slug]         Album
├── /tentang                   Tentang Masjid
│   └── /tentang/organisasi    Carta Organisasi
├── /hubungi                   Hubungi Kami (contact, map, hours)
├── /privasi                   Notis Privasi
└── /aksesibiliti              Kenyataan Aksesibiliti
```

### 3.2 Navigation model

- **Header:** mosque name/logo (links home) and a clearly labelled **"Menu"** button (word, not just a ☰ icon).
- **Bottom bar on mobile (D-04, Recommended):** 4 items with icon + text label, always visible:
  `Utama` · `Aktiviti` · `Kuliah` · `Perkhidmatan`
  "Galeri", "Organisasi" and "Hubungi" live in the Menu.
- **Persistent contact:** a "WhatsApp Masjid" and "Telefon" button on the contact page, service pages and footer (not a floating bubble that covers content — see 5.3).
- Maximum depth: 2 taps from home to any detail page.

### 3.3 Home page content order (mobile)

1. Mosque name + one-line location ("Felda Sg Panching Selatan, Kuantan").
2. Notice banner (only when set in CMS), e.g. change or cancellation: *"Kuliah Maghrib Isnin ini dibatalkan."*
3. **"Waktu Solat Hari Ini"** card with the next prayer marked (4.8).
4. **"Minggu Ini"** — next 3–5 items (activities + kuliah), each with date, time, title.
5. Buttons: **Lihat Kalendar Bulan Ini** · **Jadual Kuliah**.
6. **Perkhidmatan** cards (homestay, dewan akad nikah, dewan serbaguna…).
7. **"Derma untuk Masjid"** block with a link to `/derma` (4.9).
8. Contact block: address, map link, WhatsApp, phone.

### 3.4 Key user journeys

**J1 — "Bila kuliah minggu ni?" (elderly jemaah, via forwarded link)**
Opens link from WhatsApp → lands on `/kuliah` → sees "Minggu Ini" list at top, large text → taps a kuliah → sees day, time ("Selepas Maghrib, anggaran 7:45 malam" *if the committee supplies an approximate time*), speaker, topic → taps **Kongsi ke WhatsApp** to forward to family.

**J2 — Planning an akad nikah (family, via Google)**
Searches "dewan akad nikah Kuantan" → lands on `/perkhidmatan/dewan-akad-nikah` → reads capacity, facilities, photos, what's included, conditions → taps **Tanya Tarikh Melalui WhatsApp** → WhatsApp opens with pre-filled message:
*"Assalamualaikum. Saya ingin bertanya tentang tempahan Dewan Akad Nikah Masjid Al-Ihsan pada tarikh: ____. Bilangan tetamu: ____."*
→ committee member replies and confirms manually.

**J3 — Save this month's calendar (any user)**
Opens `/aktiviti` → taps **Simpan Gambar** → sees preview of poster image → taps **Muat Turun** (download) or **Kongsi** (native share sheet with the image) → image lands in WhatsApp group/status.

**J4 — Add an event to phone calendar**
On an activity page → taps **Tambah ke Kalendar** → chooses *Google Calendar* or *Kalendar Telefon (.ics)*.

**J5 — AJK updates a cancelled kuliah (admin)**
Logs in → **Jadual Kuliah** → picks the series → **Tambah Perubahan** → selects date, chooses *Dibatalkan*, types reason → **Terbitkan** → site updates within ~2–5 minutes (see D-23) and the item shows a red "DIBATALKAN" label.

**J6 — AJK publishes next month's calendar**
**Aktiviti** → **Tambah Aktiviti** (or **Salin dari bulan lepas** for recurring items) → fills a short form → **Pratonton** → **Terbitkan**. Poster image is regenerated automatically.

---

## 4. Feature requirements and recommended behaviour

Priority key: **M** = Must (launch), **S** = Should (launch if time allows), **C** = Could (later).

### 4.1 Monthly activity calendar (`/aktiviti`)

**Data per activity**

| Field | Required | Notes |
|---|---|---|
| Tajuk (title) | Yes | Short, plain Malay |
| Tarikh mula / tamat | Yes | Timezone fixed to Asia/Kuala_Lumpur |
| Masa | Yes | Clock time **or** prayer-relative label (e.g. "Selepas Isyak") with optional approximate clock time |
| Tempat | Yes | e.g. "Dewan Solat Utama", "Dewan Serbaguna" |
| Kategori | Yes | Kuliah, Program Khas, Kelas, Gotong-royong, Kenduri/Majlis, Mesyuarat, Lain-lain |
| Penerangan | No | Short text |
| Penceramah/Penganjur | No | |
| Sasaran | No | e.g. Umum, Muslimah, Kanak-kanak, Remaja |
| Gambar/poster | No | Optional; auto-generated card used if empty |
| Status | Yes | Dijadualkan · Dipinda · Ditangguhkan · Dibatalkan |
| Nota perubahan | If status ≠ Dijadualkan | Shown prominently |

**Behaviour**

- **Default view on mobile = list grouped by week** (M). A full month grid is hard to read on a 360px screen for older users; offer **"Paparan Kalendar"** (month grid with dots/labels) as a toggle (S). Desktop shows grid + list side by side.
- Month switcher: large "‹ Bulan Lepas" / "Bulan Depan ›" buttons with month names, not arrows alone (M).
- Each month has its own URL (`/aktiviti/2026-10`) so it can be shared (M).
- **Past events:** in the current month, past items are shown greyed with "Telah berlangsung" and moved below upcoming ones; past months remain reachable (archive) but are not linked from home (M). Past events are marked `EventCompleted`-style in data only — no special SEO treatment needed.
- **Cancellations/changes:** item stays visible with a coloured status label **and** text (never colour alone), e.g. **DIBATALKAN**, **DITANGGUHKAN ke 12 Okt**, **PERTUKARAN PENCERAMAH**. Structured data uses `eventStatus` accordingly (M).
- Filter chips by category (S): "Semua · Kuliah · Program Khas · Kelas".
- On each activity: **Kongsi ke WhatsApp**, **Salin Pautan**, **Simpan Gambar**, **Tambah ke Kalendar** (M).
- Add-to-calendar: generate an `.ics` file per event at build time plus a Google Calendar template link (M). For prayer-relative times without a clock time, the calendar entry becomes an all-day entry with the time label in the title (e.g. "Kuliah Maghrib – selepas Maghrib").

### 4.2 Kuliah schedules (`/kuliah`)

**Model (D-11, Recommended):** store kuliah as **series** with **recurrence rules**, plus **exceptions**, rather than typing every date.

| Series field | Example (illustrative only) |
|---|---|
| Nama siri | "Kuliah Maghrib Mingguan" |
| Jenis | Mingguan / Bulanan / Sekali |
| Corak ulangan | "Setiap Isnin" · "Isnin minggu pertama setiap bulan" · "Setiap Ahad kedua" |
| Masa | "Selepas Maghrib" (+ optional anggaran masa) |
| Tempat | Dewan Solat Utama |
| Penceramah biasa | Name (from committee) |
| Topik / kitab | Optional |
| Sasaran | Umum / Muslimah… |
| Aktif dari / hingga | Date range (e.g. pause during Ramadan) |

**Exceptions** (per date): *Dibatalkan*, *Ditangguhkan (tarikh baru)*, *Penceramah jemputan (nama)*, *Tukar tempat*, *Tukar masa*.

**Display**

- Tabs: **Mingguan** | **Bulanan** (M).
- "Minggu Ini" section on top listing the actual dates generated from rules for the next 7 days, with exceptions applied (M).
- Weekly view: one card per day of the week (Isnin → Ahad) — familiar printed-timetable pattern (M).
- Monthly view: list of occurrences for the chosen month (M).
- Each series has a detail page (speaker, topic, usual time) for SEO and sharing (S).
- Generated occurrences also feed the activity calendar so jemaah see one combined view (M), with a toggle to hide kuliah (C).

**Why rules + exceptions:** the committee edits once per series, and a single cancellation is one small action — this is the biggest single saver of admin effort.

### 4.3 Services and facilities (`/perkhidmatan`)

**Services to launch (subject to committee confirmation, Q12):** Homestay, Dewan Akad Nikah, Dewan Serbaguna, plus others the committee lists.

**Content per service page (all managed in CMS)**

| Block | Purpose |
|---|---|
| Title + one-line summary | e.g. "Dewan Akad Nikah Masjid Al-Ihsan – Felda Sg Panching Selatan, Kuantan" |
| Photo gallery (3–8 photos) | Facility photos with Malay alt text |
| Penerangan | 2–4 short paragraphs in simple Malay |
| Kemudahan disediakan | Checklist (icons + text) |
| Kapasiti | Number or range (Needs confirmation) |
| Kadar / Sumbangan | Per D-15: exact, "bermula dari", or "Sila hubungi kami" |
| Syarat & peraturan | Bullet list; downloadable PDF optional |
| Cara menempah | Numbered steps (see flow below) |
| Lokasi | Address + "Buka di Google Maps" + "Waze" buttons |
| Hubungi | Named contact role (not necessarily a personal name), WhatsApp + phone buttons |
| Soalan Lazim (FAQ) | 3–6 Q&As; also helps SEO |
| Share | Kongsi ke WhatsApp, Simpan Gambar |

**Recommended enquiry/booking flow (D-13, Recommended)**

```
Service page
  → "Tanya Tarikh Melalui WhatsApp" (primary)      → WhatsApp with pre-filled message
  → "Hantar Borang Pertanyaan" (secondary, S)      → short form: nama, telefon, tarikh diingini,
                                                     bilangan tetamu/orang, catatan
                                                   → stored privately in the CMS "Pertanyaan" inbox (D-45)
                                                     + email/WhatsApp notification to service handler
  → Committee confirms availability manually, explains deposit/terms offline
  → (Optional) Committee marks date as "Ditempah" in CMS → shows on public availability list (D-14)
```

- **No online payment at launch** (D-14 Optional later). Payment adds PCI/gateway setup, refunds and reconciliation work that is disproportionate at this stage.
- **Availability display is Optional (D-14)**: only switch on if one person commits to keeping it current. A wrong "available" date is worse than none. If enabled, show a simple list "Tarikh telah ditempah" for the next 3 months — not a live booking engine.
- The optional web form must include a short privacy notice and a spam guard (Cloudflare Turnstile). Form data is personal data (see 8.5). Because Sanity's Free-plan datasets are public-read, enquiries must never be stored as ordinary documents (D-45).

**Search discoverability** — see Section 6 for the full plan.

### 4.4 Sharing and downloadable images

**Two sharing layers**

1. **Link share (M):** every page and item has
   - **Kongsi ke WhatsApp** → opens `https://wa.me/?text=<pre-written message + URL>`;
   - **Kongsi** → device share sheet via the Web Share API where supported, otherwise "Salin Pautan";
   - proper Open Graph image, title and description so forwarded links show an attractive preview card.
2. **Image share (M for calendar, kuliah and services; S for single activities):** a ready-made image the user can save or share.

**Share message example (auto-generated):**
> *Kuliah Maghrib – Isnin, 6 Okt 2026, selepas Maghrib di Masjid Al-Ihsan, Felda Sg Panching Selatan. Maklumat lanjut: [link]*
(Content illustrative; real details come from CMS.)

**Image templates (D-31)** — built (Phase 2, 1 Oct 2026). Every kind of content can be saved as an image:

| Template | Content | Sizes | Page with "Simpan Gambar" |
|---|---|---|---|
| Minggu Ini | Next 7 days, grouped by day: title, time, place, speaker | 1080×1350, 1080×1920 | Utama |
| Kalendar Bulanan | Month's activities + kuliah by date, status labels (DITANGGUHKAN ke …) | 1080×1350, 1080×1920 | Aktiviti (each month) |
| Aktiviti (single) | Title, status box, date, time, place, speaker, short description | 1080×1350, 1080×1920, 1200×630 link preview | Each activity |
| Jadual Kuliah | Weekly timetable Isnin → Ahad + monthly series, speaker line | 1080×1350, 1080×1920 | Kuliah |
| Siri Kuliah (single) | Name, rule ("Setiap Isnin"), time, place, speaker, topic | 1080×1350, 1080×1920, 1200×630 | Each kuliah series |
| Perkhidmatan | Name, capacity, rate, up to 5 facilities, WhatsApp enquiry line | 1080×1350, 1080×1920, 1200×630 | Each service |
| Waktu Solat Hari Ini | Imsak → Isyak (Zohor shown as Jumaat on Fridays), Gregorian + Hijri date | 1080×1350, 1080×1920 | Waktu Solat |
| Waktu Solat Bulanan | Month table (5 prayers), Fridays bold, zone, "Sumber: JAKIM (e-Solat)"; doubles as Ramadan imsakiyah | 1080×1350 (2 parts), 1080×1920 | Waktu Solat (each month) |
| Derma | QR, account holder name, bank, account number, recipient-name safety note | 1080×1350, 1080×1920 | Derma |
| Carta Organisasi | Positions grouped by level, vacancies shown | 1080×1350, 1080×1920 | Carta Organisasi |

- **How it's built (D-30 option A):** Satori lays out each template to SVG and resvg renders PNG, at build time (about 100 images in under 10 seconds). Fonts are the site's own (Atkinson Hyperlegible Next). All images are regenerated on every build, so a publish in the Studio or the nightly rebuild keeps them current.
- **Test-site safety (D-34):** while `UAT_MODE` is on, every image carries a yellow "LAMAN PERCUBAAN — CONTOH, BUKAN RASMI" band, so test images can't circulate as official.
- **Readability:** text on images keeps the site's rules: ≥ 32px on a 1080px canvas, high contrast, statuses in words, no text over photos. Rows are clipped to one line with "…" rather than shrinking; long lists split into "Bahagian 1/2, 2/2" with day headings never left alone at the bottom.
- **iPhone / iPad (UAT finding, 1 Oct 2026):** "Muat Turun" (`<a download>`) stalled in iOS Safari's Downloads list, while sharing worked. On iOS, saving now goes through the share sheet: one **"Simpan / Kongsi"** button, with the hint "pilih *Simpan Imej*" (saves to Photos, where users look, not Files). Older iOS without file sharing gets **"Buka Gambar"** → long-press → "Tambah ke Foto". Android and computers keep "Muat Turun" + "Kongsi". Images are pre-fetched when the panel opens, so the share sheet opens immediately after the tap. The `.ics` link no longer forces a download, so iOS opens its native "add to Calendar" prompt.
- **Custom selection (D-37, Optional):** the brief's "selected content" is met by giving every kind of content its own image. Letting a visitor tick several items and combine them into one image would need on-demand rendering (option B below) and is left for later.
- **Format:** PNG for text-heavy posters (sharp text, predictable colours); JPEG/WebP only for photo-heavy service cards. Target ≤ 400 KB per image so it sends quickly on WhatsApp.
- **Automatic overflow:** if a month has too many items for one image, the generator splits into "Bahagian 1/2, 2/2" rather than shrinking text below a minimum size (≥ 32px on a 1080px-wide canvas).
- **Design rules:** high contrast, large dates, one font family with Malay-friendly glyphs, mosque name and URL on every image, "Dikemas kini: [tarikh]" footer so forwarded images carry their freshness date.

**User flow**

```
Tap "Simpan Gambar"
  → Bottom sheet with preview + choice: [Potret] [Status WhatsApp]
  → [Kongsi]  (native share sheet with the image file, where the browser supports file sharing)
  → [Muat Turun] (always available fallback)
```

**Implementation options (D-30)**

| Option | How | Pros | Cons |
|---|---|---|---|
| **A. Build-time generation (Recommended)** | During each site build, render templates to PNG (e.g. Satori + resvg) and publish them as static files | Zero JS on the page, identical output on every phone, instant download, cacheable, doubles as OG images | Images refresh only when the site rebuilds (minutes after publishing) |
| B. On-demand server rendering | A small Cloudflare Worker renders the image per request and caches it | Always current; can render ad-hoc filters | Adds a running function (CPU limits on free tier, cold-path complexity) |
| C. In-browser screenshot (e.g. html-to-image) | Captures the page's DOM to an image on the phone | Any view can be exported | Heavy JS, inconsistent fonts/rendering on older Android, slow on budget phones — conflicts with "lean" goal |

**Accessibility of shared images:** images of text are acceptable here because every image mirrors a real HTML page with the same text; the image always carries a link back to that page, has descriptive alt text on the site, and the WhatsApp share includes a text caption, so screen-reader users receive the information as text.

**Browser note:** file sharing through the Web Share API is not supported in every browser, so the code must check support first (`navigator.canShare`) and fall back to download. Sharing must be triggered by a tap.

### 4.5 Organisation chart (`/tentang/organisasi`)

**Data:** Position (Jawatan), Name, Group/level (e.g. *Penaung*, *Pengurusan Utama*, *Pegawai Masjid*, *AJK Biro*), display order, optional photo (with consent), optional biro/portfolio, "Kosong" flag, term dates.

**Mobile presentation (D-35, Recommended):** not a wide tree diagram (unreadable on a phone). Use **grouped stacked cards**:

```
PENGURUSAN UTAMA
┌──────────────────────────┐
│ Pengerusi                │
│ [Nama]                   │
└──────────────────────────┘
┌────────────┐┌────────────┐
│ Timbalan   ││ Setiausaha │
│ [Nama]     ││ [Nama]     │
└────────────┘└────────────┘
PEGAWAI MASJID
Imam · Bilal · Siak …
```

- Desktop can show a simple top-down tree using the same data.
- **Vacancies:** show position with "Jawatan kosong" in muted style rather than hiding it (keeps structure clear).
- **Changes:** edited in CMS; page footer shows "Dikemas kini: [tarikh]" and optional "Sesi 2026/2027".
- Positions order is drag-and-drop in the CMS; names never typed into free text blocks, so layout can't break.
- Exportable as image (same generator; S).

### 4.6 Photo galleries (`/galeri`) — Phase 8

Assessment: **useful, but only with a light, disciplined workflow.** Galleries show the mosque as active and welcoming, support service pages (e.g. photos of past majlis in the dewan) and give content for social sharing. Risks are storage creep, slow pages and privacy. Full recommendation in Section 8.

Behaviour: albums per event (title, date, cover photo, 10–40 curated photos), lazy-loaded thumbnail grid, tap to open full view with swipe, "Kongsi album" link. No autoplay slideshows.

### 4.7 Other pages

- **Hubungi Kami (M):** address, map embed *on tap* (load the map only after the user taps "Tunjuk Peta" to protect speed), directions buttons (Google Maps, Waze), phone, WhatsApp, office hours (Needs confirmation).
- **Tentang Masjid (S):** short history (from committee), facilities overview.
- **Notis Privasi (M)** and **Kenyataan Aksesibiliti (M)** — see 5.6 and 8.4.
- **Waktu Solat (M)** and **Derma (M)** — see 4.8 and 4.9.

### 4.8 Waktu Solat (`/waktu-solat`) — MVP

**Source (D-16, Recommended):** JAKIM's official **e-Solat** service, `https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=<period>&zone=<zone>`. Prayer times are **never calculated by us**.

**Zone (D-19, Needs confirmation):** **PHG02** — Kuantan, Pekan, Muadzam Shah. **[Assumption]** Felda Sg Panching Selatan falls within Kuantan district and therefore PHG02. Confirm with the committee and against JAKIM's zone lookup for the mosque's map pin. Rompin left PHG02 for its own zone on 1 March 2025, which shows that zones do change. The zone is a single setting in the repo, not hard-coded in templates.

**Data pipeline (resilient, no runtime dependency on JAKIM)**

```
Developer runs `pnpm waktu-solat:sync` (every December once JAKIM publishes, or on an alert)
  → fetch the current year and next year for the configured zone (period=duration, 1 Jan–31 Dec);
    next year returns NO_RECORD until JAKIM publishes it, which is treated as "not yet", not an error
  → validate: every date present, all 8 times present, times in order (Imsak < Subuh < Syuruk < Dhuha < Zohor < Asar < Maghrib < Isyak)
  → if valid and changed: write data/waktu-solat/<zone>-<year>.json → pull request → merge → normal build/deploy
  → if the fetch fails or is invalid: keep the last good file; the site keeps working
Every site build (Workers Builds)
  → re-validates the current year's file and FAILS if it is missing or invalid (the previous deploy stays live)
  → from 1 December, warns if next year's file is missing
  → reads the committed JSON only (the build never calls e-Solat)
Scheduler Worker (Phase 2, Cloudflare cron)
  → weekly: compares e-Solat with the committed data and alerts on any difference or on next year's data appearing
```

- Up to a year of data is always committed, so an e-Solat outage or API change has no visible effect for months.
- e-Solat is a public government service, but it has no documented, supported public API. **Phase 0 spike (1 Oct 2026):** reachable from Malaysia; full-year PHG02 data for 2026 fetched and validated (365 days; dates use Malay month abbreviations such as `Okt`, `Ogos`). Still to confirm (Phase 2): access from Cloudflare's cron Worker, which may run outside Malaysia. If direct access is blocked, run the fetch from a Cloudflare Worker cron instead (same validation, same committed output).

**Display**

| Where | What |
|---|---|
| Home, near the top | **"Waktu Solat Hari Ini"** card: Subuh, Zohor (**Jumaat** on Fridays), Asar, Maghrib, Isyak, with the next prayer marked in text ("Seterusnya: Asar 4:32 petang"), not colour alone. Imsak and Syuruk sit behind a "Lihat semua" link. |
| `/waktu-solat` | Today's times, then a table for the whole month (proper `<th>` headers), month switcher, and Hijri date per row from the e-Solat data (if D-17 is approved). |
| Share | **Simpan Gambar** of the monthly table (1080×1350, 1080×1920). In Ramadan this doubles as the **jadual imsakiyah** poster. |
| Attribution | "Sumber: JAKIM (e-Solat) · Zon PHG02 (Kuantan, Pekan, Muadzam Shah)" shown under every prayer-times block and on every image. |

- **Formatting:** "5:52 pagi" style (Section 5.3). Times shown to the minute exactly as JAKIM publishes them, with no rounding.
- **Staying correct without daily publishing:** the page embeds the current month's times, and a tiny script (≤ 3 KB) picks today's row and the next prayer using Asia/Kuala_Lumpur time. A **daily scheduled rebuild at 00:05 MYT** keeps the plain HTML correct for no-JS visitors and link previews.
- **Link to kuliah times (S):** prayer-relative kuliah can show the official time for that date automatically, e.g. "Selepas Maghrib (Maghrib 7:18 malam)". This replaces most of the manual "anggaran masa" entry in D-12.
- **Out of scope:** azan audio, push notifications, qibla compass, and mosque-specific iqamah times (Optional, D-85).

**Acceptance:** the times for 5 sample dates match e-Solat's own website for the zone exactly; the home card shows the correct "next prayer" at 11:59 pm and 12:01 am MYT; a simulated API failure leaves the site unchanged and raises an alert.

### 4.9 Derma — donation details and DuitNow QR (`/derma`) — MVP

**What it is:** a **display-only** page showing the mosque's official bank account and DuitNow QR code so jemaah can donate with their own banking app. No payment is processed on the site, and no donor data is collected. (The online *donations gateway* in 1.3 remains out of scope.)

**Content**

| Block | Notes |
|---|---|
| Heading + short appeal | e.g. "Sumbangan untuk Masjid Al-Ihsan" (wording from committee) |
| **DuitNow QR** | The official QR issued by the mosque's bank for the **mosque's own account** (D-82), shown at least 240×240 px, with alt text "Kod QR DuitNow untuk [nama pemegang akaun]" |
| Account holder name | Exactly as registered with the bank, as text |
| Bank name + account number | Account number as large text grouped for reading (e.g. `1234 5678 9012`), plus **Salin Nombor Akaun** (copies digits only). Illustrative number only. |
| **Safety note** | *"Sebelum mengesahkan pemindahan, pastikan nama penerima yang dipaparkan oleh aplikasi bank anda ialah **[nama pemegang akaun]**. Kod QR rasmi masjid hanya dipaparkan di laman ini dan di papan kenyataan masjid."* |
| Funds (optional) | Separate tabung (e.g. Tabung Masjid, Anak Yatim) **only if** each has its own account (D-84) |
| Receipts / tax | How to request a receipt (contact role). Tax-exemption wording **only if** the committee confirms approved status (D-83). Otherwise nothing is said. |

**Placement:** Home "Derma untuk Masjid" block (before the contact block); in the Menu; footer link on every page. The mobile bottom bar stays at 4 items (D-04).

**Change control — the critical part (D-81, Recommended)**

QR-code fraud is a real and growing problem in Malaysia, including fake QR stickers on mosque donation boxes. On a website the equivalent attack is someone changing the bank details or QR image. Bank details change rarely, so they get **stricter control than any other content**:

1. **Not stored in the CMS.** Donation details live in the Git repo (`config/derma.json` + the QR image), not in Sanity. On Sanity's Free plan, a Penyunting's access cannot be reliably restricted at document level, so a compromised editor login could otherwise redirect donations.
2. **Two-person rule:** changes go by pull request to protected `main` and need approval from a second authorised person (developer + Bendahari/Pentadbir). `CODEOWNERS` covers `config/derma/`; approvers need their own GitHub account with write access to the repo. This needs branch protection with **no admin bypass**, so the repo is public (D-28). Bank details are public on the site anyway.
3. **Written authority:** each change is backed by a bank letter or statement header in the mosque's name, checked by the Bendahari. The PR records who checked it, but the document itself is not stored in the repo.
4. **Automated check at build:** the build decodes the QR image and fails if the recipient name in the DuitNow (EMVCo) payload does not match `accountName` in the config. If the bank's QR does not carry the name, the build compares the full decoded payload with an approved value stored in the config instead.
5. **Change alert:** GitHub automatically requests (and emails) a review from the code owners for any pull request touching `config/derma/`, and the Pengerusi and Bendahari **watch** the repo, so they are also notified of merges. An unexpected change is therefore noticed quickly.
6. **Live test:** after every change and quarterly, a committee member scans the live QR with two different banking apps, confirms the displayed recipient name, and sends RM1.

**Sample content on UAT:** before real details are approved, the page shows a placeholder QR that **cannot be paid to** (it encodes the text "CONTOH — bukan akaun sebenar") and an obviously fake account number.

**Share:** **Simpan Gambar** poster with QR, account name, account number and the safety note (1080×1350). The poster always shows the account name in text so a recipient can check it.

**Acceptance:** the QR on the live site scans in at least two Malaysian banking apps and shows the expected recipient; a PR changing `config/derma/` cannot merge without a second approval; a mismatched QR fails the build.

---

## 5. Mobile-first design and accessibility guidance

### 5.1 What "WCAG Elderly" actually is

There is **no formal standard called "WCAG Elderly."** The term usually refers to the W3C Web Accessibility Initiative's work on **older users** (the WAI-AGE project and the resource *"Older Users and Web Accessibility"*). That work found that the existing W3C accessibility standards already address most older users' needs, because age-related declines in vision, dexterity, hearing and cognition overlap with disability needs. So the practical meaning is: **meet WCAG properly, then add age-friendly design practice on top.**

| Item | Status | Use in this project |
|---|---|---|
| **WCAG 2.2** | Current W3C Recommendation — the formal, testable standard | **Target Level AA** (D-50) |
| WCAG 2.2 Level AAA criteria | Formal but optional | Adopt selected AAA items that help older users (D-51) |
| W3C WAI "Older Users" guidance | Guidance/education, not a standard | Design reference |
| **WCAG 3.0** | Still a **Working Draft** (latest published September 2026); not yet citable as a requirement; Recommendation not expected before ~2028 | Monitor only; do not target |

### 5.2 Formal target: WCAG 2.2 AA — the criteria that matter most here

| Area | Requirement | Our implementation |
|---|---|---|
| Text contrast (1.4.3 AA) | 4.5:1 normal text, 3:1 large | We go further: **≥ 7:1 for body text** (AAA 1.4.6) |
| Resize text (1.4.4) & Reflow (1.4.10) | Usable at 200% zoom and 320px width, no sideways scrolling | Fluid layout; test with Android "largest font" setting |
| Text spacing (1.4.12) | No loss of content when spacing increased | No fixed-height text boxes |
| Target size (2.5.8 AA) | ≥ 24×24 CSS px | We use **≥ 44×44 px** (AAA 2.5.5) and 8px spacing |
| Focus visible (2.4.7) / Focus not obscured (2.4.11) | Visible keyboard focus, not hidden by sticky bars | Thick focus ring; bottom bar never covers focused element |
| Dragging movements (2.5.7) | Alternative to drag | Swipe galleries also have Next/Prev buttons; CMS reorder has up/down buttons |
| Consistent help (3.2.6) | Help in same place | Contact buttons in the same position on every page |
| Redundant entry (3.3.7) | Don't make users retype | Enquiry form remembers name/phone during the session |
| Accessible authentication (3.3.8) | No cognitive tests to log in | CMS login by email link / Google sign-in, no CAPTCHA puzzles |
| Language of page (3.1.1) | `lang="ms"` | Set on every page; Arabic terms marked `lang="ar"` if in Arabic script |
| Non-text content (1.1.1) | Alt text | Required field in CMS for every image |
| Use of colour (1.4.1) | Not colour alone | Status labels always include words |

### 5.3 Age-friendly extras (beyond AA)

- **Base font 18px** body, 1.6 line height, headings clearly larger; no light/thin font weights; maximum ~65 characters per line.
- **Plain Malay** (D-05): short sentences, everyday words, avoid English jargon and abbreviations (write "Ahli Jawatankuasa" in full the first time, then "AJK"). Dates written as "Isnin, 6 Oktober 2026" — no numeric-only dates like 06/10/26.
- **Time format:** "8:30 malam" style (12-hour with pagi/tengah hari/petang/malam), which is how the community speaks, rather than 20:30.
- **Buttons look like buttons:** filled, labelled with verbs ("Lihat Jadual", "Hubungi Masjid"), icon + text, never icon-only.
- **One primary action per screen section**; avoid carousels, auto-rotating banners, pop-ups and floating chat bubbles that cover content.
- **Predictable navigation:** same bottom bar everywhere; "Kembali" link at top of detail pages.
- **Generous spacing** between links in lists to prevent mis-taps.
- **No time limits**, no auto-refresh.
- **Motion:** respect `prefers-reduced-motion`; no parallax.
- **Optional text-size control (C):** browsers already provide zoom; a site-level "A A+" toggle is Optional and must not replace proper responsive design.
- **Dark mode (C):** not necessary; if added, keep contrast ≥ 7:1.

### 5.4 Design system basics (starting point for the designer)

| Token | Value (starting proposal) |
|---|---|
| Font | A highly legible sans-serif with full Latin + Malay coverage (e.g. *Atkinson Hyperlegible* or *Inter*/*Noto Sans*); self-hosted, subset, ≤ 2 weights |
| Base size | 18px (1.125rem); small text never below 16px |
| Colours | Deep green or teal primary on white/near-white; text near-black (#1a1a1a); status colours red/amber/green each paired with a text label; all pairs checked for contrast |
| Radius / spacing | 8px radius; 8px spacing scale |
| Touch targets | Min 44×44px, 8px gap |
| Icons | Simple outline icons always with text labels |

### 5.5 Performance budget (mobile-first)

| Metric | Budget |
|---|---|
| Largest Contentful Paint | ≤ 2.5 s on mid-range Android, 4G (field "good" threshold) |
| Interaction to Next Paint | ≤ 200 ms |
| Cumulative Layout Shift | ≤ 0.1 |
| JavaScript per content page | ≤ 30 KB compressed (share sheet, filters, Waktu Solat "next prayer" ≤ 3 KB, copy account number) |
| Page weight (excluding gallery full-size images) | ≤ 500 KB |
| Web fonts | ≤ 2 files, `font-display: swap`, subset |
| Images | AVIF/WebP with responsive `srcset`; width/height set to avoid layout shift |
| Third-party scripts | None on public pages at launch except privacy-friendly analytics (D-65) |

### 5.6 Accessibility testing & statement

- Automated: axe or Lighthouse on every page template in CI.
- Manual: keyboard pass, TalkBack (Android) and VoiceOver (iOS) pass on key journeys, 200% zoom and largest-system-font pass.
- **User test with at least 3 jemaah aged 60+** on their own phones, on UAT before go-live (Phase 5), using journeys J1–J4.
- Publish a short **Kenyataan Aksesibiliti** in Malay: target standard, known limitations, and how to report problems (WhatsApp/phone).

### 5.7 Sample interface copy (simple Bahasa Melayu)

| Context | Copy |
|---|---|
| Home section | **Minggu Ini di Masjid** |
| Calendar button | **Lihat Kalendar Bulan Ini** |
| Month nav | **‹ Bulan Lepas** · **Bulan Depan ›** |
| Empty state | *Tiada aktiviti dijadualkan untuk bulan ini lagi. Sila semak semula nanti.* |
| Status labels | **DIBATALKAN** · **DITANGGUHKAN** · **DIPINDA** · **Telah berlangsung** |
| Change note | *Kuliah ini ditangguhkan ke Isnin, 13 Oktober 2026.* |
| Share | **Kongsi ke WhatsApp** · **Simpan Gambar** · **Salin Pautan** · **Tambah ke Kalendar** |
| After copying link | *Pautan telah disalin.* |
| Service CTA | **Tanya Tarikh Melalui WhatsApp** · **Hubungi Pejabat Masjid** |
| Form labels | *Nama penuh* · *Nombor telefon* · *Tarikh yang dikehendaki* · *Anggaran bilangan tetamu* · *Catatan (jika ada)* |
| Form success | *Terima kasih. Pertanyaan anda telah dihantar. Pihak masjid akan menghubungi anda.* |
| Form error | *Sila isi nombor telefon anda.* |
| Org chart vacancy | *Jawatan kosong* |
| Last updated | *Dikemas kini: 30 September 2026* |
| Map | **Tunjuk Peta** · **Buka di Google Maps** · **Buka di Waze** |
| Waktu Solat | **Waktu Solat Hari Ini** · *Seterusnya: Asar 4:32 petang* · **Lihat Jadual Bulan Ini** · *Sumber: JAKIM (e-Solat), Zon PHG02* |
| Derma | **Derma untuk Masjid** · **Salin Nombor Akaun** · *Nombor akaun telah disalin.* · *Pastikan nama penerima ialah [nama pemegang akaun] sebelum mengesahkan.* |

---

## 6. Local SEO recommendations

### 6.1 Principles

- **One service = one indexable page** with its own URL, title, description, photos and FAQ. Never hide services inside tabs or a single long page.
- **Server-rendered HTML** (Astro static) so Google sees all content without running JavaScript.
- **Consistent NAP** (Name, Address, Phone) — identical on website footer, Google Business Profile, Facebook page and any directories.
- Write for how people actually search, in Malay first: *dewan akad nikah Kuantan*, *dewan serbaguna Kuantan*, *homestay dekat Sungai Panching*, *masjid Felda Sungai Panching Selatan*, *sewa dewan murah Kuantan*. Include both "Sg" and "Sungai", and "Felda Sg Panching Selatan" and "Kuantan, Pahang" naturally in text.

### 6.2 Page-level metadata patterns

| Page | `<title>` pattern (≤ 60 chars where possible) | Meta description pattern |
|---|---|---|
| Home | Masjid Al-Ihsan Felda Sg Panching Selatan, Kuantan | Jadual kuliah, aktiviti bulanan dan perkhidmatan Masjid Al-Ihsan, Felda Sungai Panching Selatan, Kuantan, Pahang. |
| Service | Dewan Akad Nikah – Masjid Al-Ihsan, Sg Panching, Kuantan | Tempah dewan akad nikah di Masjid Al-Ihsan, Felda Sungai Panching Selatan, Kuantan. Kemudahan, kapasiti dan cara tempahan. |
| Calendar month | Aktiviti Oktober 2026 – Masjid Al-Ihsan Kuantan | Senarai aktiviti dan program Masjid Al-Ihsan bagi bulan Oktober 2026. |
| Kuliah | Jadual Kuliah Mingguan & Bulanan – Masjid Al-Ihsan | … |

Also: one `<h1>` per page matching the title intent; descriptive Malay image file names and alt text (e.g. `dewan-akad-nikah-masjid-al-ihsan-kuantan.webp`); canonical URLs; `hreflang` only if English is added later.

### 6.3 Structured data (JSON-LD)

| Page | Types | Key properties |
|---|---|---|
| All pages (site-wide) | `Mosque` (schema.org subtype of `PlaceOfWorship`) with `@id` | `name`, `address` (`PostalAddress`), `geo`, `telephone`, `url`, `logo`, `image`, `sameAs` (Facebook etc.), `hasMap`, `openingHoursSpecification` (office hours, if confirmed) |
| Each service page | `Service` | `name`, `serviceType`, `provider` → Mosque `@id`, `areaServed` (Kuantan / Pahang), `description`, `image`, `offers` **only if** prices are published (D-15) |
| Homestay | `LodgingBusiness` (or `Accommodation` + `Service`), `containedInPlace` → Mosque | `amenityFeature`, `checkinTime`/`checkoutTime` (if confirmed) |
| Halls | `Service` + optionally `Place` with `maximumAttendeeCapacity` | |
| Activity/kuliah detail | `Event` | `name`, `startDate` (with +08:00 offset), `location` (Mosque), `eventStatus` (`EventScheduled`/`EventCancelled`/`EventPostponed`/`EventRescheduled`), `eventAttendanceMode` (offline), `organizer`, `isAccessibleForFree` |
| FAQ blocks | `FAQPage` (valid markup, though Google shows FAQ rich results only for limited site types — treat as bonus) | |
| All detail pages | `BreadcrumbList` | |

**Expectation-setting:** Google's event search experience is aimed at events that are bookable by the public and held at a physical location. Markup is still correct and useful for understanding the page, but kuliah may not always appear as event rich results. Validate all markup with Google's Rich Results Test before launch.

### 6.4 Google Business Profile (GBP) — the biggest local lever

- **Claim/verify the mosque's GBP** (D-61). Start as soon as the committee approves (Phase 4), because verification can take days to weeks. Add the website link at go-live (Phase 6), never the UAT address. The mosque qualifies because it makes in-person contact with the public at a physical location. Must be managed by the mosque or its authorised representative, ideally owned by the institutional Google account with 2+ AJK as managers.
- Category: "Masjid"/"Mosque" as primary. Add website link, phone, hours, photos (building, dewan, facilities).
- Add services list in GBP matching website service names, each linking to its service page.
- Post updates (major events) occasionally; encourage genuine jemaah reviews (never incentivised).
- **Homestay separate listing — Needs confirmation (D-62).** Google's guidelines list rental properties such as vacation homes as ineligible for their own Business Profile, and only one profile per business is allowed. The safer approach is to promote the homestay through the mosque's profile and its own website page, unless the homestay operates with its own staffed reception meeting guests during stated hours. Review Google's eligibility page before creating any second listing.

### 6.5 Technical SEO checklist

- **UAT must stay out of search (D-08):** while `UAT_MODE` is on, every response carries `X-Robots-Tag: noindex` and `robots.txt` is `Disallow: /`; the UAT address is never submitted anywhere. At go-live the `workers.dev` route is disabled or 301-redirected to the custom domain so Google never sees two copies of the site.
- All absolute URLs (canonical, sitemap, Open Graph, `.ics`, share images) are built from `SITE_URL`, so switching from UAT to the custom domain is a config change plus rebuild (9.6).
- XML sitemap (auto-generated) + `robots.txt`; submit to **Google Search Console** (and Bing Webmaster Tools) at go-live.
- HTTPS everywhere, `www`/non-`www` redirect decided (D-02).
- Fast Core Web Vitals (Section 5.5) — also a ranking and usability factor.
- Past activity pages: keep them (they build history), but exclude very old months (e.g. > 12 months) from the sitemap. Cancelled events keep their page with status shown.
- 301 redirects if any slug changes (CMS enforces slug locking after publish — D-26).
- Local links: ask JAKIM/Majlis Ugama Islam Pahang listings, Felda community pages, local wedding/event directories to link to the service pages (only accurate, legitimate listings).

---

## 7. CMS and admin requirements

### 7.1 Main admin tasks (by frequency)

| Frequency | Task |
|---|---|
| Weekly | Add/adjust activities; mark kuliah changes (cancel, guest speaker) |
| Monthly | Publish next month's calendar; check services info is current |
| Ad hoc | Post a notice banner; answer enquiries; upload event photos |
| Rarely | Update org chart; edit service pages; change contact details |

### 7.2 Admin navigation (Malay, task-based)

```
Papan Utama (Dashboard)
  ├── "Minggu ini": upcoming items + quick actions
  └── Quick buttons: [+ Tambah Aktiviti] [Batal/Tukar Kuliah] [Tambah Notis]
Aktiviti & Kalendar
Jadual Kuliah
  ├── Siri Kuliah
  └── Perubahan (Pembatalan / Penceramah Jemputan)
Notis Penting (banner)
Perkhidmatan
Pertanyaan (inbox, if web form enabled)
Carta Organisasi
Galeri (Phase 8)
Tetapan Masjid (name, address, phones, hours, social links) — Pentadbir only
  (Waktu Solat and Derma are not edited here: prayer times update automatically;
   donation details change only through the two-person process in 4.9)
Bantuan (short how-to videos/guides)
```

Every form uses Malay labels (Sanity's own buttons such as "Publish" stay in English — D-29), helper text under each field with an example, date pickers (no typing dates), dropdowns for venue/category, and **required fields kept to the minimum**.

### 7.3 Roles and permissions (D-24)

| Role | Who | Can |
|---|---|---|
| **Pentadbir** (Administrator) | 2 trusted AJK (e.g. Setiausaha + one more) + developer during support period | Everything, incl. users, site settings, deleting |
| **Penyunting** (Editor) | Other AJK responsible for content | Create/edit/publish activities, kuliah, notices, services, gallery; cannot manage users or site settings; cannot hard-delete |

Note: Sanity's Free plan provides a limited number of permission roles (two), which matches the two roles above. A three-tier "draft-only contributor + approver" workflow would require a paid plan or a custom workflow. If the committee wants approval before publishing (Q25), use a simple convention first ("Minta Semakan" draft status + WhatsApp notification) — D-25.

### 7.4 Drafting, preview, publishing, correcting

- **Draft → Preview → Publish** for every item. Preview shows the item exactly as on the phone.
- **Scheduled publishing** (S): prepare next month's calendar and set it to publish on the 25th.
- **Publishing speed:** publishing triggers an automatic site rebuild; changes appear in roughly 2–5 minutes (D-23). The admin shows "Sedang dikemas kini… siap dalam beberapa minit" so editors don't republish repeatedly.
- **Urgent notices:** banner content can be fetched live on the client (tiny request) so an urgent "DIBATALKAN" appears within seconds — Optional (D-27); default is the rebuild path.
- **Corrections:** edit and republish; version history lets any editor view and restore previous versions.

### 7.5 Avoiding accidental deletion or confusing changes

- **Archive instead of delete** for editors ("Arkibkan"); only Pentadbir can permanently delete.
- **Revision history** on every document with one-click restore.
- **Confirmation dialogs** with plain wording: *"Anda pasti mahu membatalkan kuliah pada Isnin, 6 Oktober?"*
- **Validation:** end time after start time; required alt text; warning when publishing an activity in the past; warning if a kuliah exception duplicates an existing one.
- **Slug lock (D-26):** URLs are auto-generated from titles and locked after first publish to protect shared links and SEO.
- **Structured fields, not free-form page builders:** editors fill forms; layout is controlled by code, so nobody can accidentally break a page's design.
- **Weekly automatic backup** export of all content (Section 11.4).

### 7.6 Training and handover

- 60–90 minute hands-on session (in person, on their own phones and a laptop) covering J5/J6 and service edits.
- **"Panduan Ringkas"** — 2-page Malay PDF with screenshots, plus 5 short screen-recorded videos (≤ 2 min each): Tambah Aktiviti · Batal Kuliah · Tambah Notis · Kemas Kini Perkhidmatan · Muat Naik Gambar.
- A **practice dataset `latihan`** alongside `production` (Sanity Free allows two datasets). Both are public-read on the Free plan, which is acceptable for published content, but not for enquiries — see D-45. AJK first try the Studio on `latihan` during the UAT presentation (Phase 4).
- Named "Pentadbir Laman Web" role on the committee; handover checklist in Section 11.5.

### 7.7 Hosted vs custom vs other CMS approaches

| Approach | Verdict for this project |
|---|---|
| **Hosted headless CMS (Sanity)** — Recommended | No server to maintain, built-in drafts/versions/roles, customisable Malay admin UI, free tier sufficient. Trade-off: vendor dependency and plan limits; admin UI needs developer customisation to feel simple. |
| **Self-hosted open-source CMS (Payload on Cloudflare)** — Alternative | Full ownership and a very tailored admin in the same codebase; small monthly cost; the mosque (or its developer) owns updates and security patches. |
| **WordPress** — Alternative | Familiar to many, huge ecosystem; but plugins/themes need constant updates, frequent target for attacks, heavier pages unless carefully built. |
| **Fully custom admin** (e.g. Supabase + custom UI) | Most tailored but the most code to maintain; hard for a future developer to pick up. Not recommended. |
| **Google Sheets as CMS** | Very familiar and free, but no preview, no validation, easy to break by editing a column; acceptable only as a stop-gap. |

---

## 8. Gallery storage and privacy

### 8.1 Is a gallery worth it?

Yes, **as a Phase 8 feature** (after go-live) with curation rules: 10–40 best photos per event, not full phone dumps. It helps community pride, shows services in real use (useful on service pages), and provides shareable content. It should not delay launch of the core schedule and services features.

### 8.2 Storage estimate (illustrative — adjust to actual habits)

| Item | Per photo | Per event (30 photos) | Per year (4 events/month) |
|---|---|---|---|
| Original phone photo | ~3–5 MB | ~90–150 MB | ~4–7 GB |
| Web large (1600px WebP/AVIF) | ~250–400 KB | ~8–12 MB | ~0.4–0.6 GB |
| Thumbnail (400px) | ~30–50 KB | ~1–1.5 MB | ~0.05–0.07 GB |

**Key recommendation (D-40):** publish only **web-optimised copies** to the website storage (≈ 0.5 GB/year), and archive **originals** in the committee's existing Google Drive (or equivalent). On this basis the website's image storage stays within Cloudflare R2's free 10 GB for many years.

### 8.3 Storage and delivery options

| Option | Cost profile | Pros | Cons |
|---|---|---|---|
| **A. Cloudflare R2 + upload-time resizing (Recommended, D-40)** | Free up to 10 GB-month storage, then USD 0.015/GB-month; **no egress fees**; generous free operations | Cheap and predictable even if an album goes viral on WhatsApp; same vendor as hosting | Needs an upload step that resizes images (built into admin flow) |
| B. Sanity asset storage | Included in CMS plan quota | Simplest for editors (same upload box) | Free plan has hard caps — hitting a quota blocks functionality rather than billing; mixes large media with content quota |
| C. Supabase Storage | Free: 1 GB storage; free projects pause after 1 week of inactivity; Pro from USD 25/month | Good if already using Supabase | Pause risk on free tier; higher cost for this use |
| D. External albums (Google Photos shared album / Facebook) linked from site | Free | Zero storage/maintenance | Out of our control, inconsistent experience, not indexable, privacy controls weaker |

**Growth path:** if galleries become large (hundreds of albums), keep R2 and add Cloudflare Image Resizing/Images for on-the-fly sizes, or move older albums to Infrequent Access storage. Set a **retention rule** (e.g. keep 3 years online, older albums archived to Drive only) — D-42, Needs confirmation.

### 8.4 Image optimisation and delivery

- On upload: auto-rotate, **strip EXIF (removes GPS location and device data)**, resize to 1600px and 400px, encode WebP (and AVIF if supported by the pipeline), keep aspect ratio.
- On page: lazy-load below the fold, `srcset` sizes, blurred placeholder, fixed dimensions (no layout shift).
- Album page shows thumbnails only; full image loads on tap.

### 8.5 Privacy and consent

- **Consent policy (D-41, Needs confirmation):** agree a written photo policy before Phase 8, covering: notice at events ("Program ini akan dirakam untuk laman web dan media sosial masjid"); avoiding close-up photos of individuals without permission; **no identifiable photos of children without a parent's consent**; committee's position on photographing women and jemaah during ibadah; a quick **takedown request** channel (WhatsApp) with a commitment to remove within e.g. 3 working days.
- Captions must not name private individuals without consent.
- Org chart photos: individual consent from each person (D-72).
- **Malaysia's Personal Data Protection Act 2010 (as amended in 2024)** strengthened penalties and introduced data protection officer and breach-notification duties from 2025. Whether the PDPA applies to the mosque's activities (it focuses on commercial transactions; homestay/hall rental may be viewed as commercial) is a **legal question for the committee to confirm (D-43)**. Regardless of strict applicability, follow its principles: publish a Malay privacy notice, collect only what the enquiry form needs, restrict access to enquiries, delete enquiry records after a set period (e.g. 12 months), and have a breach response plan.
- **Enquiry storage (D-45):** the enquiry Worker writes each enquiry to Sanity with a document ID under a private path (e.g. `pertanyaan.<uuid>`). Sanity treats IDs containing a dot as non-root paths that unauthenticated requests cannot read, even in a public dataset. The write token lives only in the Worker's secrets. The Phase 3 acceptance test confirms that an anonymous query returns no enquiries. **Fallback:** if this cannot be verified, send enquiries by email notification only and do not store them.

### 8.6 Backups for photos

Originals already live in Drive (primary archive). R2 web copies can be regenerated from originals, and a monthly R2 → second-location copy is optional (D-44).

---

## 9. Technology options, comparison and recommendation

### 9.1 Options considered

**Option 1 — Astro (static) + Sanity (hosted CMS) + Cloudflare hosting + R2 — Recommended**
- **Astro** builds every page to plain HTML and ships JavaScript only where needed (share button, filters). Astro is open source (MIT) and its team joined Cloudflare in January 2026, with Cloudflare committing to keep it open source.
- **Cloudflare**: serves static files from a global network; requests to static assets are free and unlimited, even on the free Workers plan. A small Worker handles the optional enquiry form.
- **Sanity**: hosted content store + customisable admin ("Studio"). Free plan: 20 seats, 10,000 documents, 2 public datasets, 2 permission roles; hard caps (no surprise bills). Growth is USD 15/seat/month if ever needed.
- **Publishing:** Sanity webhook → Cloudflare Workers Builds deploy hook → rebuild → deploy (2–5 min).
- **Images for sharing:** generated at build (Satori + resvg).

**Option 2 — Payload CMS on Cloudflare Workers (D1 database + R2) with Next.js/Astro front end**
- Payload is an open-source CMS with an official one-click Cloudflare template (Workers + D1 + R2).
- Admin UI lives in the same codebase; very customisable, all data owned by the mosque.
- Community templates note the Payload Cloudflare template needs **Workers Paid** (USD 5/month minimum) due to size limits.
- Every admin page load and form save runs on Workers — more moving parts than static + hosted CMS, and the mosque's developer is responsible for upgrades.

**Option 3 — WordPress on Malaysian shared hosting (lightweight block theme + ACF/The Events Calendar + caching plugin)**
- Familiar admin; many developers available locally; plugins for events and forms.
- Needs regular core/plugin/theme updates and security hardening; common attack target; performance depends on hosting and discipline; recurring hosting fee.

**Option 4 (not recommended) — Next.js + Supabase + custom admin**
- Flexible, but custom admin is expensive to build and maintain; Supabase's free plan pauses projects after a week of inactivity, which is unacceptable for a public site's backend; Pro starts at USD 25/month.

### 9.2 Comparison

| Criterion | Opt 1: Astro + Sanity + Cloudflare | Opt 2: Payload on Cloudflare | Opt 3: WordPress |
|---|---|---|---|
| Speed on mobile | ★★★★★ static HTML, near-zero JS | ★★★★ fast if front end is static; admin heavier | ★★★ good only with careful theme + caching |
| Reliability | ★★★★★ static files; CMS outage doesn't take site down | ★★★★ depends on Worker + D1 | ★★★ depends on host/plugins |
| Maintenance burden | ★★★★★ no server; dependency updates only | ★★★ app + DB migrations + upgrades | ★★ constant plugin/core updates |
| Security | ★★★★★ tiny attack surface | ★★★★ | ★★ frequent target |
| CMS usability (after customisation) | ★★★★ (Malay labels, task menus, previews) | ★★★★★ fully tailored | ★★★★ familiar, but cluttered unless trimmed |
| Accessibility & SEO control | ★★★★★ full control of HTML | ★★★★★ | ★★★★ theme-dependent |
| Running cost | Free tiers + domain; possible USD 5/mo | ~USD 5/mo + domain | Hosting (annual) + domain + possible premium plugins |
| Future developer handover | ★★★★ common, documented tools | ★★★ needs Payload/Workers knowledge | ★★★★★ widest talent pool |
| Vendor lock-in | Medium (Sanity content exportable as JSON) | Low (open source, own DB) | Low |

### 9.3 Recommendation

**Adopt Option 1 (D-20 to D-23).** It best fits the brief's stated priorities — lean, fast, simple, low maintenance — and puts all complexity in the build rather than in anything the committee must look after.

**When to choose Option 2 instead:** the committee insists on owning all data on its own infrastructure, wants an approval workflow with more than two roles without paying for Sanity Growth, or wants enquiries/bookings to become a richer internal tool later.

**When to choose Option 3 instead:** the long-term maintainer will be a local WordPress agency, or the committee already pays for hosting and has WordPress skills in-house.

### 9.4 What the recommendation depends on

| Dependency | If different… |
|---|---|
| Traffic stays modest (A1) | Static hosting scales anyway; only the form Worker could hit the free daily limit (100,000 requests/day) — upgrade USD 5/mo |
| ≤ 20 editors and ≤ 10,000 documents (A4) | Sanity Growth (USD 15/seat/month) or switch to Option 2 |
| No online payment (A5) | Payment gateway integration adds scope, cost and compliance |
| A developer available for occasional updates (A3) | Without one, prefer the most managed parts (Option 1) even more strongly |
| Budget near zero (A2) | Option 1 remains ~domain-cost-only |

### 9.5 Recommended project structure (Option 1)

```
masjid-al-ihsan/
├── apps/web/            Astro site (pages, components, image templates)
│   ├── src/pages/       /, /aktiviti, /kuliah, /perkhidmatan, ...
│   ├── src/lib/         recurrence expansion, ics generation, schema.org builders
│   ├── src/og/          share-image templates (Satori)
│   └── wrangler.jsonc   Cloudflare Worker config (static assets, routes, preview URLs)
├── apps/studio/         Sanity Studio (Malay-customised admin)
│   └── schemas/         activity, kuliahSeries, kuliahException, service,
│                        orgPosition, galleryAlbum, notice, siteSettings, enquiry
├── workers/enquiry/     Cloudflare Worker for optional enquiry form (+ Turnstile)
├── config/derma/        derma.json (account name, bank, number, expected QR payload)
│                        + duitnow-qr.png — CODEOWNERS, two-person review (D-81)
├── config/site.json     non-CMS settings, e.g. prayer-time zone (PHG02, D-19)
├── data/waktu-solat/    committed JAKIM e-Solat data, e.g. PHG02-2026.json
├── seed/                "CONTOH" sample content for UAT (removed in Phase 5)
├── docs/                plan.md (this document, the SSOT), access list template,
│                        Panduan Ringkas
├── .env.example         SITE_URL, UAT_MODE, SANITY_PROJECT_ID, SANITY_DATASET
├── README.md            run, build, deploy, secrets, environments
├── workers/jadual/      Cloudflare cron Worker (Phase 2): nightly rebuild via deploy hook,
│                        weekly e-Solat check, weekly Sanity export to private R2
├── .githooks/pre-push   format, type-check, tests, Waktu Solat check before every push
└── .github/CODEOWNERS   two-person rule for config/derma/ (no GitHub Actions — D-76)
```

### 9.6 Environments and Git workflow (D-08)

| Environment | Address | Sanity dataset | Deployed from | Indexing |
|---|---|---|---|---|
| Local | `localhost` | `latihan` (or `production`, read-only) | Developer machine | — |
| PR preview | Cloudflare preview URL, `<version>-masjid-al-ihsan.<subdomain>.workers.dev` | `production` | Each pull request | `noindex` |
| **UAT** (until go-live) | `masjid-al-ihsan.<subdomain>.workers.dev` | `production` (sample content, then real content from Phase 5) | Merge to `main` | `noindex` + "Laman Percubaan" banner |
| **Production** (from go-live) | Custom domain (D-02) | `production` | Merge to `main` | Indexed; `workers.dev` route off or redirected |
| Studio (admin) | `<name>.sanity.studio` (free Sanity hosting; can move to `admin.<domain>` later) | both | Merge to `main` (changes under `apps/studio`) | Login required |

- **The UAT becomes production.** It's the same Worker and the same `production` dataset. Going live means attaching the custom domain, changing `SITE_URL`, turning off `UAT_MODE` and rebuilding. No migration is needed.
- **Repository home and visibility (D-28, D-75):** during the build the main repo lives on the **developer's personal GitHub account** and is **public**. On GitHub Free, branch protection and required reviews are only available for public repos, and the two-person rule for donation details depends on them. Protection on `main` must **include administrators** (no bypass), because the repo owner is otherwise exempt. At handover the repo is transferred to a mosque-owned GitHub organisation (GitHub keeps redirects from the old URL). Nothing sensitive goes in this repo: no secrets, no enquiries, no real access list (only a template). Content backups (which may include enquiries) go to a **private Cloudflare R2 bucket**, never to this repo or to workflow artifacts (both public). Alternative: keep the repo private on GitHub Pro/Team (monthly fee).
- **Branch protection settings:** pull request required (0 approvals), **review from Code Owners required** (so only `config/derma/` and `CODEOWNERS` need a second person), **no bypass for administrators**. No required status checks (there is no GitHub CI; Workers Builds reports a build check on each commit).
- **Branching:** `main` is protected and always deployable. Work happens on short-lived branches and is merged by pull request once CI passes (build, type-check, axe, Lighthouse CI). Releases after go-live are tagged (`v1.0.0`, …).
- **CI/CD (D-76):** Cloudflare **Workers Builds**, connected to the GitHub repo. On every push it runs `pnpm install --frozen-lockfile && pnpm ci:build` (tests, type-checks, Waktu Solat check, build). Then `main` deploys with `wrangler deploy`, and other branches upload a preview version with a preview URL. A failed check means no deploy. The same checks run locally in a pre-push hook. Free plan: 3,000 build minutes/month, 1 concurrent build, 20-minute timeout.
- **Content publishing:** Sanity webhook → Workers Builds **deploy hook** (a secret URL; no GitHub token) → build → deploy.
- **Scheduled jobs:** a small Cloudflare Worker with cron triggers (Phase 2) calls the deploy hook nightly at 00:05 MYT, checks e-Solat weekly and exports Sanity weekly to a private R2 bucket.
- **Secrets:** stored as Cloudflare build variables/secrets and Worker secrets, never in the repo or on GitHub. Use tokens owned by the **account/project**, not by a person: a Cloudflare *account* API token scoped to Workers for this account, and a Sanity project (robot) token. Then removing the developer later does not break deployments. All secrets are rotated at handover (Phase 6).
- **Access model (D-73):** the mosque's official email is the owner of Cloudflare and Sanity, with 2-step verification on, and recovery details controlled by the mosque. The developer works through their **own login, invited as a member** (Cloudflare: Administrator; Sanity: Administrator), not by using the mosque email's password day-to-day.
- **Infrastructure as code:** Worker config, routes and CI live in the repo, so the site can be redeployed into a different Cloudflare account if ever needed.

---

## 10. Implementation plan

**Approach: build first, then present (D-09).** The developer builds the infrastructure and a working MVP *before* the committee review, using clearly marked sample content, and deploys it to a free, non-custom **UAT** address on Cloudflare (`*.workers.dev`, D-08). The committee then reviews a real site on their own phones instead of a document, and the open questions in Section 2.5 are answered against something they can see. The custom domain, institutional accounts and Google listings are set up only at **handover and go-live** (Phase 6).

Durations assume one developer, part-time to full-time. Before the committee presentation the developer is the critical path; after it, **content collection** is.

### Phase 0 — Infrastructure in Git (≈ 1 week, developer only)

| Tasks | Output |
|---|---|
| Open **Cloudflare** and **Sanity** with the **mosque's official email**; turn on 2-step verification; invite the developer's personal login as Administrator in both (D-73) | Mosque-owned accounts, developer access by invitation |
| Create a public monorepo on the **developer's personal GitHub** (D-28, D-75) using the structure in 9.5, plus a private R2 bucket for content backups; protect `main` with admin bypass off; commit this plan as `docs/plan.md` (the SSOT from now on) | Repo with protected `main` branch |
| Scaffold Astro (static output) and the Sanity Studio; add lint, type-check and formatting | Builds locally |
| Configure Cloudflare Worker (static assets) via `wrangler.jsonc`, deployed to `masjid-al-ihsan.<subdomain>.workers.dev`; preview URLs enabled for pull requests | Deployed "hello" UAT site |
| Set up the environment config (`SITE_URL`, `UAT_MODE`, Sanity project/dataset) so going live is a config change, not a code change (9.6) | `.env.example`, GitHub/Cloudflare secrets |
| UAT safeguards on by default: `X-Robots-Tag: noindex`, `robots.txt` `Disallow: /`, and a visible **"Laman Percubaan"** banner (D-08) | UAT cannot be indexed or mistaken for the official site |
| Create a Sanity project with datasets `production` and `latihan`; deploy the Studio to `<name>.sanity.studio` | Empty Studio online |
| Cloudflare Workers Builds connected to the repo: checks + build on every push, deploy on `main`, preview uploads for other branches; deploy hook for Sanity; local pre-push hook (D-76). axe/Lighthouse checks join `ci:build` in Phase 1–2. Scheduled jobs deferred to the Phase 2 cron Worker job | Green pipeline end-to-end |
| Write `README.md` (run, build, deploy, secrets, environments) | First handover document |
| **Spike: JAKIM e-Solat** — call the API for zone PHG02, check the `year` period and response format, and build `waktu-solat-sync` with validation (4.8) | First `data/waktu-solat/PHG02-2026.json` committed, or a documented fallback (Worker cron) |
| Branch protection + `CODEOWNERS` for `config/derma/` | A test PR touching `config/derma/` cannot merge without a second approval |

**Status (1 Oct 2026):**
- ✅ Local repo scaffolded: Astro site with `UAT_MODE` (banner, `noindex` meta + `X-Robots-Tag`, `robots.txt` Disallow; verified via `wrangler dev`), Sanity Studio with a starter "Tetapan Masjid" schema, prayer-time sync with tests, 2026 PHG02 data committed, placeholder non-payable QR, `CODEOWNERS`, 6 workflows, README.
- ✅ GitHub repo created (public) with a `main` ruleset (PR required, Code Owner review, no bypass); Cloudflare and Sanity accounts created with the mosque email.
- ✅ GitHub Actions replaced by Workers Builds + pre-push hook (D-76). The developer's GitHub account is billing-locked, which blocks Actions.
- ✅ Workers Builds connected; UAT live on `workers.dev` with the "Laman Percubaan" banner.
- ✅ Sanity project `1xd617ey` with public datasets `production` and `latihan` (both empty); project ID set as the Studio default.
- ✅ Hosted Studio deployed at `https://masjid-al-ihsan.sanity.studio` (appId in `sanity.cli.ts`).
- ✅ Live UAT checked (1 Oct 2026) at `https://masjid-al-ihsan.masjidalihsansps.workers.dev`: `X-Robots-Tag: noindex, nofollow`, `robots.txt` Disallow, real 404, banner shown.
- ✅ `SITE_URL` build variable applied; canonical on UAT is the `workers.dev` address. Builds now normalise `SITE_URL` and fail clearly if it is missing or invalid.
- ✅ `sanity-publish` deploy hook + Sanity webhook (dataset `production`, published changes only, enquiries excluded): publishing in the Studio triggers a Cloudflare build that succeeds.
- ✅ **Phase 0 complete (1 Oct 2026).**

**Acceptance:**
- A merge to `main` deploys to the UAT URL automatically. A PR gets its own preview URL.
- Publishing a test document in Studio triggers a rebuild that appears on UAT within 5 minutes.
- `curl -I` on UAT shows `X-Robots-Tag: noindex`, and the banner shows on every page.
- No secrets in the repo. Every account's login and recovery details are recorded in the access list (11.5).

### Phase 1 — Design foundations (≈ 1 week)

| Tasks | Output |
|---|---|
| Mobile-first wireframes for Home, Aktiviti, Kuliah, service page, Org chart | Wireframes (in code or a design tool) |
| Design tokens, typography, contrast checks, base components (buttons, cards, status labels, bottom bar) | Mini design system in the repo |
| Sanity schemas for all Section 4 content types, with Malay labels and validations | Schemas reviewed against Section 4 |
| **Sample content** in `production`: fictional kuliah, activities, services and org chart, each labelled "CONTOH" (D-09); **non-payable placeholder QR** and fake account number in `config/derma/` | Realistic demo data, no real names, prices or bank details |
| Optional informal hallway test with 2–3 older users | Notes and changes |

**Acceptance:** all colour pairs ≥ 4.5:1 (body text ≥ 7:1). Schemas cover every field in Section 4. The sample content is obviously fictional.

**Status (1 Oct 2026):**
- ✅ Sanity schemas for Section 4, all labels, help text and validation messages in Malay: `aktiviti`, `kuliahSiri` (weekly / nth weekday monthly), `kuliahPerubahan` (per-date exceptions, with a duplicate warning), `perkhidmatan`, `jawatan` (photo requires a consent tick — D-72), `notis` (auto-expiry), `tempat`, `siteSettings` (singleton that can't be duplicated or deleted); shared `masa` (clock or prayer-relative time) and `gambar` (alt text required). Task-based menu per 7.2. Schema validation: 0 errors, 0 warnings.
- Notes: a one-off kuliah is entered as an Aktiviti with category *Kuliah* (no "Sekali" series type). Ordering uses a number field for now; drag-and-drop with up/down buttons (5.2, 2.5.7) comes with the Phase 2 Studio customisation, as do slug lock (D-26) and archive-not-delete. Enquiry (Phase 3) and gallery (Phase 8) schemas are not built yet.
- ✅ Design system: tokens in `apps/web/src/design/tokens.ts` (single source → CSS variables); **all 19 colour pairs tested automatically** (text ≥ 7:1, borders/focus ≥ 3:1); Atkinson Hyperlegible Next, self-hosted, Latin subset, 400 + 700; 18px base. Malay date/time formatting ("Selasa, 6 Oktober 2026", "8:30 malam", Hijri month names) with tests.
- ✅ Components (zero JavaScript): site header with a `<details>` "Menu" (keyboard-operable), mobile bottom bar (4 items, icon + label; switches to a 2 × 2 grid when the screen is too narrow for the user's text size, instead of breaking words), status labels, activity rows, Waktu Solat card (real JAKIM data, next prayer marked in text), notice banner, service card, org-chart card, buttons.
- ✅ Wireframes in code (UAT only, removed from production builds): `/reka-bentuk` (component gallery + contrast table) and `/reka-bentuk/utama` (home page in the 3.3 order).
- ✅ Checked with real mobile emulation (not headless Chrome's 500px minimum): no horizontal scroll at 300, 320 and 360px, including 130% text; axe-core (WCAG 2.2 A/AA + AAA contrast): **0 violations** on all pages.
- ✅ "CONTOH" sample content: `pnpm contoh:isi` / `pnpm contoh:buang` (IDs `contoh-*`; Tetapan Masjid overwritten with CONTOH values, never deleted). 29 documents (4 venues, 4 kuliah series incl. one monthly, 2 changes, 5 activities incl. one postponed, 3 services with FAQs, 9 org positions incl. one vacant, 1 notice). Loaded into `latihan` and validated: 0 errors, 0 warnings; removal tested. Loading into `production` waits for the webhook to be paused (one rebuild instead of ~29).
- ⏳ Next: wireframes for Aktiviti, Kuliah, service page and org chart come with their real pages in Phase 2. axe/Lighthouse cannot run inside Workers Builds (no browser), so they run locally before merging for now.

### Phase 2 — Core site (MVP) on UAT (3–4 weeks)

| Tasks |
|---|
| Pages: Home, Aktiviti (list + month grid), activity detail, Kuliah (weekly/monthly, series detail), Perkhidmatan index + service pages, **Waktu Solat**, **Derma**, Organisasi, Hubungi, Privasi, Aksesibiliti |
| Waktu Solat: home card + `/waktu-solat` month table from committed data; "next prayer" script (≤ 3 KB); daily rebuild; kuliah "Selepas Maghrib (Maghrib 7:18 malam)" labels (S) |
| Derma: page, home block, footer link, Salin Nombor Akaun, safety note; build-time QR decode check (D-81) |
| Scheduler Worker `workers/jadual` (cron): nightly 00:05 MYT deploy-hook call, weekly e-Solat comparison with alert, weekly Sanity export to private R2; alert channel set up (email via Cloudflare Email Routing once the domain is on Cloudflare, until then an agreed fallback) (D-76) |
| Recurrence expansion + exceptions for kuliah; statuses on activities |
| Link sharing (WhatsApp, native share, copy link), Open Graph tags, `.ics` + Google Calendar links — all URLs built from `SITE_URL` |
| Studio customisation in Malay: task-based desk structure, validations, previews, slug lock, archive-not-delete |

**Acceptance criteria:**
- A kuliah series "Setiap Isnin" with one cancellation displays correctly in weekly, monthly and calendar views, and the cancelled date shows "DIBATALKAN".
- A new activity published in Studio appears on UAT within 5 minutes.
- Every page passes automated axe checks with zero serious/critical issues; keyboard and 200% zoom checks pass.
- Mobile Lighthouse on UAT: Performance ≥ 90, Accessibility ≥ 95 on Home, Aktiviti and a service page. (SEO scores are measured at go-live, because UAT is deliberately `noindex`.)
- A WhatsApp share of any UAT page shows the correct title, description and image preview.
- Waktu Solat: the times for 5 sample dates match e-Solat exactly; the next prayer is correct either side of midnight MYT; with the API blocked, the sync fails safely and the site still shows the committed data.
- Derma: the placeholder QR cannot be paid to; a QR whose payload does not match `config/derma/derma.json` fails the build.

**Status (1 Oct 2026):**
- ✅ Data layer: build-time GROQ (published only), kuliah recurrence engine (weekly; nth/last weekday monthly; active windows; cancel / postpone + replacement date / guest speaker / venue / time changes), Malay time labels with the official prayer time ("Selepas Maghrib (Maghrib 7:00 malam)"). The plan's acceptance case (Setiap Isnin + one cancellation) is a unit test.
- ✅ Pages from Sanity: Home (3.3 order), Kuliah (Minggu Ini, weekly timetable Isnin→Ahad, monthly; series pages), Aktiviti (this month + `/aktiviti/YYYY-MM`, grouped by week, past items under "Telah Berlangsung"; detail pages), Perkhidmatan (index + one SEO page per service, WhatsApp-first enquiry with pre-filled message, FAQ), Waktu Solat (today's 8 times + month tables; all 5 prayers fit at 360px), Derma (CONTOH warning, QR, grouped account number, copy button as progressive enhancement, safety note), Carta Organisasi, Hubungi (map loads only on tap), Notis Privasi (draft for AJK), Kenyataan Aksesibiliti; footer on every page.
- ✅ Derma build check (D-81): QR decoded at build and compared with `config/derma/derma.json` (EMV tag 59 recipient name, or exact payload); runs in `ci:build` and pre-push.
- ✅ Checked: no page-level horizontal scroll at 300/320/360px; axe 0 violations on all pages.
- Deviations: kuliah "tabs" are in-page jump links (no JavaScript); the month grid view (D-10 toggle, "S") is not built yet.
- ✅ Sharing (D-32): "Kongsi ke WhatsApp" with a pre-written Malay message on every main page; device share sheet and "Salin Pautan" appear only where supported; Open Graph + Twitter card tags with a default 1200×630 preview image (per-page share images: Phase 3).
- ✅ Tambah ke Kalendar (D-33): `.ics` per activity and per kuliah series (RRULE weekly / nth / last weekday; cancelled and postponed dates excluded via EXDATE; prayer-relative times as all-day entries with the label in the title) + Google Calendar links; RFC 5545 escaping and line folding unit-tested.
- ✅ **Export to image (all content)** — see 4.4: 103 images per build (largest 265 KB), "Simpan Gambar" on every main page (two previews per row, Muat Turun + Kongsi), per-page link previews for activities, kuliah series and services. axe 0 violations and no overflow with the panel open.
- ✅ Live "Seterusnya": the Waktu Solat card embeds today + the next two days and updates every minute (next prayer highlight, "Subuh esok" after Isyak, switches day after midnight — Jumaat label included) without a rebuild. All JavaScript on the home page: 1.8 KB gzipped.
- ✅ Studio safety (plan 7.5, D-26): published URLs are **locked** (shown read-only with an explanation; a Pentadbir can unlock); **archive instead of delete** — an "Arkibkan" switch on activities, kuliah series and changes, services, org positions and notices hides the item from the website and moves it to an "Arkib" list; only a Pentadbir (administrator) sees Delete. Ordering stays a number field (no dragging needed — WCAG 2.5.7).
- ⏳ Remaining Phase 2: scheduler Worker (nightly rebuild, weekly e-Solat check, weekly backups).

### Phase 3 — Share images & technical SEO on UAT (1–2 weeks)

| Tasks |
|---|
| ~~Build-time image generator~~ — **done in Phase 2** (1 Oct 2026), see 4.4 |
| ~~"Simpan Gambar" with native file share + download fallback~~ — **done in Phase 2**; still to test on real Android (Chrome) and iPhone (Safari) |
| JSON-LD (Mosque, Service, LodgingBusiness, Event, BreadcrumbList, FAQPage); sitemap; canonical — generated, but only served as indexable when `UAT_MODE` is off |
| Optional enquiry form Worker + Turnstile + notification, storing enquiries privately (D-45) |

**Acceptance criteria:**
- Images are generated for every month, kuliah and service on each build. Text on images is ≥ 32px at 1080px width, and each image is ≤ 400 KB.
- Image share works on current Chrome (Android) and Safari (iOS); the download fallback works where file sharing is not supported.
- Rich Results Test (code-paste mode): no errors on service and event pages.
- If the form is enabled, an unauthenticated query to the Sanity API returns **no** enquiry documents.

### Phase 4 — Committee presentation & UAT (1–2 weeks, committee-paced)

| Tasks | Output |
|---|---|
| Present the working UAT site at an AJK meeting, with a 1–2 page Malay summary of recommendations and the Section 2.5 questions | Decisions recorded in the register (Section 12) |
| Invite 2–3 AJK to the Studio (Penyunting role) to try J5/J6 on the `latihan` dataset | Feedback on the admin experience |
| Agree account ownership (D-70), domain (D-02), budget (D-71) and target launch date (D-74) | Go-live prerequisites confirmed |
| Confirm prayer-time zone (D-19). Collect donation details: account in the mosque's name, bank-issued DuitNow QR, bank letter, authorised approvers, any external approval (Q28–Q33; D-81–D-84) | Derma and Waktu Solat ready for real data |
| Start **Google Business Profile** claim/verification with the institutional account (D-61); verification can take days to weeks | GBP verification in progress |
| Start content collection: content spreadsheet with one tab per type, each with a named AJK owner and deadline | Content pipeline running |
| Log UAT feedback as GitHub issues | Prioritised fix list |

**Acceptance:** the committee approves the direction (or chooses a different option from Section 9); every "Needs confirmation" item that blocks go-live has an answer or an owner and a date.

### Phase 5 — Real content, fixes & user testing on UAT (1–2 weeks)

| Tasks |
|---|
| Remove all "CONTOH" content; enter real content (developer + AJK together, which doubles as training) |
| Real donation details added by pull request, approved by the Bendahari (or other authorised AJK) against the bank letter; **live test:** two committee members scan the UAT QR with two different banking apps, confirm the recipient name and send RM1 |
| Fix the prioritised UAT issues from Phase 4 |
| Usability test with ≥ 3 jemaah aged 60+ and 2 AJK editors on UAT using journeys J1–J6 (D-52) |
| Final accessibility pass with TalkBack and VoiceOver |
| Panduan Ringkas + 5 short videos, recorded against the real Studio |

**Acceptance:** ≥ 80% task success on J1–J4; a new editor publishes an activity in ≤ 3 minutes; two AJK can publish and cancel items unaided; committee signs off UAT.

### Phase 6 — Handover & go-live (≈ 1 week)

| Tasks |
|---|
| Add ≥ 2 AJK as owners/administrators in Cloudflare and Sanity; developer drops to a non-owner role for the support period (D-73). Create a mosque-owned GitHub organisation and **transfer the repo** to it; developer stays as a collaborator (D-75). Update `CODEOWNERS`. |
| Rotate all secrets and API tokens after the transfer |
| Register the domain (D-02); attach it to the Worker as a custom domain; set `SITE_URL` and turn `UAT_MODE` off; rebuild |
| Disable the `workers.dev` route (or 301 it to the custom domain) so there is no duplicate site |
| Google Search Console + Bing Webmaster Tools; submit sitemap; add the website link to GBP; NAP consistency pass |
| Analytics (D-65), uptime monitor; confirm backup job and do one restore |
| Repeat the Derma live test on the custom domain; confirm the scheduler Worker (nightly rebuild, e-Solat check, backups) runs and its alerts reach a mosque contact |
| Announce: WhatsApp broadcast/group message with the link and a share image |

**Acceptance:** handover checklist (11.5) complete; custom domain live over HTTPS; no UAT banner or `noindex` in production; mobile Lighthouse SEO ≥ 95; home and all service pages indexed within 2–4 weeks.

### Phase 7 — Post-launch review (2–4 weeks after go-live)

- Review analytics, Search Console and the first month's publishing; fix the top issues.
- Check that the monthly calendar was published on time by the AJK without developer help.

### Phase 8 — Gallery (1–2 weeks, after photo policy agreed)

- R2 bucket, upload-with-resize flow in Studio, EXIF stripping, album pages, retention rule.
- **Dependency:** D-41 photo consent policy approved.
- **Acceptance:** an album with 40 photos loads first view ≤ 2.5 s LCP on 4G; no GPS metadata in any published image; takedown process documented.

### Later / Optional backlog

Availability list (D-14) · online payments (D-14) · online donations gateway · iqamah times (D-85) · Hijri dates (D-17) · English version (D-06) · live urgent banner (D-27) · PWA "Add to Home Screen" (D-07) · WhatsApp Channel link (D-66).

### Dependency summary

```
Developer-led (no committee input needed)
  Phase 0 Infra in Git + e-Solat spike ─> Phase 1 Design ─> Phase 2 MVP (incl. Waktu Solat, Derma) ─> Phase 3 Images/SEO
  (UAT live on workers.dev from Phase 0: noindex, "Laman Percubaan" banner, sample content)
                                                              │
Committee-led                                                 ▼
  Phase 4 Present & UAT ─> Phase 5 Real content, fixes & user testing
        ├─> GBP verification (D-61) ──────────────────┐        │
        ├─> Domain, accounts, budget (D-02/70/71) ────┤        │
        └─> Bank account + QR + approvals (D-81–84) ──┤        │
                                                      ▼        ▼
Handover                                         Phase 6 Go-live ─> Phase 7 Review

Photo policy (D-41) ────────────────────────────────────────────> Phase 8 Gallery
```

---

## 11. Risks, costs, maintenance, backups and handover

### 11.1 Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Schedules go stale (no one updates) | High | High — site loses trust | Named owner; monthly reminder (scheduled WhatsApp/email on the 20th); "Dikemas kini" dates visible; recurrence rules reduce effort |
| Accounts owned by one individual who leaves | Medium | High | Institutional email; ≥ 2 owners per account; access list in handover pack |
| Wrong info spreads via forwarded images | Medium | Medium | "Dikemas kini" date + URL on every image; cancellations shown prominently online |
| Free-tier limits change or are exceeded | Low–Med | Low–Med | Costs capped small (USD 5/mo Workers Paid; Sanity hard caps); monitor usage quarterly |
| Vendor dependency (Sanity) | Low | Medium | Weekly JSON export; schemas in Git; Option 2 as exit path |
| Privacy complaint about a photo | Medium | Medium | Consent policy, takedown channel, curation rules |
| Spam through enquiry form | Medium | Low | Turnstile, rate limiting, WhatsApp-first flow |
| Accessibility regressions after edits | Medium | Medium | Structured fields; required alt text; automated a11y checks on each build |
| Developer unavailable post-launch | Medium | Medium | Static site keeps running without intervention; documented repo; common tools |
| Rework after committee review (build-first approach) | Medium | Low–Med | Build only confirmed requirements; structured schemas; present UAT as soon as Phase 3 is done; Options 2/3 still open at Phase 4 |
| UAT link circulates and is mistaken for the official site | Medium | Medium | "Laman Percubaan" banner, `noindex`, "CONTOH" sample content; `workers.dev` route disabled or redirected at go-live |
| Code repo stays on the developer's personal GitHub after handover | Medium | High | Repo transfer is a go-live checklist item (D-75); if the committee prefers not to run a GitHub organisation, at least 2 AJK are added as collaborators and the arrangement is written down |
| Mosque official email is lost, locked, or controlled by one person | Low–Med | High | 2-step verification; recovery phone/email controlled by the mosque; ≥ 2 AJK know how to access it; recorded in the access list (D-73) |
| Deployments break when the developer leaves | Low | Medium | Account-owned Cloudflare API token and Sanity project token, not personal tokens (9.6) |
| Workers Builds loses access to the repo (e.g. GitHub account lock worsens, repo transfer) | Low–Med | Medium | Site stays live (static); reconnect the repo in Cloudflare; manual `wrangler deploy` from a laptop as a fallback |
| December prayer-data sync forgotten | Medium | High | Builds warn from 1 December and fail on 1 January without data; Phase 2 scheduler Worker alerts; calendar reminder for the Pentadbir |
| Enquiry personal data exposed via public dataset | Low | High | Private-path document IDs, verified by an anonymous-read test; email-only fallback (D-45) |
| **Donation details or QR tampered with** (compromised account or malicious change) | Low–Med | **Very high** — donations stolen, trust lost | Details outside the CMS; two-person review with bank letter; build-time QR payload check; change alerts to Pengerusi + Bendahari; safety note to check recipient name; quarterly live test (D-81) |
| Donation details published for a personal (not institutional) account | Low | High | Launch blocker: account must be in the mosque's name, proven by bank letter (D-82) |
| JAKIM e-Solat changes format, blocks overseas requests or goes down | Medium | Low | A year of data committed; validation before commit; alert on failure; Worker-cron fallback (4.8) |
| Wrong prayer-time zone | Low | High | Zone confirmed by committee and JAKIM zone lookup (D-19); zone shown on every prayer-times block |
| Tax-exemption wording shown without approval | Low | Medium | Only shown when the committee confirms approved status (D-83) |

### 11.2 Ongoing costs (verify at time of purchase; USD prices as published by vendors, 2026)

| Item | Launch estimate | If growth |
|---|---|---|
| Domain (`.my` / `.org.my`) | Annual registrar fee — **Needs confirmation** (quote from a MYNIC-accredited registrar) | — |
| UAT environment (`workers.dev`, PR previews, `*.sanity.studio`) | **Free** — no domain needed before go-live | — |
| Cloudflare hosting (static) | **Free** — static asset requests free and unlimited | Workers Paid **USD 5/month** if the form Worker exceeds free limits |
| Cloudflare R2 (gallery) | **Free** within 10 GB-month | USD 0.015/GB-month beyond; no egress fees |
| Sanity CMS | **Free** plan (20 seats, 10k documents) | Growth USD 15/seat/month |
| Email (institutional) | Free options exist; **Needs confirmation** | — |
| Analytics | Free (Cloudflare Web Analytics, cookieless) | — |
| Developer support (optional retainer) | **Needs confirmation** | — |

Realistic running cost at launch: **domain fee only**, with a probable ceiling of ~USD 5/month.

### 11.3 Maintenance plan

| Frequency | Task | Who |
|---|---|---|
| Weekly | Update activities/kuliah changes | AJK editors |
| Monthly | Publish next month (by 25th); check notices; review enquiries inbox; glance at Waktu Solat and Derma pages | AJK |
| Quarterly | Check service info, prices, org chart; review analytics & Search Console; check free-tier usage; **Derma live test** (scan QR in two banking apps, check recipient name, send RM1) | Pentadbir + Bendahari (+ developer) |
| Twice a year | Dependency updates, rebuild, a11y/perf re-check; restore test from backup | Developer |
| Annually | Renew domain; review access list (remove ex-AJK) and Derma approvers in `CODEOWNERS`; review photo retention; **run the Waktu Solat sync in December** once JAKIM publishes next year's data (builds warn from 1 December) | Pentadbir (+ developer) |

### 11.4 Backups

- **Content:** weekly automated export of the Sanity dataset via the Phase 2 scheduler Worker to a **private R2 bucket**; keep 12 weekly + 12 monthly copies (R2 lifecycle rule).
- **Code & schemas:** Git (GitHub), at least two owners.
- **Photos:** originals in Google Drive; web copies regenerable.
- **Restore drill:** twice a year, restore the latest export into a test dataset and build the site from it.

### 11.5 Handover checklist

- [ ] Access list: every account, owners, recovery emails/phones
- [ ] Cloudflare and Sanity: ≥ 2 AJK added as owners/administrators; mosque email recovery details controlled by the mosque (D-73)
- [ ] GitHub: repo transferred to a mosque-owned organisation, or ≥ 2 AJK added as collaborators if the committee decides otherwise (D-75)
- [ ] Developer reduced to a non-owner role for the agreed support period
- [ ] All secrets and API tokens rotated after transfer
- [ ] Custom domain live; `SITE_URL` set; `UAT_MODE` off (no banner, no `noindex`); `workers.dev` route disabled or redirected
- [ ] All "CONTOH" sample content removed from `production`; placeholder QR replaced with the approved DuitNow QR
- [ ] Derma: bank letter checked, second approver recorded on the PR, live test passed on the custom domain; `CODEOWNERS` lists the mosque's authorised approvers
- [ ] Waktu Solat: zone confirmed; sync and daily rebuild running under the mosque's accounts; failure alert goes to a mosque contact, not only the developer
- [ ] Repo README: how to run, build, deploy, rotate secrets
- [ ] This document updated with final decisions
- [ ] Panduan Ringkas (PDF) + 5 videos delivered
- [ ] Two AJK trained and have published live content unaided
- [ ] Backup job verified with one restore
- [ ] Search Console and GBP ownership transferred to institutional account
- [ ] Support contact and arrangement (if any) written down

---

## 12. Decision register

Status key: **Decided** (agreed, with date) · **Recommended** (adopt unless objected) · **Optional** (not in launch scope; decide later) · **Needs confirmation** (committee input required).

| ID | Area | Decision | Status | Notes / depends on |
|---|---|---|---|---|
| D-01 | General | Public site language: Malay (simple Bahasa Melayu) | Recommended | [Confirmed] requirement |
| D-02 | General | Domain name and `www` vs root | Needs confirmation | Q7; availability check; needed by go-live (Phase 6) only — UAT uses `workers.dev` |
| D-03 | IA | Malay URL slugs (`/aktiviti`, `/kuliah`, `/perkhidmatan/...`) | Recommended | SEO + readability |
| D-04 | IA | Mobile bottom bar: Utama, Aktiviti, Kuliah, Perkhidmatan + labelled "Menu" | Recommended | Validate on UAT (Phases 4–5) |
| D-05 | Content | Plain-language style guide (dates "Isnin, 6 Oktober 2026", "8:30 malam") | Recommended | |
| D-06 | Content | English version | Optional | Doubles content work |
| D-07 | Tech | PWA "Add to Home Screen" | Optional | |
| D-08 | Delivery | UAT on a free, non-custom address (`<worker>.<subdomain>.workers.dev`) with `noindex`, "Laman Percubaan" banner and PR preview URLs; the same Worker becomes production at go-live | Recommended | Section 9.6; custom domain D-02 |
| D-09 | Delivery | Build first (Phases 0–3) with "CONTOH" sample content, then present the working site to the committee | Recommended | A9; Section 1.4 |
| D-10 | Calendar | Mobile default = weekly-grouped list; month grid as toggle | Recommended | |
| D-11 | Kuliah | Series + recurrence rules + per-date exceptions | Recommended | |
| D-12 | Calendar | Store prayer-relative time labels with optional approximate clock time | Recommended | A8; approximate time filled automatically from Waktu Solat data (4.8, Should) |
| D-13 | Services | WhatsApp-first enquiry with pre-filled message; optional short web form | Recommended (form: Optional) | Q3, Q16 |
| D-14 | Services | Public "booked dates" list; online payments | Optional | Only with a committed owner; payments later phase |
| D-15 | Services | Publish exact rates / "bermula dari" / "hubungi kami" | Needs confirmation | Q14 |
| D-16 | Content | Waktu Solat in the MVP, from JAKIM e-Solat only (never calculated); scheduled fetch → validate → commit; site reads committed data | Recommended | [Confirmed] requirement 1 Oct 2026; Section 4.8 |
| D-17 | Content | Show Hijri date alongside Gregorian | Needs confirmation | Q10; official source available from the e-Solat data (4.8) |
| D-18 | Content | Notice banner for urgent changes | Recommended | |
| D-19 | Content | Prayer-time zone PHG02 (Kuantan, Pekan, Muadzam Shah) | Needs confirmation | Q34; [Assumption] mosque is in Kuantan district |
| D-20 | Tech | Front end: Astro, static output | Recommended | Option 1 |
| D-21 | Tech | Hosting: Cloudflare (static assets on Workers) | Recommended | |
| D-22 | Tech | CMS: Sanity (Free plan), Studio customised in Malay | Recommended | Alt: Payload (Option 2) |
| D-23 | Tech | Publish → webhook → rebuild; 2–5 min to live | Recommended | Webhook targets the Workers Builds deploy hook (D-76) |
| D-24 | CMS | Roles: Pentadbir, Penyunting | Recommended | Sanity Free = 2 roles |
| D-25 | CMS | Approval before publishing | Needs confirmation | Q25; convention first |
| D-26 | CMS | Slug lock after first publish; archive-not-delete for editors | Recommended | |
| D-27 | CMS | Live (non-rebuild) urgent banner | Optional | |
| D-29 | CMS | All our Studio labels, menus, help text and validation messages in Malay. Sanity's built-in interface stays in English, because no Malay locale package exists (checked 1 Oct 2026); revisit if one appears | Recommended | Training materials cover the few English UI words (Publish, etc.) |
| D-28 | Tech | Main repo is public (free branch protection and required reviews, admin bypass off); backups in a private R2 bucket | Recommended | Needed for D-81; alternative: private repo on GitHub Pro/Team (paid) |
| D-30 | Sharing | Share images generated at build time (Satori + resvg) | **Built** 1 Oct 2026 | Alt: on-demand Worker (needed only for D-37) |
| D-31 | Sharing | 10 templates covering all content; sizes 1080×1350, 1080×1920, 1200×630; PNG ≤ 400 KB | **Built** 1 Oct 2026 | Section 4.4 table |
| D-32 | Sharing | WhatsApp link share + native share + copy link on every item | Recommended | |
| D-33 | Calendar | Add to Calendar (.ics + Google Calendar link) | **Built** 1 Oct 2026 | |
| D-34 | Sharing | "LAMAN PERCUBAAN — CONTOH, BUKAN RASMI" band on every image while in UAT mode | Recommended | Removed automatically at go-live (`UAT_MODE=false`) |
| D-35 | Org chart | Grouped stacked cards on mobile; vacancies shown as "Jawatan kosong" | Recommended | |
| D-37 | Sharing | Visitor picks several items and exports them as one image | Optional | Needs on-demand rendering (D-30 option B); not in launch scope |
| D-36 | Org chart | Positions and names list | Needs confirmation | Q20 |
| D-40 | Gallery | R2 for web-optimised copies; originals in Google Drive | Recommended | Phase 8 |
| D-41 | Gallery | Photo consent & takedown policy | Needs confirmation | Q23; blocks Phase 8; interim answer for facility photos needed in Phase 4 |
| D-42 | Gallery | Retention period online (e.g. 3 years) | Needs confirmation | |
| D-43 | Privacy | PDPA applicability to mosque services | Needs confirmation | Legal view; follow principles regardless |
| D-44 | Backup | Secondary copy of R2 web images | Optional | |
| D-45 | Privacy | Enquiries stored in Sanity under private-path IDs (e.g. `pertanyaan.<uuid>`), written only by the Worker; email-only fallback | Recommended | Verify with anonymous-read test in Phase 3; Section 8.5 |
| D-50 | A11y | Formal target WCAG 2.2 Level AA | Recommended | |
| D-51 | A11y | Extras: 44px targets, 18px base text, ≥7:1 body contrast | Recommended | |
| D-52 | A11y | Usability test with ≥ 3 users aged 60+ | Recommended | Phase 5, on UAT before go-live |
| D-60 | SEO | One page per service with FAQ and local wording | Recommended | |
| D-61 | SEO | Claim/verify Google Business Profile for the mosque | Recommended | Q6 ownership; start in Phase 4, website link added in Phase 6 |
| D-62 | SEO | Separate GBP listing for homestay | Needs confirmation | Likely ineligible under Google's rules |
| D-63 | SEO | JSON-LD: Mosque, Service, LodgingBusiness, Event, BreadcrumbList, FAQPage | Recommended | |
| D-64 | SEO | Search Console + sitemap; exclude months > 12 months old from sitemap | Recommended | |
| D-65 | Analytics | Cookieless analytics (Cloudflare Web Analytics) | Recommended | |
| D-66 | Social | Link to official WhatsApp Channel / Facebook page | Optional | Q4 |
| D-70 | Accounts | Institutional ownership, ≥ 2 owners per account | Recommended | Q6; Cloudflare/Sanity institutional from day one (D-73); GitHub from handover (D-75) |
| D-71 | Budget | One-off build budget and annual running budget | Needs confirmation | Q27 |
| D-72 | Org chart | Show member photos (with individual consent) | Needs confirmation | Q21 |
| D-73 | Accounts | Cloudflare and Sanity opened with the mosque's official email from day one (2-step verification on); developer invited with their own login; account-owned deploy tokens | **Decided** 1 Oct 2026 | Q6; Section 9.6 |
| D-75 | Accounts | Code repo on the developer's personal GitHub during the build; transferred to a mosque-owned GitHub organisation at handover | Repo location **decided** 1 Oct 2026; transfer Recommended | Section 9.6, 11.5 |
| D-80 | Derma | Display-only Derma page: account holder name, bank, account number (copy button), DuitNow QR, safety note; home block, menu and footer link | Recommended | [Confirmed] requirement 1 Oct 2026; Section 4.9 |
| D-81 | Derma | Donation details kept in Git (not CMS); two-person PR approval against a bank letter; build-time QR payload check; change alerts; quarterly live test | Recommended | Q30; depends on D-28 |
| D-82 | Derma | Only an account in the mosque's own name is published | Needs confirmation | Q28, Q31, A10; launch blocker for Derma |
| D-83 | Derma | Tax-exemption wording on the Derma page | Needs confirmation | Q32; show nothing unless confirmed |
| D-84 | Derma | Separate tabung/accounts shown separately | Needs confirmation | Q29 |
| D-85 | Waktu Solat | Mosque-specific iqamah times | Optional | Q35; would need a CMS field and an owner |
| D-76 | Tech | CI/CD on Cloudflare Workers Builds instead of GitHub Actions; local pre-push checks; scheduled jobs in a Cloudflare cron Worker | **Decided** 1 Oct 2026 | Developer's GitHub account billing-locked; also keeps all automation in the mosque's Cloudflare account |
| D-74 | Plan | Target go-live date | Needs confirmation | Suggest before Ramadan 1448 (expected early February 2027) to catch the pre-Ramadan traffic spike (A1) |

---

## 13. Sources

Accessibility
- W3C WAI — Older Users and Web Accessibility: https://www.w3.org/WAI/older-users/
- W3C WAI — Developing Websites for Older People (how WCAG applies): https://www.w3.org/WAI/older-users/developing/
- W3C — WCAG 3.0 Working Draft (latest published version): https://www.w3.org/TR/wcag-3.0/
- W3C WAI — WCAG 3 Working Draft news (March 2026): https://www.w3.org/WAI/news/2026-03-03/wcag3
- W3C — Understanding SC 2.5.8 Target Size (Minimum): https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- W3C — Understanding SC 2.5.5 Target Size (Enhanced): https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html
- AbilityNet — WCAG 3.0 timeline overview: https://abilitynet.org.uk/resources/digital-accessibility/what-expect-wcag-30-web-content-accessibility-guidelines

SEO & structured data
- Google Search Central — Event structured data: https://developers.google.com/search/docs/appearance/structured-data/event
- Google Search Central — Documentation updates (event eligibility change): https://developers.google.com/search/updates
- schema.org — Mosque: https://schema.org/Mosque · PlaceOfWorship: https://schema.org/PlaceOfWorship · Service: https://schema.org/Service · Event: https://schema.org/Event
- Google Business Profile — Business eligibility & ownership guidelines: https://support.google.com/business/answer/13763036
- Google Business Profile — Policies overview: https://support.google.com/business/answer/13762416

Technology & pricing (verify at purchase; prices change)
- Cloudflare Workers — Pricing (static asset requests free and unlimited): https://developers.cloudflare.com/workers/platform/pricing/
- Cloudflare Workers — Limits: https://developers.cloudflare.com/workers/platform/limits/
- Cloudflare R2 — Pricing: https://developers.cloudflare.com/r2/pricing/
- Cloudflare — Payload on Workers (blog): https://blog.cloudflare.com/payload-cms-workers/
- Payload — Deploy onto Cloudflare in one click: https://payloadcms.com/posts/blog/deploy-payload-onto-cloudflare-in-a-single-click
- Payload — GitHub (one-click deploy options): https://github.com/payloadcms/payload
- Astro joins Cloudflare (Astro blog): https://astro.build/blog/joining-cloudflare/
- Sanity — Pricing: https://www.sanity.io/pricing (third-party summary: https://www.flowninja.com/blog/sanity-cms-pricing)
- Supabase — Pricing: https://supabase.com/pricing
- MDN — Web Share API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API
- MDN — Navigator.canShare(): https://developer.mozilla.org/en-US/docs/Web/API/Navigator/canShare
- GitHub Docs — About protected branches (availability by plan): https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
- Cloudflare Workers — Preview URLs: https://developers.cloudflare.com/workers/versions-and-deployments/preview-urls/
- Sanity — IDs and paths (non-root document IDs are not publicly readable): https://www.sanity.io/docs/ids

Waktu Solat
- JAKIM e-Solat (official prayer times): https://www.e-solat.gov.my/
- e-Solat takwim endpoint (as used by open-source clients): `https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=<period>&zone=<zone>` — see https://github.com/afiqiqmal/Esolat-Malaysia
- Bernama — Special prayer-time zone for Rompin from 1 March 2025: https://www.bernama.com/bm/news.php?id=2395089

Donations and QR safety
- RinggitPlus — QR code payment safety in Malaysia: https://ringgitplus.com/en/blog/personal-finance-news/qr-code-payment-safety-in-malaysia-what-to-check-before-you-pay.html

Privacy (Malaysia)
- DLA Piper — Data Protection in Malaysia (PDPA and 2024 amendments, 2025 guidelines): https://www.dlapiperdataprotection.com/?c=MY&t=law
- Baker McKenzie — PDPA (Amendment) Act 2024 commencement: https://insightplus.bakermckenzie.com/bm/data-technology/malaysia-personal-data-protection-amendment-act-2024-to-come-into-force

---

*End of document. Update the Decision Register (Section 12) first whenever a decision changes.*
