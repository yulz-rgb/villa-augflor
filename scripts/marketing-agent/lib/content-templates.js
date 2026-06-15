const WA =
  "https://wa.me/33623777333?text=Hi%20Lana%2C%20please%20check%20Villa%20Augflor%20availability.%20Dates%3A%20%5Bcheck-in%5D%20to%20%5Bcheck-out%5D.%20Guests%3A%20%5Bnumber%5D.";

const HASHTAGS =
  "#VillaAugflor #CagnesSurMer #CoteDAzur #FrenchRiviera #PrivatePool #NiceAirport #VillaRental #SouthOfFrance #DirectBooking";

function formatDate(ymd) {
  const [year, month, day] = ymd.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
  });
}

function urgencyLine(windows) {
  if (!windows.length) return "Ask Lana for current availability — summer weeks fill quickly.";
  const labels = windows.map((w) => {
    if (w.start === w.end) return formatDate(w.start);
    return `${formatDate(w.start)} → ${formatDate(w.end)}`;
  });
  return `Open windows (next 90 days): ${labels.join(" · ")}`;
}

function weeklyPosts(openSummary) {
  const line = urgencyLine(openSummary.windows);
  return [
    {
      type: "feed",
      theme: "pool_privacy",
      imageHint: "assets/photos/optimized/swimming-pool.jpg",
      canvaTemplate: "CANVA_BRAND_TEMPLATE_FEED",
      caption: `Your own pool, walled garden, no shared facilities — Villa Augflor, Cagnes-sur-Mer.\n\n15 min Nice Airport · ideal 4 / max 6 · 4.79★ · written quote before payment.\n\n${line}\n\nEnquire: ${WA}\n\n${HASHTAGS}`,
      canvaFields: {
        headline: "Private pool villa · Côte d'Azur",
        subline: "15 min Nice Airport · from €420/n direct",
        cta: "Written quote before payment",
      },
    },
    {
      type: "story",
      theme: "open_dates",
      imageHint: "assets/photos/optimized/garden-dining-patio.jpg",
      canvaTemplate: "CANVA_BRAND_TEMPLATE_STORY",
      caption: `Summer dates still open at Villa Augflor 🌿\n${line}\nSwipe up / link in bio → WhatsApp Lana for a written quote.`,
      canvaFields: {
        headline: "Summer 2026 — open weeks",
        subline: line.slice(0, 120),
        cta: "Check dates on WhatsApp",
      },
    },
    {
      type: "reel",
      theme: "direct_savings",
      imageHint: "assets/photos/optimized/photo-swimming-pool-backyard-garden-lounge.jpg",
      canvaTemplate: "CANVA_BRAND_TEMPLATE_REEL",
      caption: `Same villa. Clearer total.\n\nDirect booking example: ~€676 saved vs platform fees on a peak week (see villa-augflor.com/rates).\n\nCompare on Airbnb first if you prefer — then message for a written direct quote.\n\n${HASHTAGS}`,
      canvaFields: {
        headline: "Book direct · save ~€676/week",
        subline: "4.79★ · 38 reviews · Gîtes de France 4★",
        cta: "villa-augflor.com",
      },
    },
  ];
}

module.exports = { weeklyPosts, urgencyLine, WA, HASHTAGS };
