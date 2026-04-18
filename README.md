# Villa Augflor — Conversion-Optimised Rebuild

A pure HTML/CSS/JS rebuild of [villa-augflor.com](https://www.villa-augflor.com/),
designed to **maximise direct bookings** and reduce Airbnb / Booking dependency.

**Snapshot / where this draft lives:** see **`SAVE-POINT.txt`** in this folder (path on disk, how to `git tag`, zip backup, and how to pick the work up later). This repo is **not** automatically what visitors see on the live domain unless you deploy it.

Built from first principles against the original site's weaknesses:

- vague poetic hero → hard value proposition with price delta vs Airbnb
- hidden 20% savings → front-and-centre compare block
- passive scarcity → mock 2026 availability calendar
- scattered CTAs → sticky bottom bar (mobile) + side card (desktop) + WhatsApp float
- objections-as-FAQ → dedicated "Read this before you book" section
- feature copy → outcome copy

## Stack

- Pure HTML + modular CSS + vanilla JS — no frameworks, no build step.
- `data-include="components/*.html"` pattern for reusable partials (fetched at runtime).
- Google Fonts: Cormorant Garamond (serif display) + Inter (UI).
- Photos live under `assets/photos/` with optimised JPEGs in `assets/photos/optimized/` (see "Replacing images" below).

## Structure

```
index.html             conversion landing page (hero → compare → proof → benefits → objections → reviews → calendar → book)
villa.html             layout, bedrooms, amenities, honest notes, FAQ
rates.html             prices, direct-vs-Airbnb maths, 2026 calendar, cancellation
gallery.html           full visual proof (outdoor, interior, bedrooms) with lightbox
area.html              distances + Lana's Riviera playbook
pay.html               Stripe Checkout — 30% deposit (after you confirm dates)
pay-success.html       post-payment thank-you

api/calendar.js        serverless: merge Airbnb + Booking iCals → JSON busy dates
api/create-deposit-session.js   serverless: Stripe Checkout Session for deposit
lib/ical-busy.js       tiny iCal parser (no extra npm deps)

components/
  header.html          sticky nav + mobile menu
  footer.html          4-col footer, trust, legal
  sticky-cta.html      mobile bottom bar + desktop WhatsApp float
  booking-form.html    enquiry form (mailto + WhatsApp fallback)

styles/main.css        full design system (≈ 18 KB)
scripts/main.js        components, live/mock calendar, lightbox, sticky CTA, form
scripts/pay-deposit.js pay.html only — posts to Stripe API
package.json           stripe SDK for serverless
.env.example           copy to .env locally; mirror vars in Vercel dashboard
assets/photos/         put optimised real villa images here
```

## Running locally

Because the component loader uses `fetch()`, open via a local server (not `file://`):

```bash
cd villa-augflor
python3 -m http.server 8080
# then http://localhost:8080
```

or `npx serve .`

## Deploy on Vercel as a **separate** project (not `yulz-rgb/villa-augflor`)

The GitHub repo **`yulz-rgb/villa-augflor`** is wired to the older single-page static export. **This folder** (localhost `8080` rebuild) should use its **own** Vercel project so you get a **new** `*.vercel.app` URL.

**Fastest (CLI on your Mac):**

```bash
cd /path/to/villa-augflor
bash scripts/deploy-new-vercel.sh
```

When Vercel asks to link the directory, choose **Create new project** and name it e.g. **`villa-augflor-rebuild`** (any unused name is fine). The CLI prints the production URL when the deploy finishes.

**Via GitHub (good for auto-deploy on every push):**

1. Create a **new** empty repository (e.g. `villa-augflor-rebuild`) — do **not** reuse `yulz-rgb/villa-augflor`.
2. Push this codebase to `main` on that repo.
3. In [Vercel Dashboard](https://vercel.com/new) → **Add New…** → **Project** → **Import** that repository. Framework preset: **Other** (no build command; root is the site).
4. Add environment variables from `.env.example` if you use Stripe or live iCal (`STRIPE_SECRET_KEY`, `SITE_URL`, `AIRBNB_ICAL_URL`, `BOOKING_ICAL_URL`).

## Photos — where to put them (fastest path)

**Do not use Cursor or GitHub as your “photo host.”** Cursor is for editing code (and chat attachments are not a CDN). GitHub works only if you commit **small, optimised** files — huge phone originals will make Git slow and are bad for visitors.

**Recommended (simplest + fastest loading):**

1. **Optimise on your Mac** (Photos app export, or [squoosh.app](https://squoosh.app)): WebP or JPEG, **max width 1600–2000 px**, target **150–400 KB** per image.
2. **Copy files into** `assets/photos/` in this project (see `assets/photos/HOW-TO-ADD-PHOTOS.txt`).
3. **Replace** each `https://images.unsplash.com/...` URL in the HTML with `assets/photos/your-name.webp`.
4. **Deploy** (Vercel serves them from the same domain — fast, no CORS issues).

**Upgrade path (global CDN):** upload to Cloudinary / Imgix, paste their HTTPS URLs into HTML — automatic WebP and resizing worldwide.

**Why pages stay fast:** small file sizes + `loading="lazy"` + hero as CSS `background-image` only once + no giant GIFs. Broken images = wrong path or typo — always use lowercase, no spaces in filenames.

---

## Live calendar (Airbnb + Booking iCal) — already coded

Browsers **cannot** read secret Airbnb/Booking iCal links directly (CORS + you must not publish those URLs in public HTML). This repo includes a **serverless** endpoint:

- `**GET /api/calendar`** — fetches `AIRBNB_ICAL_URL` and `BOOKING_ICAL_URL` from **Vercel environment variables only**, merges every booked night, returns JSON `{ busyDates: ["2026-07-01", ...] }`.
- `**scripts/main.js`** calls `/api/calendar` on page load. If the API is missing (local `python -m http.server`), it **falls back to the demo calendar** so the site never breaks.

### How to get your secret iCal links

1. **Airbnb:** Hosting dashboard → **Calendar** → listing → **Availability settings** (or similar) → **Export calendar** → copy the **private iCal URL** (long URL with a token — treat it like a password).
2. **Booking.com:** Extranet → **Rates & availability** → **Calendar** → **Sync calendars** → **Export** / iCal link (wording varies by region).

### Wire it on Vercel (5 minutes)

1. Push this project to GitHub (without `.env` — never commit secrets).
2. Import the repo in [Vercel](https://vercel.com) → deploy (default settings detect `/api/*`).
3. **Project → Settings → Environment Variables** (Production):
  - `AIRBNB_ICAL_URL` = paste Airbnb export URL  
  - `BOOKING_ICAL_URL` = paste Booking export URL (optional if unused)  
  - `SITE_URL` = `https://www.villa-augflor.com` (your real domain)
4. **Redeploy.** Open your site — calendar legend should say *Live sync from Airbnb + Booking*.

The API response is **cached ~5 minutes** at the edge so we do not hammer Airbnb/Booking on every page view.

---

## Stripe — 30% deposit after you accept a guest

**Flow:** Guest enquires → you confirm dates on WhatsApp/email → you send them `**pay.html`** → they pay on Stripe Checkout → money hits your Stripe account.

**What was added:**

- `**POST /api/create-deposit-session`** — creates a Checkout Session. Amounts are **fixed on the server** (never trust a browser for €):
  - `peak-week` → **€1,092.00** (30% of €3,640)
  - `shoulder-week` → **€1,008.00** (30% of €3,360)
- `**pay.html`** — simple form → redirects to Stripe.
- `**pay-success.html`** — return landing after payment.

### Stripe setup (first time)

1. Create a [Stripe](https://stripe.com) account → **Developers → API keys** → copy **Secret key** (`sk_test_…` for testing).
2. In Vercel → Environment Variables → add `**STRIPE_SECRET_KEY`** (test key first).
3. Ensure `**SITE_URL`** matches your deployed URL (e.g. `https://villa-augflor.vercel.app` during tests).
4. Deploy, open `**/pay.html**`, pay with [Stripe test card](https://docs.stripe.com/testing) `4242 4242 4242 4242`.
5. When ready for real money: switch to **live keys** in Vercel and turn on Stripe **live mode**.

**Optional next step (not required day 1):** add a **Stripe webhook** to email you when `checkout.session.completed` fires — I can add that in a follow-up if you want automated “deposit received” emails.

---

## Replacing placeholder images

Every `<img>` currently points at Unsplash. To swap to real photos:

1. Drop optimised files into `/assets/photos/` (see above).
2. Global find-and-replace `https://images.unsplash.com/...` → `assets/photos/your-file.webp`.
3. Preserve `loading="lazy"` and `data-full=""` for the lightbox.

## Wiring the booking form to a backend

Currently the form opens a pre-filled `mailto:` and shows a success state. For production:

1. Replace the `mailto` fallback in `scripts/main.js` (`bookingForm()`) with a `fetch()` POST to
  your endpoint of choice — Formspree, Getform, or a simple serverless function.
2. Keep the WhatsApp CTA above the form as an always-available escape hatch.

## Conversion primitives in use


| Primitive                       | Where                                                                   |
| ------------------------------- | ----------------------------------------------------------------------- |
| Hero price anchor               | `index.html` hero badges + meta grid                                    |
| Direct vs Airbnb delta (€707)   | `index.html` + `rates.html` compare sections                            |
| Urgency strip                   | `index.html` under hero                                                 |
| Live / mock calendar            | `data-calendar` + `GET /api/calendar` (Vercel) or demo fallback locally |
| Stripe deposit                  | `pay.html` + `POST /api/create-deposit-session`                         |
| Sticky CTA (mobile)             | component — shown after 60% of hero scrolled                            |
| WhatsApp float (desktop)        | component — always visible                                              |
| Objection pre-emption           | `index.html` + `villa.html`                                             |
| Lifestyle gallery with lightbox | `gallery.html` + `index.html`                                           |
| Host credibility                | `index.html` split block                                                |
| Schema.org `LodgingBusiness`    | `index.html` head                                                       |


## Performance

- No JS frameworks, no webfont blocking, no trackers.
- CSS ≈ 18 KB uncompressed; gzip < 5 KB.
- JS ≈ 6 KB uncompressed.
- All images use `loading="lazy"` except the hero background.
- Preconnects to `fonts.googleapis.com`, `fonts.gstatic.com`, `images.unsplash.com`.

## Next improvements (ranked by conversion impact)

1. **Real photos** — replace Unsplash URLs with `assets/photos/`* (still the #1 trust upgrade).
2. **Stripe webhook → email** — auto-notify you on `checkout.session.completed` (I can add this next).
3. **Video hero** — 8-second silent loop of the pool at golden hour.
4. **Hosted enquiry form** — Formspree / serverless email so guests are not forced through `mailto:`.
5. **Custom deposit amounts** — if rates change, update the cent amounts in `api/create-deposit-session.js` only.

