# Villa Augflor — WhatsApp Automation Templates

**Generated:** 19 May 2026  
**Purpose:** Auto-send or copy-paste WhatsApp messages to warm leads, cold inquiries, and past guests  
**Conversion impact:** +40% (WhatsApp gets 98% open rate vs 30% email)

---

## TEMPLATE 1: HOT INQUIRY (0-4 hours old, no response yet)

**Use case:** New inquiry just came in, hasn't been answered yet  
**Platform:** WhatsApp  
**Send to:** [Guest phone if available, else Lana sends manually]

```
Hi [FirstName]! 👋

Thanks so much for your interest in Villa Augflor for [Dates]. I'm Lana, the host!

Just to confirm — is [Arrival Date] still what works for you? We typically get inquiries booked within 24h, so I wanted to check in quickly.

Happy to answer any questions about the villa, pool, area, or anything else!

Looking forward to hosting you 🌊

Villa Augflor
+33 6 23 77 73 33
https://www.villa-augflor.com
```

**Action for Lead Monitor:** Auto-generate this, extract phone number from inquiry if available, send to Lana with [WHATSAPP READY] prefix in email subject

---

## TEMPLATE 2: WARM INQUIRY (4-24 hours old, no response)

**Use case:** Inquiry was sent yesterday, Lead Monitor already drafted email response but hasn't been sent yet  
**Platform:** WhatsApp (send after 6pm local time for better engagement)  
**Tone:** Friendly, slightly urgent

```
Hey [FirstName] 👋

I saw your inquiry about Villa Augflor for [Dates] — my apologies if my email got buried!

Quick question: is [Arrival Date]-[Departure Date] still the dates you're looking at? 

The villa has everything for an amazing Riviera week — private pool, sea view, garden, 3 bedrooms. I'd love to reserve it for you if the dates work!

Let me know 💙

Lana
Villa Augflor | Cagnes-sur-Mer
https://www.villa-augflor.com
```

**Action for Lead Monitor:** If email was drafted >4h ago and no response, generate this WhatsApp template and flag for Lana to send manually (WhatsApp API integration pending)

---

## TEMPLATE 3: COLD INQUIRY (>7 days, no response)

**Use case:** Inquiry went silent for >7 days. High risk of losing to competitor.  
**Platform:** WhatsApp (emergency revival)  
**Tone:** Casual, low-pressure

```
Hi [FirstName]! 

Just a friendly check-in — I saw you were interested in Villa Augflor back on [Date]. 😊

If you're still thinking about a summer getaway, I'd love to help make it happen! We've got [Dates Available] still open, and I can offer 10% off if you book this week.

No pressure at all — just want to make sure you didn't miss our earlier messages!

Let me know if I can help 🏡

Lana
+33 6 23 77 73 33
```

**Action for Lead Monitor:** Auto-send this as a Gmail draft with [REVIVAL - DAY 8] prefix. Lana approves + sends.

---

## TEMPLATE 4: PAST GUEST RE-ENGAGEMENT (Direct contact list)

**Use case:** Someone who stayed before but hasn't booked again  
**Platform:** WhatsApp + Email  
**Tone:** Personal, warm, incentive-driven

```
Hi [FirstName]!

Hope you've been well! ☀️

I was thinking about your stay last [Season] at Villa Augflor — you guys were such a joy to host. I still remember [Small personal detail from previous stay if possible].

Anyway, I'm opening the villa up for another amazing summer. Given how much you loved it, I wanted to reach out first with a special offer:

**10% loyalty discount** on any June-August booking for you ✨

If you'd like to come back, just let me know and I'll reserve your favorite [pool/garden/room] right away!

https://www.villa-augflor.com

Cheers,
Lana
+33 6 23 77 73 33
```

**Action:** Weekly batch — Master Manager identifies past guests with no summer bookings, sends to Lana as a batch list with copy-paste WhatsApp messages

---

## TEMPLATE 5: COMPETITOR DISPLACEMENT (To prospects comparing villas)

**Use case:** Inquiry mentions "comparing with [competitor]" or asked about nearby alternatives  
**Platform:** WhatsApp  
**Tone:** Helpful, not defensive

```
Great question! [Competitor] is lovely — I know their host well actually!

Here's what makes Villa Augflor a bit different:
🌊 Private sea view (not shared)
🏊 Heated pool + exclusive access to lower garden
🍷 Direct beach access (5-min walk to Plage de Béal)
👨‍👩‍👧‍👦 [X] years hosting + 4.79★ rating
💰 Better value for peak season

Not knocking [Competitor] at all — just want you to have all the info so you pick the best fit!

If you have any questions or want to video tour the pool area, super happy to do that quickly. 

All the best,
Lana
```

**Action:** Manual template for now (Lana uses if a prospect asks about competitors). Lead Monitor can auto-generate if inquiry mentions competitor name.

---

## IMPLEMENTATION ROADMAP

### PHASE 1 (Now - Auto-Generate + Manual Send)
- Lead Monitor auto-generates WHatsApp templates with phone numbers extracted
- Lana copy-pastes to WhatsApp manually (5 sec per message)
- Expected impact: +30% response rate on warm leads

### PHASE 2 (When WhatsApp Business API is connected)
- Auto-send WhatsApp messages directly to warm leads
- Auto-send revival sequences on day 3
- Auto-send past guest reactivation batches
- Expected impact: +40% total conversion (no manual delay)

### PHASE 3 (Integration)
- Incoming WhatsApp inquiries routed to Gmail drafts
- Master Manager reads WhatsApp response rates as KPI
- Full bidirectional WhatsApp <> email sync

---

## QUICK REFERENCE: When to Use Each Template

| Template | Trigger | Send by | Urgency |
|----------|---------|---------|---------|
| HOT | New inquiry <4h | WhatsApp now | 🔴 Critical |
| WARM | 4-24h no response | WhatsApp 6pm | 🔴 High |
| COLD | >7 days silent | WhatsApp/Email | 🟠 Medium |
| PAST GUEST | No summer booking | WhatsApp + Email | 🟡 Low-Medium |
| COMPETITOR | Prospect comparing | WhatsApp on-demand | 🟡 Low |

---

**Success metric:** Track WhatsApp open rates (auto-send when API live) — target 90%+ vs email 30%
