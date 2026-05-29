/**
 * GET /api/calendar
 * Fetches secret iCal URLs from env, merges with data/calendar-busy.json, returns JSON.
 * Never expose iCal URLs to the browser — they stay server-side only.
 */
const fs = require("fs");
const path = require("path");
const { mergeBusyFromIcsBodies } = require("../lib/ical-busy");

function loadStaticBusyDates() {
  try {
    const file = path.join(__dirname, "..", "data", "calendar-busy.json");
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    return Array.isArray(data.busyDates) ? data.busyDates : [];
  } catch {
    return [];
  }
}

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
  const staticBusy = loadStaticBusyDates();

  if (!airbnb && !booking) {
    return res.status(200).json({
      ok: true,
      source: staticBusy.length ? "static" : "none",
      busyDates: staticBusy,
      updated: staticBusy.length ? "2026-05-29" : undefined,
      message: staticBusy.length
        ? "Manual calendar sync — iCal env optional for automatic updates."
        : "Set AIRBNB_ICAL_URL and/or BOOKING_ICAL_URL in Vercel env to enable live calendar.",
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
    if (staticBusy.length) {
      return res.status(200).json({
        ok: true,
        source: "static",
        busyDates: staticBusy,
        errors,
      });
    }
    return res.status(502).json({
      ok: false,
      source: "error",
      busyDates: [],
      errors,
    });
  }

  const icalBusy = mergeBusyFromIcsBodies(bodies);
  const busyDates = [...new Set([...staticBusy, ...icalBusy])].sort();
  return res.status(200).json({
    ok: true,
    source: "merged",
    busyDates,
    feeds: { airbnb: Boolean(airbnb), booking: Boolean(booking) },
    errors: errors.length ? errors : undefined,
  });
};
