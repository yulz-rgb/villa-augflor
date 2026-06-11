# Villa Augflor — Competitor Monitoring & Intelligence System

**Generated:** 19 May 2026  
**Purpose:** Daily competitor price tracking, availability monitoring, and strategic response triggers  
**Competitive advantage:** Real-time pricing decisions vs 1-2 week feedback loops

---

## PRIMARY COMPETITOR

### Un Brin De Paille
- **Location:** Cagnes-sur-Mer (same town as Villa Augflor)
- **Airbnb listing:** https://www.airbnb.fr/rooms/[ID] (need exact ID — check Lana's notes)
- **Specs:** Similar to Villa Augflor (pool, garden, 3-4 bedrooms)
- **Rating:** 9.8★ / 200 reviews (vs our 4.79★ / 38 reviews — they have 5x more reviews)
- **Pricing:** ~€458/night (baseline, varies seasonally)
- **Market share threat:** HIGH — closest direct competitor

---

## SECONDARY COMPETITORS

### Villa Sur La Côte D'Azur
- **Location:** La Colle-sur-Loup (10km away, slightly inland)
- **Market:** Lower tier (€273/night)
- **Threat:** LOW — different market segment, we don't compete on price

### Other Platforms to Monitor
- **Cozycozy.com** — European vacation rental aggregator
- **Booking.com rival properties** — same region, any major price moves
- **Instagram competitors** — hashtag #CagnesSurMer #VillaRental trending properties

---

## DAILY MONITORING PROTOCOL

### TIME: 6:00 AM PARIS TIME (Master Manager automatic task)

#### STEP 1: Fetch Un Brin De Paille Airbnb Listing

**Manual method (until automated):**
1. Go to: https://www.airbnb.fr/rooms/[ID]
2. Note today's date
3. Scroll to pricing section
4. Record: nightly rate, availability calendar (if visible)
5. Note any listing changes (new photos, updated description)

**Automated method (target state):**
- Use Airbnb API or web scraper to fetch pricing daily
- Store in simple CSV: [Date | Price | Availability Days]
- Flag if price changes >€10 from baseline

#### STEP 2: Check Availability Calendar

**What to record:**
- How many weeks are they booked in Jun/Jul/Aug?
- Any patterns? (weekends vs weekdays? Specific periods?)
- Are they more or less booked than us?

**Why it matters:**
- If they're fully booked (no discount power) → we hold our prices
- If they have gaps → they might drop price → we need to monitor

#### STEP 3: Scan Their Airbnb Reviews (Last 3-5 reviews)

**Look for:**
- Any concerns guests mention (price, cleanliness, noise)?
- Sentiment shifts (are recent reviews lower than older ones)?
- Topics (kids, groups, couples?) — which markets are they converting?

#### STEP 4: Check Their Instagram (If public)

**What to note:**
- Recent posts (last 5 posts)
- Engagement rates (likes, comments)
- Marketing angle (are they doing flash sales? Eco messaging? Luxury angle?)
- Which hashtags are they using? (steal the successful ones)

---

## PRICE CHANGE RESPONSE MATRIX

### SCENARIO 1: Un Brin Drops Price by €10-20

**Trigger:** They drop from €458 → €440

**Master Manager action:**
1. Note the change
2. Check our calendar: how many weeks still open?
3. If we have >3 open weeks AND <14 days to availability → recommend we drop to €430 (undercut by €10)
4. If we have <3 open weeks → hold price (we're less desperate)
5. Create directive: "Un Brin dropped to €440. Recommend we drop Jun 1-15 to €430 to undercut."

**Lana action:**
- Review directive at 6:15am (in Master Manager brief)
- If approved: update Airbnb Jun pricing to €430 (takes 2 min)
- Note the change date + reason in competitor tracking log

---

### SCENARIO 2: Un Brin Drops Price by >€20 (Aggressive move)

**Trigger:** They drop from €458 → €400 (emergency pricing)

**Master Manager action:**
1. Flag as ALERT: "Un Brin emergency pricing detected"
2. Analyze: Are they desperate? Do they have many open weeks?
3. Check our calendar: how confident are we in our bookings?
4. Recommend: Either (a) hold price if we're booking well, or (b) match pricing if we're also struggling

**Lana action:**
- Make strategic decision: Match or hold?
- If match: "We're in same situation, strategic parity pricing"
- If hold: "Our booking rate is better, maintain price integrity"
- Document the decision + reason

---

### SCENARIO 3: Un Brin's Price Increases

**Trigger:** They raise from €458 → €480 (confidence signal)

**Master Manager action:**
1. Positive signal — market supports higher pricing
2. Check our bookings: if we're booked 80%+ → we could also raise
3. Or: Hold price, use as marketing advantage ("We're €30 cheaper than [competitor]")
4. Create directive: "Market is supporting higher prices. Current booking rate supports €520 in peak. Hold course."

**Lana action:**
- Review & confirm (no action needed unless we want to raise)
- Don't be reactive — pricing is strategic

---

## WEEKLY SUMMARY (Every Monday 9am)

**OTA Listing Optimizer creates competitor report:**

```
COMPETITOR PRICING REPORT — WEEK OF MAY 19-25

Un Brin De Paille:
- Current price: €458/night (baseline €458 — no change)
- Availability: 4 weeks booked, 9 weeks open
- Status: Stable pricing, still has capacity
- Our strategy: Hold pricing at €520 (peak), €480 (shoulder)

Our position:
- Current price: €520 (Jul), €480 (Jun)
- Availability: 2 weeks booked, 11 weeks open
- Compared to them: We're €62 more expensive, 11 weeks less booked
- Action needed: Consider 10% discount on June if no bookings by May 25

Recommendation:
- Hold peak pricing (July) at €520 (we're full-booked equivalent)
- Consider €450 flash sale for June if no bookings by May 25
- Monitor Un Brin daily for any drops >€20
```

---

## QUARTERLY COMPETITIVE ANALYSIS (End of each quarter)

**Master Manager quarterly review:**

```
Q2 COMPETITIVE ANALYSIS

MARKET POSITIONING:
- Un Brin De Paille: Holding €458 avg, 80% booked Jul-Aug
- Villa Sur La Côte D'Azur: €273 avg, different market
- Us: €480-520 avg, 15% booked Jul-Aug (PROBLEM)

FINDINGS:
1. We're pricing correctly relative to competition
2. We're NOT converting because of response time & marketing, not price
3. Un Brin has 5x more reviews (credibility advantage)
4. We need to close booking response time to <2h (not <4h)

NEXT QUARTER STRATEGY:
- Don't compete on price — compete on service + reviews
- Target: Get 10 new 5★ reviews by Sep 1
- Marketing: "Fastest response rate on Côte d'Azur" messaging
```

---

## INTEGRATION WITH MASTER MANAGER

**Master Manager 6am scan output → Lana's briefing:**

```
🔴 COMPETITOR ALERT
Un Brin De Paille: €458/night (baseline)
- Last check: May 19 6:00am
- Change from yesterday: None
- Action: None needed

Your position:
- Jun price: €480 (vs their €458) — you're €22 more expensive
- Jul price: €520 (vs their €458) — you're €62 more expensive
- Your advantage: Better location (beachfront), heated pool

Strategy: Hold pricing. Focus on conversion speed instead of price cuts.
```

---

## TOOLS & RESOURCES

### Option A: Manual Daily Check (Low-tech, 3 min)

1. Bookmark Un Brin's Airbnb: https://www.airbnb.fr/rooms/[ID]
2. Every morning at 6am, click, check price
3. Write in simple Google Sheet: [Date | Price | Notes]
4. Master Manager reads sheet → issues directive

**Tool needed:** Google Sheet + 3 min daily

---

### Option B: Automated Airbnb Price Scraper (Medium-tech, 5 min setup)

Use a free service like:
- **Airbnb Tracker** (google "airbnb price tracker") — some free, some freemium
- **Zapier + RapidAPI** — automate Airbnb API calls → spreadsheet
- **Custom Python script** (if Lana wants) — fetch Airbnb page daily, extract price, email alert

**Expected cost:** Free - €10/month  
**Setup time:** 15 minutes

---

### Option C: Professional Competitive Intelligence Service

Services like Booking Intelligence, RMS (Revenue Management Systems), or Airbnb's own analytics tools provide automated competitor tracking.

**Cost:** €30-100/month  
**Setup:** 1 hour  
**ROI:** High if managing multiple properties

---

## WHAT TO TRACK IN SPREADSHEET

```
Date | Un Brin Price | Un Brin Avail % | Our Price (Jun) | Our Price (Jul) | Our Avail % | Action Taken | Notes
-----|---|---|---|---|---|---|---
5/19 | €458 | 69% | €480 | €520 | 15% | None | Baseline established
5/20 | €458 | 69% | €480 | €520 | 15% | None | No change
5/21 | €450 | 73% | €480 | €520 | 15% | ALERT | Drop detected, monitor
5/22 | €440 | 76% | €430 | €520 | 18% | Jun price cut | Undercut by €10
...
```

---

## RED FLAGS (Alert Lana immediately)

**Master Manager should ALERT if:**

1. ⚠️ **Un Brin drops >€30** → "Emergency pricing detected — competitive threat"
2. ⚠️ **Un Brin fully books Jul/Aug** → "They're out of capacity — we should hold pricing"
3. ⚠️ **Un Brin launches new reviews spike** (20+ in one week) → "They're doing heavy marketing — expect demand surge"
4. ⚠️ **Un Brin publishes new photos/upgraded description** → "They're refreshing listing — we should audit ours"
5. ⚠️ **Our prices are >€80 above market** → "We're too expensive relative to competition + our booking rate"

---

## MONTHLY COMPETITIVE REPORT (For Lana's records)

**Saved in Google Drive for historical reference:**

```
VILLA AUGFLOR COMPETITIVE POSITION
May 2026

PRIMARY COMPETITOR: Un Brin De Paille
- Pricing trend: Stable (€458)
- Booking trend: Strong (80% booked Jul-Aug vs our 15%)
- Review trend: Steady (9.8★, 200+ reviews)
- Marketing intensity: High (3-4 posts/week)

MARKET OPPORTUNITY:
- They're booked, high demand
- But they're at premium prices (€458)
- We can compete on service quality + response speed
- Not on price

OUR RECOMMENDATIONS:
1. Focus on response speed (<1h for hot inquiries)
2. Increase review count (target 50 reviews by Dec)
3. Match their marketing frequency (3+ posts/week)
4. Maintain premium pricing (we earn it through service)
```

---

## SUCCESS METRICS

✅ Track price differential (maintain <€30 gap on same season)  
✅ Track availability monitoring accuracy (catch price changes within 2h)  
✅ Track response-to-competitor-move time (goal: <4h from price change to our update)  
✅ Track market share perception (survey guests: do they feel we're good value vs alternatives?)
