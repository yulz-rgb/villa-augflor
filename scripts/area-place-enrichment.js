/* Enriches PLACES with CRO fields — loaded before area-guide.js */
(function (global) {
  "use strict";

  var PRICE_ORDER = { Free: 0, "€": 1, "€€": 2, "€€€": 3, "€€€€": 4 };
  var PARKING_ORDER = { Easy: 0, Medium: 1, Difficult: 2 };

  var HOST_TIPS = {
    "haut-de-cagnes": "Take the free line 44 shuttle — skip village parking entirely.",
    "st-paul-de-vence": "Go early for parking, or arrive after 5pm when coaches leave.",
    "cros-de-cagnes": "Morning swim before the afternoon breeze; book Bistrot de la Marine or Vivo for sunset.",
    "nice": "Market mornings Tue–Sun, then old town — parking is easier before 10am.",
    "la-garoupe": "Book a beach-club lounger in July/August; public section fills fast.",
    "eze-town": "Best at sunset — golden light on the village and sea.",
    "monaco": "Take the train; parking in Monaco is expensive and scarce.",
    "fondation-maeght": "Arrive at opening; busy after midday in summer.",
    "le-caruso": "Temporarily closed — try Les Remparts or Café Timothé for Saint-Paul lunch instead.",
    "table-de-pierre": "Our closest Michelin-star dinner — reserve on TheFork; only 5 min from the villa on Route des Serres.",
    "plage-mala": "Arrive before 10am — small cove, very popular in August.",
    "polygone": "Rainy-day favourite — cinema and covered shopping under one roof.",
    "antibes-market": "Arrive at 9am with an empty bag — best selection before noon.",
    "cours-saleya": "Socca at Chez Pipo is best fresh off the griddle at lunchtime.",
    "sabai-sabai": "Our go-to Thai in Saint-Paul — book the terrace on summer evenings.",
    "les-remparts": "Book the ramparts terrace for sunset — one of the best views in Saint-Paul.",
    "cafe-timothe": "Our cute, healthy lunch pick in Saint-Paul — opens from 10:30; book ahead in August.",
    "table-de-kamiya": "Our Cros seafront favourite — reserve terrace seats for sunset; same promenade as Bistrot de la Marine.",
    "l-agape": "Reserve for terrace cocktails at sunset — our upscale Cros pick on the same promenade.",
    "ino-plage": "Book the pergola terrace for lunch after a Cros swim — beach umbrellas and sea views on the same promenade.",
    "fleur-de-sel": "Walkable from the villa — call to book; village parking is tricky, so allow time to find a spot."
  };

  var GUEST_POPULAR = {
    "cros-de-cagnes": true,
    "haut-de-cagnes": true,
    "st-paul-de-vence": true,
    "antibes": true,
    "nice": true,
    "fondation-maeght": true,
    "la-garoupe": true,
    "monaco": true,
    "polygone": true,
    "sabai-sabai": true,
    "les-remparts": true,
    "cafe-timothe": true,
    "la-pesquiere": true,
    "table-de-kamiya": true,
    "l-agape": true,
    "ino-plage": true,
    "fleur-de-sel": true,
    "table-de-pierre": true,
    "bakery-local": true
  };

  var OVERRIDES = {
    "haut-de-cagnes": {
      priceLevel: "Free", priceNote: "Free village walk; cafés from €",
      bestFor: ["Couples", "First-time Riviera", "Local favourite"],
      bookingAdvice: "Walk-in usually fine", transport: "Car or free shuttle",
      parking: "Medium", seasonNote: "Year-round", localFavourite: true, carFreePossible: true,
      romantic: true, hotDay: false, teenagerFriendly: false, grandparentFriendly: true,
      imageAlt: "Haut-de-Cagnes hilltop village and Château Grimaldi above Cagnes-sur-Mer"
    },
    "st-paul-de-vence": {
      priceLevel: "Free", priceNote: "Village free; Fondation Maeght museum ticket",
      bestFor: ["Couples", "First-time Riviera", "Luxury"],
      bookingAdvice: "Book Maeght online in summer", transport: "Car recommended",
      parking: "Difficult", seasonNote: "Best Jun–Sep; busy August midday", bookAhead: true,
      romantic: true, grandparentFriendly: true,
      combineWith: "Fondation Maeght (12 min)",
      imageAlt: "Saint-Paul-de-Vence walled hill village and ramparts near Villa Augflor"
    },
    "cros-de-cagnes": {
      priceLevel: "Free", priceNote: "Public beach; restaurants €€",
      beachType: "Public sandy beach",
      bestFor: ["Families", "Local favourite"],
      bookingAdvice: "Walk-in; book Bistrot de la Marine or Vivo for lunch", transport: "Car recommended",
      parking: "Medium", seasonNote: "Best Jun–Sep", localFavourite: true,
      hotDay: true, teenagerFriendly: true, grandparentFriendly: true,
      imageAlt: "Cros-de-Cagnes beach promenade and waterfront, nearest beach to Villa Augflor"
    },
    "fondation-maeght": {
      priceLevel: "€€", priceNote: "Museum entry ticket (check official site)",
      bestFor: ["Couples", "Rainy day", "First-time Riviera"],
      bookingAdvice: "Book ahead July/August", transport: "Car recommended",
      parking: "Medium", seasonNote: "Year-round", bookAhead: true, rainyDay: true,
      grandparentFriendly: true,
      combineWith: "Saint-Paul-de-Vence village",
      imageAlt: "Fondation Maeght museum courtyard and sculpture garden, Saint-Paul-de-Vence"
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
    "le-caruso": {
      priceLevel: "Closed", priceNote: "Temporarily closed — see Les Remparts or Café Timothé",
      bestFor: ["See alternatives"],
      bookingAdvice: "Closed — try Les Remparts, Café Timothé or Sabaï-sabaï instead",
      transport: "—", parking: "—", seasonNote: "Closed",
      imageAlt: "Provençal burrata and heirloom tomato salad — Saint-Paul-de-Vence dining"
    },
    "plage-mala": {
      priceLevel: "Free", priceNote: "Free cove; coastal path shoes recommended",
      beachType: "Rocky pebble cove",
      bestFor: ["Couples", "Hidden gem"],
      bookingAdvice: "Arrive early in summer", transport: "Car recommended",
      parking: "Difficult", seasonNote: "Best Jun–Sep", hotDay: true, romantic: true,
      imageAlt: "Plage Mala hidden cove Cap d'Ail French Riviera"
    },
    "sabai-sabai": {
      priceLevel: "€", priceNote: "About €20–30 per person",
      bestFor: ["Couples", "Local favourite", "Villa pick"],
      bookingAdvice: "Reserve for terrace in summer; closed Tuesdays",
      transport: "Car recommended", parking: "Difficult", seasonNote: "Year-round",
      localFavourite: true, romantic: true, grandparentFriendly: true,
      combineWith: "Saint-Paul-de-Vence village or Fondation Maeght",
      imageAlt: "Sabaï-sabaï Thai restaurant terrace on Place de la Mairie, Saint-Paul-de-Vence"
    },
    "les-remparts": {
      priceLevel: "€€", priceNote: "About €30–80 per person",
      bestFor: ["Couples", "Romantic", "Villa pick"],
      bookingAdvice: "Reserve terrace for sunset in peak season",
      transport: "Car recommended", parking: "Difficult", seasonNote: "Year-round",
      localFavourite: true, romantic: true, bookAhead: true, grandparentFriendly: true,
      combineWith: "Saint-Paul-de-Vence village or Fondation Maeght",
      imageAlt: "Les Remparts candlelit terrace with valley views at sunset, Saint-Paul-de-Vence"
    },
    "cafe-timothe": {
      priceLevel: "€", priceNote: "About €20–30 per person",
      bestFor: ["Couples", "Local favourite", "Villa pick"],
      bookingAdvice: "Reserve in summer; opens from 10:30",
      transport: "Car recommended", parking: "Difficult", seasonNote: "Year-round",
      localFavourite: true, romantic: true, grandparentFriendly: true,
      combineWith: "Saint-Paul-de-Vence village or Fondation Maeght",
      imageAlt: "Café Timothé organic restaurant interior with dried flowers, Saint-Paul-de-Vence"
    },
    "table-de-kamiya": {
      priceLevel: "€€", priceNote: "About €40–80 per person",
      bestFor: ["Couples", "Local favourite", "Villa pick"],
      bookingAdvice: "Reserve terrace for sunset in peak season",
      transport: "Car recommended", parking: "Medium", seasonNote: "Best Jun–Sep",
      localFavourite: true, romantic: true, bookAhead: true, grandparentFriendly: true,
      combineWith: "Morning swim at Cros beach first",
      imageAlt: "La Table de KAMIYA seafront restaurant, Promenade de la Plage, Cros-de-Cagnes"
    },
    "l-agape": {
      priceLevel: "€€€", priceNote: "About €50–100 per person",
      bestFor: ["Couples", "Local favourite", "Villa pick", "Luxury"],
      bookingAdvice: "Reservations required; reserve terrace for cocktails at sunset",
      transport: "Car recommended", parking: "Medium", seasonNote: "Best Jun–Sep",
      localFavourite: true, romantic: true, bookAhead: true, grandparentFriendly: true,
      combineWith: "Morning swim at Cros beach first",
      imageAlt: "L'Agapè seafront restaurant terrace, Promenade de la Plage, Cros-de-Cagnes"
    },
    "ino-plage": {
      priceLevel: "€€", priceNote: "About €20–60 per person",
      bestFor: ["Couples", "Families", "Villa pick"],
      bookingAdvice: "Reserve pergola terrace in peak season; open daily 10:00–22:30",
      transport: "Car recommended", parking: "Medium", seasonNote: "Best Jun–Sep",
      localFavourite: true, romantic: true, bookAhead: true, hotDay: true,
      teenagerFriendly: true, grandparentFriendly: true,
      combineWith: "Morning swim at Cros beach first",
      imageAlt: "Ino Plage savoury pie and fresh salad at the Cros seafront, Promenade de la Plage"
    },
    "fleur-de-sel": {
      priceLevel: "€€", priceNote: "About €40–60 per person",
      bestFor: ["Couples", "Local favourite", "Villa pick"],
      bookingAdvice: "Reserve by phone; opens evenings; vegan options available",
      transport: "Walkable from villa", parking: "Difficult", seasonNote: "Year-round",
      localFavourite: true, romantic: true, bookAhead: true, carFreePossible: true,
      combineWith: "Haut-de-Cagnes village stroll before dinner",
      imageAlt: "Fleur de Sel restaurant, Montée de la Bourgade, Haut-de-Cagnes"
    },
    "table-de-pierre": {
      priceLevel: "€€€€", priceNote: "Tasting menus from ~€99; reserve well ahead",
      bestFor: ["Couples", "Luxury", "Villa pick"],
      bookingAdvice: "Reservations required — TheFork or hotel; Tue–Sat dinner",
      transport: "Car recommended", parking: "Easy", seasonNote: "Year-round",
      localFavourite: true, romantic: true, bookAhead: true, grandparentFriendly: true,
      combineWith: "Saint-Paul-de-Vence village or Fondation Maeght",
      imageAlt: "La Table de Pierre elegant dining room with pink velvet chairs, Domaine du Mas de Pierre"
    },
    "polygone": {
      priceLevel: "€", priceNote: "Shopping varies; cinema ticket",
      bestFor: ["Families", "Rainy day", "Teenagers"],
      bookingAdvice: "Walk-in; book cinema online", transport: "Car recommended",
      parking: "Easy", seasonNote: "Year-round", rainyDay: true,
      teenagerFriendly: true, grandparentFriendly: true,
      imageAlt: "Polygone Riviera shopping promenade and Le Guetteur sculpture, Cagnes-sur-Mer"
    },
    "aquasplash": {
      priceLevel: "€€", priceNote: "Day ticket; summer only",
      bestFor: ["Families", "Teenagers"],
      bookingAdvice: "Book online in peak season", transport: "Car recommended",
      parking: "Easy", seasonNote: "Jul–Aug", hotDay: true,
      teenagerFriendly: true, grandparentFriendly: true,
      imageAlt: "Aquasplash Side Winder water slide, Antibes"
    },
    "speed-park": {
      priceLevel: "€€", priceNote: "Activity passes vary",
      bestFor: ["Teenagers", "Families", "Rainy day"],
      bookingAdvice: "Book karting ahead in school holidays", transport: "Car recommended",
      parking: "Easy", seasonNote: "Year-round", rainyDay: true,
      teenagerFriendly: true,
      imageAlt: "Speed Park bowling alleys with neon lanes near Cagnes-sur-Mer"
    },
    "musee-renoir": {
      priceLevel: "€€", priceNote: "Museum ticket",
      bestFor: ["Couples", "First-time Riviera", "Rainy day"],
      bookingAdvice: "Closed Tuesdays", transport: "Car or walk from villa area",
      parking: "Easy", seasonNote: "Year-round", rainyDay: true, grandparentFriendly: true,
      imageAlt: "Musée Renoir villa and garden, Cagnes-sur-Mer"
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
    var combineMap = (typeof global !== "undefined" && global.AREA_COMBINE_WITH) || {};
    if (combineMap[p.id]) enriched.combineWith = combineMap[p.id];
    enriched.duration = p.duration || enriched.duration || "Half day";
    enriched.seasonNote = (OVERRIDES[p.id] && OVERRIDES[p.id].seasonNote) || enriched.seasonNote;
    return merge(p, enriched);
  };

  global.PRICE_ORDER = PRICE_ORDER;
  global.PARKING_ORDER = PARKING_ORDER;
})(typeof window !== "undefined" ? window : global);
