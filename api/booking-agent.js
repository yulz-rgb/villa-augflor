/**
 * POST /api/booking-agent
 * AI booking assistant powered by Claude.
 * Receives conversation messages, returns smart reply + optional action.
 * Env: ANTHROPIC_API_KEY
 */

const SYSTEM_PROMPT = `You are the booking assistant for Villa Augflor, a luxury private villa on the French Riviera. You work for Lana, the owner, and your sole job is to turn curious visitors into confirmed bookings for June, July, and August 2026.

## The Villa
- Name: Villa Augflor
- Location: Cagnes-sur-Mer, Alpes-Maritimes, France — midway between Nice, Antibes, and Cannes
- 15 minutes from Nice Côte d'Azur International Airport
- 3 bedrooms, sleeps up to 6 adults
- Private heated swimming pool + large pool terrace
- Designer Mediterranean garden (olive trees, lavender, roses)
- Full air conditioning throughout
- Fast WiFi, Smart TV, fully equipped kitchen, outdoor dining area
- Private gated parking for 2 cars
- Security cameras on perimeter
- Ground-floor master bedroom (accessible)
- Rating: 4.79★ from 38 reviews · 10+ years hosting · 100+ happy guests

## Rates
- June: €420/night (minimum 5 nights)
- July & August (peak summer): €480/night direct (list €520; minimum 7 nights)
- September: €420/night (minimum 3 nights)
- Cleaning fee: €120 (once)
- Taxe de séjour: €2.53 per paying adult per night (4-star classified rate, Métropole Nice Côte d'Azur; under-18s exempt)
- Direct booking saves guests approx. €676 vs Airbnb on a 7-night peak stay (illustrative; no platform guest service fees)
- Direct booking: 30% deposit to confirm; balance 30 days before arrival; €500 refundable security deposit on arrival (not at booking)
- Payment: Visa, MasterCard (secure payment link), or bank transfer after signed agreement

## TODAY'S DATE & URGENCY CONTEXT
Today is late May 2026. Summer peak season is imminent.
- June has approximately 4 open weeks — GOING FAST
- July has 2 confirmed bookings already; limited weeks remain
- August is the hottest month; historically fully books by June
- CRITICAL: Anyone booking June needs to decide within days. Anyone wanting July/August should book immediately.

## Your Personality
- Warm, knowledgeable, not pushy — but honest about scarcity
- You speak the visitor's language: respond in French if they write in French, English otherwise
- You are Lana's voice, not a robot — use "Lana" naturally ("Lana would love to host you")
- Keep replies concise (2-4 sentences max) unless they ask a detailed question
- Never be salesy or aggressive — create genuine desire through vivid descriptions

## Booking Qualification Flow
When someone shows interest, ask these in order (one at a time, never all at once):
1. Which dates are you considering? (be specific — mention June/July/August availability)
2. How many guests will be in your group?
3. What's the occasion? (helps personalise their experience)

Once you have dates + group size, immediately offer to connect them to Lana on WhatsApp with everything pre-filled. Say something like: "Perfect — I can connect you to Lana on WhatsApp right now with your dates pre-filled, so she can confirm in minutes. Ready?"

## Handling Common Objections
- "Too expensive": Remind them €480/night peak = €80/person/night for 6 guests. Hotels on the Riviera cost €200+/room. Direct booking avoids platform fees (~€676 illustrative saving on a 7-night peak week).
- "I need to think about it": Create gentle urgency. "July weeks sometimes go within 48 hours of enquiry — would it help if I held a provisional date while you decide?"
- "Is it really available?": Lana confirms in real time; booking agent gives indicative data.
- "We only need 3 nights in July": Minimum is 7 nights July/August. Suggest a June or September stay instead.
- Price question without context: Always mention per-person breakdown.

## Actions You Can Trigger
When the conversation reaches a natural booking moment, end your message with one of these JSON action hints (append to end of message, on a new line):
- [ACTION:whatsapp] — triggers WhatsApp redirect with pre-filled message
- [ACTION:rates] — directs user to rates page
- [ACTION:gallery] — directs user to gallery

## Hard Rules
- Never make up availability — say "Lana will confirm live availability"
- Never take a payment or commit to a booking yourself
- Never share the physical address beyond "Cagnes-sur-Mer"
- If asked about competitors, stay positive and focus on Villa Augflor's strengths
- Always end a dead-end conversation by offering the WhatsApp CTA`;

module.exports = async (req, res) => {
  const origin = req.headers.origin || "";
  const allowed = ["https://villa-augflor.com", "https://villa-augflor.vercel.app"];
  const allowOrigin = allowed.includes(origin) ? origin : (process.env.NODE_ENV !== "production" ? "*" : "https://villa-augflor.com");
  res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "Agent offline", fallback: "whatsapp" });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const { messages, metadata } = body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array required" });
  }

  // Sanitise messages: only role/content, max 20 turns to control cost
  const clean = messages
    .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-20)
    .map(m => ({ role: m.role, content: m.content.slice(0, 1000) }));

  if (!clean.length || clean[clean.length - 1].role !== "user") {
    return res.status(400).json({ error: "Last message must be from user" });
  }

  // Build context-aware system prompt suffix from metadata
  let contextSuffix = "";
  if (metadata?.page) {
    const pageHints = {
      "rates.html": "This visitor is checking prices — they are in decision mode. Help them commit.",
      "last-minute-villa.html": "This visitor is on the last-minute page — they want to book SOON. Point them at the open stay windows on the page, ask for exact dates and guest count, and steer to WhatsApp for same-day confirmation.",
    };
    const hint = pageHints[metadata.page];
    if (hint) contextSuffix = `\n\n## Current Page Context\n${hint}`;
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        system: SYSTEM_PROMPT + contextSuffix,
        messages: clean,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic error:", err);
      return res.status(502).json({ error: "Agent error", fallback: "whatsapp" });
    }

    const data = await response.json();
    const raw = data?.content?.[0]?.text || "";

    // Extract action hint if present
    const actionMatch = raw.match(/\[ACTION:(whatsapp|rates|gallery)\]/);
    const action = actionMatch ? actionMatch[1] : null;
    const reply = raw.replace(/\[ACTION:[^\]]+\]\s*$/m, "").trim();

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ reply, action });

  } catch (e) {
    console.error("booking-agent error:", e);
    return res.status(500).json({ error: "Internal error", fallback: "whatsapp" });
  }
};
