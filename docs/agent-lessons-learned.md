# Agent lessons learned (from Cursor chat history)

Generated from review of parent agent transcripts (Apr–May 2026). Use with `.cursor/rules/deployment-verification.mdc` and `AGENTS.md` in the `villa-augflor` workspace pointer.

## Root causes

### 1. Wrong workspace folder

Cursor project `villa-augflor` was empty while all HTML/CSS lives in `villa-augflor-live`. Agents searched `villa-augflor-static-live`, archives, and transcripts — often with **no file edits**.

**Fix:** Open Cursor on `villa-augflor-live`, or keep pointer rules in `villa-augflor` that force `move_agent_to_root` on first tool failure.

### 2. Local edit ≠ live site

User repeatedly reported: booking form still on site, redesign not visible, “still old”. Causes included editing the wrong repo, deploy queue/alias issues, and agents saying “done” without checking https://villa-augflor.com.

**Fix:** `scripts/verify-production.sh` after deploy; never claim live without exit 0.

### 3. Deploy / domain complexity

- Custom domain on project `villa-augflor-static-live`, not always the GitHub-linked project name.
- `www` vs apex on different Vercel scopes.
- Agent environment often lacks valid Vercel token → user must run CLI.

**Fix:** `scripts/deploy-production.sh`; one-line user instructions without `#` comments (zsh parse errors when pasted).

### 4. Pricing / copy inconsistency

- `index.html` used €480 for Jul–Aug while `rates.html` used “Peak summer” €520.
- UI screenshots said “High Season” but markup uses month blocks / “Peak summer”.
- Overlapping season cards (June on shoulder and peak) confused users and SEO.

**Fix:** When changing rates, update **both** `index.html` and `rates.html` in one change set; grep for `€480`, `€420`, `€520`.

### 5. CRO prompt overload

Conflicting instructions (instant book vs WhatsApp, weeks vs 48h, discount vs premium) led to copy whiplash and user “terrible” / “no difference” feedback.

**Fix:** Default to HANDOVER positioning: 4 guests, garden USP, refined tone, no bargain/emoji unless requested.

## Checklist for every agent session

- [ ] Confirmed read of `index.html` or `HANDOVER.md` in **this** repo
- [ ] Identified target page from user screenshot or URL
- [ ] Applied patch (not only markdown recommendations)
- [ ] If change must be public: deploy + `verify-production.sh`
- [ ] Told user clearly if only local / blocked on Vercel auth

## Related files

| File | Purpose |
|------|---------|
| `HANDOVER.md` | Deploy URLs, gallery, session notes |
| `.cursor/rules/deployment-verification.mdc` | Live-site proof required |
| `scripts/deploy-production.sh` | Production deploy |
| `scripts/verify-production.sh` | Curl-based live checks |
| `../villa-augflor/AGENTS.md` | Pointer when wrong folder is open |
