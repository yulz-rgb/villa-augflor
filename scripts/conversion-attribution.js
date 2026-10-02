/* First-party, privacy-minimised conversion attribution. No form values are sent. */
(function(){'use strict';
function context(){var p=new URLSearchParams(location.search);return{page:location.pathname.slice(0,160),referrer:(document.referrer?new URL(document.referrer).hostname:'').slice(0,120),utm_source:(p.get('utm_source')||'').slice(0,80),utm_medium:(p.get('utm_medium')||'').slice(0,80),utm_campaign:(p.get('utm_campaign')||'').slice(0,100)}}
function event(name){try{navigator.sendBeacon('/api/conversion-event',new Blob([JSON.stringify({event:name,...context()})],{type:'application/json'}));}catch(_){}}
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a');if(!a)return;var h=a.href||'';if(h.includes('wa.me/'))event('whatsapp_click');else if(h.startsWith('mailto:'))event('email_click');else if(/airbnb|booking\.com|vrbo/i.test(h))event('platform_click');});
window.addEventListener('villa-enquiry-handoff',function(e){event('enquiry_'+((e.detail&&e.detail.channel)||'handoff'));});
})();