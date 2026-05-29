/* Villa Augflor — Area Guide
 * Concierge-grade local guide: structured data model + dynamic filtering,
 * sorting, Google Maps / route links, and SEO ItemList schema.
 *
 * Distances & drive times are measured from the villa's Cagnes-sur-Mer /
 * Villeneuve-Loubet base (off-peak driving). Ratings are indicative Google
 * ratings at time of writing — always confirm seasonal hours on the official site.
 *
 * To add a real photo to any card, set its `image` field to a local path
 * (e.g. "images/eze-village.jpg"); otherwise an elegant category tile is shown.
 */
(function () {
  "use strict";

  var ORIGIN = "Cagnes-sur-Mer, France";

  /* ---- Category metadata (label + thin-line icon + duotone tile) ---- */
  var CATEGORIES = {
    destinations: { label: "Must-see towns", tile: "linear-gradient(135deg,#3d7a8a,#2d5f6d)" },
    villages:     { label: "Hill villages",  tile: "linear-gradient(135deg,#b8976a,#8a6f47)" },
    beaches:      { label: "Beaches",        tile: "linear-gradient(135deg,#5a9aaa,#3d7a8a)" },
    family:       { label: "Family",         tile: "linear-gradient(135deg,#c98a5a,#a85f3a)" },
    watersports:  { label: "Water sports",   tile: "linear-gradient(135deg,#3d8a82,#1f5f57)" },
    museums:      { label: "Museums & culture", tile: "linear-gradient(135deg,#6a6f8a,#454a6d)" },
    wine:         { label: "Wine & vineyards", tile: "linear-gradient(135deg,#8a4a5a,#5f2d3a)" },
    food:         { label: "Foodie guide",   tile: "linear-gradient(135deg,#b8766a,#8a473d)" },
    nature:       { label: "Nature & hiking", tile: "linear-gradient(135deg,#5f8a4a,#3a5f2d)" },
    daytrips:     { label: "Day trips",      tile: "linear-gradient(135deg,#4a6f8a,#2d4a5f)" },
    shopping:     { label: "Shopping",       tile: "linear-gradient(135deg,#8a7a6a,#5f5347)" },
    nightlife:    { label: "Nightlife",      tile: "linear-gradient(135deg,#3a3a5a,#1c1a2e)" }
  };

  var ICONS = {
    destinations: "M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6",
    villages: "M4 21V10l5-4 5 4M14 21V8l5-3 1 1v15M8 14h2M8 17h2",
    beaches: "M2 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0M12 14V4M12 4c3 0 5 2 5 5H7c0-3 2-5 5-5z",
    family: "M9 7a2 2 0 11-4 0 2 2 0 014 0zM19 7a2 2 0 11-4 0 2 2 0 014 0zM7 21v-6M17 21v-6M5 13h4l-2 4M15 13h4l-2 4",
    watersports: "M3 17c2 1 4 1 6 0s4-1 6 0 4 1 6 0M5 14l7-9 7 9M12 5v9",
    museums: "M3 21h18M4 21V9l8-5 8 5v12M8 21v-7M12 21v-7M16 21v-7",
    wine: "M8 3h8l-1 7a3 3 0 01-6 0L8 3zM12 13v6M9 21h6",
    food: "M5 3v8a2 2 0 002 2h0v8M7 3v6M9 3v6M19 3c-2 0-3 2-3 5s1 4 1 4v9",
    nature: "M12 22V9M7 13l5-9 5 9zM5 18l7-12 7 12z",
    daytrips: "M3 12h18M12 3a15 15 0 010 18M12 3a15 15 0 000 18M4 8h16M4 16h16",
    shopping: "M6 8h12l-1 12H7L6 8zM9 8V6a3 3 0 016 0v2",
    nightlife: "M5 4h14l-7 9zM12 13v6M8 21h8"
  };

  function enc(s) { return encodeURIComponent(s); }
  function mapsLink(q) { return "https://www.google.com/maps/search/?api=1&query=" + enc(q); }
  function routeLink(q) {
    return "https://www.google.com/maps/dir/?api=1&origin=" + enc(ORIGIN) + "&destination=" + enc(q);
  }

  /* CC-licensed destination photos (Wikimedia Commons) — assets/photos/area/ */
  var IMAGES = {
    "antibes-market": "assets/photos/area/antibes-market.jpg",
    "antibes": "assets/photos/area/antibes.jpg",
    "aquasplash": "assets/photos/area/aquasplash.jpg",
    "biot": "assets/photos/area/biot.jpg",
    "boat-charter": "assets/photos/area/boat-charter.jpg",
    "cannes-beach-clubs": "assets/photos/area/cannes-beach-clubs.jpg",
    "cannes": "assets/photos/area/cannes.jpg",
    "cap-ferrat-walk": "assets/photos/area/cap-ferrat-walk.jpg",
    "cap3000": "assets/photos/area/cap3000.jpg",
    "casino-monte-carlo": "assets/photos/area/casino-monte-carlo.jpg",
    "coaraze": "assets/photos/area/coaraze.jpg",
    "colombe-dor": "assets/photos/area/colombe-dor.jpg",
    "cours-saleya": "assets/photos/area/cours-saleya.jpg",
    "cros-de-cagnes": "assets/photos/area/cros-de-cagnes.jpg",
    "diving": "assets/photos/area/diving.jpg",
    "domaine-toasc": "assets/photos/area/domaine-toasc.jpg",
    "esterel": "assets/photos/area/esterel.jpg",
    "eze-sunset-dining": "assets/photos/area/eze-sunset-dining.jpg",
    "eze-town": "assets/photos/area/eze-town.jpg",
    "fondation-maeght": "assets/photos/area/fondation-maeght.jpg",
    "gorges-du-loup": "assets/photos/area/gorges-du-loup.jpg",
    "gourdon": "assets/photos/area/gourdon.jpg",
    "grasse": "assets/photos/area/grasse.jpg",
    "haut-de-cagnes": "assets/photos/area/haut-de-cagnes.jpg",
    "italy-trip": "assets/photos/area/italy-trip.jpg",
    "juan-les-pins": "assets/photos/area/juan-les-pins.jpg",
    "juan-nightlife": "assets/photos/area/juan-nightlife.jpg",
    "la-garoupe": "assets/photos/area/la-garoupe.jpg",
    "la-pesquiere": "assets/photos/area/la-pesquiere.jpg",
    "larvotto": "assets/photos/area/larvotto.jpg",
    "lerins": "assets/photos/area/lerins.jpg",
    "louis-xv": "assets/photos/area/louis-xv.jpg",
    "mamac": "assets/photos/area/mamac.jpg",
    "menton": "assets/photos/area/menton.jpg",
    "mercantour": "assets/photos/area/mercantour.jpg",
    "mirazur": "assets/photos/area/mirazur.jpg",
    "monaco": "assets/photos/area/monaco.jpg",
    "mont-boron": "assets/photos/area/mont-boron.jpg",
    "mougins": "assets/photos/area/mougins.jpg",
    "musee-chagall": "assets/photos/area/musee-chagall.jpg",
    "musee-leger": "assets/photos/area/musee-leger.jpg",
    "musee-matisse": "assets/photos/area/musee-matisse.jpg",
    "musee-oceano-family": "assets/photos/area/musee-oceano-family.jpg",
    "musee-picasso": "assets/photos/area/musee-picasso.jpg",
    "musee-renoir": "assets/photos/area/musee-renoir.jpg",
    "nice-rooftops": "assets/photos/area/nice-rooftops.jpg",
    "nice": "assets/photos/area/nice.jpg",
    "paddleboard": "assets/photos/area/paddleboard.jpg",
    "paloma": "assets/photos/area/paloma.jpg",
    "parc-phoenix": "assets/photos/area/parc-phoenix.jpg",
    "plage-mala": "assets/photos/area/plage-mala.jpg",
    "plage-passable": "assets/photos/area/plage-passable.jpg",
    "polygone": "assets/photos/area/polygone.jpg",
    "porquerolles": "assets/photos/area/porquerolles.jpg",
    "saint-tropez": "assets/photos/area/saint-tropez.jpg",
    "sentier-cap-antibes": "assets/photos/area/sentier-cap-antibes.jpg",
    "socca-nice": "assets/photos/area/socca-nice.jpg",
    "st-paul-de-vence": "assets/photos/area/st-paul-de-vence.jpg",
    "tourrettes-sur-loup": "assets/photos/area/tourrettes-sur-loup.jpg",
    "train-pignes": "assets/photos/area/train-pignes.jpg",
    "valbonne": "assets/photos/area/valbonne.jpg",
    "vence": "assets/photos/area/vence.jpg",
    "verdon": "assets/photos/area/verdon.jpg",
    "villa-ephrussi": "assets/photos/area/villa-ephrussi.jpg",
    "villefranche": "assets/photos/area/villefranche.jpg",
  };

  /* ---- The data model ---- */
  /* family / luxury / gem scored 1–5. drive = minutes by car from the villa. */
  var PLACES = [
    /* ===================== MUST-SEE TOWNS ===================== */
    { id: "nice", name: "Nice", cat: "destinations", area: "13 km",
      blurb: "The Riviera's capital — Promenade des Anglais, the ochre old town and the Cours Saleya market.",
      why: "The most complete day out: beach, baroque streets, world-class museums and the best market on the coast, all walkable.",
      rating: 4.7, reviews: 60000, km: 13, drive: 25, walk: null, cycle: null,
      website: "https://www.explore-nicecotedazur.com/en/", maps: "Vieux Nice, Nice, France",
      duration: "Full day", best: "Morning market, then sunset on the Prom", season: ["spring","summer","autumn","winter"],
      family: 5, luxury: 4, gem: 1, tags: ["Old town","Market","Beach","Walkable"] },

    { id: "antibes", name: "Antibes & Juan-les-Pins", cat: "destinations", area: "11 km",
      blurb: "Ramparts, the best Provençal market on the coast, the Picasso Museum and the superyacht harbour.",
      why: "Our nearest 'real' town — atmospheric old streets, a daily covered market and Juan-les-Pins' sandy bay.",
      rating: 4.6, reviews: 25000, km: 11, drive: 20, walk: null, cycle: 45,
      website: "https://www.antibesjuanlespins.com/en", maps: "Vieil Antibes, Antibes, France",
      duration: "Half to full day", best: "Market mornings (Tue–Sun until 1pm)", season: ["spring","summer","autumn","winter"],
      family: 5, luxury: 4, gem: 2, tags: ["Old town","Market","Yachts","Beach"] },

    { id: "cannes", name: "Cannes & La Croisette", cat: "destinations", area: "23 km",
      blurb: "Palais des Festivals, the Croisette beach clubs and the boat to the Lérins islands.",
      why: "Glamour, designer shopping and the jumping-off point for the monastery island of Saint-Honorat.",
      rating: 4.5, reviews: 40000, km: 23, drive: 35, walk: null, cycle: null,
      website: "https://www.cannes-destination.com/", maps: "La Croisette, Cannes, France",
      duration: "Full day", best: "Spring & early autumn (calmer than festival season)", season: ["spring","summer","autumn"],
      family: 4, luxury: 5, gem: 1, tags: ["Glamour","Beach clubs","Shopping","Islands"] },

    { id: "monaco", name: "Monaco & Monte-Carlo", cat: "destinations", area: "32 km",
      blurb: "The Casino, the Prince's Palace, the F1 circuit, the Oceanographic Museum and superyachts.",
      why: "A whole principality in an afternoon — old town on the rock, gardens, and the most famous casino in the world.",
      rating: 4.6, reviews: 50000, km: 32, drive: 45, walk: null, cycle: null,
      website: "https://www.visitmonaco.com/en", maps: "Place du Casino, Monaco",
      duration: "Full day", best: "Take the coastal train; arrive mid-morning", season: ["spring","summer","autumn","winter"],
      family: 4, luxury: 5, gem: 1, tags: ["Casino","Palace","Yachts","Train-friendly"] },

    { id: "eze-town", name: "Èze", cat: "destinations", area: "25 km",
      blurb: "A stone eagle's-nest village perched 427 m above the sea, with the cliff-top Jardin Exotique.",
      why: "The single best panoramic view on the coast, plus the Fragonard perfume factory at the foot of the village.",
      rating: 4.6, reviews: 18000, km: 25, drive: 35, walk: null, cycle: null,
      website: "https://www.eze-tourisme.com/en/", maps: "Èze Village, France",
      duration: "Half day", best: "Late afternoon for golden light", season: ["spring","summer","autumn","winter"],
      family: 3, luxury: 5, gem: 3, tags: ["Panorama","Perfume","Perched village"] },

    { id: "menton", name: "Menton", cat: "destinations", area: "45 km",
      blurb: "The 'pearl of France' on the Italian border — lemon groves, pastel facades and the Cocteau museum.",
      why: "The warmest microclimate on the coast and a softer, less touristy old town; pair it with a hop into Italy.",
      rating: 4.6, reviews: 12000, km: 45, drive: 55, walk: null, cycle: null,
      website: "https://www.menton-riviera-merveilles.fr/en/", maps: "Vieille Ville, Menton, France",
      duration: "Full day", best: "Feb (Lemon Festival) or quiet shoulder months", season: ["spring","autumn","winter"],
      family: 4, luxury: 3, gem: 3, tags: ["Lemon groves","Old town","Italian border"] },

    { id: "villefranche", name: "Villefranche-sur-Mer", cat: "destinations", area: "20 km",
      blurb: "A deep natural harbour with a perfect crescent of ochre houses and a calm swimming beach.",
      why: "Arguably the prettiest bay on the Riviera — sheltered water, fishing-port charm, easy by train.",
      rating: 4.7, reviews: 9000, km: 20, drive: 30, walk: null, cycle: null,
      website: "https://www.villefranche-sur-mer.com/en/", maps: "Villefranche-sur-Mer, France",
      duration: "Half day", best: "Mornings for swimming, golden hour for photos", season: ["spring","summer","autumn"],
      family: 5, luxury: 4, gem: 3, tags: ["Bay","Swimming","Train-friendly","Photogenic"] },

    { id: "grasse", name: "Grasse", cat: "destinations", area: "28 km",
      blurb: "The world capital of perfume, with the Fragonard, Galimard and Molinard houses.",
      why: "Create your own scent in a perfumer's workshop — a memorable rainy-day or hinterland half-day.",
      rating: 4.4, reviews: 10000, km: 28, drive: 45, walk: null, cycle: null,
      website: "https://www.paysdegrassetourisme.fr/en/", maps: "Grasse, France",
      duration: "Half day", best: "Year-round; great for cooler or wet days", season: ["spring","summer","autumn","winter"],
      family: 4, luxury: 3, gem: 3, tags: ["Perfume","Workshops","Rainy-day"] },

    { id: "saint-tropez", name: "Saint-Tropez", cat: "destinations", area: "95 km",
      blurb: "The legendary yacht harbour, Place des Lices market and the Pampelonne beach clubs.",
      why: "Bucket-list glamour. Best as a boat day or an early start — go via the A8 and avoid the gulf traffic at peak.",
      rating: 4.5, reviews: 22000, km: 95, drive: 95, walk: null, cycle: null,
      website: "https://www.sainttropeztourisme.com/en/", maps: "Saint-Tropez, France",
      duration: "Full day", best: "June or September; leave by 8am", season: ["spring","summer","autumn"],
      family: 3, luxury: 5, gem: 2, tags: ["Yachts","Beach clubs","Glamour","Long drive"] },

    /* ===================== HILL VILLAGES ===================== */
    { id: "haut-de-cagnes", name: "Haut-de-Cagnes", cat: "villages", area: "3 km",
      blurb: "Our own medieval hilltop village — candlelit lanes, the Grimaldi château and terrace restaurants.",
      why: "Five minutes away and the easiest 'wow' evening: take the free shuttle, dine on the square, walk it off.",
      rating: 4.6, reviews: 3500, km: 3, drive: 8, walk: 40, cycle: 12,
      website: "https://www.cagnes-tourisme.com/en/", maps: "Haut-de-Cagnes, Cagnes-sur-Mer, France",
      duration: "Evening", best: "At dusk, for dinner", season: ["spring","summer","autumn","winter"],
      family: 4, luxury: 4, gem: 4, tags: ["Closest","Château","Dinner","Free shuttle"] },

    { id: "st-paul-de-vence", name: "Saint-Paul-de-Vence", cat: "villages", area: "10 km",
      blurb: "A 16th-century walled village of galleries, ramparts and the famous Colombe d'Or.",
      why: "The most beautiful village within easy reach, and home to the world-class Fondation Maeght art foundation.",
      rating: 4.6, reviews: 30000, km: 10, drive: 20, walk: null, cycle: 35,
      website: "https://www.saint-pauldevence.com/en/", maps: "Saint-Paul-de-Vence, France",
      duration: "Half day", best: "Arrive before 10am or after 5pm to beat crowds", season: ["spring","summer","autumn","winter"],
      family: 3, luxury: 5, gem: 3, tags: ["Walled village","Art","Galleries"] },

    { id: "vence", name: "Vence & the Matisse Chapel", cat: "villages", area: "12 km",
      blurb: "A lively walled town with Matisse's Chapelle du Rosaire, his final masterpiece.",
      why: "Quieter than Saint-Paul, with a real working centre and one of the great pieces of 20th-century art.",
      rating: 4.5, reviews: 8000, km: 12, drive: 22, walk: null, cycle: null,
      website: "https://www.vence-tourisme.com/en/", maps: "Vence, France",
      duration: "Half day", best: "Check chapel hours (limited)", season: ["spring","summer","autumn","winter"],
      family: 3, luxury: 4, gem: 3, tags: ["Matisse","Walled town","Less touristy"] },

    { id: "mougins", name: "Mougins", cat: "villages", area: "18 km",
      blurb: "A snail-shell village of art galleries and gastronomy where Picasso spent his final years.",
      why: "A refined, food-led village — superb restaurants and a classic-art museum, with none of the coach crowds.",
      rating: 4.5, reviews: 4000, km: 18, drive: 28, walk: null, cycle: null,
      website: "https://www.mougins-tourisme.com/en/", maps: "Mougins Village, France",
      duration: "Half day", best: "Lunch or dinner", season: ["spring","summer","autumn","winter"],
      family: 3, luxury: 5, gem: 4, tags: ["Gastronomy","Art","Quiet"] },

    { id: "biot", name: "Biot", cat: "villages", area: "8 km",
      blurb: "A hilltop village famous for bubbled glassware and the Fernand Léger national museum.",
      why: "Watch glass-blowers at the Verrerie, then a vivid mosaic-art museum — a great, close half-day.",
      rating: 4.4, reviews: 5000, km: 8, drive: 15, walk: null, cycle: 25,
      website: "https://www.biot-tourisme.com/en/", maps: "Biot Village, France",
      duration: "Half day", best: "Combine with the glassworks tour", season: ["spring","summer","autumn","winter"],
      family: 4, luxury: 3, gem: 4, tags: ["Glassblowing","Léger museum","Close"] },

    { id: "tourrettes-sur-loup", name: "Tourrettes-sur-Loup", cat: "villages", area: "20 km",
      blurb: "The 'city of violets' — a fortress village ringed by terraced flower fields.",
      why: "Artisan workshops, no crowds and the scented Gorges du Loup on the doorstep.",
      rating: 4.6, reviews: 2500, km: 20, drive: 32, walk: null, cycle: null,
      website: "https://www.tourrettessurloup.com/en/", maps: "Tourrettes-sur-Loup, France",
      duration: "Half day", best: "March (violet season)", season: ["spring","autumn","winter"],
      family: 3, luxury: 3, gem: 5, tags: ["Violets","Artisans","Hidden gem"] },

    { id: "gourdon", name: "Gourdon", cat: "villages", area: "35 km",
      blurb: "An eagle's-nest village clinging to a cliff 760 m above the Loup valley.",
      why: "One of France's 'most beautiful villages', with a jaw-dropping view all the way to the sea.",
      rating: 4.5, reviews: 4500, km: 35, drive: 50, walk: null, cycle: null,
      website: "https://www.gourdon-tourisme.fr/", maps: "Gourdon, Alpes-Maritimes, France",
      duration: "Half day", best: "Pair with the Gorges du Loup drive", season: ["spring","summer","autumn"],
      family: 3, luxury: 3, gem: 5, tags: ["Clifftop","Panorama","Hinterland"] },

    { id: "valbonne", name: "Valbonne", cat: "villages", area: "18 km",
      blurb: "A rare grid-plan Provençal village with arcaded squares and an easy, leafy charm.",
      why: "Friday market, relaxed café terraces and a local, unhurried feel away from the coast.",
      rating: 4.5, reviews: 2000, km: 18, drive: 28, walk: null, cycle: null,
      website: "https://www.valbonne-sophiaantipolis-tourisme.com/", maps: "Valbonne, France",
      duration: "Half day", best: "Friday morning market", season: ["spring","summer","autumn","winter"],
      family: 4, luxury: 3, gem: 4, tags: ["Market","Relaxed","Squares"] },

    { id: "coaraze", name: "Coaraze", cat: "villages", area: "40 km",
      blurb: "The 'village of the sun' — a tiny, vertical hamlet decorated with painted sundials.",
      why: "A true off-the-radar hinterland gem for travellers who want the Riviera without a single tour bus.",
      rating: 4.6, reviews: 900, km: 40, drive: 60, walk: null, cycle: null,
      website: "https://www.coaraze.fr/", maps: "Coaraze, France",
      duration: "Half day", best: "Combine with a hinterland drive", season: ["spring","summer","autumn"],
      family: 2, luxury: 2, gem: 5, tags: ["Off-grid","Sundials","Hidden gem"] },

    { id: "peillon", name: "Peillon", cat: "villages", area: "38 km",
      blurb: "A near-untouched perched village of vaulted passages and steep stone stairways.",
      why: "One of the most authentic medieval villages in the Alpes-Maritimes — and almost nobody goes.",
      rating: 4.6, reviews: 1100, km: 38, drive: 50, walk: null, cycle: null,
      website: "https://www.paysdespaillons.fr/", maps: "Peillon Village, France",
      duration: "Half day", best: "Spring & autumn", season: ["spring","autumn"],
      family: 2, luxury: 2, gem: 5, tags: ["Medieval","Authentic","Hidden gem"] },

    /* ===================== BEACHES ===================== */
    { id: "cros-de-cagnes", name: "Cros-de-Cagnes Beach", cat: "beaches", area: "3 km",
      blurb: "Our local fishermen's beach — calm water, beach restaurants and seafront strolling.",
      why: "The closest swim to the villa: park, swim, lunch on the front, home for a siesta.",
      rating: 4.3, reviews: 3000, km: 3, drive: 8, walk: 35, cycle: 10,
      website: null, maps: "Plage du Cros-de-Cagnes, Cagnes-sur-Mer, France",
      duration: "Half day", best: "Morning, before the afternoon breeze", season: ["spring","summer","autumn"],
      family: 5, luxury: 3, gem: 3, tags: ["Closest","Seafood","Calm water"] },

    { id: "la-garoupe", name: "Plage de la Garoupe", cat: "beaches", area: "14 km",
      blurb: "The chic Cap d'Antibes sand beach, with the legendary Keller beach club.",
      why: "Sheltered, clear water and the prettiest sand near us — plus the Cap coastal path right beside it.",
      rating: 4.5, reviews: 4000, km: 14, drive: 25, walk: null, cycle: null,
      website: null, maps: "Plage de la Garoupe, Antibes, France",
      duration: "Half to full day", best: "Book a beach-club lounger in summer", season: ["spring","summer","autumn"],
      family: 4, luxury: 5, gem: 3, tags: ["Sand","Beach club","Cap d'Antibes"] },

    { id: "plage-passable", name: "Plage de Passable", cat: "beaches", area: "22 km",
      blurb: "A small, sheltered Cap-Ferrat beach looking straight across to Villefranche.",
      why: "Calm, shallow and family-perfect, with a lovely restaurant — book loungers ahead in season.",
      rating: 4.4, reviews: 1800, km: 22, drive: 35, walk: null, cycle: null,
      website: null, maps: "Plage de Passable, Saint-Jean-Cap-Ferrat, France",
      duration: "Half day", best: "Reserve sun-beds in July/August", season: ["spring","summer","autumn"],
      family: 5, luxury: 4, gem: 4, tags: ["Sheltered","Family","Cap Ferrat"] },

    { id: "paloma", name: "Paloma Beach", cat: "beaches", area: "25 km",
      blurb: "A stylish Cap-Ferrat cove with a renowned beach club and crystal water.",
      why: "Glamorous yet relaxed, on the gorgeous Saint-Hospice peninsula walk — a classic Riviera beach day.",
      rating: 4.4, reviews: 1500, km: 25, drive: 40, walk: null, cycle: null,
      website: "https://www.paloma-beach.com/en/", maps: "Paloma Beach, Saint-Jean-Cap-Ferrat, France",
      duration: "Full day", best: "Reserve in advance", season: ["summer"],
      family: 4, luxury: 5, gem: 3, tags: ["Beach club","Glamour","Cove"] },

    { id: "plage-mala", name: "Plage Mala", cat: "beaches", area: "30 km",
      blurb: "A hidden turquoise cove below Cap d'Ail, reached by a stair path through the pines.",
      why: "The closest thing to a secret tropical bay on the Riviera — worth the steps down.",
      rating: 4.6, reviews: 3500, km: 30, drive: 45, walk: null, cycle: null,
      website: null, maps: "Plage Mala, Cap-d'Ail, France",
      duration: "Half day", best: "Arrive early; small and popular", season: ["summer"],
      family: 3, luxury: 4, gem: 5, tags: ["Hidden cove","Turquoise","Snorkelling"] },

    { id: "juan-les-pins", name: "Juan-les-Pins Beaches", cat: "beaches", area: "13 km",
      blurb: "A long, lively sandy bay with beach clubs, pines and a buzzy resort strip.",
      why: "Proper soft sand and the easiest family swim with full amenities and gentle water.",
      rating: 4.3, reviews: 6000, km: 13, drive: 22, walk: null, cycle: null,
      website: null, maps: "Plage de Juan-les-Pins, Antibes, France",
      duration: "Half to full day", best: "Summer; jazz festival in July", season: ["summer"],
      family: 5, luxury: 3, gem: 2, tags: ["Sandy","Family","Beach clubs"] },

    { id: "larvotto", name: "Larvotto Beach, Monaco", cat: "beaches", area: "32 km",
      blurb: "Monaco's renovated public beach, with smart promenade dining and clear shallow water.",
      why: "Free, clean and easy to combine with a Monaco day — surprisingly relaxed for the principality.",
      rating: 4.3, reviews: 5000, km: 32, drive: 45, walk: null, cycle: null,
      website: null, maps: "Larvotto Beach, Monaco",
      duration: "Half day", best: "Pair with the Oceanographic Museum", season: ["summer"],
      family: 4, luxury: 4, gem: 2, tags: ["Public","Promenade","Monaco"] },

    /* ===================== FAMILY ===================== */
    { id: "aquasplash", name: "Aquasplash Antibes", cat: "family", area: "9 km",
      blurb: "A big summer water park of slides, lazy rivers and splash zones beside the old Marineland site.",
      why: "The region's top water-park day for kids — ten minutes away and open through the summer season.",
      rating: 4.1, reviews: 4000, km: 9, drive: 15, walk: null, cycle: null,
      website: "https://www.aquasplash.fr/", maps: "Aquasplash, Antibes, France",
      duration: "Full day", best: "July–August (summer only)", season: ["summer"],
      family: 5, luxury: 1, gem: 2, tags: ["Water park","Kids","Summer"] },

    { id: "parc-phoenix", name: "Parc Phoenix, Nice", cat: "family", area: "12 km",
      blurb: "A botanical park with a huge tropical greenhouse, lakes, birds and a small zoo.",
      why: "Affordable, shady and easy with little ones — animals, play and picnics in one gentle loop.",
      rating: 4.4, reviews: 9000, km: 12, drive: 22, walk: null, cycle: null,
      website: "https://www.parc-phoenix.org/", maps: "Parc Phoenix, Nice, France",
      duration: "Half day", best: "Morning, especially with toddlers", season: ["spring","summer","autumn","winter"],
      family: 5, luxury: 2, gem: 3, tags: ["Animals","Gardens","Low cost"] },

    { id: "marineland-note", name: "Marineland (closed 2025)", cat: "family", area: "9 km",
      blurb: "The former marine-animal park in Antibes closed permanently in January 2025.",
      why: "We list it so you're not caught out by old guides — for marine life, head to Monaco's Oceanographic Museum or Aquasplash next door.",
      rating: null, reviews: null, km: 9, drive: 15, walk: null, cycle: null,
      website: null, maps: "Marineland, Antibes, France",
      duration: "—", best: "Closed — see alternatives", season: ["spring","summer","autumn","winter"],
      family: 0, luxury: 0, gem: 0, tags: ["Closed","See alternatives"] },

    { id: "musee-oceano-family", name: "Oceanographic Museum, Monaco", cat: "family", area: "32 km",
      blurb: "A cliff-top marine museum with a shark lagoon, 90 tanks and a kids' touch pool.",
      why: "The best wet-weather or with-children day on the coast — and a stunning building in its own right.",
      rating: 4.4, reviews: 30000, km: 32, drive: 45, walk: null, cycle: null,
      website: "https://www.oceano.mc/en/", maps: "Musée Océanographique de Monaco",
      duration: "Half day", best: "Buy timed tickets online", season: ["spring","summer","autumn","winter"],
      family: 5, luxury: 4, gem: 3, tags: ["Aquarium","Rainy-day","Iconic"] },

    { id: "azur-park", name: "Azur Park, Villeneuve-Loubet", cat: "family", area: "4 km",
      blurb: "A seafront funfair with rides, trampolines, go-karts and arcade games.",
      why: "Five minutes away and open into the evening — an easy crowd-pleaser when the kids need a treat.",
      rating: 4.2, reviews: 2500, km: 4, drive: 10, walk: null, cycle: 15,
      website: null, maps: "Azur Park, Villeneuve-Loubet, France",
      duration: "Evening", best: "Summer evenings", season: ["summer"],
      family: 5, luxury: 1, gem: 2, tags: ["Funfair","Closest","Evenings"] },

    { id: "gorges-loup-canyon", name: "Canyoning, Gorges du Loup", cat: "family", area: "30 km",
      blurb: "Guided canyoning, natural pools and waterfalls in the cool limestone gorge.",
      why: "A genuine adventure day for active families and teens, cool even in August.",
      rating: 4.7, reviews: 1200, km: 30, drive: 45, walk: null, cycle: null,
      website: null, maps: "Gorges du Loup, France",
      duration: "Half day", best: "May–September with a licensed guide", season: ["summer"],
      family: 4, luxury: 2, gem: 4, tags: ["Adventure","Waterfalls","Guided"] },

    { id: "train-pignes", name: "Train des Pignes", cat: "family", area: "13 km",
      blurb: "A century-old narrow-gauge railway climbing from Nice into the dramatic back-country.",
      why: "A relaxed scenic adventure — let someone else drive while the mountains roll past the window.",
      rating: 4.6, reviews: 2000, km: 13, drive: 25, walk: null, cycle: null,
      website: "https://www.traindespignes.fr/", maps: "Gare de Nice CP, Nice, France",
      duration: "Half to full day", best: "Spring & autumn", season: ["spring","summer","autumn"],
      family: 4, luxury: 3, gem: 4, tags: ["Scenic train","No driving","Mountains"] },

    /* ===================== WATER SPORTS ===================== */
    { id: "boat-charter", name: "Private Boat & Yacht Charter", cat: "watersports", area: "Antibes 11 km",
      blurb: "Skippered day boats, sailing yachts and motor yachts from Antibes — Europe's superyacht capital.",
      why: "The definitive Riviera day: swim off the Lérins or Cap, lunch on board, golden-hour return. Arranged on request.",
      rating: 4.8, reviews: 800, km: 11, drive: 20, walk: null, cycle: null,
      website: "https://wa.me/33623777333", maps: "Port Vauban, Antibes, France",
      duration: "Half to full day", best: "Book ahead in July/August", season: ["spring","summer","autumn"],
      family: 4, luxury: 5, gem: 3, tags: ["On request","Yachts","Signature day"] },

    { id: "jet-ski", name: "Jet Ski & Parasailing", cat: "watersports", area: "Antibes 13 km",
      blurb: "Guided jet-ski safaris along the Cap and tandem parasailing over the bay.",
      why: "The adrenaline hit — a guided jet-ski tour of the Cap d'Antibes coves is unforgettable.",
      rating: 4.6, reviews: 600, km: 13, drive: 22, walk: null, cycle: null,
      website: null, maps: "Jet ski Juan-les-Pins, France",
      duration: "1–2 hours", best: "Calm mornings, summer", season: ["summer"],
      family: 3, luxury: 4, gem: 3, tags: ["Adrenaline","Guided","Summer"] },

    { id: "paddleboard", name: "Paddleboard & Kayak Hire", cat: "watersports", area: "3 km",
      blurb: "SUP and sea-kayak rental right on our local Cros-de-Cagnes / Villeneuve seafront.",
      why: "The easiest, closest water sport — paddle the calm morning sea minutes from the villa.",
      rating: 4.5, reviews: 400, km: 3, drive: 8, walk: 35, cycle: 10,
      website: null, maps: "Paddle Cros-de-Cagnes, France",
      duration: "1–2 hours", best: "Early morning, flat water", season: ["spring","summer","autumn"],
      family: 5, luxury: 2, gem: 3, tags: ["Closest","Easy","Calm water"] },

    { id: "diving", name: "Scuba Diving & Snorkelling", cat: "watersports", area: "Antibes 13 km",
      blurb: "PADI dive centres and snorkelling trips around the Cap d'Antibes and Lérins reefs.",
      why: "Clear, life-rich Mediterranean water — try-dives for beginners, certified dives for the experienced.",
      rating: 4.7, reviews: 700, km: 13, drive: 22, walk: null, cycle: null,
      website: null, maps: "Plongée Antibes, France",
      duration: "Half day", best: "June–October (warmest water)", season: ["summer","autumn"],
      family: 3, luxury: 3, gem: 4, tags: ["Diving","Snorkelling","Reefs"] },

    { id: "sailing-school", name: "Sailing & Catamaran Trips", cat: "watersports", area: "Antibes 11 km",
      blurb: "Catamaran day-sails, sunset cruises and RYA-style sailing lessons from the harbours.",
      why: "Learn the ropes or just lie back with a glass of rosé as the coast slides by under sail.",
      rating: 4.7, reviews: 500, km: 11, drive: 20, walk: null, cycle: null,
      website: null, maps: "Catamaran Antibes, France",
      duration: "Half day to full day", best: "Sunset sails in summer", season: ["spring","summer","autumn"],
      family: 4, luxury: 4, gem: 3, tags: ["Sailing","Catamaran","Sunset"] },

    /* ===================== MUSEUMS & CULTURE ===================== */
    { id: "musee-renoir", name: "Musée Renoir, Cagnes", cat: "museums", area: "2 km",
      blurb: "Renoir's own house and olive-grove garden, kept as it was, with original works and studio.",
      why: "Our closest cultural gem — the painter's last home, two minutes away and beautifully peaceful.",
      rating: 4.5, reviews: 2500, km: 2, drive: 6, walk: 25, cycle: 8,
      website: "https://www.cagnes-tourisme.com/en/musee-renoir/", maps: "Musée Renoir, Cagnes-sur-Mer, France",
      duration: "1–2 hours", best: "Closed Tuesdays; quiet mornings", season: ["spring","summer","autumn","winter"],
      family: 3, luxury: 4, gem: 4, tags: ["Closest","Renoir","Garden"] },

    { id: "fondation-maeght", name: "Fondation Maeght", cat: "museums", area: "10 km",
      blurb: "A landmark modern-art foundation with a Giacometti courtyard and a Miró sculpture labyrinth.",
      why: "One of Europe's finest private art collections in an architectural masterpiece — unmissable.",
      rating: 4.6, reviews: 3400, km: 10, drive: 20, walk: null, cycle: null,
      website: "https://www.fondation-maeght.com/", maps: "Fondation Maeght, Saint-Paul-de-Vence, France",
      duration: "2–3 hours", best: "Arrive early; busy after midday", season: ["spring","summer","autumn","winter"],
      family: 3, luxury: 5, gem: 3, tags: ["Modern art","Architecture","Sculpture garden"] },

    { id: "musee-picasso", name: "Musée Picasso, Antibes", cat: "museums", area: "11 km",
      blurb: "The Château Grimaldi where Picasso worked in 1946, full of joyous post-war Mediterranean art.",
      why: "A compact, sea-view museum you can actually finish — pair it with the Antibes market and ramparts.",
      rating: 4.5, reviews: 6000, km: 11, drive: 20, walk: null, cycle: null,
      website: "https://www.antibesjuanlespins.com/en/culture/picasso-museum", maps: "Musée Picasso, Antibes, France",
      duration: "1–2 hours", best: "Closed Mondays", season: ["spring","summer","autumn","winter"],
      family: 3, luxury: 4, gem: 3, tags: ["Picasso","Sea views","Château"] },

    { id: "musee-matisse", name: "Musée Matisse, Nice", cat: "museums", area: "15 km",
      blurb: "A red-ochre villa in the Cimiez olive groves holding Nice's great Matisse collection.",
      why: "Set among Roman ruins and shady gardens — the loveliest museum setting in the city.",
      rating: 4.4, reviews: 7000, km: 15, drive: 28, walk: null, cycle: null,
      website: "https://www.musee-matisse-nice.org/en/", maps: "Musée Matisse, Nice, France",
      duration: "1–2 hours", best: "Closed Tuesdays; free first-Sunday options", season: ["spring","summer","autumn","winter"],
      family: 3, luxury: 4, gem: 3, tags: ["Matisse","Gardens","Cimiez"] },

    { id: "musee-chagall", name: "Musée National Marc Chagall, Nice", cat: "museums", area: "14 km",
      blurb: "A purpose-built national museum around Chagall's luminous Biblical Message cycle.",
      why: "Small, serene and stunning — arguably the most moving single-artist museum on the coast.",
      rating: 4.6, reviews: 8000, km: 14, drive: 26, walk: null, cycle: null,
      website: "https://www.musees-nationaux-alpesmaritimes.fr/chagall/", maps: "Musée National Marc Chagall, Nice, France",
      duration: "1–2 hours", best: "Closed Tuesdays", season: ["spring","summer","autumn","winter"],
      family: 3, luxury: 4, gem: 4, tags: ["Chagall","Serene","National museum"] },

    { id: "villa-ephrussi", name: "Villa Ephrussi de Rothschild", cat: "museums", area: "24 km",
      blurb: "A pink Belle-Époque palazzo with nine themed gardens and dancing musical fountains.",
      why: "The most romantic house-and-garden visit on the Riviera, on the Cap-Ferrat ridge between two bays.",
      rating: 4.6, reviews: 12000, km: 24, drive: 38, walk: null, cycle: null,
      website: "https://www.villa-ephrussi.com/en", maps: "Villa Ephrussi de Rothschild, Saint-Jean-Cap-Ferrat, France",
      duration: "2–3 hours", best: "Time the fountain shows", season: ["spring","summer","autumn"],
      family: 4, luxury: 5, gem: 3, tags: ["Gardens","Belle Époque","Romantic"] },

    { id: "musee-leger", name: "Musée Fernand Léger, Biot", cat: "museums", area: "8 km",
      blurb: "A national museum wrapped in giant Léger mosaics, set in a sculpture garden.",
      why: "Bold, colourful and family-friendly — and just fifteen minutes away beside Biot village.",
      rating: 4.5, reviews: 2000, km: 8, drive: 15, walk: null, cycle: 25,
      website: "https://www.musees-nationaux-alpesmaritimes.fr/fleger/", maps: "Musée Fernand Léger, Biot, France",
      duration: "1–2 hours", best: "Closed Tuesdays", season: ["spring","summer","autumn","winter"],
      family: 4, luxury: 3, gem: 4, tags: ["Léger","Mosaics","Close"] },

    { id: "mamac", name: "MAMAC, Nice", cat: "museums", area: "14 km",
      blurb: "Nice's modern and contemporary art museum, strong on Pop Art and the Nice School.",
      why: "Free rooftop terrace with a great city view, and Yves Klein's electric blue up close.",
      rating: 4.4, reviews: 6000, km: 14, drive: 26, walk: null, cycle: null,
      website: "https://www.mamac-nice.org/en/", maps: "MAMAC, Nice, France",
      duration: "1–2 hours", best: "Closed Mondays", season: ["spring","summer","autumn","winter"],
      family: 3, luxury: 3, gem: 3, tags: ["Contemporary","Rooftop","Pop Art"] },

    /* ===================== WINE & VINEYARDS ===================== */
    { id: "domaine-toasc", name: "Domaine de Toasc (AOC Bellet)", cat: "wine", area: "12 km",
      blurb: "A welcoming family estate in Nice's tiny Bellet appellation, with cellar tours and tastings.",
      why: "The closest 'proper' vineyard — taste rare Bellet wines fifteen minutes from the villa.",
      rating: 4.6, reviews: 400, km: 12, drive: 25, walk: null, cycle: null,
      website: "https://www.domainedetoasc.com/", maps: "Domaine de Toasc, Nice, France",
      duration: "1–2 hours", best: "Book the tasting in advance", season: ["spring","summer","autumn"],
      family: 2, luxury: 4, gem: 4, tags: ["Bellet","Tasting","Closest vineyard"] },

    { id: "chateau-bellet", name: "Château de Bellet", cat: "wine", area: "13 km",
      blurb: "A historic Bellet estate above the Var valley producing elegant, age-worthy wines.",
      why: "One of the Riviera's oldest wine names — refined tastings with a sweeping valley view.",
      rating: 4.5, reviews: 200, km: 13, drive: 26, walk: null, cycle: null,
      website: "https://www.chateaudebellet.com/", maps: "Château de Bellet, Nice, France",
      duration: "1–2 hours", best: "By appointment", season: ["spring","summer","autumn"],
      family: 2, luxury: 5, gem: 4, tags: ["Heritage","Bellet","By appointment"] },

    { id: "rose-estates", name: "Provence Rosé Estate Day", cat: "wine", area: "Varies",
      blurb: "A chauffeured tasting tour to renowned Côtes-de-Provence estates such as Minuty and Saint-Maur.",
      why: "The classic rosé pilgrimage — sommelier-led, fully arranged, no one has to drive. On request.",
      rating: 4.8, reviews: 300, km: 70, drive: 75, walk: null, cycle: null,
      website: "https://wa.me/33623777333", maps: "Château Minuty, Gassin, France",
      duration: "Full day", best: "Arranged on request", season: ["spring","summer","autumn"],
      family: 1, luxury: 5, gem: 3, tags: ["On request","Rosé","Chauffeured"] },

    { id: "organic-wine", name: "Organic Estate, Villars-sur-Var", cat: "wine", area: "35 km",
      blurb: "Certified-organic hillside vineyards in the upper Var producing characterful natural wines.",
      why: "For the curious drinker — small-batch organic wine and a beautiful drive into the hinterland.",
      rating: 4.6, reviews: 150, km: 35, drive: 50, walk: null, cycle: null,
      website: "https://wa.me/33623777333", maps: "Clos Saint Joseph, Villars-sur-Var, France",
      duration: "Half day", best: "Spring & autumn", season: ["spring","autumn"],
      family: 1, luxury: 4, gem: 5, tags: ["Organic","Natural wine","Scenic drive"] },

    /* ===================== FOODIE GUIDE ===================== */
    { id: "mirazur", name: "Mirazur, Menton (3★)", cat: "food", area: "45 km",
      blurb: "Mauro Colagreco's three-Michelin-star garden restaurant, once ranked No.1 in the world.",
      why: "A pilgrimage meal — produce from its own terraced gardens, looking out over the Italian frontier.",
      rating: 4.7, reviews: 2000, km: 45, drive: 55, walk: null, cycle: null,
      website: "https://www.mirazur.fr/en/", maps: "Mirazur, Menton, France",
      duration: "Lunch / dinner", best: "Reserve weeks ahead", season: ["spring","summer","autumn"],
      family: 1, luxury: 5, gem: 3, tags: ["3 Michelin","Bucket-list","Garden-to-plate"] },

    { id: "louis-xv", name: "Le Louis XV – Alain Ducasse, Monaco (3★)", cat: "food", area: "32 km",
      blurb: "Ducasse's three-star temple of Riviera cuisine in the Hôtel de Paris.",
      why: "The grandest dining room on the coast and a defining French-Riviera gastronomic experience.",
      rating: 4.7, reviews: 1500, km: 32, drive: 45, walk: null, cycle: null,
      website: "https://www.montecarlosbm.com/en/restaurant-monaco/le-louis-xv-alain-ducasse-hotel-de-paris", maps: "Le Louis XV, Monaco",
      duration: "Lunch / dinner", best: "Reserve well ahead; dress code", season: ["spring","summer","autumn","winter"],
      family: 1, luxury: 5, gem: 2, tags: ["3 Michelin","Grand","Monaco"] },

    { id: "colombe-dor", name: "La Colombe d'Or, Saint-Paul", cat: "food", area: "10 km",
      blurb: "A legendary auberge whose walls hold Picasso, Matisse and Léger, paid in paintings.",
      why: "Long lunch on the fig-shaded terrace beside priceless art — pure Riviera romance.",
      rating: 4.4, reviews: 2500, km: 10, drive: 20, walk: null, cycle: null,
      website: "https://www.la-colombe-dor.com/en/", maps: "La Colombe d'Or, Saint-Paul-de-Vence, France",
      duration: "Lunch / dinner", best: "Book the terrace for lunch", season: ["spring","summer","autumn"],
      family: 2, luxury: 5, gem: 4, tags: ["Iconic","Art","Romantic"] },

    { id: "la-pesquiere", name: "Seafood at Cros-de-Cagnes", cat: "food", area: "3 km",
      blurb: "The little row of seafront fish restaurants on our local beach (La Pesquière, La Bourride).",
      why: "Grilled dorade and a bottle of Bellet white, feet almost in the sand — the easy local classic.",
      rating: 4.4, reviews: 1200, km: 3, drive: 8, walk: 35, cycle: 10,
      website: null, maps: "Restaurant La Pesquière, Cagnes-sur-Mer, France",
      duration: "Lunch / dinner", best: "Sunset tables; book in summer", season: ["spring","summer","autumn"],
      family: 4, luxury: 3, gem: 4, tags: ["Closest","Seafood","Seafront"] },

    { id: "socca-nice", name: "Socca & Niçoise in Vieux-Nice", cat: "food", area: "13 km",
      blurb: "Chickpea socca hot off the griddle (Chez Pipo, Cours Saleya) — the true Nice street snack.",
      why: "The most authentic, affordable taste of Nice — eat it standing up with a glass of rosé.",
      rating: 4.5, reviews: 5000, km: 13, drive: 25, walk: null, cycle: null,
      website: null, maps: "Chez Pipo Socca, Nice, France",
      duration: "Snack / lunch", best: "Lunchtime, fresh batches", season: ["spring","summer","autumn","winter"],
      family: 5, luxury: 2, gem: 3, tags: ["Local classic","Street food","Cheap eat"] },

    { id: "fenocchio", name: "Fenocchio Gelato, Nice", cat: "food", area: "13 km",
      blurb: "The cult Vieux-Nice gelateria with 90-plus flavours, from lavender to tomato-basil.",
      why: "The Riviera's most famous ice cream — a non-negotiable stop after the old-town market.",
      rating: 4.5, reviews: 9000, km: 13, drive: 25, walk: null, cycle: null,
      website: "https://www.fenocchio.fr/", maps: "Fenocchio, Place Rossetti, Nice, France",
      duration: "Quick stop", best: "Late afternoon", season: ["spring","summer","autumn"],
      family: 5, luxury: 2, gem: 2, tags: ["Gelato","Vieux-Nice","Kids"] },

    { id: "bakery-local", name: "Best Local Bakery — Bour & Multari", cat: "food", area: "2 km",
      blurb: "Bour Pâtisserie (Cagnes) for morning croissants; Maison Multari for modern pastry and brunch.",
      why: "Start every villa morning right — the good pastries don't last past nine.",
      rating: 4.5, reviews: 800, km: 2, drive: 5, walk: 20, cycle: 7,
      website: null, maps: "Bour Pâtisserie, Cagnes-sur-Mer, France",
      duration: "Breakfast", best: "Go early (from 06:15)", season: ["spring","summer","autumn","winter"],
      family: 5, luxury: 3, gem: 4, tags: ["Closest","Breakfast","Pastry"] },

    { id: "pizza-nice", name: "Wood-Fired Pizza, Nice", cat: "food", area: "13 km",
      blurb: "Pissaladière and proper Niçoise wood-fired pizza in Vieux-Nice (try Pizza Cresci).",
      why: "The southern-French take on pizza — thin, smoky and best with the onion-anchovy pissaladière.",
      rating: 4.4, reviews: 2000, km: 13, drive: 25, walk: null, cycle: null,
      website: null, maps: "Pizza Cresci, Nice, France",
      duration: "Lunch / dinner", best: "Casual evenings", season: ["spring","summer","autumn","winter"],
      family: 5, luxury: 2, gem: 2, tags: ["Pizza","Casual","Family"] },

    { id: "eze-sunset-dining", name: "Sunset Dining, Èze", cat: "food", area: "25 km",
      blurb: "Clifftop terraces (Château Eza, Château de la Chèvre d'Or) high above the sea.",
      why: "The most dramatic dinner view on the Riviera as the sun drops behind Cap-Ferrat.",
      rating: 4.6, reviews: 1800, km: 25, drive: 35, walk: null, cycle: null,
      website: "https://www.chevredor.com/en/", maps: "Château de la Chèvre d'Or, Èze, France",
      duration: "Dinner", best: "Reserve a terrace table for sunset", season: ["spring","summer","autumn"],
      family: 2, luxury: 5, gem: 4, tags: ["Sunset","Clifftop","Romantic"] },

    /* ===================== NATURE & HIKING ===================== */
    { id: "sentier-cap-antibes", name: "Sentier du Littoral, Cap d'Antibes", cat: "nature", area: "14 km",
      blurb: "A coastal footpath around the millionaires' cape, past hidden coves and crashing rocks.",
      why: "The best easy coastal walk near us — start at La Garoupe, swim along the way, lunch in Antibes.",
      rating: 4.7, reviews: 5000, km: 14, drive: 25, walk: null, cycle: null,
      website: null, maps: "Sentier du Littoral, Cap d'Antibes, France",
      duration: "2–3 hours", best: "Morning; not in strong wind", season: ["spring","summer","autumn","winter"],
      family: 4, luxury: 3, gem: 4, tags: ["Coastal walk","Coves","Swimming"] },

    { id: "cap-ferrat-walk", name: "Cap-Ferrat Coastal Path", cat: "nature", area: "24 km",
      blurb: "A gentle loop around the Saint-Hospice peninsula with clear water and grand villas.",
      why: "Flat, shaded and beautiful — the most relaxed of the cape walks, easy with older kids.",
      rating: 4.7, reviews: 3000, km: 24, drive: 38, walk: null, cycle: null,
      website: null, maps: "Sentier du Littoral, Saint-Jean-Cap-Ferrat, France",
      duration: "1.5–2 hours", best: "Spring & autumn", season: ["spring","summer","autumn"],
      family: 4, luxury: 4, gem: 4, tags: ["Easy walk","Sea views","Villas"] },

    { id: "gorges-du-loup", name: "Gorges du Loup & Cascades", cat: "nature", area: "30 km",
      blurb: "A dramatic limestone canyon with the Courmes and Saut-du-Loup waterfalls.",
      why: "A cool, scenic hinterland drive and short walks to turquoise pools — a perfect hot-day escape.",
      rating: 4.6, reviews: 2500, km: 30, drive: 45, walk: null, cycle: null,
      website: null, maps: "Gorges du Loup, France",
      duration: "Half day", best: "Combine with Gourdon", season: ["spring","summer","autumn"],
      family: 3, luxury: 2, gem: 4, tags: ["Canyon","Waterfalls","Drive"] },

    { id: "esterel", name: "Massif de l'Estérel", cat: "nature", area: "45 km",
      blurb: "Fiery red volcanic hills plunging into the sea between Cannes and Saint-Raphaël.",
      why: "Spectacular coastal hiking and driving, with red-rock coves few visitors ever reach.",
      rating: 4.7, reviews: 4000, km: 45, drive: 50, walk: null, cycle: null,
      website: null, maps: "Massif de l'Estérel, France",
      duration: "Full day", best: "Spring & autumn", season: ["spring","autumn"],
      family: 3, luxury: 2, gem: 4, tags: ["Hiking","Red rock","Coves"] },

    { id: "mercantour", name: "Parc National du Mercantour", cat: "nature", area: "70 km",
      blurb: "An alpine national park of peaks, lakes, wolves and the prehistoric Vallée des Merveilles.",
      why: "Trade the coast for the mountains — wildlife, alpine lakes and serious hiking under two hours away.",
      rating: 4.8, reviews: 3000, km: 70, drive: 90, walk: null, cycle: null,
      website: "http://www.mercantour-parcnational.fr/en", maps: "Parc National du Mercantour, France",
      duration: "Full day", best: "June–September", season: ["summer"],
      family: 3, luxury: 2, gem: 5, tags: ["Alpine","Wildlife","Serious hiking"] },

    { id: "mont-boron", name: "Mont Boron & Cap de Nice", cat: "nature", area: "16 km",
      blurb: "A pine-clad headland above Nice with easy paths and the best city-and-sea panorama.",
      why: "A short, rewarding walk to the postcard view of Nice and Villefranche — great at sunset.",
      rating: 4.7, reviews: 2500, km: 16, drive: 28, walk: null, cycle: null,
      website: null, maps: "Parc du Mont Boron, Nice, France",
      duration: "1–2 hours", best: "Late afternoon", season: ["spring","summer","autumn","winter"],
      family: 4, luxury: 3, gem: 4, tags: ["Viewpoint","Easy walk","Sunset"] },

    /* ===================== DAY TRIPS ===================== */
    { id: "italy-trip", name: "Italy: Ventimiglia & Dolceacqua", cat: "daytrips", area: "50 km",
      blurb: "Cross the border for Friday's huge Ventimiglia market and the medieval village of Dolceacqua.",
      why: "Two countries in one trip — Italian market bargains, pasta and a Monet-painted stone bridge.",
      rating: 4.5, reviews: 3000, km: 50, drive: 60, walk: null, cycle: null,
      website: null, maps: "Ventimiglia, Italy",
      duration: "Full day", best: "Friday (market day)", season: ["spring","summer","autumn","winter"],
      family: 4, luxury: 3, gem: 4, tags: ["Italy","Market","Border"] },

    { id: "lerins", name: "Îles de Lérins", cat: "daytrips", area: "Cannes 23 km",
      blurb: "A short ferry from Cannes to car-free islands — Sainte-Marguerite's pines and Saint-Honorat's monastery vineyard.",
      why: "Swim off deserted coves, picnic under the pines and taste wine made by the island's monks.",
      rating: 4.6, reviews: 6000, km: 23, drive: 35, walk: null, cycle: null,
      website: "https://www.cannes-ilesdelerins.com/en/", maps: "Île Sainte-Marguerite, Cannes, France",
      duration: "Full day", best: "Pack a picnic; first ferries", season: ["spring","summer","autumn"],
      family: 4, luxury: 3, gem: 4, tags: ["Islands","Ferry","Swimming"] },

    { id: "verdon", name: "Gorges du Verdon", cat: "daytrips", area: "120 km",
      blurb: "Europe's grandest canyon, with turquoise water, kayaking and the lavender of Valensole nearby.",
      why: "An epic full-day adventure — pedalo on emerald Lac de Sainte-Croix beneath towering cliffs.",
      rating: 4.8, reviews: 8000, km: 120, drive: 120, walk: null, cycle: null,
      website: null, maps: "Gorges du Verdon, France",
      duration: "Full day (early start)", best: "June–July (lavender + warm water)", season: ["summer"],
      family: 4, luxury: 3, gem: 5, tags: ["Canyon","Kayak","Lavender"] },

    { id: "porquerolles", name: "Porquerolles Island", cat: "daytrips", area: "150 km",
      blurb: "A car-free Provençal island of white-sand beaches and vineyards off Hyères.",
      why: "Caribbean-clear water on French soil — best as an overnight or a very early full day.",
      rating: 4.7, reviews: 5000, km: 150, drive: 150, walk: null, cycle: null,
      website: null, maps: "Porquerolles, France",
      duration: "Full day / overnight", best: "Hire bikes on the island", season: ["spring","summer","autumn"],
      family: 4, luxury: 4, gem: 4, tags: ["Island","White sand","Cycling"] },

    /* ===================== SHOPPING ===================== */
    { id: "polygone", name: "Polygone Riviera", cat: "shopping", area: "5 km",
      blurb: "An open-air designer mall in Cagnes with shops, cinema, restaurants and outdoor art.",
      why: "The closest retail therapy — five minutes away, with everything from high-street to luxury.",
      rating: 4.4, reviews: 20000, km: 5, drive: 10, walk: null, cycle: 18,
      website: "https://www.polygoneriviera.com/", maps: "Polygone Riviera, Cagnes-sur-Mer, France",
      duration: "Half day", best: "Rainy days; evenings for dinner & cinema", season: ["spring","summer","autumn","winter"],
      family: 4, luxury: 4, gem: 1, tags: ["Closest","Designer","Cinema"] },

    { id: "cap3000", name: "CAP3000", cat: "shopping", area: "8 km",
      blurb: "A vast seafront shopping centre at Saint-Laurent-du-Var, one of France's largest.",
      why: "Hundreds of brands plus waterfront dining — the go-to for a serious shop or a wet afternoon.",
      rating: 4.4, reviews: 30000, km: 8, drive: 12, walk: null, cycle: null,
      website: "https://www.cap3000.com/", maps: "CAP3000, Saint-Laurent-du-Var, France",
      duration: "Half day", best: "Rainy days", season: ["spring","summer","autumn","winter"],
      family: 4, luxury: 3, gem: 1, tags: ["Big mall","Seafront","Brands"] },

    { id: "cours-saleya", name: "Cours Saleya Market, Nice", cat: "shopping", area: "13 km",
      blurb: "Nice's iconic flower-and-produce market (antiques on Mondays) in the heart of the old town.",
      why: "The most atmospheric market on the coast — flowers, candied fruit, socca and people-watching.",
      rating: 4.5, reviews: 15000, km: 13, drive: 25, walk: null, cycle: null,
      website: null, maps: "Cours Saleya Market, Nice, France",
      duration: "Morning", best: "Tue–Sun mornings; antiques Mon", season: ["spring","summer","autumn","winter"],
      family: 5, luxury: 3, gem: 3, tags: ["Market","Flowers","Old town"] },

    { id: "antibes-market", name: "Marché Provençal, Antibes", cat: "shopping", area: "11 km",
      blurb: "A daily covered Provençal market — cheese, olives, charcuterie, lavender and local produce.",
      why: "The best food market on the Riviera; arrive at 9am with an empty bag and no plan.",
      rating: 4.6, reviews: 8000, km: 11, drive: 20, walk: null, cycle: null,
      website: null, maps: "Marché Provençal, Antibes, France",
      duration: "Morning", best: "Tue–Sun until 1pm", season: ["spring","summer","autumn","winter"],
      family: 5, luxury: 3, gem: 3, tags: ["Food market","Local","Mornings"] },

    { id: "monaco-luxury", name: "Carré d'Or Luxury Shopping, Monaco", cat: "shopping", area: "32 km",
      blurb: "The golden square around Place du Casino — every grand fashion and jewellery house.",
      why: "Window-shop the world's most exclusive boutiques between the Casino and the Hôtel de Paris.",
      rating: 4.5, reviews: 4000, km: 32, drive: 45, walk: null, cycle: null,
      website: null, maps: "Carré d'Or, Monaco",
      duration: "Half day", best: "Combine with a Monaco day", season: ["spring","summer","autumn","winter"],
      family: 2, luxury: 5, gem: 2, tags: ["Luxury","Fashion","Monaco"] },

    /* ===================== NIGHTLIFE ===================== */
    { id: "casino-monte-carlo", name: "Casino de Monte-Carlo", cat: "nightlife", area: "32 km",
      blurb: "The Belle-Époque gaming palace immortalised in film, with its terrace bar and supercars.",
      why: "Even non-gamblers should see it once — dress up, sip a cocktail and watch the world arrive.",
      rating: 4.5, reviews: 20000, km: 32, drive: 45, walk: null, cycle: null,
      website: "https://www.montecarlosbm.com/en/casino-monaco/casino-de-monte-carlo", maps: "Casino de Monte-Carlo, Monaco",
      duration: "Evening", best: "After dinner; smart dress, ID required", season: ["spring","summer","autumn","winter"],
      family: 1, luxury: 5, gem: 2, tags: ["Casino","Iconic","Dress code"] },

    { id: "cannes-beach-clubs", name: "Cannes Beach Clubs & Croisette", cat: "nightlife", area: "23 km",
      blurb: "Croisette beach clubs by day that slide into Champagne and DJ sets after dark.",
      why: "The glamorous Riviera night out — toes in the sand, cocktails and music until late.",
      rating: 4.3, reviews: 6000, km: 23, drive: 35, walk: null, cycle: null,
      website: null, maps: "La Croisette, Cannes, France",
      duration: "Evening", best: "Summer weekends", season: ["summer"],
      family: 2, luxury: 5, gem: 2, tags: ["Beach club","DJ","Glamour"] },

    { id: "juan-nightlife", name: "Juan-les-Pins After Dark", cat: "nightlife", area: "13 km",
      blurb: "The Riviera's buzziest late-night strip of bars, clubs and the famous summer jazz festival.",
      why: "Our nearest proper nightlife — lively, walkable bars and live music all summer.",
      rating: 4.2, reviews: 4000, km: 13, drive: 22, walk: null, cycle: null,
      website: null, maps: "Juan-les-Pins, Antibes, France",
      duration: "Evening", best: "Summer; Jazz à Juan in July", season: ["summer"],
      family: 2, luxury: 3, gem: 2, tags: ["Bars","Live music","Closest nightlife"] },

    { id: "nice-rooftops", name: "Nice Rooftop & Cocktail Bars", cat: "nightlife", area: "13 km",
      blurb: "Sea-view rooftops (Le Méridien, Hôtel Aston) and characterful old-town cocktail bars.",
      why: "A more relaxed evening — sundowners over the Baie des Anges, then old-town wine bars.",
      rating: 4.4, reviews: 3000, km: 13, drive: 25, walk: null, cycle: null,
      website: null, maps: "Rooftop bar Nice, France",
      duration: "Evening", best: "Sunset start", season: ["spring","summer","autumn"],
      family: 2, luxury: 4, gem: 3, tags: ["Rooftop","Cocktails","Sunset"] }
  ];

  /* Enrich with price levels, transport, best-for tags (area-place-enrichment.js) */
  if (typeof enrichPlace === "function") {
    PLACES = PLACES.map(enrichPlace);
  }

  /* ---- Sort helpers ---- */
  var PO = typeof PRICE_ORDER !== "undefined" ? PRICE_ORDER : { Free: 0, "€": 1, "€€": 2, "€€€": 3, "€€€€": 4 };
  var SORTS = {
    distance: function (a, b) { return a.drive - b.drive; },
    rating: function (a, b) { return (b.rating || 0) - (a.rating || 0); },
    family: function (a, b) { return b.family - a.family || (b.rating || 0) - (a.rating || 0); },
    luxury: function (a, b) { return b.luxury - a.luxury || (b.rating || 0) - (a.rating || 0); },
    gem: function (a, b) { return b.gem - a.gem || (b.rating || 0) - (a.rating || 0); },
    priceLow: function (a, b) {
      var pa = PO[a.priceLevel] != null ? PO[a.priceLevel] : 2;
      var pb = PO[b.priceLevel] != null ? PO[b.priceLevel] : 2;
      return pa - pb || a.drive - b.drive;
    }
  };

  var state = { cat: "all", tag: "all", sort: "distance" };

  function stars(score) {
    var full = Math.round(score);
    var s = "";
    for (var i = 1; i <= 5; i++) s += (i <= full ? "●" : "○");
    return s;
  }

  function metaRow(label, value) {
    if (!value && value !== 0) return "";
    return '<div class="ag-meta"><span>' + label + '</span><span>' + value + '</span></div>';
  }

  function timeBadges(p) {
    var b = '<span class="ag-badge ag-badge-drive" title="Drive time from the villa">' +
            svgIcon("M5 11l1.5-4.5A2 2 0 018.4 5h7.2a2 2 0 011.9 1.5L19 11M5 11h14v5H5zM7 16v2M17 16v2") +
            p.drive + ' min drive</span>';
    if (p.cycle) b += '<span class="ag-badge" title="By bike">' + p.cycle + ' min cycle</span>';
    if (p.walk) b += '<span class="ag-badge" title="On foot">' + p.walk + ' min walk</span>';
    return b;
  }

  function svgIcon(path, cls) {
    return '<svg class="' + (cls || "ag-i") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + path + '"/></svg>';
  }

  function scorePill(label, score) {
    if (!score) return "";
    return '<span class="ag-score" title="' + label + ' score"><b>' + label + '</b>' +
      '<i class="ag-dots">' + stars(score) + '</i></span>';
  }

  function tagChips(p) {
    var chips = [];
    if (p.priceLevel) chips.push('<span class="ag-tag ag-tag-price">' + p.priceLevel + '</span>');
    if (p.beachType) chips.push('<span class="ag-tag">' + p.beachType + '</span>');
    if (p.rainyDay) chips.push('<span class="ag-tag">Rainy day</span>');
    if (p.localFavourite) chips.push('<span class="ag-tag">Local pick</span>');
    if (p.bookAhead) chips.push('<span class="ag-tag">Book ahead</span>');
    if (p.carFreePossible) chips.push('<span class="ag-tag">Train-friendly</span>');
    if (p.bestFor && p.bestFor.length) {
      p.bestFor.slice(0, 2).forEach(function (b) {
        chips.push('<span class="ag-tag">' + b + '</span>');
      });
    }
    return chips.length ? '<div class="ag-tags">' + chips.join("") + '</div>' : "";
  }

  function card(p) {
    var c = CATEGORIES[p.cat];
    var imgSrc = p.image || IMAGES[p.id];
    var alt = p.imageAlt || (p.name + " near Villa Augflor");
    var media = imgSrc
      ? '<div class="ag-media" style="background-image:url(\'' + imgSrc + '\')" role="img" aria-label="' + alt + '">'
      : '<div class="ag-media" style="background:' + c.tile + '">' +
        '<span class="ag-media-icon">' + svgIcon(ICONS[p.cat], "ag-i-lg") + '</span>';
    var ratingBadge = p.rating
      ? '<span class="ag-rating" title="' + p.reviews + '+ Google reviews"><b>' + p.rating.toFixed(1) +
        '</b> ★ <em>' + fmtReviews(p.reviews) + '</em></span>'
      : '<span class="ag-rating ag-rating-na">Info</span>';

    return '' +
      '<article class="ag-card" data-cat="' + p.cat + '">' +
        media +
          '<span class="ag-cat-tag">' + c.label + '</span>' +
          ratingBadge +
          '<span class="ag-dist">' + p.area + '</span>' +
        '</div>' +
        '<div class="ag-body">' +
          '<h3>' + p.name + '</h3>' +
          '<p class="ag-blurb">' + p.blurb + '</p>' +
          '<p class="ag-why"><b>Why go:</b> ' + p.why + '</p>' +
          tagChips(p) +
          '<div class="ag-badges">' + timeBadges(p) + '</div>' +
          '<div class="ag-metas">' +
            metaRow("Typical cost", (p.priceLevel || "—") + (p.priceNote ? " · " + p.priceNote : "")) +
            metaRow("Time needed", p.duration) +
            metaRow("Best time", p.best) +
            metaRow("Transport", p.transport) +
            metaRow("Parking", p.parking) +
            metaRow("Season", p.seasonNote) +
            (p.bookingAdvice ? metaRow("Tip", p.bookingAdvice) : "") +
          '</div>' +
          (p.family || p.luxury || p.gem
            ? '<div class="ag-scores">' +
                scorePill("Family", p.family) +
                scorePill("Luxury", p.luxury) +
                scorePill("Gem", p.gem) +
              '</div>'
            : "") +
          '<div class="ag-actions">' +
            '<a class="ag-btn ag-btn-primary" target="_blank" rel="noopener" href="' + routeLink(p.maps) + '">' +
              svgIcon("M12 21s-6-5.5-6-10a6 6 0 1112 0c0 4.5-6 10-6 10zM12 11a2 2 0 100-4 2 2 0 000 4z") + 'Route from villa</a>' +
            '<a class="ag-btn" target="_blank" rel="noopener" href="' + mapsLink(p.maps) + '">Map</a>' +
            (p.website
              ? '<a class="ag-btn" target="_blank" rel="noopener" href="' + p.website + '">' +
                (p.website.indexOf("wa.me") > -1 ? "Ask us" : "Website") + '</a>'
              : "") +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function fmtReviews(n) {
    if (!n) return "";
    if (n >= 1000) return Math.round(n / 1000) + "k reviews";
    return n + " reviews";
  }

  function matchesTag(p, tag) {
    if (tag === "all") return true;
    if (tag === "free") return p.priceLevel === "Free";
    if (tag === "budget") return p.priceLevel === "€";
    if (tag === "mid") return p.priceLevel === "€€";
    if (tag === "family") return p.family >= 4 || (p.bestFor && p.bestFor.indexOf("Families") >= 0);
    if (tag === "rainy") return p.rainyDay || (p.bestFor && p.bestFor.indexOf("Rainy day") >= 0);
    if (tag === "local") return p.localFavourite || p.gem >= 4;
    if (tag === "train") return p.carFreePossible || p.transport === "Train possible";
    if (tag === "luxury") return p.luxury >= 4;
    return true;
  }

  function render() {
    var grid = document.getElementById("ag-grid");
    if (!grid) return;
    var list = PLACES.filter(function (p) {
      if (state.cat !== "all" && p.cat !== state.cat) return false;
      return matchesTag(p, state.tag);
    }).slice().sort(SORTS[state.sort] || SORTS.distance);

    grid.innerHTML = list.map(card).join("");
    var count = document.getElementById("ag-count");
    if (count) count.textContent = list.length + " place" + (list.length === 1 ? "" : "s");
  }

  function wireControls() {
    var filters = document.getElementById("ag-filters");
    if (filters) {
      filters.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-cat]");
        if (!btn) return;
        state.cat = btn.getAttribute("data-cat");
        filters.querySelectorAll("[data-cat]").forEach(function (b) {
          b.classList.toggle("active", b === btn);
        });
        render();
      });
    }
    var tagFilters = document.getElementById("ag-tag-filters");
    if (tagFilters) {
      tagFilters.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-tag]");
        if (!btn) return;
        state.tag = btn.getAttribute("data-tag");
        tagFilters.querySelectorAll("[data-tag]").forEach(function (b) {
          b.classList.toggle("active", b === btn);
        });
        render();
      });
    }
    var sort = document.getElementById("ag-sort");
    if (sort) {
      sort.addEventListener("change", function () {
        state.sort = sort.value;
        render();
      });
    }
  }

  /* ---- SEO: emit an ItemList of attractions ---- */
  function injectSchema() {
    var items = PLACES.filter(function (p) { return p.rating; }).map(function (p, i) {
      var node = {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "TouristAttraction",
          name: p.name,
          description: p.blurb,
          url: p.website || undefined,
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: p.rating,
            reviewCount: p.reviews || undefined
          }
        }
      };
      return node;
    });
    var data = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Villa Augflor Area Guide — 70+ French Riviera places",
      dateModified: "2026-05-29",
      itemListElement: items
    };
    var article = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "French Riviera Area Guide from Villa Augflor",
      datePublished: "2025-01-01",
      dateModified: "2026-05-29",
      author: { "@type": "Person", name: "Lana" },
      publisher: { "@type": "Organization", name: "Villa Augflor", url: "https://villa-augflor.com" }
    };
    var s2 = document.createElement("script");
    s2.type = "application/ld+json";
    s2.textContent = JSON.stringify(article);
    document.head.appendChild(s2);
    var s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
  }

  document.addEventListener("DOMContentLoaded", function () {
    wireControls();
    render();
    injectSchema();
  });
})();
