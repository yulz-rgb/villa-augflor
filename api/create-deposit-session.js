/**
 * POST /api/create-deposit-session
 * Body JSON: { plan: "peak-week" | "shoulder-week", email, name }
 * Creates a Stripe Checkout Session for 30% deposit (amount fixed server-side — never trust client €).
 */
const Stripe = require("stripe");

const PLANS = {
  "peak-week": {
    label: "Villa Augflor — 30% deposit (peak week, Jul/Aug)",
    /** 7 × €520 = €3640 → 30% = €1092.00 */
    amountCents: 109200,
  },
  "shoulder-week": {
    label: "Villa Augflor — 30% deposit (shoulder week, Jun/Sep)",
    /** 7 × €480 = €3360 → 30% = €1008.00 */
    amountCents: 100800,
  },
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

module.exports = async (req, res) => {
  const cors = corsHeaders();
  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST,OPTIONS");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  const siteUrl = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  if (!secret) {
    return res.status(500).json({ error: "Missing STRIPE_SECRET_KEY on server" });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  } catch {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  const plan = body.plan;
  const email = String(body.email || "").trim();
  const name = String(body.name || "").trim();

  if (!PLANS[plan]) {
    return res.status(400).json({ error: "Unknown plan", allowed: Object.keys(PLANS) });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Valid email required" });
  }

  const stripe = new Stripe(secret);
  const p = PLANS[plan];

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      client_reference_id: `${plan}:${email}`,
      metadata: {
        plan,
        guest_name: name.slice(0, 120),
        product: "villa_augflor_deposit_30pct",
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: p.amountCents,
            product_data: {
              name: p.label,
              description:
                "30% booking deposit for Villa Augflor (Cagnes-sur-Mer). Balance due 30 days before arrival per your booking agreement.",
            },
          },
        },
      ],
      success_url: `${siteUrl}/pay-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/pay.html?cancelled=1`,
    });

    return res.status(200).json({ url: session.url });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Stripe error" });
  }
};
