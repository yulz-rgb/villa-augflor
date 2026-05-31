#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");
const PROMPT_PATH = path.join(ROOT, "automation/villa-marketing-agent/AGENT-PROMPT.md");
const OUTPUT_DIR = path.join(ROOT, "automation/villa-marketing-agent/output");
const CALENDAR_PATH = path.join(ROOT, "data/calendar-busy.json");
const INDEX_PATH = path.join(ROOT, "index.html");
const BRAND = {
  name: "Villa Augflor",
  instagram: "@villa_augflor_france",
  tone: "elegant, honest, direct booking trust",
  trustAnchors: [
    "Written quote before payment",
    "4.79-star guest rating",
    "38 reviews",
    "Gites de France 4-star classification"
  ]
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

function usage() {
  return [
    "Usage: node scripts/marketing-agent/index.js --task weekly",
    "",
    "Generates a dry-run weekly Villa Augflor marketing report and content pack.",
    "Set MARKETING_AGENT_PUBLISH=true only when publishing integrations are intentionally enabled."
  ].join("\n");
}

function parseArgs(argv) {
  const args = { task: null, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else if (arg === "--task") {
      args.task = argv[i + 1];
      i += 1;
    } else if (arg.startsWith("--task=")) {
      args.task = arg.slice("--task=".length);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function readJson(filePath) {
  return JSON.parse(readText(filePath));
}

function toDate(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function toIso(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function eachDate(startIso, endIso) {
  const dates = [];
  for (let d = toDate(startIso); d <= toDate(endIso); d = addDays(d, 1)) {
    dates.push(toIso(d));
  }
  return dates;
}

function groupContiguous(dates) {
  if (dates.length === 0) {
    return [];
  }

  const sorted = [...dates].sort();
  const ranges = [];
  let start = sorted[0];
  let previous = sorted[0];

  for (let i = 1; i < sorted.length; i += 1) {
    const current = sorted[i];
    const expected = toIso(addDays(toDate(previous), 1));
    if (current !== expected) {
      ranges.push({ start, end: previous });
      start = current;
    }
    previous = current;
  }

  ranges.push({ start, end: previous });
  return ranges;
}

function monthName(iso) {
  const date = toDate(iso);
  return MONTHS[date.getUTCMonth()];
}

function dayNumber(iso) {
  return toDate(iso).getUTCDate();
}

function daysInMonth(iso) {
  const date = toDate(iso);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
}

function formatRange(range) {
  const startMonth = monthName(range.start);
  const endMonth = monthName(range.end);
  const startDay = dayNumber(range.start);
  const endDay = dayNumber(range.end);

  if (range.start === range.end) {
    return `${startMonth} ${startDay}`;
  }

  if (startMonth === endMonth) {
    const fullMonth = startDay === 1 && endDay === daysInMonth(range.start);
    if (fullMonth) {
      return `all of ${startMonth}`;
    }
    return `${startMonth} ${startDay}-${endDay}`;
  }

  return `${startMonth} ${startDay}-${endMonth} ${endDay}`;
}

function summarizeRanges(ranges) {
  const fragments = [];

  for (let i = 0; i < ranges.length; i += 1) {
    const range = ranges[i];
    const formatted = formatRange(range);
    const month = monthName(range.start);
    const canGroup =
      monthName(range.start) === monthName(range.end) && !formatted.startsWith("all of ");

    if (!canGroup) {
      fragments.push(formatted);
      continue;
    }

    const parts = [`${dayNumber(range.start)}-${dayNumber(range.end)}`];
    while (i + 1 < ranges.length) {
      const next = ranges[i + 1];
      const nextFormatted = formatRange(next);
      const sameMonth =
        monthName(next.start) === month &&
        monthName(next.end) === month &&
        !nextFormatted.startsWith("all of ");

      if (!sameMonth) {
        break;
      }

      parts.push(`${dayNumber(next.start)}-${dayNumber(next.end)}`);
      i += 1;
    }

    fragments.push(`${month} ${parts.join(" & ")}`);
  }

  return fragments.join(" · ");
}

function normalizeSummary(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/\s+\./g, ".")
    .trim()
    .toLowerCase();
}

function extractHomepageStillOpen(indexHtml) {
  const match = indexHtml.match(/<strong>Still open:<\/strong>\s*([^.]*)\./i);
  return match ? match[1].replace(/&amp;/g, "&").trim() : null;
}

function getCanvaStatus() {
  const detectedEnvVars = Object.keys(process.env)
    .filter((key) => key.startsWith("CANVA_"))
    .sort();

  return {
    templatesConfigured: detectedEnvVars.length > 0,
    detectedEnvVars
  };
}

function buildPosts(availability) {
  const summerLine = availability.stillOpenSummary;
  const trustLine = "Written quote before payment. 4.79-star guest rating from 38 reviews.";

  return [
    {
      id: "ig-carousel-availability",
      channel: "instagram",
      format: "carousel",
      title: "Summer dates still open",
      objective: "Turn availability urgency into direct enquiries without overpromising.",
      caption: [
        "A quiet Riviera base with private pool, 15 minutes from Nice Airport.",
        "",
        `Still open for summer 2026: ${summerLine}.`,
        "",
        `${trustLine} Ask Lana for a written direct quote before any payment.`,
        "",
        "DM @villa_augflor_france or WhatsApp with dates + guests."
      ].join("\n"),
      canvaBrief: "Elegant cream/teal carousel using pool, terrace, and bedroom photography. Keep text sparse: 'Still open', 'Private pool', 'Written quote before payment'.",
      frames: [
        "Cover: Villa Augflor summer 2026 - still open",
        `Availability: ${summerLine}`,
        "Trust: written quote before payment + 4.79-star / 38 reviews",
        "CTA: Send dates + guest count to Lana"
      ],
      hashtags: ["#FrenchRivieraVilla", "#CotedAzur", "#NiceAirport", "#VillaRental", "#DirectBooking"]
    },
    {
      id: "ig-story-direct-booking-trust",
      channel: "instagram",
      format: "story",
      title: "Direct booking trust explainer",
      objective: "Reduce payment anxiety for guests comparing Airbnb, Booking.com, and direct.",
      caption: [
        "Book direct, but never blindly.",
        "",
        "Villa Augflor sends a written quote before payment, with the deposit, balance date, local tax, and security deposit clearly itemised.",
        "",
        "Same host. Same villa. Clearer conversation."
      ].join("\n"),
      canvaBrief: "Three story slides with restrained typography and a document/quote visual cue. Use trust badges sparingly.",
      frames: [
        "Slide 1: Book direct, never blindly",
        "Slide 2: Written quote before payment",
        "Slide 3: 4.79-star rating / 38 reviews / ask Lana for dates"
      ],
      hashtags: ["#BookDirect", "#FrenchRiviera", "#VillaAugflor"]
    },
    {
      id: "ig-reel-riviera-base",
      channel: "instagram",
      format: "reel",
      title: "A practical Riviera base",
      objective: "Position the villa as the calm base for families and couples who want Nice, Antibes, beaches, and hill villages nearby.",
      caption: [
        "Private pool mornings. Antibes or Nice by afternoon. Dinner under the pergola.",
        "",
        "Villa Augflor is a practical South of France base for guests who want comfort, parking, air conditioning, and clear direct-booking terms.",
        "",
        `Summer 2026 still open: ${summerLine}.`
      ].join("\n"),
      canvaBrief: "Vertical reel storyboard: pool water, pergola dining, garden path, map-style text overlays for Nice Airport / Antibes / Cagnes-sur-Mer.",
      frames: [
        "Hook: 15 minutes from Nice Airport",
        "Scene: private pool and garden",
        "Scene: shaded outdoor dining",
        "Close: send dates for a written quote"
      ],
      hashtags: ["#SouthOfFrance", "#RivieraBase", "#CagnesSurMer", "#FamilyVilla"]
    }
  ];
}

function buildWeeklyPack() {
  const prompt = readText(PROMPT_PATH);
  const calendar = readJson(CALENDAR_PATH);
  const indexHtml = readText(INDEX_PATH);
  const allSummerDates = eachDate("2026-06-01", "2026-09-30");
  const busySet = new Set(calendar.busyDates || []);
  const openDates = allSummerDates.filter((date) => !busySet.has(date));
  const openRanges = groupContiguous(openDates);
  const bookedRanges = groupContiguous(allSummerDates.filter((date) => busySet.has(date)));
  const stillOpenSummary = summarizeRanges(openRanges);
  const bookedSummary = summarizeRanges(bookedRanges);
  const homepageStillOpenSummary = extractHomepageStillOpen(indexHtml);
  const homepageNeedsUpdate =
    normalizeSummary(homepageStillOpenSummary) !== normalizeSummary(stillOpenSummary);
  const publishRequested = process.env.MARKETING_AGENT_PUBLISH === "true";
  const dryRun = !publishRequested;
  const runAt = new Date().toISOString();
  const runId = runAt.replace(/[:.]/g, "-");
  const reportRelPath = `automation/villa-marketing-agent/output/${runId}-report.md`;
  const contentPackRelPath = `automation/villa-marketing-agent/output/${runId}-content-pack.json`;
  const canva = getCanvaStatus();
  const availability = {
    sourcePath: path.relative(ROOT, CALENDAR_PATH),
    calendarUpdated: calendar.updated || null,
    openWindows: openRanges.map((range) => ({ ...range, label: formatRange(range) })),
    bookedWindows: bookedRanges.map((range) => ({ ...range, label: formatRange(range) })),
    stillOpenSummary,
    bookedSummary,
    homepageStillOpenSummary,
    homepageNeedsUpdate
  };
  const posts = buildPosts(availability);

  return {
    schemaVersion: 1,
    task: "weekly",
    runId,
    runAt,
    dryRun,
    publishRequested,
    publishStatus: publishRequested
      ? "MARKETING_AGENT_PUBLISH=true was set. This runner still generated approval assets only; Instagram publishing is not implemented in this repository."
      : "Dry run. Instagram auto-publish disabled because MARKETING_AGENT_PUBLISH is not true.",
    brand: BRAND,
    prompt: {
      path: path.relative(ROOT, PROMPT_PATH),
      bytes: Buffer.byteLength(prompt, "utf8")
    },
    canva,
    availability,
    content: {
      posts,
      approvalRequiredBy: "Lana",
      contentPackPath: contentPackRelPath,
      reportPath: reportRelPath
    }
  };
}

function renderReport(pack) {
  const mode = pack.dryRun ? "DRY RUN" : "PUBLISH REQUESTED";
  const material = pack.availability.homepageNeedsUpdate ? "Yes" : "No";
  const canvaLine = pack.canva.templatesConfigured
    ? `Detected Canva env vars: ${pack.canva.detectedEnvVars.join(", ")}`
    : "No CANVA_* environment variables detected in this run.";

  return [
    "# Villa Augflor weekly marketing report",
    "",
    `Run: ${pack.runAt}`,
    `Mode: ${mode}`,
    "",
    "## Generated files",
    "",
    `- Report: \`${pack.content.reportPath}\``,
    `- Content pack: \`${pack.content.contentPackPath}\``,
    "",
    "## Availability signal",
    "",
    `- Calendar source: \`${pack.availability.sourcePath}\``,
    `- Calendar updated: ${pack.availability.calendarUpdated || "unknown"}`,
    `- Still open: ${pack.availability.stillOpenSummary}`,
    `- Booked: ${pack.availability.bookedSummary}`,
    "",
    "## Homepage urgency check",
    "",
    `- Homepage current \"Still open\" line: ${pack.availability.homepageStillOpenSummary || "not found"}`,
    `- Generated \"Still open\" line: ${pack.availability.stillOpenSummary}`,
    `- Material update needed: ${material}`,
    "",
    "## Lana approval queue",
    "",
    ...pack.content.posts.flatMap((post) => [
      `### ${post.title}`,
      "",
      `- Channel/format: ${post.channel} ${post.format}`,
      `- Objective: ${post.objective}`,
      `- Canva brief: ${post.canvaBrief}`,
      "- Caption:",
      "",
      "```",
      post.caption,
      "```",
      ""
    ]),
    "## Publishing and Canva status",
    "",
    `- ${pack.publishStatus}`,
    `- ${canvaLine}`,
    "- Do not claim villa-augflor.com is live or updated unless `scripts/verify-production.sh` passes.",
    "",
    "## Recommended next step",
    "",
    pack.availability.homepageNeedsUpdate
      ? "Update the homepage Summer demand snapshot to match the generated Still open line, then run verification before describing the change as live."
      : "No homepage urgency edit is needed from this run. Lana can review the content pack for Instagram/Canva approval."
  ].join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }

  if (args.task !== "weekly") {
    throw new Error("This runner currently supports only --task weekly.\n\n" + usage());
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const pack = buildWeeklyPack();
  const report = renderReport(pack);
  const reportPath = path.join(ROOT, pack.content.reportPath);
  const contentPackPath = path.join(ROOT, pack.content.contentPackPath);

  fs.writeFileSync(contentPackPath, JSON.stringify(pack, null, 2) + "\n");
  fs.writeFileSync(reportPath, report + "\n");

  console.log(`Marketing agent weekly run complete (${pack.dryRun ? "dry run" : "publish requested"}).`);
  console.log(`Report: ${pack.content.reportPath}`);
  console.log(`Content pack: ${pack.content.contentPackPath}`);
  console.log(`Homepage urgency update needed: ${pack.availability.homepageNeedsUpdate ? "yes" : "no"}`);
  console.log(pack.publishStatus);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
