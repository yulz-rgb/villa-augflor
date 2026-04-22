const { useState, useEffect, useRef } = React;

// ─── Constants ────────────────────────────────────────────────────────────────
const WA = 'https://wa.me/33623777333';

const STRINGS = {
  en: {
    book:'Book Direct', checkAvail:'Check Availability', discover:'Discover the Villa ↓',
    heroLabel:'Cagnes-sur-Mer · Côte d\'Azur · France',
    heroTitle:['Somewhere between','Nice and Cannes,','there is a garden.'],
    heroSub:'Private villa · 3 bedrooms · Private pool · From €480 per night',
    villaLabel:'The Villa', villaH1:'A designer garden,', villaH2:'a perfect address',
    galleryLabel:'Photo Gallery', galleryH1:'Inside &', galleryH2:'outside',
    tlLabel:'A day at the villa', tlH1:'Morning coffee.', tlH2:'Starlit dinner.',
    locLabel:'Location', locH1:'The Riviera\'s', locH2:'most central address',
    locCopy:'Cagnes-sur-Mer sits at the geographic heart of the Côte d\'Azur. Not a compromise — the strategic centre. Nice, Antibes, Saint-Paul, Cannes, Monaco. All within easy reach. 15 minutes from the airport.',
    bdLabel:'Book Direct & Save', bdH1:'Save up to', bdH2:'€700 per week',
    bdCopy:'No platform fees, no middleman. Book directly with Lana and keep that money for rosé, Michelin dinners, and the boat trip to Île Sainte-Honorat.',
    htbLabel:'How to Book', htbH1:'Three steps.', htbH2:'Your villa awaits.',
    lanaLabel:'Your Host', lanaH1:'Lana.', lanaH2:'Ten years. Every detail.',
    availLabel:'Availability 2026', availH1:'Summer — book', availH2:'while you can',
    reviewLabel:'Guest Reviews', reviewH1:'4.79★ across', reviewH2:'38 verified stays',
    igLabel:'Follow Along', igH1:'@villa_augflor_france',
    faqLabel:'FAQ', faqH1:'Everything you', faqH2:'need to know',
    ctaLabel:'Reserve Your Week', ctaH1:'Your Riviera summer', ctaH2:'starts here',
    ctaCopy:'Three peak weeks or fewer remain in 2026. Guests who book direct get priority on dates, personal concierge, and the best rate available anywhere.',
    enquire:'Enquire via WhatsApp', viewAirbnb:'View on Airbnb',
  },
  fr: {
    book:'Réserver Direct', checkAvail:'Vérifier les disponibilités', discover:'Découvrir la villa ↓',
    heroLabel:'Cagnes-sur-Mer · Côte d\'Azur · France',
    heroTitle:['Entre Nice et Cannes,','il y a un jardin.',''],
    heroSub:'Villa privée · 3 chambres · Piscine privée · À partir de 480 €/nuit',
    villaLabel:'La Villa', villaH1:'Un jardin de designer,', villaH2:'une adresse parfaite',
    galleryLabel:'Galerie Photos', galleryH1:'Intérieur &', galleryH2:'extérieur',
    tlLabel:'Une journée à la villa', tlH1:'Café du matin.', tlH2:'Dîner sous les étoiles.',
    locLabel:'Localisation', locH1:'L\'adresse la plus', locH2:'centrale de la Riviera',
    locCopy:'Cagnes-sur-Mer est au cœur géographique de la Côte d\'Azur. Pas un compromis — le centre stratégique. Nice, Antibes, Saint-Paul, Cannes, Monaco. Tous à portée de main.',
    bdLabel:'Réserver Direct', bdH1:'Économisez jusqu\'à', bdH2:'700 € par semaine',
    bdCopy:'Pas de frais de plateforme. Réservez directement avec Lana et gardez cet argent pour le rosé et les dîners étoilés.',
    htbLabel:'Comment Réserver', htbH1:'Trois étapes.', htbH2:'Votre villa vous attend.',
    lanaLabel:'Votre Hôtesse', lanaH1:'Lana.', lanaH2:'Dix ans. Chaque détail.',
    availLabel:'Disponibilités 2026', availH1:'Été — réservez', availH2:'dès maintenant',
    reviewLabel:'Avis Clients', reviewH1:'4,79★ sur', reviewH2:'38 séjours vérifiés',
    igLabel:'Suivez-nous', igH1:'@villa_augflor_france',
    faqLabel:'FAQ', faqH1:'Tout ce que', faqH2:'vous devez savoir',
    ctaLabel:'Réservez Votre Semaine', ctaH1:'Votre été sur la Riviera', ctaH2:'commence ici',
    ctaCopy:'Moins de trois semaines restent en haute saison 2026. Les réservations directes bénéficient de la priorité et du meilleur tarif garanti.',
    enquire:'Contacter via WhatsApp', viewAirbnb:'Voir sur Airbnb',
  },
  de: {
    book:'Direkt Buchen', checkAvail:'Verfügbarkeit prüfen', discover:'Die Villa entdecken ↓',
    heroLabel:'Cagnes-sur-Mer · Côte d\'Azur · Frankreich',
    heroTitle:['Zwischen Nizza und','Cannes liegt ein Garten.',''],
    heroSub:'Private Villa · 3 Schlafzimmer · Privatpool · Ab 480 €/Nacht',
    villaLabel:'Die Villa', villaH1:'Ein Designer-Garten,', villaH2:'eine perfekte Adresse',
    galleryLabel:'Fotogalerie', galleryH1:'Innen &', galleryH2:'außen',
    tlLabel:'Ein Tag in der Villa', tlH1:'Morgenkaffee.', tlH2:'Abendessen unter Sternen.',
    locLabel:'Lage', locH1:'Die zentralste', locH2:'Adresse der Riviera',
    locCopy:'Cagnes-sur-Mer liegt im geografischen Herz der Côte d\'Azur. Kein Kompromiss — das strategische Zentrum. Nizza, Antibes, Cannes, Monaco. Alles bequem erreichbar.',
    bdLabel:'Direkt Buchen & Sparen', bdH1:'Sparen Sie bis zu', bdH2:'700 € pro Woche',
    bdCopy:'Keine Plattformgebühren. Direkt mit Lana buchen und das Geld für Rosé und Gourmetdinners nutzen.',
    htbLabel:'Wie Buchen', htbH1:'Drei Schritte.', htbH2:'Ihre Villa wartet.',
    lanaLabel:'Ihre Gastgeberin', lanaH1:'Lana.', lanaH2:'Zehn Jahre. Jedes Detail.',
    availLabel:'Verfügbarkeit 2026', availH1:'Sommer — jetzt', availH2:'buchen',
    reviewLabel:'Gästebewertungen', reviewH1:'4,79★ in', reviewH2:'38 Aufenthalten',
    igLabel:'Folgen Sie uns', igH1:'@villa_augflor_france',
    faqLabel:'FAQ', faqH1:'Alles was Sie', faqH2:'wissen müssen',
    ctaLabel:'Ihre Woche Reservieren', ctaH1:'Ihr Riviera-Sommer', ctaH2:'beginnt hier',
    ctaCopy:'Nur noch wenige Wochen in der Hochsaison 2026 verfügbar. Direktbuchungen erhalten Priorität und den besten Preis.',
    enquire:'Anfrage per WhatsApp', viewAirbnb:'Auf Airbnb ansehen',
  }
};

const IMGS = [
  {src:'https://www.villa-augflor.com/images/img_7247-3.jpg',label:'Pool & Garden'},
  {src:'https://www.villa-augflor.com/images/img_7245-3.jpg',label:'Pool Terrace'},
  {src:'https://www.villa-augflor.com/images/img_7222-2.jpg',label:'Living Area'},
  {src:'https://www.villa-augflor.com/images/img_7237-2.jpg',label:'Outdoor Dining'},
  {src:'https://www.villa-augflor.com/images/img_7235-4.jpg',label:'Bedroom'},
  {src:'https://www.villa-augflor.com/images/airbnb-5bfc.jpg',label:'Villa Exterior'},
  {src:'https://www.villa-augflor.com/images/img_7340-2.jpg',label:'Mediterranean Garden'},
  {src:'https://www.villa-augflor.com/images/airbnb-345ec.jpg',label:'Garden'},
  {src:'https://www.villa-augflor.com/images/airbnb-31641.jpg',label:'Interior'},
  {src:'https://www.villa-augflor.com/images/airbnb-34e4.jpg',label:'Terrace View'},
  {src:'https://www.villa-augflor.com/images/img_7233-3.jpg',label:'Garden Detail'},
  {src:'https://www.villa-augflor.com/images/img_3325.jpg',label:'Villa Interior'},
  {src:'https://www.villa-augflor.com/images/airbnb-1ff50b5e.jpg',label:'Villa Overview'},
  {src:'https://www.villa-augflor.com/images/img_7236-3.jpg',label:'Interior Detail'},
];

const CALENDAR = [
  {month:'June',rate:480,rateGBP:412,rateUSD:525,weeks:[
    {label:'Jun 1–7',status:'av'},{label:'Jun 8–14',status:'bk'},
    {label:'Jun 15–21',status:'av'},{label:'Jun 22–28',status:'av'},
  ]},
  {month:'July',rate:520,rateGBP:448,rateUSD:570,weeks:[
    {label:'Jul 6–12',status:'av'},{label:'Jul 13–19',status:'bk'},
    {label:'Jul 20–26',status:'bk'},{label:'Jul 27–Aug 2',status:'av'},
  ]},
  {month:'August',rate:520,rateGBP:448,rateUSD:570,weeks:[
    {label:'Aug 3–9',status:'bk'},{label:'Aug 10–16',status:'bk'},
    {label:'Aug 17–23',status:'av'},{label:'Aug 24–30',status:'bk'},
  ]},
  {month:'September',rate:480,rateGBP:412,rateUSD:525,weeks:[
    {label:'Sep 7–13',status:'av'},{label:'Sep 14–20',status:'av'},
    {label:'Sep 21–27',status:'bk'},{label:'Sep 28–Oct 4',status:'av'},
  ]},
];

const REVIEWS = [
  {stars:5,text:'"The villa is a small paradise to escape to — one place safe and beautiful. We didn\'t want to leave."',author:'Maxim R. · Belgium · 2025'},
  {stars:5,text:'"Sur les hauteurs de Cagnes-sur-Mer, magnifique villa — jardin extraordinaire, décorée avec beaucoup de goût."',author:'Carl A. · France · 2024'},
  {stars:5,text:'"Hospitality was exceptional — we felt genuinely welcomed rather than just accommodated. The pool and garden are exactly as pictured."',author:'Verified Guest · Airbnb · 2024'},
];

const FAQS = [
  {q:'What is the minimum stay?',a:'A 7-night minimum applies for all open season months (June–September). Contact Lana directly if you\'re interested in a shorter stay — availability around existing bookings occasionally allows for it.'},
  {q:'How much does booking direct save?',a:'Up to 20% versus Airbnb, which charges a 14–17% guest service fee. On a peak-season week that\'s over €700 back in your pocket — plus direct communication with Lana and concierge access not available through any platform.'},
  {q:'What are the bed sizes?',a:'200×220 cm, 180×200 cm, and 160×200 cm. Let Lana know your preferences when booking — she\'ll allocate accordingly.'},
  {q:'Tell me more about the upper floor.',a:'The ground floor has all main living areas, kitchen, direct pool and terrace access — spacious and ideal. The upper level is a loft-style space, characterful and cosy, but with lower ceilings and a steep staircase. Guests who prefer standard ceiling heights may want to note this when requesting rooms.'},
  {q:'Is there parking? How do we get from Nice Airport?',a:'Private parking for 2 cars on site. Nice Airport is 15 minutes by car. Lana can arrange a private airport transfer (highly recommended). Cagnes-sur-Mer train station is also very close.'},
  {q:'Can we arrange a private chef?',a:'Yes — Lana works with trusted local chefs and caterers for everything from a Provençal dinner to a full-group feast with Bellet wine pairings. Mention it when you enquire.'},
];

const DESTS = [
  {name:'Haut-de-Cagnes village',time:'5 min'},
  {name:'Polygone Riviera shopping',time:'4 min'},
  {name:'Nice Côte d\'Azur Airport',time:'15 min'},
  {name:'Cros-de-Cagnes Beach',time:'15 min'},
  {name:'Saint-Paul-de-Vence',time:'15 min'},
  {name:'Nice city centre',time:'25 min'},
  {name:'Antibes old town',time:'25 min'},
  {name:'Cannes & La Croisette',time:'35 min'},
  {name:'Monaco & Monte-Carlo',time:'50 min'},
];

const TIMELINE = [
  {time:'07:30',title:'Morning coffee on the terrace',desc:'The garden is cool, the light is golden, the jasmine is already fragrant. Coffee on the upper terrace with the valley stretching below. Nobody is awake yet. This is yours.'},
  {time:'10:00',title:'Into the pool',desc:'Sun hits the pool by mid-morning and stays until evening. There is nothing to do except float, read, and argue gently about where to have lunch.'},
  {time:'12:30',title:'The market or the beach',desc:'Five minutes to the sea, or twenty-five to the best Provençal market on the coast. You decide over breakfast. Either way, lunch is sorted.'},
  {time:'17:00',title:'Aperitif hour',desc:'The bougainvillea is at its best in the late afternoon. A glass of Château Minuty rosé, cold from the fridge, in the shade of the garden. The Riviera is performing.'},
  {time:'20:00',title:'Dinner under the fig tree',desc:'The outdoor kitchen, local ingredients from the market, the long Mediterranean dusk. Or Lana has a number for a private chef who can handle the whole thing for you.'},
  {time:'23:00',title:'Stars over Cagnes',desc:'The valley goes quiet. The hills are lit. Switch off the phones, keep the rosé. This is the Côte d\'Azur as it was always meant to feel.'},
];

const TICKER_ITEMS = [
  '15 min from Nice Airport','Private pool · all day sun','Designer garden · nothing like it','Save 20% booking direct',
  '4.79★ across 38 stays','Between Nice, Antibes & Cannes','Personal hosting by Lana','Sleeps 6 · 3 bedrooms',
  '15 min from Nice Airport','Private pool · all day sun','Designer garden · nothing like it','Save 20% booking direct',
  '4.79★ across 38 stays','Between Nice, Antibes & Cannes','Personal hosting by Lana','Sleeps 6 · 3 bedrooms',
];

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const fn = () => setY(window.scrollY);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return y;
}

function useCountUp(target, duration, active) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const step = ts => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setCount(Math.round(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);
  return count;
}

Object.assign(window, {
  WA, STRINGS, IMGS, CALENDAR, REVIEWS, FAQS, DESTS, TIMELINE, TICKER_ITEMS,
  useReveal, useScrollY, useCountUp,
});
