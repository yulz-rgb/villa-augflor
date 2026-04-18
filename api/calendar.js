/**
 * GET /api/calendar
 * Fetches secret iCal URLs from env, merges busy nights, returns JSON for the website.
 * Never expose iCal URLs to the browser — they stay server-side only.
 */
const { mergeBusyFromIcsBodies } = require("../lib/ical-busy");

async function fetchText(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "VillaAugflor-CalendarSync/1.0" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const airbnb = process.env.AIRBNB_ICAL_URL;
  const booking = process.env.BOOKING_ICAL_URL;

  if (!airbnb && !booking) {
    return res.status(200).json({
      ok: true,
      source: "none",
      busyDates: [],
      message: "Set AIRBNB_ICAL_URL and/or BOOKING_ICAL_URL in Vercel env to enable live calendar.",
    });
  }

  const bodies = [];
  const errors = [];

  try {
    if (airbnb) bodies.push(await fetchText(airbnb));
  } catch (e) {
    errors.push({ feed: "airbnb", error: String(e && e.message ? e.message : e) });
  }
  try {
    if (booking) bodies.push(await fetchText(booking));
  } catch (e) {
    errors.push({ feed: "booking", error: String(e && e.message ? e.message : e) });
  }

  if (!bodies.length) {
    return res.status(502).json({
      ok: false,
      source: "error",
      busyDates: [],
      errors,
    });
  }

  const busyDates = mergeBusyFromIcsBodies(bodies);
  return res.status(200).json({
    ok: true,
    source: "ical",
    busyDates,
    feeds: { airbnb: Boolean(airbnb), booking: Boolean(booking) },
    errors: errors.length ? errors : undefined,
  });
};
