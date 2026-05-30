/* Enriches PLACES with CRO fields — loaded before area-guide.js */
(function (global) {
  "use strict";

  var PRICE_ORDER = { Free: 0, "€": 1, "€€": 2, "€€€": 3, "€€€€": 4 };

  var OVERRIDES = {
    "haut-de-cagnes": {
      priceLevel: "Free", priceNote: "Free village walk; cafés from €",
      bestFor: ["Couples", "First-time Riviera", "Local favourite"],
      bookingAdvice: "Walk-in usually fine", transport: "Car recommended (free navette line 44)",
      parking: "Medium", seasonNote: "Year-round", localFavourite: true, carFreePossible: true,
      imageAlt: "Haut-de-Cagnes medieval village near Villa Augflor"
    },
    "st-paul-de-vence": {
      priceLevel: "Free", priceNote: "Village free; Fondation Maeght museum ticket",
      bestFor: ["Couples", "First-time Riviera", "Luxury"],
      bookingAdvice: "Book Maeght online in summer", transport: "Car recommended",
      parking: "Difficult", seasonNote: "Best Jun–Sep; busy August midday", bookAhead: true,
      imageAlt: "Saint-Paul-de-Vence medieval village near Villa Augflor"
    },
    "cros-de-cagnes": {
      priceLevel: "Free", priceNote: "Public beach; restaurants €€",
      beachType: "Public sandy beach",
      bestFor: ["Families", "Local favourite"],
      bookingAdvice: "Walk-in; book La Pesquière for lunch", transport: "Car recommended",
      parking: "Medium", seasonNote: "Best Jun–Sep", localFavourite: true,
      imageAlt: "Cros-de-Cagnes beach near Cagnes-sur-Mer"
    },
    "fondation-maeght": {
      priceLevel: "€€", priceNote: "Museum entry ticket (check official site)",
      bestFor: ["Couples", "Rainy day", "First-time Riviera"],
      bookingAdvice: "Book ahead July/August", transport: "Car recommended",
      parking: "Medium", seasonNote: "Year-round", bookAhead: true, rainyDay: true,
      imageAlt: "Fondation Maeght art museum near Saint-Paul-de-Vence"
    },
    "nice": {
      priceLevel: "€", priceNote: "Market free; museums & dining €–€€€",
      bestFor: ["Families", "Couples", "First-time Riviera"],
      bookingAdvice: "Market mornings; book restaurants weekends", transport: "Train possible",
      parking: "Difficult", seasonNote: "Year-round", carFreePossible: true,
      imageAlt: "Nice old town and Promenade des Anglais near Villa Augflor"
    },
    "la-garoupe": {
      priceLevel: "€€", priceNote: "Public section free; beach clubs €€€",
      beachType: "Sandy beach club / public",
      bestFor: ["Families", "Couples", "Luxury"],
      bookingAdvice: "Reserve beach club in peak season", transport: "Car recommended",
      parking: "Medium", seasonNote: "Best Jun–Sep", bookAhead: true,
      imageAlt: "Plage de la Garoupe beach Cap d'Antibes"
    },
    "monaco": {
      priceLevel: "€€", priceNote: "Palace/museums €; dining & casino €€€€",
      bestFor: ["Couples", "Luxury", "First-time Riviera"],
      bookingAdvice: "Train recommended; book Oceanographic Museum ahead",
      transport: "Train possible", parking: "Difficult", seasonNote: "Year-round",
      carFreePossible: true, imageAlt: "Monaco and Monte-Carlo from Villa Augflor"
    },
    "gorges-du-loup": {
      priceLevel: "€", priceNote: "Parking low cost; guided canyoning €€",
      bestFor: ["Families", "Rainy day"],
      bookingAdvice: "Book canyoning in advance", transport: "Car recommended",
      parking: "Easy", seasonNote: "Best Apr–Oct", rainyDay: true,
      imageAlt: "Gorges du Loup canyon near the French Riviera"
    },
    "louis-xv": {
      priceLevel: "€€€€", priceNote: "Fine dining; dress code; reserve well ahead",
      bestFor: ["Couples", "Luxury"],
      bookingAdvice: "Book weeks or months ahead", transport: "Private driver recommended",
      parking: "Difficult", seasonNote: "Year-round", bookAhead: true,
      imageAlt: "Fine dining Monaco French Riviera"
    },
    "plage-mala": {
      priceLevel: "Free", priceNote: "Free cove; coastal path shoes recommended",
      beachType: "Rocky pebble cove",
      bestFor: ["Couples", "Hidden gem"],
      bookingAdvice: "Arrive early in summer", transport: "Car recommended",
      parking: "Difficult", seasonNote: "Best Jun–Sep",
      imageAlt: "Plage Mala hidden cove Cap d'Ail French Riviera"
    }
  };

  function catDefaults(p) {
    var d = {
      priceLevel: "€€",
      priceNote: "Typical visit cost varies by season",
      bestFor: [],
      bookingAdvice: "Walk-in usually fine",
      transport: "Car recommended",
      parking: "Medium",
      seasonNote: "Year-round",
      beachType: null,
      localFavourite: false,
      rainyDay: false,
      bookAhead: false,
      carFreePossible: false,
      imageAlt: p.name + " near Villa Augflor, French Riviera"
    };
    if (p.cat === "destinations" || p.cat === "villages") {
      d.priceLevel = "Free";
      d.priceNote = "Free village walk; food & museums extra";
      d.bestFor = ["First-time Riviera"];
    }
    if (p.cat === "beaches") {
      d.priceLevel = "Free";
      d.priceNote = "Public beach; clubs or loungers extra";
      d.beachType = "Public beach";
      d.bestFor = ["Families"];
    }
    if (p.cat === "museums") {
      d.priceLevel = "€€";
      d.priceNote = "Museum ticket (check official site)";
      d.rainyDay = true;
      d.bestFor = ["Rainy day"];
    }
    if (p.cat === "food") {
      d.priceLevel = "€€";
      d.priceNote = "Restaurant or market spend";
      d.bestFor = ["Couples", "Local favourite"];
    }
    if (p.cat === "wine") {
      d.priceLevel = "€€";
      d.priceNote = "Tasting fee varies by estate";
      d.bookAhead = true;
    }
    if (p.cat === "family") {
      d.priceLevel = "€€";
      d.bestFor = ["Families"];
    }
    if (p.cat === "watersports") {
      d.priceLevel = "€€";
      d.priceNote = "Activity hire or charter";
      d.bookAhead = true;
    }
    if (p.cat === "nature") {
      d.priceLevel = "Free";
      d.priceNote = "Free trails; parking may apply";
    }
    if (p.cat === "daytrips") {
      d.priceLevel = "€€";
      d.transport = p.drive > 60 ? "Private driver recommended" : "Car recommended";
    }
    if (p.cat === "nightlife") {
      d.priceLevel = "€€";
      d.seasonNote = "Best Jun–Sep evenings";
    }
    if (p.cat === "shopping") {
      d.priceLevel = "€";
    }
    if (p.family >= 4) d.bestFor.push("Families");
    if (p.luxury >= 4) d.bestFor.push("Luxury");
    if (p.gem >= 4) d.bestFor.push("Hidden gem");
    if (p.gem >= 3) d.localFavourite = true;
    if (p.tags && p.tags.indexOf("Train-friendly") >= 0) {
      d.transport = "Train possible";
      d.carFreePossible = true;
    }
    if (p.tags && p.tags.indexOf("Rainy-day") >= 0) d.rainyDay = true;
    return d;
  }

  function merge(a, b) {
    var out = {};
    var k;
    for (k in a) if (a.hasOwnProperty(k)) out[k] = a[k];
    for (k in b) if (b.hasOwnProperty(k) && b[k] != null) out[k] = b[k];
    return out;
  }

  global.enrichPlace = function (p) {
    var enriched = merge(catDefaults(p), OVERRIDES[p.id] || {});
    enriched.duration = p.duration || enriched.duration || "Half day";
    enriched.seasonNote = (OVERRIDES[p.id] && OVERRIDES[p.id].seasonNote) || enriched.seasonNote;
    return merge(p, enriched);
  };

  global.PRICE_ORDER = PRICE_ORDER;
})(typeof window !== "undefined" ? window : global);
