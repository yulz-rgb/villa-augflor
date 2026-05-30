/**
 * Canonical Villa Augflor pricing — keep in sync with HANDOVER.md
 * Taxe de séjour: 4-star classified rate, Métropole Nice Côte d'Azur (incl. Cagnes-sur-Mer), 2025–2026
 */
(function (global) {
  "use strict";

  var P = {
    SHOULDER: 420,
    PEAK: 480,
    CLEANING: 120,
    DEPOSIT: 500,
    TAXE_PER_GUEST_NIGHT: 2.53,
    TAXE_CLASSIFICATION: "4-star classified meublé de tourisme",
    TAXE_NOTE:
      "€2.53 per paying adult per night (4-star classified rate, Métropole Nice Côte d'Azur). Under-18s exempt.",
    EXAMPLE_GUESTS: 4,
    EXAMPLE_NIGHTS: 7,
    WA_AVAILABILITY:
      "https://wa.me/33623777333?text=Hi%20Lana%2C%20please%20check%20Villa%20Augflor%20availability.%20Dates%3A%20%5Bcheck-in%5D%20to%20%5Bcheck-out%5D.%20Guests%3A%20%5Bnumber%5D.",
    AIRBNB_ILLUSTRATIVE: { nightly: 520, guestFeePct: 0.12, cleaning: 150 },
  };

  function taxeDeSejour(guests, nights) {
    var g = Math.max(1, Math.min(6, guests || P.EXAMPLE_GUESTS));
    var n = Math.max(1, nights || 1);
    return Math.round(P.TAXE_PER_GUEST_NIGHT * g * n * 100) / 100;
  }

  function stayTotal(nightly, guests, nights) {
    var rent = nightly * nights;
    var taxe = taxeDeSejour(guests, nights);
    return {
      rent: rent,
      cleaning: P.CLEANING,
      taxe: taxe,
      total: rent + P.CLEANING + taxe,
    };
  }

  P.taxeDeSejour = taxeDeSejour;
  P.stayTotal = stayTotal;
  P.shoulderExample = stayTotal(P.SHOULDER, P.EXAMPLE_GUESTS, P.EXAMPLE_NIGHTS);
  P.peakExample = stayTotal(P.PEAK, P.EXAMPLE_GUESTS, P.EXAMPLE_NIGHTS);

  var ab = P.AIRBNB_ILLUSTRATIVE;
  var abRent = ab.nightly * P.EXAMPLE_NIGHTS;
  var abFee = Math.round(abRent * ab.guestFeePct);
  P.airbnbIllustrativeTotal =
    abRent + abFee + ab.cleaning + taxeDeSejour(P.EXAMPLE_GUESTS, P.EXAMPLE_NIGHTS);
  P.directPeakSavings = Math.round(P.airbnbIllustrativeTotal - P.peakExample.total);

  global.VillaAugflorPricing = P;
})(typeof window !== "undefined" ? window : globalThis);
