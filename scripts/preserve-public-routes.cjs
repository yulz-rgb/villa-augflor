/* Preserve pre-existing public routes outside the SEO sitemap; never overwrite upgraded pages. */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),out=path.join(root,'dist');
let preserved=0;
for(const dir of ['','fr','de','nl']){
 const base=path.join(root,dir);if(!fs.existsSync(base))continue;
 for(const name of fs.readdirSync(base)){
  if(!/\.(?:html|webmanifest)$/.test(name))continue;
  const source=path.join(base,name),target=path.join(out,dir,name);
  if(fs.statSync(source).isFile()&&!fs.existsSync(target)){fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(source,target);preserved++;}
 }
}
// Intl date order is locale-data dependent; input[type=date] and comparisons need strict ISO.
const oldDate="new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())";
const isoDate="(function(){var d={};new Intl.DateTimeFormat('en',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).forEach(function(p){d[p.type]=p.value;});return d.year+'-'+d.month+'-'+d.day;})()";
for(const name of ['calendar-widget.js','enquiry-form.js']){
 const file=path.join(out,'scripts',name);let js=fs.readFileSync(file,'utf8');
 if(!js.includes(oldDate)&&!js.includes(isoDate))throw new Error('Date transform no longer matches '+name);
 js=js.replaceAll(oldDate,isoDate);
 if(name==='calendar-widget.js')js=js.replace("['M','T','W','T','F','S','S']","[0,1,2,3,4,5,6].map(function(i){return new Date(Date.UTC(2001,0,1+i)).toLocaleDateString(locale,{weekday:'narrow',timeZone:'UTC'});})");
 fs.writeFileSync(file,js);
}
fs.rmSync(path.join(out,'scripts','preserve-public-routes.cjs'),{force:true});
const reportFile=path.join(out,'technical-release.json');const report=JSON.parse(fs.readFileSync(reportFile,'utf8'));report.preservedAdditionalHtmlRoutes=preserved;fs.writeFileSync(reportFile,JSON.stringify(report,null,2));
console.log('Preserved '+preserved+' additional public HTML/manifest routes; strict Paris-date formatting applied.');
