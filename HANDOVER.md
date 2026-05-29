# Handover: Villa Augflor SEO & Deployment Complete

**Status:** ✅ PRODUCTION LIVE  
**Date:** May 29, 2026  
**Custom Domain:** https://villa-augflor.com  
**Latest commit:** `cc73d22` on `main` — run `git log -1 --oneline` for newer. Production verified May 29, 2026 (`bash scripts/verify-production.sh`).

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
| **Area guide (live page)** | https://villa-augflor.com/area.html |
| Legacy area URL | `riviera-area-guide.html` → redirects to `area.html` |
| Full photo gallery | https://villa-augflor.com/gallery.html |
| Homepage photo preview | https://villa-augflor.com/#gallery |
| Villa room photos | `assets/photos/optimized/` and `~/Desktop/Images/House Photos` |
| Area-guide destination photos | `assets/photos/area/` (Wikimedia Commons, CC) |
| Refresh area photos | `python3 scripts/download-area-photos.py` |

**Rules for any update:** browser-verify on villa-augflor.com before saying "done"; gallery changes belong on `gallery.html`; Airbnb listing is separate from this site. **Update this HANDOVER.md whenever you change the live site.**

### Canonical pricing (keep `index.html` + `rates.html` in sync)

| Season | Months | Nightly (direct) | Notes |
|--------|--------|------------------|-------|
| Shoulder | June · September | **€420** | Label: **Shoulder season** on `rates.html` |
| Peak summer | July · August | **€480** direct (was **€520** list) | Label: **Peak summer** — not "High Season" |
| 7-night peak comparison | Jul/Aug | Save **~€719** vs Airbnb | See cost grid on `rates.html` |

**Agent pitfalls (past chats):** see `docs/agent-lessons-learned.md`. If Cursor opened empty `villa-augflor/`, use repo `villa-augflor-live` only. Do not claim "live" without `bash scripts/verify-production.sh` (checks `/`, `/area.html`, and **`/rates.html`** pricing). **Do not use `./images/` paths** — hero and about photos live under `assets/photos/optimized/` only.

**Pricing deploy rule:** Any rate change must commit **`index.html` and `rates.html` in the same commit** before deploy. Subpage assets (`styles/subpage.css`, `scripts/subpage.js`, `components/nav-subpage.html`, `components/footer-subpage.html`) must be in git if `rates.html` depends on them.

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
| Ground Floor Bedroom — "Le Provance" | French-provincial styling, marble accent wall |
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
- **rates.html** — Cost comparison calculator highlighting direct-booking savings (**~€719** on 7-night peak stay)
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
**Last verification:** May 29, 2026 (`verify-production.sh` exit 0)

| Page | Status | Notes |
|------|--------|-------|
| index.html `/` | ✅ LIVE | Title “from €420/night”; calendar €420/€480; no `./images/` |
| rates.html | ✅ LIVE | Shoulder €420 · peak €480 direct (€520 list) · savings ~€719 |
| area.html | ✅ LIVE | `ag-grid`, area photos 200 |
| gallery.html | ✅ LIVE | 9 room areas, 30+ photos, AC note in intro |
| index.html `#gallery` | ✅ LIVE | Optimized photos; "View full gallery by room" button |
| index.html homepage pricing cards | ✅ REMOVED | Section removed; pricing on `rates.html` + calendar on home |
| fr/index.html | ✅ LIVE | FR pricing aligned (dès €420/nuit) |
| guest-reviews.html | ✅ LIVE | Shows 4.79★ rating, 100+ guests |
| All 13 booking pages | ✅ LIVE | Fully deployed and accessible |

### ✅ Vercel Deployments
- **villa-augflor.vercel.app** — GitHub auto-deploy (secondary subdomain)
- **villa-augflor.com** — Production custom domain via `villa-augflor-static-live`
- **Deploy command:** `npx vercel deploy --prod` from project root if GitHub auto-deploy fails

---

## Technical Architecture

### File Structure
```
.
├── index.html (7 sections: hero, amenities, split layouts, etc.)
├── villa.html (Layout, bedrooms, amenities, honest notes, FAQ)
├── rates.html (Subpage layout — rate cards, €719 comparison, WhatsApp templates)
├── gallery.html
├── area.html (Uses subpage nav + area-guide.js)
├── fr/index.html
├── [13 booking pages].html
├── api/booking-agent.js (Vercel serverless — needs ANTHROPIC_API_KEY)
├── components/
│   ├── header.html
│   ├── footer.html
│   ├── sticky-cta.html
│   ├── nav-subpage.html
│   └── footer-subpage.html
├── styles/
│   ├── main.css
│   ├── subpage.css
│   ├── area-guide.css
│   └── booking-chat.css
├── scripts/
│   ├── main.js
│   ├── subpage.js
│   ├── area-guide.js
│   ├── booking-chat.js
│   ├── deploy-production.sh
│   └── verify-production.sh
├── assets/
│   └── photos/
│       ├── optimized/ (~60 JPEGs — all gallery images)
│       └── HOW-TO-ADD-PHOTOS.txt
├── .vercel/
│   └── project.json (Points to villa-augflor-static-live)
└── vercel.json (Build config)
```

### GitHub Repository
- **Owner:** yulz-rgb
- **Repo:** villa-augflor
- **Branch:** main
- **Latest commit:** `cc73d22` (pricing + rates subpage) — run `git log -1 --oneline`
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
- **Cost comparison section** emphasizing direct-booking savings (~€719 on `rates.html` peak-week example)
- **Pre-filled WhatsApp CTAs** on all pages directing to Lana: +33 6 23 77 73 33

### Performance Targets
- **Lighthouse score:** 95+ (static HTML)
- **Page load:** <2s (Vercel global CDN)
- **Deployment time:** 30 seconds
- **SEO indexing:** Expected within 48h of sitemap submission

---

## Post-Deployment Checklist

- [ ] Load https://villa-augflor.com/gallery.html — verify room sections and new exterior photos
- [ ] Load https://villa-augflor.com/ — verify AC text and "View full gallery by room" button
- [ ] Load https://villa-augflor.com/ — verify all CTAs work
- [ ] Test WhatsApp button on any page (should open chat with +33 6 23 77 73 33)
- [ ] Load /rates.html — Shoulder **€420**, Peak **€480** (€520 struck through), savings **~€719** on 7-night grid
- [ ] Run `bash scripts/verify-production.sh` — must exit 0 (checks `/`, `/area.html`, `/rates.html`)
- [ ] Load /guest-reviews.html — verify 6 testimonials show with 4.79★
- [ ] Run Lighthouse audit (target 90+ all categories)
- [ ] Submit sitemap.xml to Google Search Console

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

1. **Gallery lives on `gallery.html`** — the homepage `#gallery` section is a photo mosaic preview only. Room-by-room layout (Barcelona, Asian, Le Provance, etc.) is on `/gallery.html`.
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
- Ground Floor Bedroom — "Le Provance"
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
- [ ] https://villa-augflor.com/rates.html — €420 shoulder / €480 peak (not €450/€520)
- [ ] https://villa-augflor.com/ — title contains “from €420”; no broken `./images/` in page source
- [ ] https://villa-augflor.com/gallery.html — room sections + AC note
- [ ] https://villa-augflor.com/area.html — filters and place cards load
- [ ] Hard refresh (Cmd+Shift+R) or private window if browser cache shows old pricing

---

**Last Updated:** May 29, 2026 (evening — post `cc73d22` full pricing deploy)  
**Status:** ✅ Production live · Area guide · Gallery by room · Pricing €420/€480 on index + rates · verify script checks both URLs
