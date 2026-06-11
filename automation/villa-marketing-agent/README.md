# Villa Augflor — Marketing agent (Instagram + Canva)

Automates the weekly marketing loop from your conversion audit: open-date urgency, IG posts, Canva creatives, and a report for Lana to approve.

## Quick start

```bash
# Dry run — generates content pack + report (no API calls that publish)
node scripts/marketing-agent/index.js --task weekly

# With publish (requires credentials in .env)
MARKETING_AGENT_PUBLISH=true node scripts/marketing-agent/index.js --task weekly --publish
```

Output: `automation/villa-marketing-agent/output/YYYY-MM-DD-content-pack.json` and `YYYY-MM-DD-report.md`

## Connect Instagram

1. Convert @villa_augflor_france to a **Business** or **Creator** account.
2. Link it to a **Facebook Page** (Meta Business Suite).
3. Create a Meta app → add **Instagram Graph API** product.
4. Generate a long-lived **Page access token** with permissions: `instagram_basic`, `instagram_content_publish`, `pages_read_engagement`.
5. Get **Instagram Business Account ID** (Graph API: `GET /{page-id}?fields=instagram_business_account`).

Add to `.env` / Vercel (optional — only if running publish from CI):

```
INSTAGRAM_ACCESS_TOKEN=
INSTAGRAM_BUSINESS_ACCOUNT_ID=
```

**Note:** Feed images must be **public HTTPS URLs** (e.g. villa-augflor.com/assets/...). Reels need video URLs — v1 skips auto Reel publish; use Canva export + manual upload.

## Connect Canva

1. Register at [Canva Developers](https://www.canva.dev/) → create Connect API integration.
2. OAuth once to obtain **refresh token** → store as `CANVA_ACCESS_TOKEN` (or refresh flow in a future script).
3. Create brand templates in Canva for Feed, Story, Reel cover with named fields: `headline`, `subline`, `cta`.
4. Copy each template ID into env:

```
CANVA_ACCESS_TOKEN=
CANVA_BRAND_TEMPLATE_FEED=
CANVA_BRAND_TEMPLATE_STORY=
CANVA_BRAND_TEMPLATE_REEL=
```

Canva API field names must match your template autofill keys — adjust `scripts/marketing-agent/lib/content-templates.js` if your template uses different names.

## Cursor Automation (recommended)

Use the pre-filled **Villa Augflor Marketing Agent** automation (see parent chat) — runs **every Monday 9:00** on repo `yulz-rgb/villa-augflor`, branch `main`:

1. Runs the CLI dry-run
2. Updates content pack / optional PR for homepage urgency text
3. Leaves Instagram/Canva publish off until you set `MARKETING_AGENT_PUBLISH=true` in automation secrets

## What it does NOT do (yet)

- Auto-deploy to villa-augflor.com (manual or separate deploy automation)
- Meta Ads / retargeting
- Google Business Profile API posts
- DM automation (use WhatsApp separately)

## Agent instructions for Cursor

Full prompt: `automation/villa-marketing-agent/AGENT-PROMPT.md`
