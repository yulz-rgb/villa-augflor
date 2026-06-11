#!/usr/bin/env node
/**
 * availability-sync.js — make live availability indexable.
 *
 * Reads data/calendar-busy.json, computes open stay windows from today through
 * SEASON_END, then rewrites generated blocks between markers in:
 *   - index.html             <!-- OPEN-WEEKS:START/END -->  + <!-- OFFERS-LD:START/END -->
 *   - rates.html             <!-- OPEN-WEEKS:START/END -->
 *   - last-minute-villa.html <!-- OPEN-WEEKS:START/END -->  + <!-- OFFERS-LD:START/END -->
 *   - llms.txt               <!-- OPEN-WEEKS:START/END -->
 * and touches <lastmod> in sitemap.xml for those pages.
 *
 * Usage: node scripts/availability-sync.js [--today=YYYY-MM-DD] [--check]
 *   --check  exit 2 (no writes) if calendar data is stale (>10 days) or
 *            generated blocks would change — used by the weekly watchdog.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SEASON_END = "2026-09-30"; // last summer-season night we advertise
const STALE_DAYS = 10;
const SHOULDER = 420; // June & September €/night (keep in sync with scripts/pricing.js)
const PEAK = 480; // July & August €/night
const MIN_NIGHTS_SHOWN = 4;
const VILLA_ID = "https://villa-augflor.com/#villa";

const args = process.argv.slice(2);
const todayArg = (args.find((a) => a.startsWith("--today=")) || "").split("=")[1];
const CHECK_ONLY = args.includes("--check");

function isoToday() {
  if (todayArg) return todayArg;
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(iso, n) {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function fmt(iso, opts) {
  return new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    ...(opts || {}),
  });
}

function nightlyRate(iso) {
  const m = Number(iso.slice(5, 7));
  return m === 7 || m === 8 ? PEAK : SHOULDER;
}

/** Consecutive open-night windows in [from, to], given busy nights. */
function computeWindows(busySet, from, to) {
  const windows = [];
  let start = null;
  let d = from;
  while (d <= to) {
    const open = !busySet.has(d);
    if (open && !start) start = d;
    if (!open && start) {
      windows.push({ firstNight: start, lastNight: addDays(d, -1) });
      start = null;
    }
    d = addDays(d, 1);
  }
  if (start) windows.push({ firstNight: start, lastNight: to, openEnded: true });
  return windows.map((w) => {
    const nights =
      Math.round(
        (Date.parse(w.lastNight + "T12:00:00Z") - Date.parse(w.firstNight + "T12:00:00Z")) / 86400000
      ) + 1;
    const checkout = addDays(w.lastNight, 1);
    const rates = new Set();
    let d2 = w.firstNight;
    while (d2 <= w.lastNight) {
      rates.add(nightlyRate(d2));
      d2 = addDays(d2, 1);
    }
    const rate = rates.size === 1 ? `€${[...rates][0]}/night` : `from €${Math.min(...rates)}/night`;
    return { ...w, nights, checkout, rate, minRate: Math.min(...rates) };
  });
}

function waLink(w) {
  const txt = `Hi Lana, we'd like to book Villa Augflor. Dates: ${fmt(w.firstNight)} to ${fmt(
    w.checkout
  )} (or part of this window). Guests: [number].`;
  return `https://wa.me/33623777333?text=${encodeURIComponent(txt)}`;
}

function windowLabel(w) {
  const arrive = fmt(w.firstNight);
  const depart = w.openEnded ? `${fmt(w.checkout)} or later` : fmt(w.checkout);
  return `${arrive} → ${depart}`;
}

function htmlBlock(windows, updatedHuman) {
  if (!windows.length) {
    return [
      `<div class="open-weeks" data-open-weeks-static>`,
      `  <p style="margin:0;font-size:15px;">Summer ${new Date().getFullYear()} is fully booked — <a href="https://wa.me/33623777333" rel="noopener">message Lana on WhatsApp</a> for autumn dates.</p>`,
      `</div>`,
    ].join("\n");
  }
  const items = windows
    .map((w) => {
      const nightsNote = w.openEnded ? `${w.nights}+ nights open` : `up to ${w.nights} nights`;
      const fits = w.nights >= 7 ? "" : ` <em style="font-style:normal;opacity:.75">(short-stay window — ask Lana)</em>`;
      return [
        `    <li style="margin:0 0 .55rem;line-height:1.45;">`,
        `      <strong>${windowLabel(w)}</strong> · ${nightsNote} · ${w.rate}${fits}`,
        `      — <a href="${waLink(w)}" rel="noopener" style="color:var(--accent,#3d7a8a);text-decoration:underline;white-space:nowrap;">enquire about these dates</a>`,
        `    </li>`,
      ].join("\n");
    })
    .join("\n");
  return [
    `<div class="open-weeks" data-open-weeks-static style="max-width:680px;margin:0 auto 2rem;text-align:left;background:rgba(255,255,255,.55);border:1px solid var(--sand,#e4dccf);border-radius:4px;padding:1.25rem 1.5rem;">`,
    `  <p style="margin:0 0 .75rem;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted,#7a7269);">Open stay windows · updated ${updatedHuman}</p>`,
    `  <ul style="list-style:none;margin:0;padding:0;font-size:15.5px;">`,
    items,
    `  </ul>`,
    `  <p style="margin:.75rem 0 0;font-size:13.5px;color:var(--muted,#7a7269);">7-night minimum in high season — shorter gaps occasionally accepted, always worth asking. Lana confirms exact dates on enquiry.</p>`,
    `</div>`,
  ].join("\n");
}

function llmsBlock(windows, updated) {
  if (!windows.length) return `\n## Current availability (updated ${updated})\n\nSummer fully booked — autumn dates open.\n`;
  const lines = windows.map((w) => {
    const span = w.openEnded
      ? `${w.firstNight} onward (open into autumn)`
      : `${w.firstNight} to ${w.checkout} (checkout)`;
    return `- **${windowLabel(w)}** — ${span}, ${w.nights}${w.openEnded ? "+" : ""} nights, ${w.rate} direct`;
  });
  return [
    ``,
    `## Current availability (updated ${updated})`,
    ``,
    `Open stay windows for summer 2026 — first night to checkout day:`,
    ``,
    ...lines,
    ``,
    `7-night minimum in July/August (shorter on request). Availability changes — confirm via WhatsApp +33 6 23 77 73 33.`,
    ``,
  ].join("\n");
}

function offersLd(windows, pageUrl) {
  const offers = windows.map((w) => ({
    "@type": "Offer",
    name: `Villa Augflor open dates ${windowLabel(w).replace(/→/g, "to")} (${w.nights}${w.openEnded ? "+" : ""} nights)`,
    price: String(w.minRate),
    priceCurrency: "EUR",
    availability: "https://schema.org/InStock",
    availabilityStarts: w.firstNight,
    availabilityEnds: w.checkout,
    url: pageUrl,
  }));
  const ld = {
    "@context": "https://schema.org",
    "@type": ["VacationRental", "LodgingBusiness"],
    "@id": VILLA_ID,
    name: "Villa Augflor",
    makesOffer: offers,
  };
  return `<script type="application/ld+json">\n${JSON.stringify(ld, null, 2)}\n</script>`;
}

function replaceBetween(content, startMark, endMark, replacement, file) {
  const re = new RegExp(`(${startMark})[\\s\\S]*?(${endMark})`);
  if (!re.test(content)) throw new Error(`Markers ${startMark}…${endMark} not found in ${file}`);
  return content.replace(re, `$1\n${replacement}\n$2`);
}

function touchSitemap(content, loc, today) {
  const re = new RegExp(`(<loc>${loc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</loc>\\s*<lastmod>)[^<]+(</lastmod>)`);
  return re.test(content) ? content.replace(re, `$1${today}$2`) : content;
}

function main() {
  const today = isoToday();
  const calPath = path.join(ROOT, "data", "calendar-busy.json");
  const cal = JSON.parse(fs.readFileSync(calPath, "utf8"));
  const busy = new Set(cal.busyDates || []);

  const staleDays = Math.floor((Date.parse(today) - Date.parse(cal.updated)) / 86400000);
  if (staleDays > STALE_DAYS) {
    console.error(
      `WARNING: data/calendar-busy.json updated ${cal.updated} (${staleDays} days ago) — re-sync from Airbnb before trusting open windows.`
    );
    if (CHECK_ONLY) process.exit(2);
  }

  const from = today > SEASON_END ? null : today;
  const windows = from
    ? computeWindows(busy, from, SEASON_END).filter((w) => w.nights >= MIN_NIGHTS_SHOWN)
    : [];

  const updatedHuman = fmt(today, { month: "long", year: "numeric" });
  const block = htmlBlock(windows, updatedHuman);
  const llms = llmsBlock(windows, today);

  const targets = [
    { file: "index.html", blocks: [["<!-- OPEN-WEEKS:START -->", "<!-- OPEN-WEEKS:END -->", block], ["<!-- OFFERS-LD:START -->", "<!-- OFFERS-LD:END -->", offersLd(windows, "https://villa-augflor.com/")]], loc: "https://villa-augflor.com/" },
    { file: "rates.html", blocks: [["<!-- OPEN-WEEKS:START -->", "<!-- OPEN-WEEKS:END -->", block]], loc: "https://villa-augflor.com/rates.html" },
    { file: "last-minute-villa.html", blocks: [["<!-- OPEN-WEEKS:START -->", "<!-- OPEN-WEEKS:END -->", block], ["<!-- OFFERS-LD:START -->", "<!-- OFFERS-LD:END -->", offersLd(windows, "https://villa-augflor.com/last-minute-villa.html")]], loc: "https://villa-augflor.com/last-minute-villa.html" },
    { file: "llms.txt", blocks: [["<!-- OPEN-WEEKS:START -->", "<!-- OPEN-WEEKS:END -->", llms]] },
  ];

  let changed = [];
  for (const t of targets) {
    const p = path.join(ROOT, t.file);
    if (!fs.existsSync(p)) {
      console.error(`SKIP: ${t.file} not found`);
      continue;
    }
    const before = fs.readFileSync(p, "utf8");
    let after = before;
    for (const [s, e, r] of t.blocks) after = replaceBetween(after, s, e, r, t.file);
    if (after !== before) {
      changed.push(t.file);
      if (!CHECK_ONLY) fs.writeFileSync(p, after);
    }
  }

  // Touch sitemap lastmod for pages whose content changed
  const smPath = path.join(ROOT, "sitemap.xml");
  let sm = fs.readFileSync(smPath, "utf8");
  const smBefore = sm;
  for (const t of targets) {
    if (t.loc && changed.includes(t.file)) sm = touchSitemap(sm, t.loc, today);
  }
  if (sm !== smBefore) {
    changed.push("sitemap.xml");
    if (!CHECK_ONLY) fs.writeFileSync(smPath, sm);
  }

  const summary = windows.length
    ? windows.map((w) => `  ${windowLabel(w)} · ${w.nights}${w.openEnded ? "+" : ""} nights · ${w.rate}`).join("\n")
    : "  (none — season fully booked)";
  console.log(`Open windows from ${today} to ${SEASON_END}:\n${summary}`);
  console.log(changed.length ? `${CHECK_ONLY ? "Would update" : "Updated"}: ${changed.join(", ")}` : "All generated blocks already current.");
  if (CHECK_ONLY && changed.length) process.exit(2);
}

main();
