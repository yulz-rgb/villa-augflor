/* Progressive enquiry handoff. Nothing is sent, booked or paid on this website. */
(function(){
 'use strict';
 function mount(root){
  root.innerHTML='<form class="enquiry-form'+(root.dataset.compact==='true'?' enquiry-form--compact':'')+'"><div class="enquiry-grid">'+
   '<label>Check-in date<input type="date" name="checkin" required></label><label>Check-out date<input type="date" name="checkout" required></label>'+
   '<label>Adults<input type="number" name="adults" min="1" max="6" step="1" value="2" required inputmode="numeric"></label><label>Children<input type="number" name="children" min="0" max="5" step="1" value="0" required inputmode="numeric"></label>'+
   '<label>Email (optional)<input type="email" name="email" autocomplete="email" maxlength="200"></label><label>Phone (optional)<input type="tel" name="phone" autocomplete="tel" maxlength="50"></label>'+
   '<label class="enquiry-full">Anything else Lana should know?<textarea name="notes" rows="3" maxlength="1500" placeholder="Flexible dates, room preferences or questions"></textarea></label></div>'+
   '<div class="enquiry-actions"><button type="submit" class="btn-primary" name="channel" value="whatsapp">Continue to WhatsApp</button><button type="submit" class="btn-outline" name="channel" value="email">Prepare email</button><button type="button" class="btn-outline" data-copy>Copy enquiry</button></div>'+
   '<p class="enquiry-note">Maximum 6 guests including children. These are enquiry dates, not a reservation. You review and send the message in WhatsApp or your email app. <a href="/privacy-policy.html">Privacy</a>.</p><p class="enquiry-note" role="status" aria-live="polite"></p></form>';
  var form=root.querySelector('form'),status=form.querySelector('[role=status]'),inputs=form.elements;
  var today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  inputs.checkin.min=today;inputs.checkout.min=today;
  function valid(){
   inputs.checkout.setCustomValidity('');inputs.adults.setCustomValidity('');inputs.checkin.setCustomValidity('');
   if(inputs.checkin.value && inputs.checkin.value<today)inputs.checkin.setCustomValidity('Please select a future arrival date.');
   if(inputs.checkout.value && inputs.checkin.value && inputs.checkout.value<=inputs.checkin.value)inputs.checkout.setCustomValidity('Departure must be after arrival.');
   if(Number(inputs.adults.value)+Number(inputs.children.value)>6)inputs.adults.setCustomValidity('The villa accommodates a maximum of 6 guests, including children.');
   return form.reportValidity();
  }
  form.addEventListener('input',function(){inputs.checkout.setCustomValidity('');inputs.adults.setCustomValidity('');inputs.checkin.setCustomValidity('');status.textContent='';});
  function message(){return 'Hi Lana, please check Villa Augflor for:\nArrival: '+inputs.checkin.value+'\nDeparture: '+inputs.checkout.value+'\nAdults: '+inputs.adults.value+'\nChildren: '+inputs.children.value+(inputs.email.value?'\nEmail: '+inputs.email.value:'')+(inputs.phone.value?'\nPhone: '+inputs.phone.value:'')+'\n\n'+inputs.notes.value+'\n\nPlease confirm availability and send a full itemised written quote. I understand this is not a reservation.';}
  form.addEventListener('submit',function(e){
   e.preventDefault();if(!valid())return;
   var channel=e.submitter&&e.submitter.value==='email'?'email':'whatsapp',text=message();
   window.dispatchEvent(new CustomEvent('villa-enquiry-handoff',{detail:{channel:channel,page:location.pathname}}));
   status.textContent='Your enquiry is prepared. Complete sending it in '+(channel==='email'?'your email app':'WhatsApp')+'. No message has been sent by this website.';
   location.href=channel==='email'?'mailto:villa.augflor@gmail.com?subject='+encodeURIComponent('Villa Augflor enquiry — '+inputs.checkin.value)+'&body='+encodeURIComponent(text):'https://wa.me/33623777333?text='+encodeURIComponent(text);
  });
  form.querySelector('[data-copy]').addEventListener('click',async function(){if(!valid())return;try{await navigator.clipboard.writeText(message());status.textContent='Copied. Paste the enquiry into a message to Lana and send it.';}catch(_){status.textContent='Copy is unavailable in this browser. Please use WhatsApp or email.';}});
 }
 function start(){document.querySelectorAll('[data-enquiry-form]').forEach(mount);}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
