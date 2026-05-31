/* Enriches PLACES with CRO fields — loaded before area-guide.js */
(function (global) {
  "use strict";

  var PRICE_ORDER = { Free: 0, "€": 1, "€€": 2, "€€€": 3, "€€€€": 4 };
  var PARKING_ORDER = { Easy: 0, Medium: 1, Difficult: 2 };

  var HOST_TIPS = {
    "haut-de-cagnes": "Take the free line 44 shuttle — skip village parking entirely.",
    "st-paul-de-vence": "Go early for parking, or arrive after 5pm when coaches leave.",
    "cros-de-cagnes": "Morning swim before the afternoon breeze; book La Pesquière for sunset.",
    "nice": "Market mornings Tue–Sun, then old town — parking is easier before 10am.",
    "la-garoupe": "Book a beach-club lounger in July/August; public section fills fast.",
    "eze-town": "Best at sunset — golden light on the village and sea.",
    "monaco": "Take the train; parking in Monaco is expensive and scarce.",
    "fondation-maeght": "Arrive at opening; busy after midday in summer.",
    "colombe-dor": "Book terrace lunch ahead in August.",
    "plage-mala": "Arrive before 10am — small cove, very popular in August.",
    "polygone": "Rainy-day favourite — cinema and covered shopping under one roof.",
    "antibes-market": "Arrive at 9am with an empty bag — best selection before noon.",
    "cours-saleya": "Socca at Chez Pipo is best fresh off the griddle at lunchtime."
  };

  var GUEST_POPULAR = {
    "cros-de-cagnes": true,
    "haut-de-cagnes": true,
    "st-paul-de-vence": true,
    "antibes": true,
    "nice": true,
    "fondation-maeght": true,
    "la-garoupe": true,
    "colombe-dor": true,
    "monaco": true,
    "polygone": true
  };

  var OVERRIDES = {
    "haut-de-cagnes": {
      priceLevel: "Free", priceNote: "Free village walk; cafés from €",
      bestFor: ["Couples", "First-time Riviera", "Local favourite"],
      bookingAdvice: "Walk-in usually fine", transport: "Car or free shuttle",
      parking: "Medium", seasonNote: "Year-round", localFavourite: true, carFreePossible: true,
      romantic: true, hotDay: false, teenagerFriendly: false, grandparentFriendly: true,
      imageAlt: "Haut-de-Cagnes medieval village near Villa Augflor"
    },
    "st-paul-de-vence": {
      priceLevel: "Free", priceNote: "Village free; Fondation Maeght museum ticket",
      bestFor: ["Couples", "First-time Riviera", "Luxury"],
      bookingAdvice: "Book Maeght online in summer", transport: "Car recommended",
      parking: "Difficult", seasonNote: "Best Jun–Sep; busy August midday", bookAhead: true,
      romantic: true, grandparentFriendly: true,
      imageAlt: "Saint-Paul-de-Vence medieval village near Villa Augflor"
    },
    "cros-de-cagnes": {
      priceLevel: "Free", priceNote: "Public beach; restaurants €€",
      beachType: "Public sandy beach",
      bestFor: ["Families", "Local favourite"],
      bookingAdvice: "Walk-in; book La Pesquière for lunch", transport: "Car recommended",
      parking: "Medium", seasonNote: "Best Jun–Sep", localFavourite: true,
      hotDay: true, teenagerFriendly: true, grandparentFriendly: true,
      imageAlt: "Cros-de-Cagnes beach near Cagnes-sur-Mer"
    },
    "fondation-maeght": {
      priceLevel: "€€", priceNote: "Museum entry ticket (check official site)",
      bestFor: ["Couples", "Rainy day", "First-time Riviera"],
      bookingAdvice: "Book ahead July/August", transport: "Car recommended",
      parking: "Medium", seasonNote: "Year-round", bookAhead: true, rainyDay: true,
      grandparentFriendly: true,
      imageAlt: "Fondation Maeght art museum near Saint-Paul-de-Vence"
    },
    "nice": {
      priceLevel: "€", priceNote: "Market free; museums & dining €–€€€",
      bestFor: ["Families", "Couples", "First-time Riviera"],
      bookingAdvice: "Market mornings; book restaurants weekends", transport: "Train possible",
      parking: "Difficult", seasonNote: "Year-round", carFreePossible: true,
      hotDay: true, teenagerFriendly: true, grandparentFriendly: true,
      imageAlt: "Nice old town and Promenade des Anglais near Villa Augflor"
    },
    "la-garoupe": {
      priceLevel: "€€", priceNote: "Public section free; beach clubs €€€",
      beachType: "Sandy beach club / public",
      bestFor: ["Families", "Couples", "Luxury"],
      bookingAdvice: "Reserve beach club in peak season", transport: "Car recommended",
      parking: "Medium", seasonNote: "Best Jun–Sep", bookAhead: true,
      hotDay: true, teenagerFriendly: true, grandparentFriendly: true,
      imageAlt: "Plage de la Garoupe beach Cap d'Antibes"
    },
    "monaco": {
      priceLevel: "€€", priceNote: "Palace/museums €; dining & casino €€€€",
      bestFor: ["Couples", "Luxury", "First-time Riviera"],
      bookingAdvice: "Train recommended; book Oceanographic Museum ahead",
      transport: "Train possible", parking: "Difficult", seasonNote: "Year-round",
      carFreePossible: true, teenagerFriendly: true, grandparentFriendly: true,
      imageAlt: "Monaco and Monte-Carlo from Villa Augflor"
    },
    "gorges-du-loup": {
      priceLevel: "€", priceNote: "Parking low cost; guided canyoning €€",
      bestFor: ["Families", "Rainy day"],
      bookingAdvice: "Book canyoning in advance", transport: "Car recommended",
      parking: "Easy", seasonNote: "Best Apr–Oct", rainyDay: true, hotDay: true,
      teenagerFriendly: true,
      imageAlt: "Gorges du Loup canyon near the French Riviera"
    },
    "louis-xv": {
      priceLevel: "€€€€", priceNote: "Fine dining; dress code; reserve well ahead",
      bestFor: ["Couples", "Luxury"],
      bookingAdvice: "Book weeks or months ahead", transport: "Private driver recommended",
      parking: "Difficult", seasonNote: "Year-round", bookAhead: true, romantic: true,
      imageAlt: "Fine dining Monaco French Riviera"
    },
    "plage-mala": {
      priceLevel: "Free", priceNote: "Free cove; coastal path shoes recommended",
      beachType: "Rocky pebble cove",
      bestFor: ["Couples", "Hidden gem"],
      bookingAdvice: "Arrive early in summer", transport: "Car recommended",
      parking: "Difficult", seasonNote: "Best Jun–Sep", hotDay: true, romantic: true,
      imageAlt: "Plage Mala hidden cove Cap d'Ail French Riviera"
    },
    "polygone": {
      priceLevel: "€", priceNote: "Shopping varies; cinema ticket",
      bestFor: ["Families", "Rainy day", "Teenagers"],
      bookingAdvice: "Walk-in; book cinema online", transport: "Car recommended",
      parking: "Easy", seasonNote: "Year-round", rainyDay: true,
      teenagerFriendly: true, grandparentFriendly: true,
      imageAlt: "Polygone Riviera shopping centre Cagnes-sur-Mer"
    },
    "aquasplash": {
      priceLevel: "€€", priceNote: "Day ticket; summer only",
      bestFor: ["Families", "Teenagers"],
      bookingAdvice: "Book online in peak season", transport: "Car recommended",
      parking: "Easy", seasonNote: "Jul–Aug", hotDay: true,
      teenagerFriendly: true, grandparentFriendly: true,
      imageAlt: "Aquasplash water park Antibes near Villa Augflor"
    },
    "speed-park": {
      priceLevel: "€€", priceNote: "Activity passes vary",
      bestFor: ["Teenagers", "Families", "Rainy day"],
      bookingAdvice: "Book karting ahead in school holidays", transport: "Car recommended",
      parking: "Easy", seasonNote: "Year-round", rainyDay: true,
      teenagerFriendly: true,
      imageAlt: "Speed Park indoor activities near Cagnes-sur-Mer"
    },
    "musee-renoir": {
      priceLevel: "€€", priceNote: "Museum ticket",
      bestFor: ["Couples", "First-time Riviera", "Rainy day"],
      bookingAdvice: "Closed Tuesdays", transport: "Car or walk from villa area",
      parking: "Easy", seasonNote: "Year-round", rainyDay: true, grandparentFriendly: true,
      imageAlt: "Musée Renoir Cagnes-sur-Mer near Villa Augflor"
    },
    "rose-estates": {
      priceLevel: "€€€", priceNote: "Chauffeured tour on request",
      bestFor: ["Luxury", "Couples"],
      bookingAdvice: "Arrange via villa concierge", transport: "Private driver",
      parking: "N/A", seasonNote: "Apr–Oct", bookAhead: true, romantic: true,
      imageAlt: "Provence rosé wine estate tour French Riviera"
    },
    "boat-charter": {
      priceLevel: "€€€", priceNote: "Charter on request",
      bestFor: ["Luxury", "Families", "Couples"],
      bookingAdvice: "Book ahead July/August", transport: "Private driver to harbour",
      parking: "Medium", seasonNote: "May–Sep", bookAhead: true, hotDay: true,
      romantic: true, teenagerFriendly: true,
      imageAlt: "Private yacht charter Antibes French Riviera"
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
      hotDay: false,
      bookAhead: false,
      carFreePossible: false,
      romantic: false,
      teenagerFriendly: false,
      grandparentFriendly: false,
      guestPopular: !!GUEST_POPULAR[p.id],
      hostTip: HOST_TIPS[p.id] || null,
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
      d.hotDay = true;
    }
    if (p.cat === "museums") {
      d.priceLevel = "€€";
      d.priceNote = "Museum ticket (check official site)";
      d.rainyDay = true;
      d.bestFor = ["Rainy day"];
      d.grandparentFriendly = true;
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
      d.teenagerFriendly = p.family >= 4;
    }
    if (p.cat === "watersports") {
      d.priceLevel = "€€";
      d.priceNote = "Activity hire or charter";
      d.bookAhead = true;
      d.hotDay = true;
    }
    if (p.cat === "nature") {
      d.priceLevel = "Free";
      d.priceNote = "Free trails; parking may apply";
      d.hotDay = p.id === "gorges-du-loup";
    }
    if (p.cat === "daytrips") {
      d.priceLevel = "€€";
      d.transport = p.drive > 60 ? "Private driver recommended" : "Car recommended";
    }
    if (p.cat === "nightlife") {
      d.priceLevel = "€€";
      d.seasonNote = "Best Jun–Sep evenings";
      d.romantic = p.luxury >= 4;
    }
    if (p.cat === "shopping") {
      d.priceLevel = "€";
      d.rainyDay = true;
    }
    if (p.family >= 4) {
      d.bestFor.push("Families");
      if (p.drive <= 30) d.grandparentFriendly = true;
    }
    if (p.luxury >= 4) d.bestFor.push("Luxury");
    if (p.luxury >= 4) d.romantic = true;
    if (p.gem >= 4) d.bestFor.push("Hidden gem");
    if (p.gem >= 3) d.localFavourite = true;
    if (p.tags && p.tags.indexOf("Train-friendly") >= 0) {
      d.transport = "Train possible";
      d.carFreePossible = true;
    }
    if (p.tags && p.tags.indexOf("Rainy-day") >= 0) d.rainyDay = true;
    if (p.tags && p.tags.indexOf("Kids") >= 0) d.teenagerFriendly = true;
    if (p.tags && p.tags.indexOf("Adrenaline") >= 0) d.teenagerFriendly = true;
    if (p.tags && p.tags.indexOf("Cheap eat") >= 0) d.priceLevel = "€";
    if (p.tags && p.tags.indexOf("Low cost") >= 0) d.priceLevel = "€";
    if (GUEST_POPULAR[p.id]) d.guestPopular = true;
    if (HOST_TIPS[p.id]) d.hostTip = HOST_TIPS[p.id];
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
  global.PARKING_ORDER = PARKING_ORDER;
})(typeof window !== "undefined" ? window : global);
