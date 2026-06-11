#!/usr/bin/env node
/**
 * Villa Augflor marketing agent CLI
 * Usage:
 *   node scripts/marketing-agent/index.js --task weekly
 *   node scripts/marketing-agent/index.js --task weekly --publish
 */

const fs = require("fs");
const path = require("path");
const { getOpenDateSummary } = require("./lib/open-dates");
const { weeklyPosts, urgencyLine } = require("./lib/content-templates");
const { publishPosts } = require("./lib/instagram");
const { processPosts } = require("./lib/canva");

const ROOT = path.join(__dirname, "../..");
const OUT = path.join(ROOT, "automation/villa-marketing-agent/output");

function parseArgs() {
  const args = process.argv.slice(2);
  const task = args.includes("--task") ? args[args.indexOf("--task") + 1] : "weekly";
  const publish =
    args.includes("--publish") || process.env.MARKETING_AGENT_PUBLISH === "true";
  return { task, publish };
}

function ensureOut() {
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(path.join(OUT, "assets"), { recursive: true });
}

function writeReport({ openSummary, posts, ig, canva, publish }) {
  const date = new Date().toISOString().slice(0, 10);
  const packPath = path.join(OUT, `${date}-content-pack.json`);
  const reportPath = path.join(OUT, `${date}-report.md`);

  const pack = {
    generatedAt: new Date().toISOString(),
    openSummary,
    posts,
    instagram: ig,
    canva,
    publishMode: publish,
  };
  fs.writeFileSync(packPath, JSON.stringify(pack, null, 2));

  const md = `# Marketing agent report — ${date}

## Open dates
${urgencyLine(openSummary.windows)}

## Instagram
- Dry run: ${!publish || ig.dryRun ? "yes" : "no"}
- Result: ${JSON.stringify(ig, null, 2)}

## Canva
${JSON.stringify(canva, null, 2)}

## Posts this run
${posts.map((p, i) => `### ${i + 1}. ${p.type} — ${p.theme}\n${p.caption}\n`).join("\n")}

## Google Business (copy-paste)
**Available summer weeks at Villa Augflor** — private pool villa, Cagnes-sur-Mer. ${urgencyLine(openSummary.windows).slice(0, 200)} Direct booking from €420/n · written quote before payment. villa-augflor.com

## Next manual steps
1. Review captions in \`${packPath}\`
2. Create/export Canva designs if API not fully configured
3. Approve Story + Feed in Meta Business Suite if not auto-published
4. Run deploy only after site HTML changes: \`bash scripts/deploy-production.sh\`
`;
  fs.writeFileSync(reportPath, md);
  return { packPath, reportPath };
}

async function runWeekly(publish) {
  ensureOut();
  const openSummary = getOpenDateSummary(120);
  const posts = weeklyPosts(openSummary);

  const siteUrl = process.env.SITE_URL || "https://villa-augflor.com";
  const ig = await publishPosts(posts, { imageBaseUrl: siteUrl, publish });
  const canva = await processPosts(posts, { outDir: path.join(OUT, "assets"), publish });

  const { packPath, reportPath } = writeReport({ openSummary, posts, ig, canva, publish });

  console.log("Villa Augflor marketing agent — weekly run complete");
  console.log("Open windows:", openSummary.windows.length);
  console.log("Content pack:", packPath);
  console.log("Report:", reportPath);
  if (!process.env.INSTAGRAM_ACCESS_TOKEN) {
    console.log("\n⚠ Instagram: add INSTAGRAM_ACCESS_TOKEN + INSTAGRAM_BUSINESS_ACCOUNT_ID to .env");
  }
  if (!process.env.CANVA_ACCESS_TOKEN) {
    console.log("⚠ Canva: add CANVA_ACCESS_TOKEN + template IDs to .env");
  }
  if (!publish) {
    console.log("\nDry run (no publish). Use --publish or MARKETING_AGENT_PUBLISH=true when ready.");
  }
}

async function main() {
  const { task, publish } = parseArgs();
  if (task === "weekly") await runWeekly(publish);
  else {
    console.error("Unknown task:", task);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
