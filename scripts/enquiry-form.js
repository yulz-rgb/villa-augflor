(function () {
  var TRIP_TYPES = [
    { value: "family", label: "Family" },
    { value: "couple", label: "Couple" },
    { value: "friends", label: "Friends" },
    { value: "other", label: "Other" }
  ];

  function buildMessage(data) {
    var lines = [
      "Villa Augflor enquiry",
      "",
      "Check-in: " + (data.checkin || "—"),
      "Check-out: " + (data.checkout || "—"),
      "Adults: " + (data.adults || "—"),
      "Children: " + (data.children || "0"),
      "Country: " + (data.country || "—"),
      "Email: " + (data.email || "—"),
      "Phone/WhatsApp: " + (data.phone || "—"),
      "Trip type: " + (data.trip || "—"),
      "",
      "Must-haves or concerns:",
      data.notes || "—"
    ];
    return lines.join("\n");
  }

  function renderForm(root, compact) {
    var id = "vf-" + Math.random().toString(36).slice(2, 9);
    var tripOptions = TRIP_TYPES.map(function (t) {
      return '<option value="' + t.value + '">' + t.label + "</option>";
    }).join("");

    root.innerHTML =
      '<form class="enquiry-form' + (compact ? " enquiry-form--compact" : "") + '" id="' + id + '" novalidate>' +
      '<div class="enquiry-grid">' +
      '<label>Check-in date<input type="date" name="checkin" required></label>' +
      '<label>Check-out date<input type="date" name="checkout" required></label>' +
      '<label>Adults<input type="number" name="adults" min="1" max="6" value="2" required></label>' +
      '<label>Children<input type="number" name="children" min="0" max="4" value="0"></label>' +
      '<label>Country<input type="text" name="country" autocomplete="country-name" required></label>' +
      '<label>Email<input type="email" name="email" autocomplete="email" required></label>' +
      '<label>WhatsApp / phone<input type="tel" name="phone" autocomplete="tel"></label>' +
      '<label>Trip type<select name="trip" required><option value="">Select…</option>' + tripOptions + "</select></label>" +
      '<label class="enquiry-full">Must-haves or concerns<textarea name="notes" rows="3" placeholder="Ground-floor bedroom, cot, dietary needs, mobility…"></textarea></label>' +
      "</div>" +
      '<div class="enquiry-actions">' +
      '<button type="submit" class="btn-primary">Prepare email enquiry</button>' +
      '<a class="btn-outline enquiry-wa" href="#" target="_blank" rel="noopener noreferrer">Open in WhatsApp</a>' +
      "</div>" +
      '<p class="enquiry-note">No server upload — your message opens in your email app or WhatsApp for you to send.</p>' +
      "</form>";

    var form = root.querySelector("form");
    var wa = root.querySelector(".enquiry-wa");

    function getData() {
      var fd = new FormData(form);
      return {
        checkin: fd.get("checkin"),
        checkout: fd.get("checkout"),
        adults: fd.get("adults"),
        children: fd.get("children") || "0",
        country: fd.get("country"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        trip: fd.get("trip"),
        notes: fd.get("notes")
      };
    }

    function updateWa() {
      var d = getData();
      var text = "Hi Lana, please check Villa Augflor.\n\n" + buildMessage(d);
      wa.href = "https://wa.me/33623777333?text=" + encodeURIComponent(text);
    }

    form.addEventListener("input", updateWa);
    updateWa();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var d = getData();
      var subject = encodeURIComponent("Villa Augflor enquiry — " + (d.checkin || "dates TBC"));
      var body = encodeURIComponent(buildMessage(d));
      window.location.href = "mailto:villa.augflor@gmail.com?subject=" + subject + "&body=" + body;
    });
  }

  document.querySelectorAll("[data-enquiry-form]").forEach(function (el) {
    renderForm(el, el.getAttribute("data-compact") === "true");
  });
})();
