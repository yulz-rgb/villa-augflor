/** GET: known blocked nights only. Unblocked nights are NOT confirmed inventory. */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const {mergeBusyFromIcsBodies}=require('../lib/ical-busy');
function manual(){try{const d=JSON.parse(fs.readFileSync(path.join(__dirname,'..','data','calendar-busy.json'),'utf8'));return{busyDates:Array.isArray(d.busyDates)?d.busyDates.filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x)):[],updated:d.updated};}catch{return{busyDates:[]};}}
async function readFeed(url){
 const u=new URL(url);if(u.protocol!=='https:')throw new Error('invalid_feed');
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),6500);
 try{
  const r=await fetch(u,{signal:ctrl.signal,headers:{'User-Agent':'VillaAugflor-CalendarSync/2.0',Accept:'text/calendar'}});
  if(!r.ok||Number(r.headers.get('content-length')||0)>2000000)throw new Error('feed_unavailable');
  const text=await r.text();if(text.length>2000000||!/^BEGIN:VCALENDAR\s*$/mi.test(text)||!/^END:VCALENDAR\s*$/mi.test(text))throw new Error('invalid_calendar');
  if(/^RRULE[;:]/mi.test(text))throw new Error('unsupported_recurrence');
  for(const m of text.matchAll(/^DT(?:START|END)[^:]*:(\d{4})(\d{2})(\d{2})/gmi)){
   const iso=m[1]+'-'+m[2]+'-'+m[3],d=new Date(iso+'T00:00:00Z');
   if(isNaN(d)||d.toISOString().slice(0,10)!==iso||Number(m[1])<2000||Number(m[1])>2040)throw new Error('invalid_date');
  }
  return mergeBusyFromIcsBodies([text]);
 }finally{clearTimeout(timer);}
}
module.exports=async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
 const stored=manual();
 const urls=[process.env.AIRBNB_ICAL_URL,process.env.BOOKING_ICAL_URL,process.env.VRBO_ICAL_URL].filter(Boolean);
 const results=await Promise.allSettled(urls.map(readFeed));
 const good=results.filter(r=>r.status==='fulfilled'),failed=results.length-good.length;
 const dates=[...new Set([...stored.busyDates,...good.flatMap(r=>r.value)])].sort();
 const source=failed?'partial':good.length>1?'merged':good.length===1?'ical':stored.busyDates.length?'static':'none';
 res.setHeader('Cache-Control',failed?'no-store':'public, s-maxage=300, stale-while-revalidate=60');
 return res.status(200).json({ok:true,source,busyDates:dates,updated:good.length?new Date().toISOString():stored.updated,configuredFeeds:urls.length,successfulFeeds:good.length,availabilityGuaranteed:false,message:'Blocked dates are an enquiry aid only. Lana confirms all availability and prices in writing.'});
};
