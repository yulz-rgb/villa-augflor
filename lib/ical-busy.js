/**
 * Minimal iCal (.ics) parser: extracts all-day busy DATE ranges from VEVENT blocks.
 * No npm dependency — works on Vercel Fluid / Node serverless.
 *
 * Handles:
 * - DTSTART;VALUE=DATE:20260711 / DTEND;VALUE=DATE:20260718 (end exclusive per RFC)
 * - STATUS:CANCELLED → skipped
 * - Line folding (newline + space continuation)
 */

function unfoldIcs(raw) {
  return String(raw)
    .replace(/\r\n/g, "\n")
    .replace(/\n[ \t]/g, "");
}

/** @returns {string[]} YYYY-MM-DD */
function enumerateExclusiveEnd(startYmd, endYmdExclusive) {
  const out = [];
  const cur = new Date(startYmd + "T12:00:00.000Z");
  const end = new Date(endYmdExclusive + "T12:00:00.000Z");
  while (cur < end) {
    out.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}

/** ical date YYYYMMDD → YYYY-MM-DD */
function ymdFromIcal(d) {
  if (!d || d.length !== 8) return null;
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
}

/**
 * @param {string} icsText
 * @returns {Set<string>} busy nights as YYYY-MM-DD (UTC date keys)
 */
function busyDatesFromIcs(icsText) {
  const busy = new Set();
  const text = unfoldIcs(icsText);
  const events = text.split(/BEGIN:VEVENT/gi).slice(1);

  for (const chunk of events) {
    const block = chunk.split(/END:VEVENT/gi)[0] || chunk;
    if (/STATUS:\s*CANCELLED/i.test(block)) continue;

    // All-day: DTSTART;VALUE=DATE:20260711
    // Or datetime: DTSTART:20260711T150000Z (use date part as night anchor)
    let m = block.match(/DTSTART[^:]*:([0-9]{8})(?:T[0-9]{6}Z?)?/i);
    if (!m) continue;
    const startRaw = m[1];

    let endRaw = null;
    const mEnd = block.match(/DTEND[^:]*:([0-9]{8})(?:T[0-9]{6}Z?)?/i);
    if (mEnd) endRaw = mEnd[1];

    const startYmd = ymdFromIcal(startRaw);
    if (!startYmd) continue;

    // If no DTEND, treat as single night
    let endExclusiveYmd;
    if (endRaw) {
      endExclusiveYmd = ymdFromIcal(endRaw);
    } else {
      const d = new Date(startYmd + "T12:00:00.000Z");
      d.setUTCDate(d.getUTCDate() + 1);
      endExclusiveYmd = d.toISOString().slice(0, 10);
    }
    if (!endExclusiveYmd) continue;

    for (const day of enumerateExclusiveEnd(startYmd, endExclusiveYmd)) busy.add(day);
  }
  return busy;
}

/**
 * @param {string[]} icsBodies
 * @returns {string[]} sorted unique busy YYYY-MM-DD
 */
function mergeBusyFromIcsBodies(icsBodies) {
  const all = new Set();
  for (const body of icsBodies) {
    if (!body || typeof body !== "string") continue;
    for (const d of busyDatesFromIcs(body)) all.add(d);
  }
  return Array.from(all).sort();
}

module.exports = { busyDatesFromIcs, mergeBusyFromIcsBodies, unfoldIcs };
