# Villa Augflor — technical SEO and 2027 enquiry release

## Publishing

The original HTML is intentionally preserved in source control. `npm run build` tests the transforms, renders navigation/footer into HTML, removes expired offers and unverified structured review/price claims, updates the enquiry season, generates responsive WebP images and publishes the result into `dist/`. Vercel serves that directory; root `api/` remains server-side. Do not publish the unbuilt source HTML or hand-edit generated `dist/` files.

`npm test` runs regression checks. `npm run build` also validates canonical count, schema JSON and component completion on the actual sitemap pages. The generated `/technical-release.json` reports page and image counts and byte totals; these are not Lighthouse/Core Web Vitals scores.

## Deliberate safeguards

- Summer 2027 dates and prices are **not** approved by this technical release. Historic 2026 rates are labelled, not copied into confirmed 2027 offers. Existing cancellation/payment terms have not been rewritten.
- A date absent from an iCal feed is never advertised as confirmed available. Feed failures, missing feeds, empty feeds and historic manual data are handled without fabricated bookings. Airbnb, Booking.com and optional `VRBO_ICAL_URL` feeds are fetched concurrently; their private URLs are never returned to the browser. Manual blocks remain server-side.
- The old chat/exit-intent widget is not loaded: it contained expired 2026 urgency, unapproved discounts and misleading `Sent` confirmations. The booking-agent endpoint now returns a safe WhatsApp handoff without paid AI calls. Re-enable a conversational agent only after its facts, inventory and end-to-end delivery are tested.
- Enquiries are WhatsApp/email handoffs, **not server-delivered leads or confirmed bookings**. No payment integrations, financial terms or external paid accounts have been changed. No analytics tracking or marketing emails have been activated.
- Main design, fonts, colours, photos and layout are retained. Hero fade-in delay is removed, image dimensions/srcset and keyboard/reduced-motion support are added.
- Public SEO changes include one canonical per page, equivalent-page hreflang, linked page/property schema, image/language sitemap, crawler rules, descriptive social previews, preserved redirects and a real 404 document.
- `llms.txt` is an accurate convenience summary, not a promise of Google/AI ranking or indexing. No Google Hotel Center/vacation-rental rich-result eligibility is claimed.

## Required owner decisions / access

1. Confirm the exact summer 2027 letting weeks, rates, minimum stay and all itemised fees with Lana before publishing price offers. Check channel calendars and direct-booking blocks together.
2. Verify live iCal environment variables in the production Vercel project. A calendar cannot prevent double bookings without an authoritative inventory/booking workflow.
3. Inspect the verified Search Console and Bing Webmaster Tools properties; submit the sitemap there and investigate real indexing reports. No submission, ranking improvement or booking uplift is implied by this release.
4. A dependable server-side enquiry inbox needs an authenticated mail provider, abuse protection and end-to-end delivery testing. Until then, the visible handoff wording is explicit.

## Rollback

The pre-release main commit is `8cb6d7323cdbcbb54c5b87592035bc75e24358ed`. Revert the release merge commit, or redeploy that previous production commit through the existing Vercel project. Do not force-reset shared history. All new changes are isolated in the technical release branch before merge.
