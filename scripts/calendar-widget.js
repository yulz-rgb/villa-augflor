/* Shared live availability calendar — homepage + rates page */
(function () {
  "use strict";

  function ymd(y, m, d) {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  async function fetchBusyDates() {
    try {
      const res = await fetch("/api/calendar", { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      if (data && data.ok && Array.isArray(data.busyDates) && data.busyDates.length && data.source !== "none") {
        return { busy: new Set(data.busyDates), source: data.source, message: data.message || "" };
      }
      if (data && data.source === "none") {
        return { busy: new Set(), source: "none", message: data.message || "" };
      }
    } catch {
      /* fall through */
    }
    return { busy: null, source: "mock", message: "" };
  }

  function mockBusyWeeks(year, months, rnd) {
    const map = new Map();
    months.forEach((m) => {
      const days = new Date(year, m.idx + 1, 0).getDate();
      const lead = (new Date(year, m.idx, 1).getDay() + 6) % 7;
      const weeks = Math.ceil((days + lead) / 7);
      const booked = new Set();
      for (let w = 0; w < weeks; w++) {
        if (rnd() < 0.35) booked.add(w);
      }
      map.set(m.idx, { lead, bookedWeeks: booked });
    });
    return map;
  }

  function formatRange(from, to) {
    const fmt = (iso) => {
      const d = new Date(iso + "T12:00:00");
      return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    };
    if (from === to) return fmt(from);
    return `${fmt(from)} – ${fmt(to)}`;
  }

  /** Build human-readable open windows from busy set (season months only). */
  function openWindows(year, months, busy) {
    const ranges = [];
    months.forEach((m) => {
      const days = new Date(year, m.idx + 1, 0).getDate();
      let start = null;
      for (let d = 1; d <= days; d++) {
        const key = ymd(year, m.idx, d);
        const open = !busy || !busy.has(key);
        if (open && !start) start = key;
        if ((!open || d === days) && start) {
          const end = open && d === days ? key : ymd(year, m.idx, d - 1);
          ranges.push({ month: m.name, from: start, to: end });
          start = null;
        }
      }
    });
    return ranges;
  }

  function renderOpenSummary(ranges) {
    if (!ranges.length) return "Contact Lana for current availability.";
    const parts = ranges.map((r) => {
      const sameMonth = r.from.slice(0, 7) === r.to.slice(0, 7);
      if (sameMonth && r.from === r.to) return `${r.month} ${formatRange(r.from, r.to)}`;
      if (sameMonth) return `${r.month} ${formatRange(r.from, r.to)}`;
      return formatRange(r.from, r.to);
    });
    return `<strong>Open to enquire:</strong> ${parts.join(" · ")}`;
  }

  async function renderCalendar() {
    const host = document.querySelector("[data-calendar]");
    if (!host) return;

    host.setAttribute("aria-busy", "true");
    const year = 2026;
    const months = [
      { name: "Jun", idx: 5, price: "€420" },
      { name: "Jul", idx: 6, price: "€480" },
      { name: "Aug", idx: 7, price: "€480" },
      { name: "Sep", idx: 8, price: "€420" },
    ];

    const { busy, source, message } = await fetchBusyDates();
    const rnd = (() => {
      let s = 20260529;
      return () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
      };
    })();
    const mockMap = busy ? null : mockBusyWeeks(year, months, rnd);
    const effectiveBusy = busy || new Set();

    const html = months.map((m) => {
      const days = new Date(year, m.idx + 1, 0).getDate();
      const lead = (new Date(year, m.idx, 1).getDay() + 6) % 7;
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
        cells += `<div class="cal-day ${cls}" title="${cls === "booked" ? "Booked" : "Open to enquire"}">${d}</div>`;
      }
      return `
        <div class="cal-month">
          <h4>${m.name} ${year} — ${m.price}/n</h4>
          <div class="cal-days">
            <div class="cal-day empty cal-dow">M</div>
            <div class="cal-day empty cal-dow">T</div>
            <div class="cal-day empty cal-dow">W</div>
            <div class="cal-day empty cal-dow">T</div>
            <div class="cal-day empty cal-dow">F</div>
            <div class="cal-day empty cal-dow">S</div>
            <div class="cal-day empty cal-dow">S</div>
            ${cells}
          </div>
        </div>`;
    }).join("");

    let legendNote = "Indicative — Lana confirms on enquiry";
    if (source === "merged" || source === "ical") legendNote = "Live sync from Airbnb + Booking · updates ~5 min";
    else if (source === "static") legendNote = "Synced from Airbnb May 2026 · confirm on enquiry";
    else if (source === "none") legendNote = message || "Confirm dates with Lana";
    else if (source === "mock") legendNote = "Preview only — confirm dates with Lana";

    host.innerHTML = `
      <div class="cal-months">${html}</div>
      <div class="cal-legend">
        <span><i class="cal-swatch cal-swatch-open"></i> Open to enquire</span>
        <span><i class="cal-swatch cal-swatch-booked"></i> Booked</span>
        <span>${legendNote}</span>
      </div>`;
    host.removeAttribute("aria-busy");

    const summaryEl = document.querySelector("[data-open-windows]");
    if (summaryEl && busy) {
      summaryEl.innerHTML = renderOpenSummary(openWindows(year, months, effectiveBusy));
    } else if (summaryEl && !busy) {
      summaryEl.textContent = "Loading calendar… refresh if dates do not appear.";
    }
  }

  document.addEventListener("DOMContentLoaded", renderCalendar);
})();
