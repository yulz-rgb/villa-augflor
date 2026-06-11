const fs = require("fs");
const path = require("path");

function parseYmd(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function formatYmd(d) {
  return d.toISOString().slice(0, 10);
}

function addDays(d, n) {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}

/** Merge consecutive open days into [start, end] windows (inclusive). */
function openWindows(busySet, from, to) {
  const windows = [];
  let winStart = null;
  for (let d = new Date(from); d <= to; d = addDays(d, 1)) {
    const key = formatYmd(d);
    const open = !busySet.has(key);
    if (open && !winStart) winStart = new Date(d);
    if (!open && winStart) {
      windows.push({ start: formatYmd(winStart), end: formatYmd(addDays(d, -1)) });
      winStart = null;
    }
  }
  if (winStart) windows.push({ start: formatYmd(winStart), end: formatYmd(to) });
  return windows;
}

function loadBusyDates() {
  const file = path.join(__dirname, "../../../data/calendar-busy.json");
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  return new Set(data.busyDates || []);
}

function getOpenDateSummary(daysAhead = 120) {
  const busy = loadBusyDates();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const end = addDays(today, daysAhead);
  const windows = openWindows(busy, today, end);
  return { windows, updated: new Date().toISOString(), busyCount: busy.size };
}

module.exports = { getOpenDateSummary, formatYmd, openWindows, loadBusyDates };
