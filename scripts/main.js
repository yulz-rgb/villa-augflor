/* =========================================================
   Villa Augflor — Main script
   Components loader, sticky CTA, lightbox, calendar (live /api/calendar or mock),
   scroll reveal, form handler, menu toggle.
   Pure vanilla JS, no dependencies.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Component loader ---------- */
  // Allows modular partials: <div data-include="components/header.html"></div>
  async function loadComponents() {
    const slots = document.querySelectorAll("[data-include]");
    await Promise.all(Array.from(slots).map(async (el) => {
      const src = el.getAttribute("data-include");
      try {
        const res = await fetch(src);
        if (!res.ok) throw new Error(res.statusText);
        el.outerHTML = await res.text();
      } catch (e) {
        console.warn("Component failed:", src, e);
      }
    }));
  }

  /* ---------- Header scroll state + mobile menu ---------- */
  function header() {
    const h = document.querySelector(".site-header");
    if (!h) return;
    const setState = () => h.classList.toggle("is-scrolled", window.scrollY > 8);
    setState();
    window.addEventListener("scroll", setState, { passive: true });

    const toggle = document.querySelector(".menu-toggle");
    const menu   = document.querySelector(".mobile-menu");
    if (toggle && menu) {
      toggle.addEventListener("click", () => menu.classList.toggle("open"));
      menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => menu.classList.remove("open")));
    }

    // Mark active nav link
    const path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a, .mobile-menu a").forEach(a => {
      const href = a.getAttribute("href") || "";
      const base = href.split("#")[0];
      if (base === path || (path === "" && base === "index.html")) a.classList.add("active");
    });
  }

  /* ---------- Sticky CTA appearance ---------- */
  function stickyCta() {
    const bar = document.querySelector(".sticky-cta");
    if (!bar) return;
    const hero = document.querySelector(".hero");
    const trigger = hero ? hero.offsetHeight * 0.6 : 400;
    const show = () => bar.classList.toggle("visible", window.scrollY > trigger);
    show();
    window.addEventListener("scroll", show, { passive: true });
  }

  /* ---------- Lightbox for gallery ---------- */
  function lightbox() {
    const figs = document.querySelectorAll(".gallery-grid figure img");
    if (!figs.length) return;
    const box  = document.createElement("div");
    box.className = "lightbox";
    box.innerHTML = `
      <button class="close" aria-label="Close">✕</button>
      <button class="nav-prev" aria-label="Previous">‹</button>
      <button class="nav-next" aria-label="Next">›</button>
      <img alt="">`;
    document.body.appendChild(box);
    const img = box.querySelector("img");
    const imgs = Array.from(figs).map(i => i.dataset.full || i.src);
    let idx = 0;
    const show = (i) => { idx = (i + imgs.length) % imgs.length; img.src = imgs[idx]; box.classList.add("open"); };
    figs.forEach((el, i) => el.addEventListener("click", () => show(i)));
    box.querySelector(".close").addEventListener("click", () => box.classList.remove("open"));
    box.querySelector(".nav-prev").addEventListener("click", (e) => { e.stopPropagation(); show(idx - 1); });
    box.querySelector(".nav-next").addEventListener("click", (e) => { e.stopPropagation(); show(idx + 1); });
    box.addEventListener("click", (e) => { if (e.target === box) box.classList.remove("open"); });
    document.addEventListener("keydown", (e) => {
      if (!box.classList.contains("open")) return;
      if (e.key === "Escape") box.classList.remove("open");
      if (e.key === "ArrowLeft")  show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
  }

  /** YYYY-MM-DD for a calendar day in local (display) month grid — matches iCal DATE keys from server */
  function ymd(year, monthIndex, day) {
    const mm = String(monthIndex + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  }

  /** Try live calendar from Vercel `/api/calendar` (merges Airbnb + Booking iCals). Falls back to mock. */
  async function fetchBusyDates() {
    try {
      const res = await fetch("/api/calendar", { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      if (data && data.ok && data.source === "ical" && Array.isArray(data.busyDates)) {
        return { busy: new Set(data.busyDates), source: "ical", message: "" };
      }
      if (data && data.source === "none") {
        return { busy: null, source: "none", message: data.message || "" };
      }
    } catch {
      /* offline / python server / no API — fall through */
    }
    return { busy: null, source: "mock", message: "" };
  }

  function mockBusyWeeks(year, months, rnd) {
    /** @returns {Map<number, Set<number>>} monthIndex -> set of week indices 0.. */
    const map = new Map();
    months.forEach((m) => {
      const first = new Date(year, m.idx, 1);
      const days = new Date(year, m.idx + 1, 0).getDate();
      const lead = (first.getDay() + 6) % 7;
      const weekCount = Math.ceil((days + lead) / 7);
      const bookedWeeks = new Set();
      const nBooked = m.idx === 6 || m.idx === 7 ? 2 : 1;
      while (bookedWeeks.size < nBooked) bookedWeeks.add(Math.floor(rnd() * weekCount));
      map.set(m.idx, { lead, days, bookedWeeks });
    });
    return map;
  }

  async function calendar() {
    const host = document.querySelector("[data-calendar]");
    if (!host) return;
    const year = 2026;
    const months = [
      { name: "Jun", idx: 5, price: "€480" },
      { name: "Jul", idx: 6, price: "€520" },
      { name: "Aug", idx: 7, price: "€520" },
      { name: "Sep", idx: 8, price: "€480" },
    ];

    const { busy, source, message } = await fetchBusyDates();
    const seedRand = (s) => () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    const rnd = seedRand(Date.now() >> 20);
    const mockMap = busy ? null : mockBusyWeeks(year, months, rnd);

    const html = months.map((m) => {
      const first = new Date(year, m.idx, 1);
      const days = new Date(year, m.idx + 1, 0).getDate();
      const lead = (first.getDay() + 6) % 7;
      const mock = mockMap ? mockMap.get(m.idx) : null;

      let cells = "";
      for (let i = 0; i < lead; i++) cells += `<div class="cal-day empty"></div>`;
      for (let d = 1; d <= days; d++) {
        const key = ymd(year, m.idx, d);
        let cls = "available";
        if (busy && busy.has(key)) cls = "booked";
        else if (!busy && mock) {
          const w = Math.floor((d - 1 + mock.lead) / 7);
          cls = mock.bookedWeeks.has(w) ? "booked" : "available";
        }
        cells += `<div class="cal-day ${cls}">${d}</div>`;
      }
      return `
        <div class="cal-month">
          <h4>${m.name} ${year} — from ${m.price}/n</h4>
          <div class="cal-days">
            <div class="cal-day empty" style="font-size:.6rem;color:var(--mute)">M</div>
            <div class="cal-day empty" style="font-size:.6rem;color:var(--mute)">T</div>
            <div class="cal-day empty" style="font-size:.6rem;color:var(--mute)">W</div>
            <div class="cal-day empty" style="font-size:.6rem;color:var(--mute)">T</div>
            <div class="cal-day empty" style="font-size:.6rem;color:var(--mute)">F</div>
            <div class="cal-day empty" style="font-size:.6rem;color:var(--mute)">S</div>
            <div class="cal-day empty" style="font-size:.6rem;color:var(--mute)">S</div>
            ${cells}
          </div>
        </div>`;
    }).join("");

    let legendNote = "Indicative — confirmed on enquiry";
    if (source === "ical") legendNote = "Live sync from Airbnb + Booking (updates every ~5 min)";
    else if (source === "none") legendNote = message || "Add iCal URLs in Vercel to enable live sync";
    else if (source === "mock") legendNote = "Demo preview — deploy to Vercel with iCal env for live dates";

    host.innerHTML = `
      <div class="cal-months">${html}</div>
      <div class="cal-legend">
        <span><i style="background:#e6f0e9"></i> Open to enquire</span>
        <span><i style="background:var(--line)"></i> Booked / blocked</span>
        <span>${legendNote}</span>
      </div>`;
  }

  /* ---------- Scroll reveal ---------- */
  function reveal() {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(e => io.observe(e));
  }

  /* ---------- Booking form ---------- */
  function bookingForm() {
    const form = document.querySelector("#booking-form");
    if (!form) return;

    // Set date min = today
    const today = new Date().toISOString().slice(0, 10);
    form.querySelectorAll('input[type="date"]').forEach(i => i.min = today);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());

      // Build a pre-filled WhatsApp message as a fallback. No backend needed.
      const body = [
        "Hello Lana,",
        "",
        "I would like to enquire about Villa Augflor.",
        "",
        `Name: ${(data.firstName || "").trim()} ${(data.lastName || "").trim()}`.trim(),
        `Arrival: ${data.arrival || "—"}`,
        `Departure: ${data.departure || "—"}`,
        `Guests: ${data.guests || "—"}`,
        `Email: ${data.email || "—"}`,
        `Phone: ${data.phone || "—"}`,
        "",
        (data.message || "").trim(),
      ].join("\n");

      const params = new URLSearchParams();
      params.set("subject", "Booking enquiry — Villa Augflor");
      params.set("body", body);
      const mailto = `mailto:villa.augflor@gmail.com?${params.toString()}`;

      // Show success state
      form.style.display = "none";
      const ok = document.querySelector(".form-success");
      if (ok) ok.style.display = "block";

      // Open mail client so the enquiry actually reaches the host
      window.location.href = mailto;
    });
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", async () => {
    await loadComponents();
    header();
    stickyCta();
    lightbox();
    await calendar();
    reveal();
    bookingForm();
  });
})();
