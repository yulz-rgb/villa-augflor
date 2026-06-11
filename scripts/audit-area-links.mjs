#!/usr/bin/env node
/**
 * Audit area guide maps queries and website URLs.
 * - Geocodes each maps string via Nominatim; flags if too far from villa vs stated km/drive.
 * - HEAD-checks website URLs (skips wa.me).
 * - Scans area.html static Google Maps links.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import vm from "vm";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const VILLA = { lat: 43.6644, lon: 7.1483 };
const NOMINATIM = "https://nominatim.openstreetmap.org/search";

/** Max km from villa allowed: stated km * factor + buffer (geocoding fuzz). */
function maxAllowedKm(place) {
  const km = place.km ?? place.drive * 1.2;
  if (km >= 80) return km * 1.35 + 25;
  if (km >= 40) return km * 1.4 + 20;
  return km * 1.6 + 15;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function loadPlaces() {
  const src = fs.readFileSync(path.join(ROOT, "scripts/area-guide.js"), "utf8");
  const m = src.match(/var PLACES = (\[[\s\S]*?\n  \]);/);
  if (!m) throw new Error("Could not parse PLACES array");
  const sandbox = {};
  vm.runInNewContext(`PLACES = ${m[1]}`, sandbox);
  return sandbox.PLACES;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const geoCache = new Map();

async function geocode(query) {
  if (geoCache.has(query)) return geoCache.get(query);
  await sleep(1100);
  const url =
    `${NOMINATIM}?` +
    new URLSearchParams({
      q: query,
      format: "json",
      limit: "1",
    });
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; VillaAugflor-LinkAudit/1.0)" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  const data = await res.json();
  const hit = data[0];
  const out = hit
    ? {
        lat: parseFloat(hit.lat),
        lon: parseFloat(hit.lon),
        display: hit.display_name,
      }
    : null;
  geoCache.set(query, out);
  return out;
}

async function checkWebsite(url) {
  if (!url || url.startsWith("https://wa.me")) return { skip: true };
  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(12000),
      headers: { "User-Agent": "VillaAugflor-LinkAudit/1.0" },
    });
    if (res.status >= 400) {
      const getRes = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: AbortSignal.timeout(12000),
        headers: { "User-Agent": "VillaAugflor-LinkAudit/1.0" },
      });
      return { status: getRes.status, finalUrl: getRes.url };
    }
    return { status: res.status, finalUrl: res.url };
  } catch (e) {
    return { error: e.message };
  }
}

/** Named venues that exist in multiple regions — maps must include local anchor. */
const AMBIGUOUS = [
  { pattern: /pesqui[eè]re/i, requiredInMaps: /cagnes|promenade|06800/i, wrongIfMaps: /saint.?tropez|tropez/i },
  { pattern: /colombe d'or/i, requiredInMaps: /saint-paul|paul-de-vence/i },
];

function checkAmbiguous(place) {
  const issues = [];
  const text = `${place.name} ${place.maps} ${place.blurb || ""}`;
  for (const rule of AMBIGUOUS) {
    if (!rule.pattern.test(text)) continue;
    if (rule.wrongIfMaps && rule.wrongIfMaps.test(place.maps)) {
      issues.push(`maps query may resolve to wrong famous venue`);
    }
    if (rule.requiredInMaps && !rule.requiredInMaps.test(place.maps) && place.drive <= 30) {
      issues.push(`ambiguous name — maps query lacks local place anchor`);
    }
  }
  if (place.cat === "food" && place.drive <= 15) {
    const hasLocal =
      /cagnes|nice|antibes|juan|monaco|cannes|menton|eze|èze|grasse|biot|vence|mougins|saint-paul|cap.?ferrat|villeneuve|saint-laurent|06800|06000|06160|06400/i.test(
        place.maps
      );
    const isRestaurant =
      /restaurant|bistrot|brasserie|pâtisserie|patisserie|gelato|pizza|socca/i.test(place.maps) ||
      /restaurant|bistrot|brasserie|pâtisserie|patisserie|gelato|pizza|socca/i.test(place.name);
    if (isRestaurant && !hasLocal) {
      issues.push(`food venue within 15 min drive but maps query has no city/region`);
    }
  }
  return issues;
}

function extractAreaHtmlMapLinks() {
  const html = fs.readFileSync(path.join(ROOT, "area.html"), "utf8");
  const links = [];
  const re = /href="(https:\/\/www\.google\.com\/maps[^"]+)"/g;
  let match;
  while ((match = re.exec(html))) {
    links.push(match[1].replace(/&amp;/g, "&"));
  }
  return [...new Set(links)];
}

async function main() {
  const places = loadPlaces();
  const issues = [];
  const websiteFails = [];
  const geoFails = [];
  const ambiguous = [];

  console.log(`Auditing ${places.length} area guide places…\n`);

  for (const place of places) {
    const amb = checkAmbiguous(place);
    if (amb.length) ambiguous.push({ id: place.id, name: place.name, maps: place.maps, amb });

    try {
      const geo = await geocode(place.maps);
      if (!geo) {
        geoFails.push({ id: place.id, name: place.name, maps: place.maps, reason: "no geocode result" });
      } else {
        const dist = haversineKm(VILLA.lat, VILLA.lon, geo.lat, geo.lon);
        const allowed = maxAllowedKm(place);
        if (dist > allowed) {
          geoFails.push({
            id: place.id,
            name: place.name,
            maps: place.maps,
            reason: `geocoded ${dist.toFixed(1)} km away (max ~${allowed.toFixed(0)} km for km=${place.km} drive=${place.drive})`,
            display: geo.display,
          });
        }
        if (/saint.?tropez|sainte-maxime|ramatuelle/i.test(geo.display) && place.id !== "saint-tropez" && (place.km ?? 99) < 50) {
          geoFails.push({
            id: place.id,
            name: place.name,
            maps: place.maps,
            reason: `resolves near Saint-Tropez area: ${geo.display}`,
            display: geo.display,
          });
        }
      }
    } catch (e) {
      geoFails.push({ id: place.id, name: place.name, maps: place.maps, reason: e.message });
    }

    if (place.website) {
      const w = await checkWebsite(place.website);
      if (w.error) websiteFails.push({ id: place.id, url: place.website, reason: w.error });
      else if (!w.skip && w.status >= 400)
        websiteFails.push({ id: place.id, url: place.website, reason: `HTTP ${w.status}` });
      await sleep(200);
    }
  }

  console.log("==> Static area.html Google Maps links");
  const staticLinks = extractAreaHtmlMapLinks();
  for (const link of staticLinks) {
    const destMatch = link.match(/destination=([^&]+)/);
    const queryMatch = link.match(/query=([^&]+)/);
    const dest = destMatch ? decodeURIComponent(destMatch[1].replace(/\+/g, " ")) : null;
    const query = queryMatch ? decodeURIComponent(queryMatch[1].replace(/\+/g, " ")) : null;
    const label = dest || query || link;
    try {
      const geo = await geocode(label);
      if (!geo) {
        issues.push({ type: "area.html", label, reason: "no geocode" });
      } else {
        const dist = haversineKm(VILLA.lat, VILLA.lon, geo.lat, geo.lon);
        if (dist > 120) issues.push({ type: "area.html", label, reason: `${dist.toFixed(0)} km from villa`, display: geo.display });
      }
    } catch (e) {
      issues.push({ type: "area.html", label, reason: e.message });
    }
  }

  console.log("\n========== SUMMARY ==========\n");

  if (ambiguous.length) {
    console.log(`AMBIGUOUS / LOCAL ANCHOR (${ambiguous.length}):`);
    for (const a of ambiguous) console.log(`  [${a.id}] ${a.name}: ${a.amb.join("; ")}`);
    console.log();
  }

  if (geoFails.length) {
    console.log(`GEO / DISTANCE MISMATCH (${geoFails.length}):`);
    for (const g of geoFails) {
      console.log(`  [${g.id}] ${g.name}`);
      console.log(`    maps: ${g.maps}`);
      console.log(`    → ${g.reason}`);
      if (g.display) console.log(`    hit: ${g.display}`);
    }
    console.log();
  } else {
    console.log("GEO: all maps queries within expected distance.\n");
  }

  if (websiteFails.length) {
    console.log(`WEBSITE FAILURES (${websiteFails.length}):`);
    for (const w of websiteFails) console.log(`  [${w.id}] ${w.url} — ${w.reason}`);
    console.log();
  } else {
    console.log("WEBSITES: all checked URLs OK.\n");
  }

  if (issues.length) {
    console.log(`AREA.HTML MAP LINKS (${issues.length} issues):`);
    for (const i of issues) console.log(`  ${i.label}: ${i.reason}`);
    console.log();
  } else {
    console.log("AREA.HTML: static map links OK.\n");
  }

  const exitCode = geoFails.length + websiteFails.length + issues.length + ambiguous.length > 0 ? 1 : 0;
  if (exitCode) {
    console.log("Audit finished with issues — review above.");
  } else {
    console.log("Audit passed — no issues found.");
  }
  process.exit(exitCode);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
