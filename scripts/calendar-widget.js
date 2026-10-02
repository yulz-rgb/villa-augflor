/* Calendar is an enquiry aid, never an inventory guarantee. No simulated bookings. */
(function () {
  'use strict';
  var YEAR = 2027;
  var months = [5, 6, 7, 8];
  var locale = document.documentElement.lang || 'en';
  var pad = function(n){return String(n).padStart(2,'0');};
  var key = function(y,m,d){return y+'-'+pad(m+1)+'-'+pad(d);};
  var today = new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  async function render() {
    var hosts = document.querySelectorAll('[data-calendar]');
    if (!hosts.length) return;
    var busy = new Set(), source = 'unknown', updated = '';
    var ctrl = new AbortController(), timeout = setTimeout(function(){ctrl.abort();},9000);
    try {
      var response = await fetch('/api/calendar',{headers:{Accept:'application/json'},signal:ctrl.signal});
      if (!response.ok) throw new Error('Calendar unavailable');
      var data = await response.json();
      if (data && data.ok && Array.isArray(data.busyDates)) {
        data.busyDates.filter(function(d){return /^\d{4}-\d{2}-\d{2}$/.test(d);}).forEach(function(d){busy.add(d);});
        source = data.source || 'unknown';
        if (typeof data.updated === 'string' && !isNaN(Date.parse(data.updated))) updated = new Date(data.updated).toLocaleDateString(locale);
      }
    } catch (_) { /* Unknown dates remain unknown; never fabricate available or booked days. */ }
    finally { clearTimeout(timeout); }
    var html=months.map(function(month){
      var first = new Date(Date.UTC(YEAR,month,1)), days = new Date(Date.UTC(YEAR,month+1,0)).getUTCDate();
      var name = first.toLocaleDateString(locale,{month:'long',year:'numeric',timeZone:'UTC'});
      var cells = ['M','T','W','T','F','S','S'].map(function(d){return '<div class="cal-day empty cal-dow" aria-hidden="true">'+d+'</div>';}).join('');
      for(var lead=0;lead<(first.getUTCDay()+6)%7;lead++)cells+='<div class="cal-day empty"></div>';
      for(var day=1;day<=days;day++){
        var date=key(YEAR,month,day), state=date<today?'past':busy.has(date)?'booked':'unknown';
        var label=state==='past'?'Past date':state==='booked'?'Blocked in the available calendar data':'Ask Lana to confirm this date';
        cells+='<div class="cal-day '+state+'" title="'+date+' — '+label+'">'+day+'</div>';
      }
      return '<div class="cal-month"><h4>'+name+'</h4><div class="cal-days">'+cells+'</div></div>';
    }).join('');
    var note=(source==='merged'||source==='ical')?'Blocked dates were fetched from configured calendars. All other dates still require Lana\u2019s confirmation.':'Live availability is not verified. Please ask Lana to confirm your dates.';
    if(source==='partial')note='Some calendar sources could not be checked. Do not treat unmarked dates as available.';
    if(source==='static')note='Historic or manually entered blocks only'+(updated?' (updated '+updated+')':'')+'. Please confirm all dates with Lana.';
    hosts.forEach(function(host){host.innerHTML='<div class="cal-months">'+html+'</div><div class="cal-legend"><span>Unmarked: confirmation required</span><span>Marked: blocked in available data</span></div><p class="va-calendar-note"></p>';host.querySelector('.va-calendar-note').textContent=note;host.removeAttribute('aria-busy');});
    document.querySelectorAll('[data-open-windows]').forEach(function(el){el.textContent='Summer 2027: send your dates and guest count to Lana. Availability and prices require written confirmation.';});
    var table=document.querySelector('[data-month-table]');
    if(table)table.innerHTML=months.map(function(month){var name=new Date(Date.UTC(YEAR,month,1)).toLocaleDateString(locale,{month:'long',year:'numeric',timeZone:'UTC'});return '<tr><td>'+name+'</td><td>Quote on request</td><td>Confirmation required</td><td><a href="/contact.html">Enquire</a></td></tr>';}).join('');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
})();
