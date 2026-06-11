# Villa Augflor — Session Handover
_Last updated: 19 May 2026. Read this at the start of any new chat about Villa Augflor._

---

## The Situation

**Property:** Villa Augflor — 3-bedroom luxury villa, private pool, Mediterranean garden, Cagnes-sur-Mer (06800), French Riviera, France.

**Host:** Lana (you). Email: villa.augflor@gmail.com. WhatsApp: +33 6 23 77 73 33.

**Channels:** Airbnb (https://www.airbnb.fr/rooms/26836386) · Booking.com · Direct (https://www.villa-augflor.com)

**Pricing:** €480/night shoulder (Jun, Sep) · €520/night peak (Jul–Aug) · up to 6 guests

**Rating:** 4.79★ from 38 reviews · 10-year host

**CRISIS CONTEXT:** As of 19 May 2026, only **2 bookings** confirmed for summer (1 Airbnb, 1 Booking.com). Normally fully booked Jun–Aug by this date. Jun–Aug = 13 bookable weeks. Each open week = ~€3,500 lost revenue. ~€46,000 total summer potential.

---

## Codebase

**Location:** `/Users/lana/Projects/villa-augflor`  
**Branch deployed to live:** `main` (Vercel auto-deploys on push)  
**GitHub remote:** https://github.com/yulz-rgb/villa-augflor  
**Live site:** https://www.villa-augflor.com  
**Vercel project ID:** `prj_41Ky5qIppQX8ATlRrPK5Ik4Mt4ca`

**⚠️ GitHub NOT connected to Claude remote agents yet.**  
To connect: https://claude.ai/code/onboarding?magic=github-app-setup  
Until then, agents can't push code changes automatically.

**Other project folders (NOT deployed):**
- `/Users/lana/Projects/villa-augflor-static-live` — older static version
- `/Users/lana/Projects/villa-augflor-live-archive-20260422-154725` — backup from Apr 22
- `/Users/lana/Projects/villa-augflor-github-live-backup-20260422-154725.zip` — zip backup
- `test/luxury-redesign-v3` branch — a full redesign in progress, NOT live yet. Has complete design system (styles/main.css, scripts/main.js, multiple pages).

---

## What's Live on Production (main branch)

**Files on main:**
- `index.html` — homepage, self-contained with inline CSS (Jost + Cormorant Garamond)
- `riviera-area-guide.html` — area guide page (**⚠️ BROKEN — references styles/main.css + scripts/main.js which don't exist on main**)
- `villa-details.html` — villa detail page (**⚠️ BROKEN — same issue**)

**SEO improvements deployed in this session (commit `341d5bb`):**
- `index.html` title changed to: `Villa Augflor | 3-Bedroom Villa with Pool · Cagnes-sur-Mer, Côte d'Azur`
- Added: canonical URL, og:type, og:url, full Twitter card tags
- Added: comprehensive JSON-LD schema (`@graph` with WebSite + LodgingBusiness + VacationRental + FAQPage)
- Schema includes: geo coordinates (43.6641, 7.1489), numberOfRooms: 3, checkin/checkout times, 6 amenities, Airbnb sameAs link
- 6-question FAQ schema triggers Google's expandable FAQ rich results in search

**Known production issue:** `villa-details.html` and `riviera-area-guide.html` render unstyled because the CSS/JS files they reference (`styles/main.css`, `scripts/main.js`) don't exist in the main branch. Fix: copy those files from `test/luxury-redesign-v3` to main. A fix task has been flagged.

---

## The Agent System — 6 Routines Running

All routines are live at https://claude.ai/code/routines

All routines have Google Calendar, Gmail, and Google Drive MCP connectors auto-attached.  
All create Gmail drafts to villa.augflor@gmail.com rather than sending directly (Lana reviews before sending).

### 1. MASTER MANAGER
**URL:** https://claude.ai/code/routines/trig_011rHkJkMXrThewaxfwSCEkf  
**Schedule:** 3× daily — noon, 4pm, 8pm Paris time (10:00, 14:00, 18:00 UTC)  
**What it does:**
- Checks Google Calendar for confirmed bookings, maps Jun–Aug week by week
- Calculates booking deficit vs normal year → assigns global MODE (STEADY/ELEVATED/URGENT/CRISIS)
- Scans Gmail for new inquiries + recent sub-agent outputs
- Issues 5 specific strategic directives for the next 12 hours
- Creates an HTML dashboard email with booking table, fill rate, revenue at risk

### 2. LEAD RESPONSE MONITOR
**URL:** https://claude.ai/code/routines/trig_01GsfM7qDrJR1WWMGgPeNmwa  
**Schedule:** Every 2 hours during business hours — 9am, 11am, 1pm, 3pm, 5pm, 7pm Paris (07:00, 09:00, 11:00, 13:00, 15:00, 17:00 UTC)  
**What it does:**
- Scans Gmail for unread booking inquiries (last 48h)
- Classifies each as HOT (<4h) / WARM (4–24h) / COLD (>24h)
- Drafts personalised response emails for each unanswered inquiry (150 words, warm, with WhatsApp CTA)
- Drafts revival messages for cold leads >7 days old
- Creates a summary report draft each run
- **This is the highest-ROI agent** — inquiry response speed is the #1 conversion factor

### 3. MORNING ACCELERATOR (Daily Booking Accelerator v2)
**URL:** https://claude.ai/code/routines/trig_01AiVPwqRQn3uRD4Ak1VQyqh  
**Schedule:** Daily 8am Paris (06:00 UTC)  
**What it does (10 modules):**
1. Google Calendar check → exact available week map
2. Urgency escalation → MODE with deficit calc
3. Competitor deep dive (Un Brin De Paille, Villa Sur La Côte D'Azur, cozycozy.com)
4. Airbnb listing audit (fetch live page, grade 6 items, write replacement copy)
5. Precision revenue math → week-by-week table with recommended prices
6. EN + DE Instagram captions (German = #1 foreign market for Côte d'Azur)
7. WhatsApp broadcast templates (short 160-char + long 300-char)
8. Google Business Profile post (weekly GBP update = local search boost)
9. 3-email nurture sequence → creates 3 Gmail drafts [SEQUENCE 1/3], [SEQUENCE 2/3], [SEQUENCE 3/3]
10. Platform listing optimisation copy (Airbnb title + description rewrite, Booking.com check)
- Creates morning brief HTML email with everything compiled

### 4. EVENING INTELLIGENCE
**URL:** https://claude.ai/code/routines/trig_01UBBWA4fXkFpa1NkkhGWZwX  
**Schedule:** Daily 6pm Paris (16:00 UTC)  
**What it does:**
- Competitor price scan (end-of-day pricing shifts)
- Demand signal scan (events near Nice/Cannes in Jul–Aug = premium pricing opps)
- Social listening (#VillaAugflor mentions, competitor content trends)
- Tomorrow's content plan: 1 caption, best post time, pricing recommendation, 1 morning action
- Creates evening brief email with overnight opportunity flag

### 5. OTA LISTING OPTIMIZER
**URL:** https://claude.ai/code/routines/trig_01TY6wn3pC41aeTkBo7VqTzK  
**Schedule:** Every Monday 9am Paris (07:00 UTC) — first run Mon 25 May  
**What it does:**
- Fetches live Airbnb listing, audits and scores title/description/photos/amenities/pricing (1–10)
- Benchmarks against 2 named competitors
- Runs 4 Google search visibility tests
- Produces complete paste-ready Airbnb update package: new title (50 char), new opening (250 char), full rewritten description (~600 words), amenity reorder, photo recommendation
- Creates weekly listing email with "~20 minutes to apply" instructions

### 6. WEEKEND URGENCY PUSH
**URL:** https://claude.ai/code/routines/trig_015FDHTXmVJBRwVv76LcFvQH  
**Schedule:** Every Friday 2pm Paris (12:00 UTC) — first run Fri 22 May  
**What it does:**
- Checks calendar for open weeks, ranks by revenue priority (July first)
- Generates 5-piece weekend content package:
  - Friday 6pm Instagram post (aspirational)
  - Saturday 9am Instagram post (EN + DE)
  - Sunday 7pm "limited availability" post
  - WhatsApp broadcast (short + long versions)
  - Weekend email to guest list (with 5% loyalty discount)
- Flash deal post if any week within 45 days is still open
- 3 caption ideas queued for following Mon/Wed/Thu
- Timing schedule at top of email for easy execution

---

## The Skill

**Skill name:** `villa-booking-accelerator`  
**Location:** `/Users/lana/Library/Application Support/Claude/local-agent-mode-sessions/skills-plugin/be681f54-95f2-4a76-9398-d186ae7d00f8/0ff08cec-4ea1-4e36-932e-b9c13636625b/skills/villa-booking-accelerator/SKILL.md`

**Invoke in any chat with:** `/villa-booking-accelerator` or just describe a booking/marketing task for the villa — it auto-triggers.

**Quick commands within the skill:**
| Say this | Does this |
|----------|-----------|
| `run everything` | All 10 modules |
| `German caption` | German Instagram caption |
| `WhatsApp blast` | Both WA broadcast versions |
| `audit Airbnb listing` | Live listing audit + replacement copy |
| `revenue math` | Week-by-week pricing table |
| `email sequence` | Creates 3 Gmail drafts |
| `fix SEO` | Audits + fixes codebase, commits, pushes |

---

## Competitor Watchlist

Tracked by name in every agent run:

| Name | Location | Price | Notes |
|------|----------|-------|-------|
| Un Brin De Paille | Cagnes-sur-Mer | ~$458/night | 9.8/10, 200 reviews — closest direct competitor |
| Villa Sur La Côte D'Azur | La Colle-sur-Loup | ~$273/night | 9.7/10, 83 reviews — lower tier |

---

## What Lana Needs to Do

**Today:**
- [ ] Check Gmail drafts — the first Lead Monitor ran at 3pm, Master Manager at 4pm
- [ ] Post one of the Instagram captions (Option 3 — Lana's voice — recommended)
- [ ] Send the past-guest email (draft in Gmail: "Coming back to the Riviera this summer?")

**This week:**
- [ ] Connect GitHub: https://claude.ai/code/onboarding?magic=github-app-setup (enables agents to push SEO fixes)
- [ ] Apply Monday's OTA listing update package when it arrives (Mon 25 May, ~20 min)
- [ ] Send the 3-email nurture sequence drafts to any existing warm leads

**Ongoing (Lana's daily time commitment: ~15 min):**
- Open morning brief from Gmail (arrives 8am)
- Send any "[SEND NOW]" response drafts from Lead Monitor
- Post one Instagram caption (EN or DE)
- Follow Master Manager's top 3 directives

---

## Key URLs

| Resource | URL |
|----------|-----|
| Live website | https://www.villa-augflor.com |
| Airbnb listing | https://www.airbnb.fr/rooms/26836386 |
| All routines | https://claude.ai/code/routines |
| GitHub repo | https://github.com/yulz-rgb/villa-augflor |
| GitHub connect | https://claude.ai/code/onboarding?magic=github-app-setup |
| Gmail | villa.augflor@gmail.com |
| WhatsApp | +33 6 23 77 73 33 |

---

## Today's Gmail Inbox Schedule (19 May 2026)

| Time (Paris) | Draft subject | From |
|---|---|---|
| 2pm ✓ | 🌊 [MODE] — Villa Augflor Master Brief ... | Master Manager |
| 3pm ✓ | 💬 Lead Monitor — 13:00 \| ... | Lead Monitor |
| 4pm | 🌊 [MODE] — Villa Augflor Master Brief ... | Master Manager |
| 5pm | 💬 Lead Monitor — 15:00 \| ... | Lead Monitor |
| 6pm | 🌅 Evening Brief 19 May ... | Evening Intelligence |
| 7pm | 💬 Lead Monitor — 17:00 \| ... | Lead Monitor |
| 8pm | 🌊 [MODE] — Villa Augflor Master Brief ... | Master Manager |

Plus already in drafts:
- `[DRAFT] Coming back to the Riviera this summer?` — past-guest email template
- `[SEQUENCE 1/3]`, `[SEQUENCE 2/3]`, `[SEQUENCE 3/3]` — inquiry nurture templates

---

## Architecture Diagram

```
                    VILLA AUGFLOR AGENT NETWORK
                    
     GOOGLE CALENDAR          GMAIL INBOX          LIVE SITE
     (booking data)      (inquiries + output)    (villa-augflor.com)
           │                     │                      │
           └──────────┬──────────┘                      │
                      │                                 │
              ┌───────▼────────┐                        │
              │ MASTER MANAGER │  3× daily              │
              │  noon/4pm/8pm  │◄───────────────────────┤
              └───────┬────────┘   reads all outputs    │
                      │ issues MODE + directives         │
           ┌──────────┼──────────────┬──────────┐       │
           │          │              │          │       │
    ┌──────▼──┐ ┌─────▼──────┐ ┌────▼────┐ ┌──▼──┐    │
    │  LEAD   │ │  MORNING   │ │EVENING  │ │ OTA │    │
    │MONITOR  │ │ACCELERATOR │ │  INTEL  │ │ OPT │    │
    │ 6×/day  │ │   8am      │ │  6pm    │ │ Mon │    │
    └──────┬──┘ └─────┬──────┘ └────┬────┘ └──┬──┘    │
           │          │             │          │       │
           └──────────┴──────┬──────┴──────────┘       │
                             │                         │
                    ┌────────▼───────┐                  │
                    │   WEEKEND      │                  │
                    │ URGENCY PUSH   │──────────────────┘
                    │  Fridays 2pm   │  (when GitHub connected)
                    └────────────────┘
                    
    ALL AGENTS → Gmail drafts → Lana reviews → Lana sends/posts
```

---

## Notes for Next Session

- The urgency MODE will be recalculated fresh each time the Master Manager runs. As of 19 May with 2 bookings, deficit against normal pace is ~6–7 weeks → expect MODE: **CRISIS**.
- The skill and all agents share the same property context. If pricing changes, update both the SKILL.md and update each routine via RemoteTrigger (action: update).
- If a booking comes in, add it to Google Calendar — all agents read from there for live accuracy.
- The `test/luxury-redesign-v3` branch has a full redesign ready. When ready to launch it, merge to main and the broken villa-details + area guide pages will also be fixed.
