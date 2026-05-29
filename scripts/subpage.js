/* Villa Augflor subpages — load nav/footer, calendar, active nav */
(function () {
  "use strict";

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

  function activeNav() {
    const path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll("#nav .nav-links a").forEach((a) => {
      const href = (a.getAttribute("href") || "").split("#")[0];
      if (href === path) a.classList.add("active");
    });
  }

  function ymd(y, m, d) {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  async function fetchBusyDates() {
    try {
      const res = await fetch("/api/calendar", { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("calendar unavailable");
      const data = await res.json();
      const busy = new Set(data.busy || []);
      return { busy, source: data.source || "ical", message: data.message };
    } catch {
      return { busy: null, source: "mock", message: null };
    }
  }

  function mockBusyWeeks(year, months, rnd) {
    const map = new Map();
    months.forEach((m) => {
      const first = new Date(year, m.idx, 1);
      const days = new Date(year, m.idx + 1, 0).getDate();
      const lead = (first.getDay() + 6) % 7;
      const weeks = Math.ceil((days + lead) / 7);
      const booked = new Set();
      for (let w = 0; w < weeks; w++) {
        if (rnd() < 0.35) booked.add(w);
      }
      map.set(m.idx, { lead, bookedWeeks: booked });
    });
    return map;
  }

  async function calendar() {
    const host = document.querySelector("[data-calendar]");
    if (!host) return;
    const year = 2026;
    const months = [
      { name: "May", idx: 4, price: "€480" },
      { name: "Jun", idx: 5, price: "€420" },
      { name: "Jul", idx: 6, price: "€480" },
      { name: "Aug", idx: 7, price: "€480" },
      { name: "Sep", idx: 8, price: "€420" },
    ];
    const { busy, source, message } = await fetchBusyDates();
    const rnd = (() => {
      let s = Date.now() >> 20;
      return () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
      };
    })();
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
            <div class="cal-day empty" style="font-size:.6rem;color:var(--muted)">M</div>
            <div class="cal-day empty" style="font-size:.6rem;color:var(--muted)">T</div>
            <div class="cal-day empty" style="font-size:.6rem;color:var(--muted)">W</div>
            <div class="cal-day empty" style="font-size:.6rem;color:var(--muted)">T</div>
            <div class="cal-day empty" style="font-size:.6rem;color:var(--muted)">F</div>
            <div class="cal-day empty" style="font-size:.6rem;color:var(--muted)">S</div>
            <div class="cal-day empty" style="font-size:.6rem;color:var(--muted)">S</div>
            ${cells}
          </div>
        </div>`;
    }).join("");

    let legendNote = "Indicative — confirmed on enquiry";
    if (source === "ical") legendNote = "Live sync from Airbnb + Booking";
    else if (source === "mock") legendNote = "Demo preview — confirm dates with Lana";

    host.innerHTML = `
      <div class="cal-months">${html}</div>
      <div class="cal-legend">
        <span><i style="background:#c8dfe5"></i> Open to enquire</span>
        <span><i style="background:var(--sand)"></i> Booked / blocked</span>
        <span>${legendNote}</span>
      </div>`;
  }

  document.addEventListener("DOMContentLoaded", async () => {
    await loadComponents();
    activeNav();
    await calendar();
  });
})();
