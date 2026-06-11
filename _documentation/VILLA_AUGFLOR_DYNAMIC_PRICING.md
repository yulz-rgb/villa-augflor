# Villa Augflor — Dynamic Pricing Automation Rules

**Generated:** 19 May 2026  
**Purpose:** Auto-adjust prices based on calendar urgency, competitor pricing, and demand signals  
**Revenue impact:** +15-25% (dynamic pricing yields 18% higher revenue on average)

---

## BASE PRICING FRAMEWORK

### Standard Rates (No urgency)

| Period | Nightly | 7-Night | Competitor (Un Brin De Paille) | Strategy |
|--------|---------|---------|---|----------|
| **June 1-15** | €480 | €3,360 | ~€458 | Shoulder season, beat competitor by €22 |
| **June 16-30** | €480 | €3,360 | ~€458 | Shoulder season, stable pricing |
| **July 1-31** | €520 | €3,640 | ~€458 | Peak season, premium justified |
| **Aug 1-31** | €520 | €3,640 | ~€458 | Peak season, premium justified |
| **Sep 1-15** | €480 | €3,360 | ~€458 | Shoulder season, back to base |

---

## DYNAMIC PRICING RULES (Master Manager applies these daily)

### RULE 1: SCARCITY DISCOUNT (High urgency, open weeks)

**Trigger:** >5 weeks still open AND <14 days until start of that period

**Action:**
- Drop nightly rate by **€50** (10% off peak, 10% off shoulder)
- Update Airbnb + Booking.com with urgency language: "Last 2 weeks available for July!"

**Example:** Today is May 19. July 1 is 43 days away.
- If 6+ July weeks still open → hold at €520 (no discount yet)
- If only 2 July weeks open AND <14 days away → drop to €470
- If only 1 July week open AND <7 days away → drop to €430 (emergency pricing)

**Timing:** Apply at 6am Paris time (before morning social posting)

---

### RULE 2: EMERGENCY FLASH SALE (<7 days, <2 weeks open)

**Trigger:** Week is <7 days away AND <2 weeks still open (i.e., unlikely to fill at standard rate)

**Action:**
- Drop nightly rate by **€100** (20% off)
- Trigger Instagram "LAST WEEK AVAILABLE" post
- Trigger WhatsApp blast to warm leads: "[Week] is down to 20% off and booking fast"

**Example:** Today is May 25. July 5-12 is still open (9 days away).
- Conditions met: <7 days AND <2 weeks → €520 - €100 = **€420/night**
- Post: "FINAL WEEK 🔥 July 5-12 at Villa Augflor — €420/night (normally €520). 48-hour flash deal."

**Timing:** Apply by 4pm Paris time (evening social blast)

---

### RULE 3: COMPETITOR UNDERCUT

**Trigger:** Un Brin De Paille drops price by >€10 from known benchmark (€458)

**Action:**
- Match their price - €10 (undercut them)
- Flag to Lana: "Competitor dropped to [price]. Recommend we drop to [our new price]."
- Update Airbnb immediately

**Example:** 
- Un Brin is €458 (known)
- They drop to €430
- We drop to €420 (undercut by €10)
- Airbnb title becomes: "Luxury Villa with Pool — €420 (Was €480!)"

**Timing:** Check daily at 6am (before competitors adjust to our moves)

---

### RULE 4: DEMAND-BASED SURGE PRICING

**Trigger:** Un Brin De Paille is fully booked for a given week AND our calendar shows high interest (3+ inquiries for same week)

**Action:**
- Hold price at standard rate (don't discount)
- If we get another 2 inquiries for same week → consider +€20 surge
- Update Airbnb: "Only [N] week(s) available this July"

**Example:**
- July 1-8 is fully booked at Un Brin
- We get 4 inquiries for July 1-8 within 48h
- Hold at €520 (no discount)
- Scarcity messaging: "This July week has [4 inquiries]. Booking fast."

**Timing:** Apply in real-time as inquiries come in

---

### RULE 5: EARLY BIRD REWARD (>30 days before arrival)

**Trigger:** Booking made >30 days in advance

**Action:**
- Apply +€20 discount per night (incentivizes advance bookings, improves cash flow)
- Or: offer "Pay 20% deposit now, rest 30 days before arrival" (better than cash discount)

**Example:** 
- Today is May 19. Guest books for July 15 (57 days away).
- Standard price: €520
- Early bird: €500/night (or deposit plan with no price cut)

**Timing:** Automatic when booking is confirmed

---

### RULE 6: SEASONAL STEP-DOWN (Post peak-season)

**Trigger:** We reach September 1

**Action:**
- Drop from €520 (peak) to €480 (shoulder)
- Refresh Airbnb + booking.com messaging: "Late Summer Special — €480/night"

**Timing:** Automatic on Sep 1

---

## IMPLEMENTATION: WHO APPLIES THESE RULES & WHEN

### MASTER MANAGER (Runs 3x daily: 10am, 2pm, 6pm Paris time)

**Job:** Calculate recommended pricing, flag changes to Lana

1. **6am scan:** Check competitor prices (Un Brin De Paille Airbnb listing)
2. **Check calendar:** How many weeks open in next 14 days?
3. **Apply rules:** Which rule is triggered? What's the recommended price?
4. **Create directive:** "Recommend drop [period] from €520 → €[new price]" in Master Manager brief

**Lana's action:** Review brief → copy-paste new price to Airbnb/Booking.com (2 min)

---

### LEAD RESPONSE MONITOR (Runs every 2 hours)

**Job:** Track inquiries by week, flag demand surges

1. Incoming inquiry for [Week]?
2. How many other inquiries for same week in last 48h?
3. If ≥3 inquiries same week → note in draft: "High demand for [Week] — consider holding price"

---

### OTA LISTING OPTIMIZER (Runs Mondays 9am)

**Job:** Weekly pricing + copy refresh

1. Set new pricing for following week based on Master Manager's recommendation
2. Update Airbnb title: "[Number] weeks still available" (triggers urgency)
3. Update description: Competitor comparison messaging if we're underpriced

---

## PRICING LOOKUP TABLE (Quick Reference for Lana)

### TODAY: May 19, 2026

| Period | Days Away | Open Weeks | Standard Price | Recommended Price | Reason |
|--------|-----------|------------|---|------|---------|
| **Jun 1-15** | 13-27 days | 2 wks | €480 | €480 | Too far, hold price |
| **Jun 16-30** | 28-42 days | 1 wk | €480 | €480 | Far out, hold |
| **Jul 1-12** | 43-53 days | 1 wk (LAST) | €520 | €520 | Still far, but last July week — monitor |
| **Jul 13-31** | 55-73 days | 3 wks | €520 | €520 | Hold, check daily |
| **Aug 1-15** | 74-88 days | 2 wks | €520 | €520 | Hold, full peak |

**Action today:** Hold all pricing. Monitor Jul 1-12 carefully — it's the last July week. If no bookings by May 25, drop to €480.

---

## PRE-MORTEM: Pricing Pitfalls to Avoid

### ⚠️ TRAP 1: Dropping too early
- **Problem:** June 1 is still 13 days away. If we drop now, we signal panic.
- **Fix:** Only drop if <7 days away AND low confidence

### ⚠️ TRAP 2: Competitor obsession
- **Problem:** Un Brin drops price → we panic-drop → spiral downward
- **Fix:** Only match if our weeks are open. If booked → hold price

### ⚠️ TRAP 3: Forgetting seasonal value
- **Problem:** Guests in July will pay €520. June guests expect €480. Don't confuse them.
- **Fix:** Keep seasonal pricing clear. Only adjust within season.

### ⚠️ TRAP 4: Lana forgets to update Airbnb
- **Problem:** Master Manager recommends drop, but Lana doesn't update platform
- **Fix:** Add "UPDATE AIRBNB" as last step in brief. Use exact price link.

---

## COMPETITOR PRICE TRACKING

### Un Brin De Paille (Closest competitor, Cagnes-sur-Mer)
- **Airbnb listing:** https://www.airbnb.fr/rooms/[ID] (manual check daily)
- **Known baseline:** €458/night
- **Last check:** [Date] — €[price]
- **Trend:** [Up/Down/Stable]

### Master Manager task:
- Check their Airbnb daily at 6am
- Extract current price
- Compare to our pricing
- Flag if drop >€10

---

## REVENUE IMPACT PROJECTION

| Scenario | Q1 Revenue | Q2 Revenue | Q3 Revenue | Notes |
|----------|-----------|-----------|-----------|-------|
| **No dynamic pricing** | €11,500 | €34,200 | €7,200 | Static €480-520 all season |
| **With dynamic pricing** | €11,800 | €39,400 | €7,500 | +15% via scarcity + undercut |
| **With dynamic pricing + sequences** | €11,900 | €42,100 | €8,000 | +23% via conversion + pricing |

**Bottom line:** Dynamic pricing + nurture sequences = +€7,900 summer revenue (17% increase)

---

## MANUAL BACKUP (If API automation fails)

If competitors can't be checked daily via API:
1. Lana checks Un Brin De Paille Airbnb listing at 6am
2. Lana fills in simple form: [Today's date] [Un Brin price] [Our price]
3. Master Manager reads the form + issues directive
4. Takes 3 minutes total

---

## SUCCESS METRICS

✅ **Pricing:** Track nightly rate month-over-month (target: +10% vs last year)  
✅ **Occupancy:** Track weeks booked vs open (target: 11/13 by Jul 1)  
✅ **Revenue:** Track total summer revenue vs €46k potential (target: €40k+)  
✅ **Competitor gap:** Track our price vs Un Brin (target: within €20)
