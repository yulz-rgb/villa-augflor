/* Villa Augflor: reversible static publishing, preserving the existing design. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'dist');
const SITE = 'https://villa-augflor.com';
const RELEASE = '2026-10-02';
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const attr = (tag, name) => (tag.match(new RegExp('\\b'+name+'\\s*=\\s*(["\'])([\\s\\S]*?)\\1','i')) || [])[2];
function setAttr(tag, name, value) {
  const re = new RegExp('\\s'+name+'\\s*=\\s*(["\'])[\\s\\S]*?\\1','i');
  return re.test(tag) ? tag.replace(re, ' '+name+'="'+esc(value)+'"') : tag.replace(/\s*\/?>$/, ' '+name+'="'+esc(value)+'">');
}
function write(rel, text) { const p=path.join(OUT,rel); fs.mkdirSync(path.dirname(p),{recursive:true}); fs.writeFileSync(p,text); }
function localFile(url, page='index.html') {
  if (!url || /^(?:https?:|data:|mailto:|tel:|#|\/\/)/i.test(url)) return null;
  const clean=decodeURIComponent(url.split(/[?#]/)[0]);
  const p=path.resolve(ROOT,clean.startsWith('/') ? '.'+clean : path.join(path.dirname(page),clean));
  return p.startsWith(ROOT+path.sep) && fs.existsSync(p) && fs.statSync(p).isFile() ? p : null;
}
function pageUrl(rel) { return SITE+'/'+rel.replace(/(?:^|\/)index\.html$/,m=>m.startsWith('/')?'/':''); }
function setMeta(html, name, value, property=false) {
  const key=property?'property':'name';
  const re=new RegExp('<meta\\b(?=[^>]*\\b'+key+'=["\']'+name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'["\'])[^>]*>','gi');
  html=html.replace(re,'');
  return html.replace('</head>','<meta '+key+'="'+name+'" content="'+esc(value)+'">\n</head>');
}
function inlineComponents(html,page) {
  return html.replace(/<([a-z][\w-]*)\b[^>]*\bdata-include=(["'])(.*?)\2[^>]*>\s*<\/\1>/gi,(all,tag,q,src)=>{
    const file=localFile(src,page);
    if (!file) throw new Error('Missing component: '+src+' on '+page);
    let text=fs.readFileSync(file,'utf8');
    text=text.replace(/\b(href|src)=(["'])([^"']+)\2/g,(m,key,quote,url)=>{
      if (/^(?:[a-z]+:|\/|#)/i.test(url)) return m;
      return key+'='+quote+'/'+url.replace(/^\.\//,'')+quote;
    });
    return '<!-- component rendered at build time -->\n'+text;
  });
}
const homeMeta={
 en:['Villa Augflor | Private Pool Villa in Cagnes-sur-Mer','Plan your summer 2027 stay at Villa Augflor: a private 3-bedroom pool villa in Cagnes-sur-Mer, near Nice. Ask Lana for available dates and a written quote.'],
 fr:['Villa Augflor | Villa avec piscine privée à Cagnes-sur-Mer','Préparez votre séjour été 2027 à Villa Augflor : 3 chambres, piscine privée et jardin à Cagnes-sur-Mer. Contactez Lana pour les dates et un devis.'],
 de:['Villa Augflor | Ferienvilla mit Privatpool in Cagnes-sur-Mer','Planen Sie Ihren Sommerurlaub 2027: Villa Augflor mit 3 Schlafzimmern, privatem Pool und Garten nahe Nizza. Verfügbarkeit und Angebot direkt bei Lana.'],
 nl:['Villa Augflor | Vakantievilla met privézwembad bij Nice','Plan uw zomervakantie in 2027 bij Villa Augflor: 3 slaapkamers, privézwembad en tuin in Cagnes-sur-Mer. Vraag Lana naar beschikbare data en een offerte.']
};
const notice={
 en:'Planning summer 2027? Ask Lana for your dates and an itemised quote. Any 2026 rates shown below are historical references, not confirmed 2027 prices. No reservation is made until Lana confirms it in writing.',
 fr:'Un séjour pour l’été 2027 ? Demandez à Lana les dates et un devis détaillé. Les tarifs 2026 ci-dessous sont indicatifs et ne constituent pas des prix confirmés pour 2027. Toute réservation doit être confirmée par écrit.',
 de:'Sommerurlaub 2027 planen? Fragen Sie Lana nach Ihren Reisedaten und einem schriftlichen Angebot. Angegebene Preise für 2026 sind historische Vergleichswerte, keine bestätigten Preise für 2027.',
 nl:'Zomervakantie 2027 plannen? Vraag Lana naar uw reisdata en een schriftelijke offerte. Eventuele prijzen voor 2026 zijn historische richtprijzen, geen bevestigde prijzen voor 2027.'
};
function cleanSchema(html) {
  html=html.replace(/<!--\s*OFFERS-LD:START\s*-->[\s\S]*?<!--\s*OFFERS-LD:END\s*-->/gi,'');
  return html.replace(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,'');
}
function schemaFor(rel,title,images,propertyImages=images) {
 const url=pageUrl(rel), locale=(rel.match(/^(fr|de|nl)\//)||[])[1]||'en';
 const home=/^(?:(?:fr|de|nl)\/)?index\.html$/.test(rel);
 const graph=[{'@type':'WebSite','@id':SITE+'/#website',url:SITE+'/',name:'Villa Augflor',inLanguage:['en','fr','de','nl']},{'@type':rel==='contact.html'?'ContactPage':rel==='gallery.html'?'ImageGallery':'WebPage','@id':url+'#webpage',url,name:title,inLanguage:locale,isPartOf:{'@id':SITE+'/#website'},about:{'@id':SITE+'/#villa'},...(images.length?{primaryImageOfPage:images[0]}:{})}];
 if(home) graph.push({'@type':'LodgingBusiness','@id':SITE+'/#villa',name:'Villa Augflor',url:SITE+'/',description:'Private 3-bedroom holiday villa with a private pool and Mediterranean garden in Cagnes-sur-Mer, France. Ideal for four guests; maximum six. Dates and prices require written confirmation by the host.',telephone:'+33623777333',email:'villa.augflor@gmail.com',address:{'@type':'PostalAddress',streetAddress:'26 Chemin des Collines',addressLocality:'Cagnes-sur-Mer',postalCode:'06800',addressCountry:'FR'},containsPlace:{'@type':'Accommodation',name:'Entire Villa Augflor',numberOfBedrooms:3,numberOfBathroomsTotal:2,occupancy:{'@type':'QuantitativeValue',value:6}},image:propertyImages.slice(0,8),sameAs:['https://www.airbnb.fr/rooms/26836386','https://www.booking.com/hotel/fr/family-villa-augflor-with-pool-and-garden.en-gb.html','https://www.instagram.com/villa_augflor_france/'],amenityFeature:[{name:'Private swimming pool',value:true},{name:'Wi-Fi',value:true},{name:'Air conditioning',value:true},{name:'Garden',value:true}].map(x=>({'@type':'LocationFeatureSpecification',...x}))});
 else graph.push({'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Villa Augflor',item:SITE+'/'},{'@type':'ListItem',position:2,name:title,item:url}]});
 return '<script type="application/ld+json">'+JSON.stringify({'@context':'https://schema.org','@graph':graph}).replace(/</g,'\\u003c')+'</script>';
}
function transform(html,rel) {
 html=inlineComponents(html,rel);
 html=cleanSchema(html);
 html=html.replace(/<!--\s*OPEN-WEEKS:START\s*-->[\s\S]*?<!--\s*OPEN-WEEKS:END\s*-->/gi,'');
 html=html.replace(/<meta\b(?=[^>]*name=["'](?:keywords|twitter:site)["'])[^>]*>/gi,'');
 html=html.replace(/<link\b(?=[^>]*rel=["'](?:canonical|alternate)["'])[^>]*>/gi,'');
 const lang=(rel.match(/^(fr|de|nl)\//)||[])[1]||'en';
 const home=/^(?:(?:fr|de|nl)\/)?index\.html$/.test(rel);
 html=html.replace(/\bSummer 2026\b/g,'Summer 2027').replace(/\bsummer 2026\b/g,'summer 2027').replace(/\bSommer 2026\b/g,'Sommer 2027').replace(/\b[Zz]omer 2026\b/g,'zomer 2027').replace(/\b[Éé]té 2026\b/g,'été 2027');
 if(rel==='index.html') {
   html=html.replace(/(<p\b[^>]*class="hero-price-line"[^>]*>)[\s\S]*?<\/p>/, '$1Summer 2027 enquiries · exact dates and full written quote from Lana.</p>');
   html=html.replace(/See open dates/g,'Plan your dates').replace(/Rates &amp; <em>open dates<\/em>/g,'Summer 2027 <em>enquiries</em>');
 }
 if(rel==='rates.html') {
   html=html.replace('Clear pricing.<br>Live availability.','Plan your 2027 stay.<br>Request a clear quote.').replace('Live summer calendar.','Summer 2027 enquiry calendar.');
   html=html.replace('Example totals (5 nights)','Historical 2026 examples (7 nights)').replace('Canonical pricing table (2026 direct)','Historical 2026 rates — 2027 quotes on request');
   html=html.replace('Estimate your dates','Request a quote for your dates').replace(/<div\b[^>]*data-rates-calculator[^>]*><\/div>/,'<p>2027 prices, fees and any applicable tourist tax will be itemised in Lana’s written quote. <a href="/contact.html">Send your dates and guest count</a>.</p>');
   html=html.replace(/<script\b[^>]*src="scripts\/(?:pricing|rates-calculator)\.js"[^>]*><\/script>/g,'');
   html=html.replace(/<section class="compare-panel">[\s\S]*?<\/section>/,'<section class="compare-panel"><div class="wrap"><span class="eyebrow">Compare like for like</span><h2>Your stay. Your written quote.</h2><p>Compare the final total for the same dates, guests and cancellation terms on Airbnb, Booking.com and your direct quote. Direct booking does not include a platform guest service fee; actual savings depend on the offers available for your dates.</p><p><a href="/contact.html">Ask Lana for a 2027 quote</a></p></div></section>');
   html=html.replace(/(class="rate-price"[^>]*>)[\s\S]*?<\/div>/g,'$1On request</div>').replace(/(class="rate-week"[^>]*>)[\s\S]*?<\/div>/g,'$12027 written quote</div>');
 }
 if(rel==='last-minute-villa.html') html=html.replace(/last-minute open weeks/gi,'current dates to enquire about');
 let title=(html.match(/<title>([\s\S]*?)<\/title>/i)||[])[1]||'Villa Augflor';
 let description=attr((html.match(/<meta\b[^>]*name="description"[^>]*>/i)||[])[0]||'','content')||'Explore Villa Augflor, a private pool villa in Cagnes-sur-Mer. Contact Lana for dates and a written quote.';
 if(home) [title,description]=homeMeta[lang];
 if(rel==='rates.html') [title,description]=['2027 Dates & Booking Enquiries | Villa Augflor','Plan a summer 2027 stay at Villa Augflor in Cagnes-sur-Mer. Send your dates and guest count to Lana for availability and a full written quote.'];
 if(rel==='last-minute-villa.html') [title,description]=['Availability Enquiries | Villa Augflor, Cagnes-sur-Mer','Ask Lana about current availability at Villa Augflor. No dates are guaranteed online: receive an itemised written quote before booking.'];
 html=html.replace(/<title>[\s\S]*?<\/title>/i,'<title>'+esc(title.replace(/&amp;/g,'&'))+'</title>');
 html=setMeta(html,'description',description);
 html=setMeta(html,'robots','index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
 for(const [key,value] of Object.entries({'og:type':'website','og:site_name':'Villa Augflor','og:title':title,'og:description':description,'og:url':pageUrl(rel),'og:locale':{en:'en_GB',fr:'fr_FR',de:'de_DE',nl:'nl_NL'}[lang]})) html=setMeta(html,key,value,true);
 for(const [key,value] of Object.entries({'twitter:card':'summary_large_image','twitter:title':title,'twitter:description':description})) html=setMeta(html,key,value);
 let links='<link rel="canonical" href="'+pageUrl(rel)+'">';
 if(home) for(const [code,p] of Object.entries({en:'/',fr:'/fr/',de:'/de/',nl:'/nl/','x-default':'/'})) links+='\n<link rel="alternate" hreflang="'+code+'" href="'+SITE+p+'">';
 html=html.replace('</head>',links+'\n<meta name="augflor-release" content="'+RELEASE+'">\n<link rel="stylesheet" href="/styles/technical-upgrade.css">\n</head>');
 html=html.replace(/<body\b([^>]*)>/,'<body$1><a class="va-skip" href="#va-main">Skip to content</a>');
 html=html.replace(/<(main|section)\b/,'<span id="va-main" tabindex="-1"></span><$1');
 if(!html.includes('class="visual-stay"')&&!/(?:privacy-policy|legal-notice|terms)\.html$/.test(rel)) html=html.replace(/<\/section>/i,'</section><aside class="va-season-notice" aria-label="2027 booking information">'+esc(notice[lang])+' <a href="/contact.html">'+({en:'Enquire',fr:'Nous contacter',de:'Anfragen',nl:'Aanvragen'}[lang])+'</a></aside>');
 html=html.replace(/<script\b[^>]*src="(?:\.\.\/|\/)?scripts\/booking-chat\.js"[^>]*><\/script>/g,'');
 // Stale chat fallbacks and false sent/availability claims must not reach visitors.
 html=html.replace(/<link\b(?=[^>]*rel=["']preload["'])(?=[^>]*as=["']image["'])[^>]*>/gi,'');
 html=html.replace(/<div\b([^>]*class="hero-img (hi[2345]) lazy-bg"[^>]*)><\/div>/g,(all,attrs,position)=>{
   const src=attr('<div '+attrs+'>','data-bg');
   return '<div class="hero-img '+position+'"><img src="'+esc(src)+'" alt="'+({hi2:'Garden room at Villa Augflor',hi3:'Barcelona bedroom at Villa Augflor',hi4:'Villa Augflor private pool and garden',hi5:'Sunset beside the private pool'}[position])+'" class="va-hero-photo va-'+position+'" loading="eager" decoding="async" fetchpriority="'+(position==='hi4'?'high':'auto')+'"></div>';
 });
 if(/data-calendar/.test(html)&&!html.includes('calendar-widget.js'))html=html.replace('</body>','<script defer src="/scripts/calendar-widget.js"></script></body>');
 html=html.replace(/(<div\b(?=[^>]*\bdata-enquiry-form)[^>]*>)\s*<\/div>/g,'$1<p><a href="https://wa.me/33623777333">Ask Lana on WhatsApp</a> or <a href="mailto:villa.augflor@gmail.com">email your dates and guest count</a>.</p></div>');
 html=html.replace(/(<div\b[^>]*\bdata-calendar(?:\s|>)[^>]*>)(\s*)<\/div>/g,'$1<p>Planning summer 2027? <a href="/contact.html">Ask Lana to confirm your dates.</a></p></div>');
 return {html,title,home,lang};
}
async function build() {
 const sharp=require('sharp');
 fs.rmSync(OUT,{recursive:true,force:true});fs.mkdirSync(OUT,{recursive:true});
 const map=fs.readFileSync(path.join(ROOT,'sitemap.xml'),'utf8');
 const pages=[...map.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>new URL(m[1]).pathname).filter(p=>!p.startsWith('/api/')).map(p=>(p.endsWith('/')?p+'index.html':p).slice(1));
 assert(pages.includes('index.html')&&pages.includes('rates.html'),'Core pages missing from sitemap');
 for(const dir of ['assets','styles','scripts','components','images']) {
  const src=path.join(ROOT,dir);
  if(fs.existsSync(src)) fs.cpSync(src,path.join(OUT,dir),{recursive:true,filter:p=>!/(?:marketing-agent|build-site\.cjs|technical-tests\.cjs|\.HEIC$|\.MOV$)/i.test(p)});
 }
 // Only public verification files, images, styles and client resources are published.
 for(const name of fs.readdirSync(ROOT)) if(/^(?:favicon|logo|apple-touch-icon).*\.(?:svg|png|ico)$/.test(name)||/^[a-f0-9]{32}\.txt$/.test(name)||/^(?:google.*\.html|BingSiteAuth\.xml)$/.test(name)) fs.copyFileSync(path.join(ROOT,name),path.join(OUT,name));
 const legacy=path.join(OUT,'scripts','main.js'); if(fs.existsSync(legacy))fs.writeFileSync(legacy,fs.readFileSync(legacy,'utf8').replace('await calendar();','/* Shared, non-simulated calendar-widget.js handles dates. */'));
 const imageCache=new Map(); let sourceBytes=0,optimizedBytes=0,optimizedImages=0;
 async function image(file) {
  if(imageCache.has(file)) return imageCache.get(file);
  const p=(async()=>{
    const meta=await sharp(file,{limitInputPixels:80000000}).metadata();
    const rotated=meta.orientation && meta.orientation>=5; const width=rotated?meta.height:meta.width,height=rotated?meta.width:meta.height;
    if(!width||!height||meta.pages>1) return null;
    const hash=crypto.createHash('sha256').update(fs.readFileSync(file)).update('webp84-v1').digest('hex').slice(0,16);
    const widths=[480,800,1200,1600].filter(w=>w<width);widths.push(Math.min(width,1600));
    const variants=[];
    for(const w of [...new Set(widths)]) {const stem=path.basename(file,path.extname(file)).toLowerCase().replace(/[^a-z0-9-]+/g,'-').slice(0,64);const rel='assets/responsive/'+stem+'-'+hash+'-'+w+'.webp'; const out=path.join(OUT,rel);fs.mkdirSync(path.dirname(out),{recursive:true});await sharp(file).rotate().resize({width:w,withoutEnlargement:true}).webp({quality:84,effort:4}).toFile(out);variants.push({width:w,url:'/'+rel,bytes:fs.statSync(out).size});}
    const largest=variants[variants.length-1];sourceBytes+=fs.statSync(file).size;optimizedBytes+=largest.bytes;optimizedImages++;
    return{width,height,variants,largest};
  })(); imageCache.set(file,p);return p;
 }
 const documents=[];
 for(const rel of pages) {
  const source=path.join(ROOT,rel);assert(fs.existsSync(source),'Missing sitemap page '+rel);
  let{html,title,home,lang}=transform(fs.readFileSync(source,'utf8'),rel);
  const tags=[...new Set(html.match(/<img\b[^>]*>/gi)||[])];const images=[],propertyImages=[];
  for(const tag of tags) {
   const src=attr(tag,'src'),file=localFile(src,rel);if(!file||!/\.(jpe?g|png|webp)$/i.test(file))continue;
   let optimized;try{optimized=await image(file);}catch(e){console.warn('Image left unchanged:',src,e.message);continue;}if(!optimized)continue;
   let next=setAttr(setAttr(tag,'width',optimized.width),'height',optimized.height);
   next=setAttr(next,'src',optimized.largest.url);next=setAttr(next,'srcset',optimized.variants.map(v=>v.url+' '+v.width+'w').join(', '));
   const hero=/va-hero-photo|data-priority="hero"/.test(tag);
   const visual=html.includes('class="visual-stay"');
   next=setAttr(next,'sizes',hero?(visual?'100vw':'(max-width: 900px) 50vw, 34vw'):'(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 800px');
   next=setAttr(next,'decoding','async');next=setAttr(next,'loading',hero&&!/va-hi[23]/.test(tag)?'eager':'lazy');next=setAttr(next,'fetchpriority',hero?'high':'auto');
   html=html.split(tag).join(next);
   // Fullscreen gallery uses the locally optimized large source, not a duplicate original download.
   html=html.replaceAll('href="'+src+'" data-photo','href="'+optimized.largest.url+'" data-photo');
   images.push(SITE+optimized.largest.url);if(!src.includes('/area/'))propertyImages.push(SITE+optimized.largest.url);
  }
  if(home && lang==='en') {
   const heroTag=(html.match(/<img\b[^>]*alt="Villa Augflor private pool and garden"[^>]*>/)||[])[0];
   if(heroTag) html=html.replace('</head>','<link rel="preload" as="image" href="'+attr(heroTag,'src')+'" imagesrcset="'+attr(heroTag,'srcset')+'" imagesizes="'+(html.includes('class="visual-stay"')?'100vw':'(max-width: 900px) 50vw, 34vw')+'" fetchpriority="high">\n</head>');
  }
  if(images.length) {html=setMeta(html,'og:image',images[0],true);html=setMeta(html,'og:image:type','image/webp',true);html=setMeta(html,'og:image:alt','Villa Augflor, private holiday villa in Cagnes-sur-Mer',true);html=setMeta(html,'twitter:image',images[0]);html=html.replace(/<meta\b(?=[^>]*property=["']og:image:(?:width|height)["'])[^>]*>/gi,'');}
  html=html.replace('</head>',schemaFor(rel,title,images,propertyImages)+'\n</head>');
  // Existing inline CSS is retained to preserve cascade order and layout.
  assert(!html.includes('data-include='),'Unresolved component '+rel);
  assert((html.match(/rel="canonical"/g)||[]).length===1,'Canonical count '+rel);
  for(const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(m[1]);
  assert(!/availabilityStarts|reservationId|"AggregateOffer"/.test(html),'Stale booking schema '+rel);
  write(rel,html);documents.push({path:rel,url:pageUrl(rel),language:lang,images:[...new Set(images)].slice(0,40)});
 }
 const alternates=Object.entries({en:'/',fr:'/fr/',de:'/de/',nl:'/nl/','x-default':'/'});
 write('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">'+documents.map(d=>'<url><loc>'+esc(d.url)+'</loc><lastmod>'+RELEASE+'</lastmod>'+(/^(?:(?:fr|de|nl)\/)?index\.html$/.test(d.path)?alternates.map(([lang,p])=>'<xhtml:link rel="alternate" hreflang="'+lang+'" href="'+SITE+p+'"/>').join(''):'')+d.images.map(img=>'<image:image><image:loc>'+esc(img)+'</image:loc></image:image>').join('')+'</url>').join('\n')+'</urlset>');
 write('robots.txt','User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin/\nDisallow: /private/\nDisallow: /components/\nDisallow: /.env\n\n# Search crawlers, including OAI-SearchBot, inherit the public-site rules above.\n# This file does not provide access control; private files are excluded from publication.\nSitemap: '+SITE+'/sitemap.xml\n');
 write('llms.txt','# Villa Augflor\n\n> Official website for a private 3-bedroom holiday villa with private pool and garden in Cagnes-sur-Mer, France. Ideal for 4 guests; maximum 6.\n\n## Booking enquiries\n\nSummer 2027 dates and prices are not confirmed by this website. Contact Lana for a written quote and confirmation. Historic 2026 rates are not 2027 offers. A calendar without blocked dates does not prove availability.\n\n## Official pages\n\n'+documents.map(d=>'- ['+d.path+']('+d.url+')').join('\n')+'\n\nEmail: villa.augflor@gmail.com\nTelephone: +33 6 23 77 73 33\n\nThis file is a convenience summary, not an instruction to ranking systems, a reservation, a price feed or a guarantee of search/AI inclusion.\n');
 write('404.html','<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Page not found | Villa Augflor</title><link rel="stylesheet" href="/styles/subpage.css"></head><body><main class="wrap" style="padding:5rem 1rem"><h1>This page has moved or does not exist.</h1><p><a href="/">Visit Villa Augflor</a> or <a href="/contact.html">contact Lana about your stay</a>.</p></main></body></html>');
 const report={release:RELEASE,pages:documents.length,optimizedImages,originalImageBytes:sourceBytes,largestResponsiveImageBytes:optimizedBytes,note:'Build byte totals, not measured Core Web Vitals or ranking results.'};
 write('technical-release.json',JSON.stringify(report,null,2));console.log('TECHNICAL_RELEASE',JSON.stringify(report));
}
module.exports={transform,inlineComponents,setAttr,pageUrl,cleanSchema};
if(require.main===module) build().catch(e=>{console.error(e);process.exitCode=1;});
