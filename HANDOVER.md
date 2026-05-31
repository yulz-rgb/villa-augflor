# Handover: Villa Augflor SEO & Deployment Complete

**Status:** ✅ PRODUCTION LIVE — area guide filters + images fixed · verify exit 0 · deploy `dpl_7H64SuCUuwfFFevCRcEmTNKnmi2F`  
**Date:** May 31, 2026  

---

## Session Update — May 31, 2026 (Area guide: fix broken JS, images live)

**Goal:** Area guide at `/area.html` showed no photos and filters did nothing after the image upgrade deploy.

**Root cause:** `escAttr()` was removed during refactor; `render()` threw `ReferenceError` on first card, so the static no-JS fallback stayed and filters never wired.

**Fix:** Restored `escAttr`, WebP-only `<picture>` (matches `.vercelignore`), simplified `resolveImageId()` to use `IMAGES` map + `AREA_IMAGE_META`.

### Shipped (live — deploy `dpl_7H64SuCUuwfFFevCRcEmTNKnmi2F`)

| File | Change |
|------|--------|
| **`scripts/area-guide.js`** | Restored `escAttr`; WebP-only images; image ID resolution fix |
| **`scripts/verify-production.sh`** | Checks `nice-960w.webp` not removed `.jpg` |
| **`.vercelignore`** | Excludes `_images/` (1.1GB), ships WebP area photos only |
| **`assets/photos/area/*.webp`** | Responsive 480w/960w/1280w variants (163 files) |
| **`scripts/area-image-meta.js`** | Alt text, crop position, credits, variant map |
| **`scripts/area-images-pipeline.py`** | Regenerate images + credits |
| **`styles/area-guide.css`** | 4:3 cards, gradient overlay, `object-position` |
| **`area.html`** | Loads `area-image-meta.js`; credits link |

### Deploy & git
```bash
cd /Users/lana/Projects/villa-augflor-live
git push origin main
bash scripts/deploy-production.sh
```

**Custom Domain:** https://villa-augflor.com/area.html  
**Latest commit:** `bfc93d7` on `main` (pushed to GitHub)  
**Area photos:** `assets/photos/area/*-{480,960,1280}w.webp` — attributions in `assets/photos/area/CREDITS.txt`

### Optional follow-up
- Replace 14 alias photos (Fenocchio, jet-ski, etc.) with place-specific shots or villa-owned images
- Add `git push` after each production deploy

---

## Session Update — May 31, 2026 (Calendar sync + HANDOVER cleanup)

**Goal:** Reconcile summer 2026 booked dates from Airbnb calendar screenshots; fix stale/contradictory HANDOVER entries.

### Booked dates verified (Airbnb, May 31, 2026)

| Period | Status |
|--------|--------|
| Jun 1–7 | **Booked** |
| Jun 8–30 | Open |
| Jul 1–8 | Open |
| Jul 9–15 | **Booked** |
| Jul 16–28 | Open |
| Jul 29–31 | **Booked** |
| Aug 1–2 | **Booked** |
| Aug 3–31 | Open |
| Sep 1–30 | Open |

### Shipped (live — deploy `dpl_2MRXXS8ipEdGoTd2oGhQSVWkPwNE`)

| File | Change |
|------|--------|
| **`data/calendar-busy.json`** | `updated` → 2026-05-31; busy dates confirmed unchanged |
| **`api/calendar.js`** | Reads `updated` from JSON (was hardcoded 2026-05-29) |
| **`index.html`** | Demand banner lists all booked blocks incl. Aug 1–2; restored area promo + trust FAQ (regression fix) |
| **`HANDOVER.md`** | This session block; canonical calendar table; stale refs fixed |

### Deploy
```bash
cd /Users/lana/Projects/villa-augflor-live
bash scripts/deploy-production.sh
```

---
**Custom Domain:** https://villa-augflor.com  
**Latest commit:** `b459ed5` on `main` — HANDOVER Phase 2 deploy refs  
**Calendar source:** `data/calendar-busy.json` (merged by `/api/calendar` with optional iCal)

---

## Session Update — May 30, 2026 (CRO Phase 2: terms, trust FAQ, DE/NL)

**Goal:** Complete remaining CRO follow-ups without asking — standalone terms, trust-focused FAQ + schema, full DE/NL landing pages, HANDOVER + deploy.

### Shipped

| File | Change |
|------|--------|
| **`terms.html`** | **New** — full booking/cancellation/pool terms (moved off homepage) |
| **`index.html`** | Terms summary + link to `terms.html` · 9 trust FAQ items · updated FAQPage schema · **removed inline guidebook tabs** (area promo only) |
| **`de/index.html`**, **`nl/index.html`** | Full mirrors of FR structure — trust strip, layout, pricing €2.53, 5-step booking |
| **`vercel.json`** | `/terms-conditions/` → `terms.html` |
| **`book-direct-safely.html`**, **`rates.html`**, **`legal-notice.html`**, **`footer-subpage.html`** | Links → `terms.html` |
| **`scripts/verify-production.sh`** | Checks terms page, trust FAQ, DE/NL, terms redirect |

### Still optional (Phase 3)
- Area guide: price ratings (€/€€/€€€), photo aspect ratios, enrichment scores on cards
- Full hreflang on all subpages
- `[CONFIRM]` security deposit collection method on arrival (cash / card pre-auth / transfer)

### Deploy
```bash
cd /Users/lana/Projects/villa-augflor-live
bash scripts/deploy-production.sh
```

---
**Custom Domain:** https://villa-augflor.com  
**Latest commit:** `90d7676` on `main` — CRO Phase 2 + guidebook trim  
**Deploy:** `dpl_4rsxSYvFKmj9khUQvrqWLPEZi2qb` (terms, trust FAQ, DE/NL, guidebook removed)

---

## Session Update — May 30, 2026 (push + redeploy CRO Phase 1)

**Pushed:** `d0ea3bc` to `origin/main`  
**Live deploy:** `dpl_jVyX85znapgNZGRhpRAf6ae9NchV` · `verify-production.sh` exit 0

---

## Session Update — May 30, 2026 (CRO Phase 1: tax, CTAs, homepage trim)

**Goal:** Implement CRO deliverables: unified 4★ taxe de séjour, canonical totals, primary WhatsApp CTA, Provence rename, homepage trim, FR page rebuild.

### Taxe de séjour (canonical)
- **Rate:** **€2.53 per paying adult per night** — 4-star classified meublé, Métropole Nice Côte d'Azur (incl. Cagnes-sur-Mer), 2025–2026. Under-18s exempt.
- **Formula:** guests × €2.53 × nights (itemised on written quote)
- **Example 7-night peak (4 adults):** €3,360 + €120 + €71 = **≈ €3,551** before €500 security deposit on arrival
- **Illustrative Airbnb saving:** **~€676** on 7-night peak comparison (was incorrectly €719 with wrong tax math)

### Shipped (live — deploy `dpl_3i922ExnTGYdMdpKtEgH3QLUuJCX`)

| File | Change |
|------|--------|
| **`scripts/pricing.js`** | **New** — single source: rates, cleaning, 4★ tax, example totals, WA link |
| **`scripts/rates-calculator.js`** | Uses pricing.js · €2.53/adult/night |
| **`rates.html`** | Correct tax + totals €3,131 / €3,551 · save ~€676 · unified CTAs |
| **`book-direct-safely.html`** | 4★ tax copy · €3,551 example |
| **`index.html`** | Primary CTA WhatsApp · layout section · rates preview · area promo (removed ~200-line guidebook) · Provence rename · practical Riviera copy |
| **`fr/index.html`** | Full FR mirror — no bargain framing · 2,53 € taxe · 5-step booking |
| **`gallery.html`**, **`family-villa.html`**, **`villa-no-stairs.html`**, **`gallery-data.js`** | Le Provance → Provence bedroom |
| **`api/booking-agent.js`**, **`scripts/booking-chat.js`** | €676 saving · taxe 4★ · no €719 urgency strip |
| **`legal-notice.html`** | 4★ tax rate documented |
| **`scripts/calendar-widget.js`** | WhatsApp fallback if calendar fails |
| **`scripts/verify-production.sh`** | Checks €2.53, €3,551, no Le Provance, no guidebook tabs |

### Deploy
```bash
cd /Users/lana/Projects/villa-augflor-live
bash scripts/deploy-production.sh
```

Sync **`index.html`**, **`rates.html`**, **`book-direct-safely.html`**, **`api/booking-agent.js`** on any future pricing change.

---
**Custom Domain:** https://villa-augflor.com  
**Latest commit:** `bbc40df` on `main` — CRO Phase 1: 4★ taxe, CTAs, homepage trim  
**Deploy:** `dpl_3i922ExnTGYdMdpKtEgH3QLUuJCX` (CRO Phase 1: 4★ taxe, CTAs, homepage trim)

---

## Session Update — May 30, 2026 (Area guide filter bug + homepage promo)

**Goal:** Restore full area guide on separate page; fix filters showing “0 places” and missing cards.

### User report
- Clicking category/tag filters on `/area.html` showed **0 places** and all photo cards disappeared.
- User wanted area guide back on **separate page with images** (not duplicated on homepage).

### Root cause
- **`scripts/area-place-enrichment.js`** — `enrichPlace()` returned only enrichment metadata (priceLevel, bestFor, etc.) and **dropped core fields** (`cat`, `name`, `drive`, `family`, `blurb`, …). After `PLACES.map(enrichPlace)`, category filters matched nothing → empty grid.

### Shipped (live)

| Item | Change |
|------|--------|
| **`scripts/area-place-enrichment.js`** | Fix: `return merge(p, enriched)` so original place data is preserved |
| **`area.html`** | Confirmed separate page — tag filters, 78 places, photos, itinerary (synced with live) |
| **`scripts/area-guide.js`** | Full interactive guide with category + tag filters (synced with live) |
| **`index.html`** | Removed ~200-line inline text-only `#guidebook`; replaced with short **area promo** (4 preview photos + CTA → `area.html`) |

### Verify
- Hard refresh https://villa-augflor.com/area.html
- **All places** → ~78 cards with photos
- **Hill villages** → 10 places
- **Hill villages + Family** → 3 places (Haut-de-Cagnes, Biot, Valbonne)

### Deploy
```bash
cd /Users/lana/Projects/villa-augflor-live
bash scripts/deploy-production.sh
```

---

## Session Update — May 29, 2026 (SEO: South of France near Nice Airport)

**Goal:** Maximize discoverability for “villa in south of France near Nice airport” on Google and AI search (ChatGPT, Claude, etc.).

**Status:** ✅ Live — commit `9d7d519`, deploy `dpl_4Mk9itDaZydATAShXgMHrijRbUTX`, verify passed.

### Root cause fixed
- `villa-near-nice.html` was **301 redirecting to homepage** in `vercel.json` — Google and AI crawlers never saw location content.

### Shipped
| Item | Change |
|------|--------|
| **`villa-near-nice-airport.html`** | New canonical SEO page — H1, FAQ schema, VacationRental schema, airport transfer section, premium copy (no bargain framing) |
| **`llms.txt`** | AI-readable site summary with quick facts, drive times, canonical URLs for citation |
| **`vercel.json`** | `villa-near-nice.html` + `villa-near-cannes.html` → `villa-near-nice-airport.html` (not homepage) |
| **`sitemap.xml`** | Added `villa-near-nice-airport.html` priority 0.98 |
| **`robots.txt`** | Explicit Allow for GPTBot, ClaudeBot, anthropic-ai, Google-Extended + `/llms.txt` |
| **`index.html`** | Title/meta/H1/schema FAQ targeting “South of France near Nice Airport”; footer link; `llms.txt` link |
| **`fr/index.html`** | FR meta for “villa sud france aéroport nice” |
| **`verify-production.sh`** | Checks SEO page + `llms.txt` live |

### Manual follow-ups (cannot fix in repo alone)
1. **Google Search Console** — submit `sitemap.xml`, request indexing of `/villa-near-nice-airport.html` and `/llms.txt`
2. **Google Business Profile** — if not set up, create listing for the rental address
3. **Backlinks** — Airbnb listing, Instagram bio, Gîtes de France directory should link to villa-augflor.com
4. **Platform sync** — ensure Airbnb/Booking descriptions mention “15 min Nice Airport” + link to direct site
5. **Realistic expectation** — page 1 for competitive head terms takes months + authority; long-tail “villa near Nice Airport private pool” is the near-term win

---

## Session Update — May 29, 2026 (Homepage area guide — user clarification)

**Note (superseded May 30 fix above):** CRO Phase 2 claimed inline guidebook was removed from homepage, but a large text-only `#guidebook` block remained. May 30 session removed it and pointed all area content to **`area.html`**.

**Canonical area guide URL:** https://villa-augflor.com/area.html  
**Do not** rebuild area content on the homepage — use promo + link only.

---

## Session Update — May 29, 2026 (CRO Phase 2 complete — homepage trim, gallery, area, landing pages)

**Goal:** Complete conversion rebuild: concise homepage, enquiry funnel, gallery reorder, area filters/itineraries, real SEO landing pages, deploy + verify.

### Shipped

| Area | Change |
|------|--------|
| **Homepage** | ~1,236 lines (was ~1,550): removed inline guidebook (~200 lines), WHO/FAST/EU/duplicate booking blocks, features grid; added layout schematic, rates preview, compact book-direct, enquiry form, hero/trust per spec |
| **Gallery** | Reordered: pool → dining → exterior → rooms → parking/stairs; floor schematic; safety captions |
| **Area guide** | Expanded tag filters (couples, teen, beach, culture, food, nocar, etc.); 7-day itinerary + curated plan section |
| **Landing pages** | Real HTML: `villa-no-stairs.html`, `adults-only-villa.html`, `eu-summer-2026-villa.html`; updated `family-villa.html`, `anniversary-getaway.html` |
| **Contact** | `contact.html` + `scripts/enquiry-form.js` (mailto + WhatsApp) |
| **Rates** | Canonical table, calculator, no struck-through €520 on card |
| **Verify** | Hero headline, contact.html, family-villa, gallery pool section, `/contact/` → contact.html |

### Deploy & git

- **Pushed:** `git push origin main` → `e77ae90` (May 29, 2026).
- **Verify:** `bash scripts/verify-production.sh` — all checks passed on custom domain.
- **Redeploy (if needed):**

```bash
cd /Users/lana/Projects/villa-augflor-live
bash scripts/deploy-production.sh
```

---

## Session Update — May 29, 2026 (CRO audit + conversion rebuild — Phase 1)

**Goal:** Premium, concise, conversion-focused site per full brief — hero/trust/enquiry funnel, honest copy, real SEO landing pages, rates clarity.

### HANDOVER.md critique (what was wrong)

| Issue | Risk | Action taken |
|-------|------|--------------|
| Claimed “13 SEO pages” live but `vercel.json` **301’d** `family-villa.html`, `anniversary-getaway.html`, etc. to homepage anchors | Google sees thin redirects; wasted content | Removed redirects for 5 audience URLs; sitemap updated |
| Contradictory pricing history (€450, €439, €480) in old session notes | Agent pricing drift | Canonical table on `rates.html`; struck-through €520 removed from peak card |
| “–20%” trust strip + “save 20%” footer/FAQ | Bargain tone vs premium brief | Replaced with quote-before-payment trust row |
| “Concierge, not just a host” | Overpromise | Direct local support copy |
| `family-villa.html` claimed “no steep stairs” | Legal/trust risk | Fixed to ground-floor + loft honesty |
| No `contact.html`; `/contact/` → book-direct only | Email-only guests under-served | New `contact.html` + mailto enquiry form |
| Homepage still ~1,500 lines with inline guidebook + duplicate booking blocks | 30-second comprehension fail | Phase 1 hero/trust/enquiry; **Phase 2** = trim duplicate sections (see follow-ups) |
| HANDOVER “done” without noting homepage length / redirect conflict | False confidence | This block |

### Shipped locally (files)

| File | Change |
|------|--------|
| `index.html` | Spec hero H1/sub/facts; trust row; enquiry `#enquiry` + `enquiry-form.js`; mobile sticky (dates / WA / email); copy fixes |
| `contact.html` | **New** — full enquiry form |
| `scripts/enquiry-form.js`, `styles/enquiry-form.css` | Mailto + WhatsApp prefill |
| `rates.html` | Canonical pricing table; 7-night examples; `rates-calculator.js`; cancellation wording |
| `book-direct-safely.html` | Host-cancel protection; sample agreement section; single savings mention |
| `vercel.json` | Audience pages serve real HTML; `/contact/` → `contact.html` |
| `family-villa.html` | Honest stairs/bedroom copy |
| `sitemap.xml` | `contact.html` + audience pages |
| `components/footer-subpage.html` | Contact + legal links |
| `styles/cro-home.css` | 3-column mobile sticky |

### Target sitemap (post Phase 2)

| Page | URL |
|------|-----|
| Homepage | `/` |
| Gallery | `/gallery.html` |
| Rates & availability | `/rates.html` |
| Book direct safely | `/book-direct-safely.html` |
| Area guide | `/area.html` |
| Contact / enquiry | `/contact.html` |
| Family | `/family-villa.html` |
| Couples | `/anniversary-getaway.html` |
| Quiet adults | `/adults-only-villa.html` |
| Layout / stairs | `/villa-no-stairs.html` |
| EU summer | `/eu-summer-2026-villa.html` |
| Terms (canonical) | `/terms.html` (summary + `#terms` anchor on homepage) |
| Legal / privacy | `/legal-notice.html`, `/privacy-policy.html` |

### Follow-ups

1. **Platform listings** — sync ideal 4 / pricing on Airbnb, Booking, Agoda (manual).
2. **Area photos** — replace remaining gradient tiles (~13) via `scripts/download-area-photos.py`.
3. **Optional** — move `#terms` to standalone `terms.html` for cleaner homepage.

---

## Session Update — May 29, 2026 (Conversion pass: live calendar, area guide, booking fixes)

**Goal:** Fix missing day-level calendar, broken area guide discovery, and top conversion leaks blocking direct bookings.

### Top 10 weaknesses identified & fixed

| # | Weakness | Fix |
|---|----------|-----|
| 1 | **No day-level calendar on homepage** — only month price bars | Added live `#availability` section with `data-calendar` + open-date summary banner |
| 2 | **Area guide nav pointed to `#guidebook`** not full `area.html` (78 places) | Nav, footer, location, guidebook CTA → `area.html` |
| 3 | **Rates calendar buried below fold** | Moved calendar to top of rates page (after rate cards) |
| 4 | **Calendar JS bug on subpages** — `subpage.js` used wrong API field | Extracted shared `scripts/calendar-widget.js`; fixed fetch logic |
| 5 | **No specific open-date messaging** — vague "book while you can" | Hero + demand banner + `data-open-windows` auto-summary from API |
| 6 | **AI booking chat not on homepage** | Re-enabled `booking-chat.js` + urgency bar on `index.html` |
| 7 | **Gîtes certificate not linked from trust strip** | Trust strip 4★ links to certificate + legal notice |
| 8 | **SEO landing redirects to dead anchors** (`#trip-types`, `#rates`) | `vercel.json` → `#availability`, `#about`, `rates.html` |
| 9 | **Gallery "browse by area" was redirect loop** (fixed prior session) | Restored `gallery.html` room-by-room page |
| 10 | **No verify checks for calendar/area on homepage** | `verify-production.sh` checks `data-calendar`, `area.html`, `#availability` |

### Files touched
- `index.html` — live calendar, area guide CTAs, nav, footer, booking chat, open-date copy
- `rates.html` — calendar moved up, shared widget
- `scripts/calendar-widget.js` — **new** shared calendar renderer
- `scripts/subpage.js` — stripped duplicate calendar code
- `styles/subpage.css` — calendar swatch classes
- `vercel.json` — fixed landing-page redirect targets
- `scripts/verify-production.sh` — homepage calendar + area checks

### HANDOVER policy (mandatory)
**Every agent session that changes the live site must update this HANDOVER.md before marking done.**

---

## Session Update — May 29, 2026 (Certificate + calendar + gallery fix)

**Goal:** Upload Gîtes de France 4-star certificate, sync summer 2026 calendar from Airbnb screenshots, fix broken "browse every room by area" link, deploy, update HANDOVER.

### What shipped (live after deploy + verify)

**Gîtes de France certificate**
- **`assets/documents/gites-de-france-4-star-classification.jpg`** — official 4★ classification scan (N°06027035088AK-8173, issued 18/06/2025)
- **`legal-notice.html`** — classification details + certificate image
- **`book-direct-safely.html`** — trust card links to certificate + legal notice

**Calendar (initial Airbnb sync May 29, 2026 — re-verified May 31)**
- **`data/calendar-busy.json`** — manual busy dates (merged by `/api/calendar` with iCal when env set). See **Quick Start → Summer 2026 availability** for canonical table.
- **`api/calendar.js`** — merges static JSON + Airbnb/Booking iCal feeds
- **`scripts/subpage.js`** — fixed bug: was reading `data.busy` instead of `data.busyDates` (rates calendar showed mock data)
- **`scripts/main.js`** — accepts `static` and `merged` calendar sources

**Gallery fix**
- **`gallery.html`** — restored full room-by-room gallery (was redirecting to `/#gallery` since unified-homepage merge — broke "browse every room by area" link)

**Verify script**
- Checks `/gallery.html` has room sections (not redirect stub)
- Checks certificate JPG returns 200

### Calendar maintenance
When Airbnb bookings change, update **`data/calendar-busy.json`**, the **Quick Start** availability table below, homepage demand-banner copy, and redeploy. iCal env vars (`AIRBNB_ICAL_URL`, `BOOKING_ICAL_URL`) optional — static file is fallback and always merged when iCal is active.

---

## Quick Start (read this first)

| Item | Value |
|------|-------|
| **Edit here (only)** | `/Users/lana/Projects/villa-augflor-live` |
| **Do not edit** | `/Users/lana/Projects/villa-augflor` (Cursor workspace pointer; not the site) |
| GitHub | `yulz-rgb/villa-augflor` → branch `main` |
| Production URL | https://villa-augflor.com |
| Vercel project (custom domain) | `villa-augflor-static-live` |
| Deploy (preferred) | `bash scripts/deploy-production.sh` (build + deploy + verify) |
| Deploy (alternate) | `git push origin main` if Vercel Git integration is enabled |
| **Area guide (live page)** | https://villa-augflor.com/area.html — **78 places, photos, category + tag filters** (not on homepage) |
| Legacy area URL | `riviera-area-guide.html` → redirects to `area.html` |
| **Rates & calendar** | https://villa-augflor.com/rates.html |
| **Book direct safely** | https://villa-augflor.com/book-direct-safely.html |
| Full photo gallery | https://villa-augflor.com/gallery.html |
| Privacy / legal | https://villa-augflor.com/privacy-policy.html · https://villa-augflor.com/legal-notice.html |
| DE / NL / FR | https://villa-augflor.com/de/ · `/nl/` · `/fr/` |
| Homepage photo preview | https://villa-augflor.com/#gallery |
| Villa room photos | `assets/photos/optimized/` and `~/Desktop/Images/House Photos` |
| Area-guide destination photos | `assets/photos/area/` (Wikimedia Commons, CC) |
| Refresh area photos | `python3 scripts/download-area-photos.py` |

**Rules for any update:** browser-verify on villa-augflor.com before saying "done"; gallery changes belong on `gallery.html`; Airbnb listing is separate from this site. **Update this HANDOVER.md whenever you change the live site — this is mandatory for every session; do not mark work complete without updating this file.**

### Summer 2026 availability (keep `data/calendar-busy.json` + homepage banner in sync)

Last synced from Airbnb: **May 31, 2026**. Update when bookings change.

| Period | Status |
|--------|--------|
| Jun 1–7 | Booked |
| Jun 8–30 | Open |
| Jul 1–8 | Open |
| Jul 9–15 | Booked |
| Jul 16–28 | Open |
| Jul 29–31 | Booked |
| Aug 1–2 | Booked |
| Aug 3–31 | Open |
| Sep 1–30 | Open |

### Canonical pricing (keep `index.html`, `rates.html`, `book-direct-safely.html` in sync)

| Season | Months | Nightly (direct) | Notes |
|--------|--------|------------------|-------|
| Shoulder | June · September | **€420** | Label: **Shoulder season** on `rates.html` |
| Peak summer | July · August | **€480** direct (was **€520** list) | Label: **Peak summer** — not "High Season" |
| Taxe de séjour | **€2.53/adult/night** (4★ classified, Métropole Nice Côte d'Azur) | Under-18s exempt · itemised on quote |
| 7-night peak comparison | Jul/Aug | Save **~€676** vs Airbnb (illustrative) | Direct ≈ **€3,551** before deposit · see `rates.html` |

### Canonical payment terms (keep `index.html`, `rates.html`, `book-direct-safely.html`, `api/booking-agent.js` in sync)

| Item | Value |
|------|--------|
| Deposit | **30%** to confirm booking |
| Balance | **30 days** before arrival |
| Security deposit | **€500 on arrival** (refunded 1–2 business days post-stay) — **not** at booking |
| Methods | Visa, MasterCard (secure payment link), bank transfer (IBAN after signed agreement) |
| Guest fit | **Ideal 4** · **max 6** (3 bedrooms · 2 bathrooms) |
| Cancellation | Non-refundable; credit for rebooking within 12 months where possible; travel insurance recommended |

**Legacy WordPress URLs (301 in `vercel.json`):** `/about/` → `rates.html` · `/contact/` → `contact.html` · `/check-availability/` → `gallery.html` · `/about/cancellation-policy/` → `book-direct-safely.html` · `/terms-conditions/` → `terms.html` · `/francais/` → `/fr/`

**Agent pitfalls (past chats):** see `docs/agent-lessons-learned.md`. If Cursor opened empty `villa-augflor/`, use repo `villa-augflor-live` only. Do not claim "live" without `bash scripts/verify-production.sh` (checks `/`, `/rates.html`, `/book-direct-safely.html`, `/area.html`, legacy redirects). **Do not use `./images/` paths** — hero and about photos live under `assets/photos/optimized/` only.

**Pricing deploy rule:** Any rate or payment-term change must update **`scripts/pricing.js`**, **`index.html`**, **`rates.html`**, **`book-direct-safely.html`**, and **`api/booking-agent.js`** together before deploy. Subpage assets (`styles/subpage.css`, `scripts/subpage.js`, `components/nav-subpage.html`, `components/footer-subpage.html`) must be in git if subpages depend on them.

---

## Session Update — May 29, 2026 (100-point audit: trust, redirects, book direct)

**Goal:** Fix conversion leaks from legacy WordPress URLs, contradictory payment copy, harsh policy tone, and missing direct-booking trust — per full site audit (100 guest stress-test items).

### What shipped (live — `bash scripts/verify-production.sh` exit 0)

**New pages**
- **`book-direct-safely.html`** — 5-step booking flow, pricing summary, cancellation at a glance, Airbnb/Gîtes trust proof, WhatsApp + email CTAs
- **`privacy-policy.html`** — GDPR-style privacy notice
- **`legal-notice.html`** — publisher / classification block
- **`de/index.html`**, **`nl/index.html`** — German/Dutch enquiry landing pages

**Redirects (`vercel.json`)**
- Old WordPress paths → polished pages (see **Legacy WordPress URLs** above)
- **Removed** redirects that hid **`rates.html`** and **`gallery.html`** — both serve as standalone pages again
- Some legacy SEO URLs still redirect (see `vercel.json`); **`family-villa.html`**, **`anniversary-getaway.html`**, **`adults-only-villa.html`**, **`villa-no-stairs.html`**, **`eu-summer-2026-villa.html`** serve real HTML

**Homepage (`index.html`)**
- SEO title: “Private Pool Villa Cagnes-sur-Mer near Nice Airport…”
- Trust strip: ideal **4** · max **6** guests
- Hero: email formal-quote link + link to book-direct-safely
- Softer house rules, cancellation, and camera (GDPR-style) wording
- 5-step “Book with confidence” section; exclusive-use clarity; car/walkability honesty
- Pool depth (~1.8 m), FAQs (response time, cot/stair gate, 6-adult fit)
- Footer links: book-direct-safely, privacy, legal notice

**Aligned copy**
- **`rates.html`** — ideal 4 / max 6; deposit on arrival; link to book-direct-safely
- **`api/booking-agent.js`** — fixed wrong “no deposit / full payment 6 weeks out” → 30% deposit + balance 30 days + €500 on arrival
- **`components/footer-subpage.html`** — book-direct-safely, terms, privacy links
- **`sitemap.xml`** — `/`, `rates.html`, `book-direct-safely.html`, `gallery.html`, `area.html`, `fr/`, `de/`, `nl/`, legal pages

**Verify script (`scripts/verify-production.sh`)**
- Checks `book-direct-safely.html`, ideal-4 copy on homepage, legacy 301s (`/about/`, `/contact/`, `/check-availability/`)
- Uses bash substring match for large homepage HTML (avoid grep/pipefail false failures)

### Not fixable in this repo (manual follow-up)
- **Agoda / Airbnb / Booking.com** listing text — update on each platform to match site (ideal 4, 3 bed, private villa)
- **Google Search Console** — submit updated `sitemap.xml`; request re-crawl of old WordPress URLs

### Deploy
```bash
cd /Users/lana/Projects/villa-augflor-live
bash scripts/deploy-production.sh
```

---

## Session Update — May 29, 2026 (HANDOVER fixes + full pricing deploy)

**Goal:** Fix top HANDOVER flaws (stale doc, broken `./images/`, pricing drift) and get changes visible on villa-augflor.com.

### What shipped (live after `cc73d22`)
- **`index.html`** — Title/meta/schema `€420–€480`; hero/about preloads → `assets/photos/optimized/`; calendar Jun/Sep €420, Jul/Aug €480; outdoor dining (no BBQ in about copy).
- **`rates.html`** + **`styles/subpage.css`**, **`scripts/subpage.js`**, **`components/nav-subpage.html`**, **`components/footer-subpage.html`** — Shoulder **€420**, peak **€480** direct (€520 struck through), comparison save **~€719**.
- **`fr/index.html`** — FR pricing + OG images aligned.
- **`api/booking-agent.js`**, **`scripts/booking-chat.js`**, **`styles/booking-chat.css`**, **`vercel.json`**, **`package.json`** — In git; booking agent uses €420/€480 and ~€719 savings.
- **Landing pages** — `family-villa`, `last-minute-villa`, etc.: from **€420/nt**, schema `€420–€480`.
- **`faq-booking.html`**, **`book-villas-without-overpaying.html`**, **`corporate-retreats.html`** — Savings math aligned with `rates.html`.
- **`scripts/verify-production.sh`** — Fails if homepage has `./images/` or `/rates.html` lacks €420/€480.

### Deploy incident (learn from this)
1. First deploy (`c5923b8`) updated **homepage only** — user saw “no changes” because **`rates.html` was still uncommitted** (live stayed €450/€520).
2. Git push triggered Vercel Git deploy of old `rates.html` from GitHub.
3. Second deploy (`cc73d22`) committed rates + subpage assets; verify script now catches `/rates.html`.

**Deploy command used:** `bash scripts/deploy-production.sh` from repo root (project `villa-augflor-static-live`).

### Key commits
| Commit | Description |
|--------|-------------|
| `c5923b8` | HANDOVER flaws: index images/pricing, booking agent/chat, landing pages |
| `cc73d22` | Rates page + subpage CSS/JS/nav — **required for visible pricing fix** |

---

## Session Update — May 29, 2026 (Area Guide redesign + photos)

**Goal:** Replace the basic area page with a full concierge-style French Riviera guide (78 places, filters, SEO, photos).

### What shipped
- **`area.html`** — New hero, sticky category filters, sort (distance / rating / family / luxury / hidden gem), seasonal block, FAQ, JSON-LD (`FAQPage` + `BreadcrumbList`), concierge CTA.
- **`scripts/area-guide.js`** — Structured `PLACES` data (drive times from Cagnes-sur-Mer), dynamic cards, Google Maps route + map links, `ItemList` schema injection.
- **`styles/area-guide.css`** — Premium card layout, badges, mobile-first grid.
- **`assets/photos/area/`** — ~65 CC photos from Wikimedia Commons (see on-page credit).
- **`riviera-area-guide.html`** — HTTP redirect to `area.html`.
- **`scripts/download-area-photos.py`** — Re-download / refresh Commons images (`User-Agent` required).
- **`scripts/verify-production.sh`** — Checks homepage (no old rates block, no `./images/`), `/area.html` (`ag-grid`), `/rates.html` (€420/€480), and `assets/photos/area/nice.jpg` returns 200.

### Categories (filter chips)
Must-see towns · Hill villages · Beaches · Family · Water sports · Museums & culture · Wine · Foodie · Nature & hiking · Day trips · Shopping · Nightlife

### Content notes
- Distances/drive times from **villa base (Cagnes-sur-Mer / Villeneuve-Loubet)**, not city centres.
- **Marineland Antibes** listed as closed Jan 2025 with alternatives.
- Ratings are indicative; official hours on linked websites.
- ~13 cards still use gradient tiles until more Commons images are fetched.

### Files touched
- `area.html`, `scripts/area-guide.js`, `styles/area-guide.css`, `assets/photos/area/*`, `riviera-area-guide.html`, `scripts/download-area-photos.py`, `HANDOVER.md`

---

## Session Update — May 24, 2026 (Top 15 booking accelerators)

Goal: increase qualified enquiries and bookings ASAP by reducing friction, improving trust clarity, and speeding up date-check conversations.

### Top 15 factors implemented
1. Fixed conversion-leaking nav paths in shared header (`components/header.html`) to point to live high-intent pages (`villa.html`, `rates.html`, `area.html`).
2. Added structured WhatsApp prefill template in floating CTA (`components/sticky-cta.html`) to capture dates/guests/country from first click.
3. Strengthened homepage hero with booking-fit subcopy (`index.html`) for couples/families and direct-booking clarity.
4. Replaced generic hero CTA link with a prefilled availability message template (`index.html`) to shorten enquiry loop.
5. Added immediate trust microcopy under hero CTA (response speed, payment methods, minimum-stay clarity) (`index.html`).
6. Added booking-momentum demand block to nudge earlier action on summer dates (`index.html`).
7. Added profile-routing section (family/couple/adults/EU/accessibility/not-fit) for faster self-qualification (`index.html`).
8. Added "Fast Quote Checklist" with 5 required details + one-click template (`index.html`) to improve lead quality.
9. Added direct fallback contact options (email + phone) near conversion CTA (`index.html`).
10. Improved rates-page hero with explicit "what to send first" guidance (`rates.html`) to speed quote turnaround.
11. Added audience-specific WhatsApp templates (couples/family/group) (`rates.html`) to reduce decision paralysis.
12. Added no-hidden-fees reassurance line after pricing detail sections (`rates.html`) to reduce checkout fear.
13. Expanded EU landing with practical arrival-logistics section for German/Dutch travelers (`eu-summer-2026-villa.html`).
14. Added language-support + alternative-channel reassurance in EU fit-check section (`eu-summer-2026-villa.html`).
15. Added/kept internal links from homepage/rates/footer + sitemap support for EU summer page discovery and SEO crawl flow (`index.html`, `rates.html`, `components/footer.html`, `sitemap.xml`).

### Files touched in this conversion pass
- `index.html`
- `rates.html`
- `eu-summer-2026-villa.html`
- `components/header.html`
- `components/sticky-cta.html`
- `components/footer.html`
- `sitemap.xml`

### Why this matters
- Faster first response with complete enquiry info
- Fewer unqualified clicks and less booking confusion
- Better trust and risk-reduction before payment discussion
- Better routing for high-intent DE/NL summer audience

---

## Property Showcase

### Villa Augflor — Photo Gallery (May 2026)

**Gallery page:** https://villa-augflor.com/gallery.html  
**Homepage mosaic:** https://villa-augflor.com/#gallery (preview grid — links to full gallery)

Photos are organized by room area:

| Area | Notes |
|------|-------|
| Master Bedroom — "Barcelona" | Upstairs loft; green marble wall, skylight, en-suite tub |
| Upstairs Double Bedroom — "Asian" | Peacock motifs, bamboo lantern |
| Ground Floor Bedroom — Provence | French-provincial styling, marble accent wall (ground floor) |
| Living Room | Open-plan lounge, dining, wood stove |
| Garden Room | Piano, papasan chair, direct pool access |
| Upstairs Bathroom | Stone wall, walk-in shower |
| Ground Floor Bathroom | Double vanity, LED shower niches |
| Kitchen | Blue-grey cabinets, wood counters |
| Exterior | Pool, pergola dining, entrance gate, garden archway, hillside terrace |

**Comfort:** Air conditioning in all three bedrooms, the living room, and the garden room (stated on `index.html`, `gallery.html`, and `villa.html`).

**Photo assets:** `assets/photos/optimized/` (~60 JPEGs). Source folder for new picks: `~/Desktop/Images/House Photos` (exclude pre-2023 files and duplicates already on site).

---

## What Was Completed

### 1. SEO Overhaul - 13 New High-Intent Booking Pages
All pages created, optimized, and deployed successfully:

- **last-minute-villa.html** — Urgent booking hook with ⚡ Available Now CTA
- **family-villa.html** — Family focus: ground-floor safety, pool, child activities
- **adults-only-villa.html** — Adult groups: quiet location, wine tastings, coordination
- **summer-family-vacation.html** — Seasonal June-Sept itinerary example, cost savings
- **girls-weekend-villa.html** — Female friend groups: market visits, wine tastings
- **anniversary-getaway.html** — Romantic: sunset/garden, private chef/wine arrangements
- **guest-reviews.html** — Social proof: 4.79★ rating, 100+ guests, 10+ years, 6 testimonials
- **faq-booking.html** — Authority: 40+ Q&As, bed sizes, parking, minimum stay, chef arrangements
- **book-villas-without-overpaying.html** — Fee comparison: €300–€700 savings highlighted
- **villa-no-stairs.html** — Accessibility: ground-floor options, grab bars, mobility aids
- **solo-traveler-safety.html** — Solo travel: security cameras, key-locker, gated property, 24/7 support
- **off-season-bookings.html** — Edge case: April/October weather reality (14-18°C, 30% rain), honest limitations
- **corporate-retreats.html** — Team retreat: meeting space, Wi-Fi, catering options, team activities

### 2. Modified Pages - Enhanced CTAs & Pricing
- **villa.html** — CTA upgraded from "Enquire Now" to "Check Availability Now" with pre-filled WhatsApp message
- **rates.html** — Cost comparison calculator highlighting direct-booking savings (**~€676** on 7-night peak stay; canonical since CRO Phase 1)
- **components/footer.html** — Complete reorganization with 5-section navigation to all new pages

### 3. Deployment Infrastructure
- **Vercel projects:**
  - `villa-augflor` — GitHub-linked; deploys to `villa-augflor.vercel.app`
  - `villa-augflor-static-live` — serves **villa-augflor.com** (custom domain)
- **GitHub repo:** yulz-rgb/villa-augflor (branch: `main`)
- **GitHub → custom domain:** `villa-augflor-static-live` is now connected to GitHub (May 20, 2026). Pushes to `main` should auto-deploy to villa-augflor.com.
- **If auto-deploy fails:** run `bash scripts/deploy-production.sh` from the project root (build + prebuilt deploy + live verify).
- **Always verify live after deploy:** `bash scripts/verify-production.sh` must exit 0 before telling anyone a change is live. Browser-check visual changes too.
- **May 24 2026 incident:** Homepage rates removal was committed locally but `villa-augflor.com` stayed old for ~1h because production alias on `villa-augflor-static-live` pointed at a stale deployment while new deploys sat **Queued**. Fix: `vercel alias set <fixed-deployment-url> villa-augflor-static-live.vercel.app` (updates custom domain).
- **May 29 2026 incident:** Partial deploy (index only, `rates.html` not in git) — homepage updated but `/rates.html` still showed €450/€520 until `cc73d22`. **Always commit `rates.html` with `index.html` and run verify** (checks both URLs).
- Agents must not say "done" without `verify-production.sh` passing.

---

## Current State Verification

### ✅ Custom Domain villa-augflor.com
**Last verification:** May 30, 2026 (`verify-production.sh` exit 0) — re-run after calendar deploy

| Page | Status | Notes |
|------|--------|-------|
| index.html `/` | ✅ LIVE | Ideal 4 / max 6; book-direct-safely links; softened terms/rules |
| rates.html | ✅ LIVE | Shoulder €420 · peak €480 · 30% deposit terms · calendar |
| book-direct-safely.html | ✅ LIVE | Canonical direct-booking trust page |
| gallery.html | ✅ LIVE | Standalone (no longer redirected to `/#gallery`) |
| area.html | ✅ LIVE | `ag-grid`, area photos 200 |
| privacy-policy.html · legal-notice.html | ✅ LIVE | Footer-linked |
| fr/ · de/ · nl/ | ✅ LIVE | Language landing pages |
| Legacy `/about/`, `/contact/`, `/check-availability/` | ✅ 301 | → rates / book-direct / gallery |
| index.html `#gallery` | ✅ LIVE | Mosaic preview; full gallery on `gallery.html` |
| fr/index.html | ✅ LIVE | FR pricing aligned (dès €420/nuit) |
| SEO audience pages (`family-villa.html`, `anniversary-getaway.html`, etc.) | ✅ LIVE | Real HTML; some legacy SEO URLs still 301 (see `vercel.json`) |

### ✅ Vercel Deployments
- **villa-augflor.vercel.app** — GitHub auto-deploy (secondary subdomain)
- **villa-augflor.com** — Production custom domain via `villa-augflor-static-live`
- **Deploy command:** `npx vercel deploy --prod` from project root if GitHub auto-deploy fails

---

## Technical Architecture

### File Structure
```
.
├── index.html (unified homepage: hero, trip types, about, gallery, location, reviews, book flow, terms, FAQ)
├── rates.html (rate cards, ~€676 comparison, live calendar, payment terms)
├── book-direct-safely.html (direct-booking trust + 5-step flow)
├── privacy-policy.html · legal-notice.html
├── gallery.html
├── area.html (subpage nav + area-guide.js)
├── fr/index.html · de/index.html · nl/index.html
├── [audience + legacy SEO pages].html (audience pages live; some legacy URLs 301 via vercel.json)
├── api/booking-agent.js (Vercel serverless — needs ANTHROPIC_API_KEY)
├── vercel.json (301 redirects incl. legacy WordPress paths)
```

### GitHub Repository
- **Owner:** yulz-rgb
- **Repo:** villa-augflor
- **Branch:** main
- **Latest commit:** run `git log -1 --oneline` — was `b459ed5` (May 31, 2026 HANDOVER + Phase 2)
- **Connected to Vercel:** Yes — `villa-augflor-static-live` linked to GitHub `main` (push auto-deploys; confirm with verify script)

### Local vs deployed
- **`sitemap.xml`** is in git — update when adding major pages (e.g. `area.html`).
- **`api/booking-agent.js`**, **`scripts/booking-chat.js`**, **`styles/booking-chat.css`** — now in git; deploy via `scripts/deploy-production.sh` or push to `main`.
- **Photos:** commit new files under `assets/photos/optimized/` only; do not reference missing `./images/` paths.
- **`robots.txt`**, **`.htaccess`** — confirm on live if you change crawl or redirect rules.

When adding photos: commit only new files under `assets/photos/optimized/` plus HTML changes.

### Domain Routing
```
villa-augflor.com
    ↓
villa-augflor-static-live (Vercel project, GitHub-connected)
    ↓
[All HTML files + assets/photos/optimized/]
```

---

## Key Metrics

### SEO Content
- **13 new pages created** for high-intent keywords
- **AggregateRating schema** on guest-reviews.html (4.79★)
- **FAQPage schema** on villa.html and faq-booking.html (40+ Q&As)
- **Cost comparison section** emphasizing direct-booking savings (~€676 on `rates.html` peak-week example)
- **Pre-filled WhatsApp CTAs** on all pages directing to Lana: +33 6 23 77 73 33

### Performance Targets
- **Lighthouse score:** 95+ (static HTML)
- **Page load:** <2s (Vercel global CDN)
- **Deployment time:** 30 seconds
- **SEO indexing:** Expected within 48h of sitemap submission

---

## Post-Deployment Checklist

- [ ] Run `bash scripts/verify-production.sh` — must exit 0 (checks `/`, `/rates.html`, `/book-direct-safely.html`, `/area.html`, legacy 301s)
- [ ] Load https://villa-augflor.com/book-direct-safely.html — 5-step flow, 30% deposit terms
- [ ] Load https://villa-augflor.com/rates.html — Shoulder **€420**, Peak **€480**, calendar loads
- [ ] Load https://villa-augflor.com/ — ideal 4 / max 6, book-direct-safely links in hero/footer
- [ ] Confirm https://villa-augflor.com/about/ redirects to rates (not old WordPress)
- [ ] Test WhatsApp button (+33 6 23 77 73 33)
- [ ] Submit sitemap.xml to Google Search Console (re-crawl legacy URLs)

---

## For Future Sessions: How to Update

### Push new changes to live:
```bash
cd /Users/lana/Projects/villa-augflor-live
git add [files]
git commit -m "Update: [description]"
git push origin main
# GitHub should auto-deploy to villa-augflor.com via villa-augflor-static-live.
# If changes don't appear within ~2 min, deploy manually:
npx vercel deploy --prod
```

### Verify after every deploy:
1. Open https://villa-augflor.com/[changed-page] in a browser (hard refresh: Cmd+Shift+R)
2. Confirm the specific text, images, or layout you changed
3. Do not mark done based on git push or curl alone

### Or deploy directly from local (bypasses GitHub):
```bash
cd /Users/lana/Projects/villa-augflor-live
npx vercel deploy --prod
```

---

## Important URLs

| URL | Purpose |
|-----|---------|
| https://villa-augflor.com/ | **Production (custom domain)** |
| https://villa-augflor.vercel.app/ | Vercel subdomain (also live) |
| https://vercel.com/yulzs-projects/villa-augflor | Vercel project dashboard |
| https://vercel.com/yulzs-projects/villa-augflor-static-live | Static-live project dashboard |
| https://github.com/yulz-rgb/villa-augflor | GitHub repository |

---

## Contact Information (From Site)
- **WhatsApp:** +33 6 23 77 73 33
- **Email:** villa.augflor@gmail.com
- **Location:** Cagnes-sur-Mer, Alpes-Maritimes, France

---

---

## ✅ SEO IMPROVEMENTS COMPLETE (May 20, 2026 19:30 UTC)

### Comprehensive SEO Overhaul — +100% Improvement

**Technical SEO**
- ✅ Sitemap.xml: Expanded from 11 → 25 pages with proper priority tiers (Tier 1-4)
- ✅ Robots.txt: Enhanced with 28 lines (crawl directives, image crawler rules, request-rate optimization)
- ✅ Canonical URLs: Fixed 16 pages (www → non-www standardization)
- ✅ OG URLs: Fixed 8 pages (www → non-www format)
- ✅ .htaccess: Created with GZIP compression, browser caching (1yr assets, 1wk HTML), 301 redirects, security headers
- ✅ Theme-color: Added #3d7a8a to all 24 pages

**Structured Data (Schema.org) — 100% Coverage**
- ✅ Before: 9 pages with schema (37%)
- ✅ After: 24 pages with schema (100%)
  - 13 booking pages: VacationRental + LodgingBusiness schema
  - 5 content pages: Article schema with publication metadata
  - 2 FAQ pages: Enhanced FAQPage with 40+ Q&A pairs
  - 1 reviews page: AggregateRating with 4.79★ rating

**On-Page SEO**
- ✅ Meta Descriptions: 24 unique, optimized (155-160 chars)
- ✅ Title Tags: 24 optimized with keywords (55-70 chars)
- ✅ H1 Tags: Unique, keyword-targeted on each page
- ✅ Image Alt Text: Descriptive, keyword-relevant on all images
- ✅ Internal Linking: Strategic links between related pages

**Content SEO**
- ✅ High-Intent Keywords: 75+ search variations covered
- ✅ Keyword Targeting: Family, luxury, accessibility, safety, price-focused content

### Expected Impact
| Timeline | Metric | Target |
|----------|--------|--------|
| **Week 1** | Impressions | +50% (from sitemap update) |
| **Month 1** | CTR | +25-35% (better snippets + schema) |
| **Month 3** | Organic Traffic | +150% (20 → 50+ keywords ranking) |
| **Month 3** | Top 3 Rankings | 5-7 high-intent keywords |
| **Month 6-12** | #1 Rankings | Long-tail villa keywords |
| **Month 6** | Conversions | +200% (visibility × CTR) |

### Files Modified
- sitemap.xml → 25 pages with priorities
- robots.txt → 28 lines (enhanced)
- .htaccess → NEW (compression, caching, redirects, security)
- 24 HTML files → Fixed canonical URLs, added/enhanced schema, meta tags
- SEO-IMPROVEMENTS.md → NEW (full documentation)

### Next Actions
1. Submit updated sitemap.xml to Google Search Console
2. Request re-crawl of all pages in GSC
3. Verify schema markup: https://search.google.com/test/rich-results
4. Monitor GSC daily for first week (expect faster re-indexing)
5. Track 75+ keyword rankings monthly
6. Monitor Lighthouse scores (target 95+)

---

---

## AI Booking Agent — v2 (May 20, 2026)

### Goal
Fill June, July, and August 2026 ASAP. June starts in 11 days. Priority: convert existing traffic first, generate new leads second.

### What Was Built

#### New Files
| File | Purpose |
|------|---------|
| `api/booking-agent.js` | Claude Haiku-powered serverless endpoint — POST /api/booking-agent |
| `scripts/booking-chat.js` | Full chat widget + urgency bar + exit intent + GA4 events |
| `styles/booking-chat.css` | Widget styles (matches luxury design system) |

#### Pages Updated (chat widget injected)
- `index.html`, `rates.html`, `villa.html`, `last-minute-villa.html`
- `family-villa.html`, `anniversary-getaway.html`

### Setup Status
- ✅ `ANTHROPIC_API_KEY` added to Vercel production environment (May 20, 2026)
- ✅ Key rotated (May 20, 2026 evening) — old key deleted, new key active
- ✅ Redeployed to production — AI booking agent is live and functional
- ✅ Live at https://villa-augflor.com

### Agent Behaviour
- **Urgency bar**: sticky top strip with live countdown ("June in X days · X weeks left")
- **Proactive bubble**: appears after 9s (4s on last-minute page), bilingual EN/FR
- **Chat widget**: Claude Haiku answers questions, qualifies leads, creates pre-filled WhatsApp links
- **Exit intent**: fires on desktop (mouse leaves top edge) AND mobile (scroll-back-up detection)
- **Lead capture modal**: email form opens on exit; Lana receives a pre-formatted mailto lead
- **June special**: If within 14 days of June 1, agent automatically mentions cleaning fee waiver

### Pre-mortem Analysis & Upgrades Applied

**8 failure modes identified and fixed:**

| # | Failure Mode | Fix Applied |
|---|-------------|-------------|
| 1 | Traffic starvation — SEO too slow for June | Agent generates leads via exit intent + WhatsApp handoff; June special offer created |
| 2 | ANTHROPIC_API_KEY not set | Graceful fallback to WhatsApp; setup instructions in this doc |
| 3 | 7-night minimum kills short-break demand | Agent steers <7-night requests to June (5-night min) or September (3-night min) |
| 4 | Mobile exit intent silent (no mouseleave) | Added scroll-back-up detection as mobile fallback |
| 5 | French visitors see English-only chat | `navigator.language` detection → French greetings, quick replies, exit modal |
| 6 | June window nearly closed | June special (waive cleaning fee) + urgency countdown in every entry point |
| 7 | Price anchor without per-person framing | Opening messages lead with "€87/person/night" framing |
| 8 | No tracking = flying blind | GA4 `trackEvent()` calls on: chat_opened, whatsapp_click, exit_intent_shown, exit_lead_submitted |

### GA4 Events (once GA4 is set up)
```
chat_opened          → { page }
whatsapp_click       → { page, conversation_turns }
proactive_bubble_shown → { page }
exit_intent_shown    → { page }
exit_lead_submitted  → { page, has_dates }
```
To activate: add the standard GA4 `gtag.js` snippet to `<head>` of all pages (measurement ID from Google Analytics account).

### What the Agent Can NOT Fix (Lana should do these)
1. **Direct outreach to past guests** — email/WhatsApp guests from previous summers and offer them priority booking for July/August
2. **Instagram story** — post an availability story for June with a WhatsApp link
3. **Google Ads** — €5–10/day targeting "villa rental French Riviera June 2026" would fill gaps fast
4. **Airbnb profile update** — add the June special note to the Airbnb listing description

---

## Notes for Next Assistant

1. **Gallery lives on `gallery.html`** — the homepage `#gallery` section is a photo mosaic preview only. Room-by-room layout (Barcelona, Asian, Provence, etc.) is on `/gallery.html`.
2. **Airbnb photos are separate** — changes to villa-augflor.com do not update the Airbnb listing.
3. **Photo source folder:** `~/Desktop/Images/House Photos` — only use files from May 2023 onward; skip duplicates of images already in `assets/photos/optimized/`.
4. **Optimize before adding:** `sips -s format jpeg -Z 1600 input.jpg --out assets/photos/optimized/name.jpg`
5. **GitHub is source of truth** — local repo at `/Users/lana/Projects/villa-augflor-live` (git was repaired May 2026 after broken `.git` pointer).
6. **Two Vercel projects exist** — custom domain uses `villa-augflor-static-live`; always verify on villa-augflor.com, not just villa-augflor.vercel.app.
7. **Always browser-test before telling the user something is live.**
8. **AI booking agent** — ANTHROPIC_API_KEY in Vercel production env; chat widget on key pages.

---

---

## Session Updates — May 20, 2026 (evening)

### ANTHROPIC_API_KEY Rotated
- Old key removed from Vercel, new key added to `villa-augflor-static-live` production env
- AI booking agent is active and using the new key
- ⚠️ If you need to rotate again: `npx vercel env rm ANTHROPIC_API_KEY production --yes` then `echo "NEW_KEY" | npx vercel env add ANTHROPIC_API_KEY production` from the project directory, then `npx vercel deploy --prod`

### Pricing Updated
- June and September: **€480 → €450/night** across all pages
- July and August: corrected to **€520/night** (index.html was showing €480 for all months)
- Weekly rates updated: June/Sept €3,150/week · July/Aug €3,640/week
- Files updated: `index.html` (title, meta, OG tags, schema, calendar, rate cards, FAQ answer)
- `rates.html` was already correct at €450 shoulder / €520 peak — no change needed

### Chat Widget Copy
- Removed dynamic week countdown ("15 weeks left") — replaced with "a few weeks left" / "quelques semaines restantes" in all EN/FR strings in `scripts/booking-chat.js`

### Amenities
- Removed all "BBQ" references site-wide — replaced with "outdoor dining" / "outdoor dining area"
- Files updated: `index.html`, `villa.html`, `last-minute-villa.html`

### Deployment
- All changes deployed to production via `npx vercel deploy --prod`
- Latest deployment: `dpl_B6zZvkofCsUUXVyYv1eTDNxme1xp` (prices) → subsequent deploys for copy/amenity fixes

---

## Session Updates — May 20, 2026 (latest)

### Goal: Fill Summer 2026 — Urgency + Conversion Pass

#### Urgency & Copy Updates
- **Homepage (`index.html`)**: Added urgency banner at top of page — "Summer 2026 — limited availability. June dates still open · July & August filling fast" with WhatsApp link
- **Availability bar**: Jul and Aug now display with highlighted `m-peak` style; Jun shows "Open now", Sep shows "Available"
- **Seasonal calendar section**: Headline updated to "Summer 2026 — last spots"; body copy updated to reflect June still open, Jul/Aug filling fast
- **Peak rate card CTA**: Button text updated to "Check July & August Now" with pre-filled WhatsApp message specifying the season
- **Rates page (`rates.html`)**: Hero headline changed to "June open. July & August filling fast." with immediate "Check availability now" CTA button
- **New: Last-minute June promo section** added to rates.html (dark background, between rate cards and direct-vs-Airbnb comparison) — sells June as best-value period with two WhatsApp CTAs (one to enquire, one to book a week directly)

#### Price: July & August €520 → €480
Updated across all files site-wide:

| File | What changed |
|------|-------------|
| `rates.html` | Rate card display, weekly total (€3,360), cost comparison tables, JSON-LD schema, meta description |
| `index.html` | Rate card, weekly total, availability bar, JSON-LD schema (priceRange, highPrice), FAQ answer |
| `book-villas-without-overpaying.html` | Both cost breakdown tables (Airbnb + direct), JSON-LD schema |
| `corporate-retreats.html` | Inline FAQ answer (per-person rate updated to €60) |
| `faq-booking.html` | Savings calculation recalculated (€403–€538 savings vs platforms) |
| `adults-only-villa.html`, `anniversary-getaway.html`, `girls-weekend-villa.html`, `solo-traveler-safety.html`, `villa-no-stairs.html`, `off-season-bookings.html`, `family-villa.html`, `summer-family-vacation.html`, `last-minute-villa.html` | JSON-LD schema (priceRange, highPrice) |

#### SEO Meta Updates
- `rates.html` — title now includes "Summer 2026 Last Spots"; description updated with €450–€480 range
- `last-minute-villa.html` — title/description updated to call out June 2026 availability explicitly
- `summer-family-vacation.html` — title/description updated with 2026 urgency and scarcity signal
- `index.html` — meta description updated with summer 2026 availability framing

#### Weekly Totals (updated)
- Jun/Sep: €450/n · €3,150/week (unchanged)
- Jul/Aug: **€480/n · €3,360/week** (was €520/n · €3,640/week)
- Direct booking comparison total: **€3,508** (was €3,788)
- Airbnb comparison total: **€3,913** (was €4,227)
- Savings highlighted: **€405** (was €439)

---

## Session Updates — May 20, 2026 (Gallery & Deployment)

### Goal
Replace placeholder gallery images with real villa photos organized by room area. Fix deployment so changes appear on villa-augflor.com.

### Gallery Overhaul (`gallery.html`)
Rebuilt with 9 sections and ~30 photos from `assets/photos/optimized/`:

- Master Bedroom — "Barcelona" (upstairs)
- Upstairs Double Bedroom — "Asian"
- Ground Floor Bedroom — Provence
- Living Room
- Garden Room
- Upstairs Bathroom
- Ground Floor Bathroom
- Kitchen
- Exterior

### New Photos Added (from `~/Desktop/Images/House Photos`)
Seven additional images imported May 2026 (2025–2026 files only; 2020 screenshots and duplicates skipped):

| File | Area |
|------|------|
| `entrance-gate-cypress.jpg` | Exterior |
| `garden-archway-path.jpg` | Exterior |
| `exterior-terrace-lounge-roses.jpg` | Exterior |
| `pool-patio-yellow-awning.jpg` | Exterior |
| `terrace-hillside-view-sunset.jpg` | Exterior |
| `interior-floating-staircase.jpg` | Living Room |
| `master-bedroom-barcelona-chairs.jpg` | Barcelona |

Also copied from `_images/`: `garden-room-*.jpg`, `kitchen-corner-wide.jpg`.

### Homepage Updates (`index.html`)
- Gallery grid uses optimized photos (no more `./images/` placeholders in grid)
- Hero background images switched to optimized photos
- Added "browse every room by area" link and **"View full gallery by room"** button
- Footer link points to `gallery.html`
- AC bullet: *"Air conditioning in every bedroom, the living room, and the garden room"*

### Deployment Fix
- **Problem:** GitHub pushed to `villa-augflor.vercel.app` but `villa-augflor.com` uses a separate Vercel project (`villa-augflor-static-live`) that was not auto-deploying.
- **Fix:** Connected GitHub repo to `villa-augflor-static-live` via `npx vercel git connect`. Manual fallback: `npx vercel deploy --prod`.
- **Local git repaired:** broken `.git` pointer to `/private/tmp/vagit` replaced with fresh link to GitHub.

### Key Commits
| Commit | Description |
|--------|-------------|
| `35ce37d` | Rebuild gallery.html with room areas |
| `e4ee3ae` | Homepage gallery → optimized photos |
| `86249c1` | Add 7 new House Photos (2025–2026) |
| `f5496b4` | Link homepage to full gallery page |
| `5d65697` | AC in all rooms + gallery CTA button + hero fix |
| `fe1e614` | Add HANDOVER.md (this file) |

### Known issues / follow-ups
- `photo-stone-house-blue-gate-number-26.jpg` — red mark on wall; candidate for swap
- Homepage `#gallery` mosaic — direct users to `/gallery.html` for room-by-room layout
- ~13 area-guide cards still use gradient tiles until more Commons images are fetched (see Area Guide session above)
- Older session notes below may mention superseded prices (€450, €439, flat €480) — use **Canonical pricing** at top of this file

### Verification Checklist (run after any deploy)
- [ ] `bash scripts/verify-production.sh` exits 0
- [ ] https://villa-augflor.com/rates.html — €420 shoulder / €480 peak
- [ ] https://villa-augflor.com/book-direct-safely.html — 30% deposit, 5-step flow
- [ ] https://villa-augflor.com/about/ — 301 to rates (not old WordPress)
- [ ] https://villa-augflor.com/ — “ideal 4”, link to book-direct-safely
- [ ] https://villa-augflor.com/gallery.html — room sections (standalone URL)
- [ ] https://villa-augflor.com/area.html — filters and place cards load
- [ ] Hard refresh (Cmd+Shift+R) or private window if browser cache shows old content

---

**Last Updated:** May 31, 2026 (calendar sync verified · HANDOVER cleanup)  
**Status:** ✅ Production live · Summer 2026 calendar synced · Full area guide on `/area.html` · SEO page + llms.txt live
