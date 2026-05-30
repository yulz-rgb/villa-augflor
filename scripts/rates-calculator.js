(function () {
  var P = window.VillaAugflorPricing;
  if (!P) return;

  function nightlyRate(month) {
    if (month === 7 || month === 8) return P.PEAK;
    return P.SHOULDER;
  }

  function calc(checkin, checkout, guests) {
    var start = new Date(checkin + "T12:00:00");
    var end = new Date(checkout + "T12:00:00");
    if (!(start < end)) return null;
    var nights = 0;
    var rent = 0;
    var d = new Date(start);
    while (d < end) {
      nights++;
      rent += nightlyRate(d.getMonth() + 1);
      d.setDate(d.getDate() + 1);
    }
    var g = Math.max(1, Math.min(6, parseInt(guests, 10) || 4));
    var taxe = P.taxeDeSejour(g, nights);
    return { nights: nights, rent: rent, cleaning: P.CLEANING, taxe: taxe, total: rent + P.CLEANING + taxe };
  }

  document.querySelectorAll("[data-rates-calculator]").forEach(function (root) {
    root.innerHTML =
      '<div class="rates-calc">' +
      '<label>Check-in <input type="date" data-rc-in></label>' +
      '<label>Check-out <input type="date" data-rc-out></label>' +
      '<label>Paying adults <input type="number" data-rc-guests min="1" max="6" value="4"></label>' +
      '<button type="button" class="btn btn-primary" data-rc-run>Estimate total</button>' +
      '<div class="rates-calc-result" data-rc-result aria-live="polite"></div>' +
      '<p class="note">' +
      P.TAXE_NOTE +
      " Mixed shoulder/peak weeks use nightly rate per date. Exact total on written quote." +
      "</p>" +
      "</div>";

    root.querySelector("[data-rc-run]").addEventListener("click", function () {
      var cin = root.querySelector("[data-rc-in]").value;
      var cout = root.querySelector("[data-rc-out]").value;
      var g = root.querySelector("[data-rc-guests]").value;
      var out = root.querySelector("[data-rc-result]");
      var r = calc(cin, cout, g);
      if (!r) {
        out.textContent = "Please enter valid check-in and check-out dates.";
        return;
      }
      out.innerHTML =
        "<strong>" +
        r.nights +
        " nights</strong><br>" +
        "Rent: €" +
        r.rent.toLocaleString("en-GB") +
        "<br>" +
        "Cleaning: €" +
        r.cleaning +
        "<br>" +
        "Taxe de séjour (€" +
        P.TAXE_PER_GUEST_NIGHT +
        "/adult/night, 4★ rate): €" +
        r.taxe +
        "<br>" +
        "<strong>Estimated total: €" +
        r.total.toLocaleString("en-GB") +
        "</strong><br>" +
        '<span style="font-size:13px;color:var(--muted)">+ €500 refundable security deposit on arrival (not included)</span>';
    });
  });
})();
