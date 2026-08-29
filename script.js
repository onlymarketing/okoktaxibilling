const $ = id => document.getElementById(id);

const fields = [
  ['Company','OKOK TAXI'],
  ['Customer Name','customerName'],
  ['Customer Contact','customerContact'],
  ['Driver Name','driverName'],
  ['Driver Contact','driverContact'],
  ['Vehicle','vehicle'],
  ['Vehicle Number','vehicleNumber'],
  ['Company / Travel Partner','partnerCompany'],
  ['Package','package'],
  ['Included KM','includedKm'],
  ['Extra KM Charge','extraKmCharge'],
  ['Extra Hour Charge','extraHourCharge'],
  ['Driver Bata','driverBata'],
  ['Toll & Parking','tollParking'],
  ['Pickup Location','pickupLocation'],
  ['Pickup Time','pickupTime'],
  ['Date','tripDate'],
  ['Drop Location','dropLocation'],
  ['Drop Time','dropTime'],
  ['Total Amount','totalAmount'],
  ['Payment Status','paymentStatus'],
  ['Payment Mode','paymentMode'],
  ['GST','gst'],
  ['Contact 1','customerContact'],
  ['Route / Locations Covered','route'],
  ['Remarks','remarks']
];

function val(id){ return ($(id)?.value || '').trim(); }
function setVal(id,v){ if($(id) && v!==undefined && v!==null) $(id).value=v; }
function todayISO(){ return new Date().toISOString().slice(0,10); }

function formatDate(iso){
  if(!iso) return '';
  const p=iso.split('-');
  if(p.length===3) return `${p[2]} / ${p[1]} / ${p[0]}`;
  return iso;
}
function money(v){
  if(!v) return '';
  const n=String(v).replace(/[^0-9.]/g,'');
  if(!n) return v;
  return Number(n).toLocaleString('en-IN');
}
function cleanLine(s){return s.replace(/^[-•*\d.)\s]+/,'').trim();}

function parseRaw(text){
  const lines=text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  const joined=text.toLowerCase();
  const out={};
  const findAfter=(regexes)=>{
    for(const r of regexes){ const m=text.match(r); if(m) return cleanLine(m[1]); }
    return '';
  };
  out.customerContact=findAfter([/customer(?:\s+number|\s+contact)?\s*[:=-]?\s*(\+?\d[\d\s-]{8,})/i]);
  out.driverContact=findAfter([/(?:driver\s+(?:phone|contact|number))\s*[:=-]?\s*(\+?\d[\d\s-]{8,})/i]);
  out.driverName=findAfter([/(?:driver\s*name)\s*[:=-]?\s*([^\n]+)/i]);
  out.vehicleNumber=findAfter([/(?:vehicle\s*(?:number|no\.?))\s*[:=-]?\s*([A-Z]{2}\s*\d{1,2}\s*[A-Z]{1,3}\s*\d{3,4})/i]);
  if(!out.vehicleNumber){ const m=text.match(/\b([A-Z]{2}\s*\d{1,2}\s*[A-Z]{1,3}\s*\d{3,4})\b/i); if(m) out.vehicleNumber=m[1]; }
  out.extraKmCharge=findAfter([/(?:₹|rs\.?|rs)\s*([0-9]+)\s*(?:per|\/)?\s*km/i, /([0-9]+)\s*(?:per|\/)?\s*km/i]);
  if(out.extraKmCharge) out.extraKmCharge='₹'+out.extraKmCharge+' / KM';
  out.driverBata=findAfter([/(?:driver\s*bata)\s*[:=-]?\s*(?:₹|rs\.?|rs)?\s*([0-9,]+)/i]);
  if(out.driverBata) out.driverBata='₹'+out.driverBata;
  out.extraHourCharge=findAfter([/(?:waiting\s*charges?|waiting)\s*[:=-]?\s*(?:₹|rs\.?|rs)?\s*([0-9,]+)\s*(?:add\s*)?(?:per\s*)?(?:hr|hour)/i]);
  if(out.extraHourCharge) out.extraHourCharge='₹'+out.extraHourCharge+' / Hour';
  out.tollParking=/toll\s*&?\s*parking\s+extra/i.test(joined)?'Extra':'Included';
  out.partnerCompany=lines.find(x=>/travels|travel/i.test(x)) || '';
  const vehicleLine=lines.find(x=>/swift|dzire|innova|ertiga|wagon|aura|etios/i.test(x));
  if(vehicleLine) out.vehicle=vehicleLine;
  out.pickupLocation=findAfter([/pickup\s*(?:point|location)?\s*(?:is|:)?\s*([^\n.]+)/i]);
  out.dropLocation=findAfter([/drop\s*(?:location|point)?\s*(?:is|:)?\s*([^\n.]+)/i]);
  // Common natural-language route phrases
  const pm=text.match(/pickup\s*(?:point|location)?[^\n]*?\b(?:madurai|chennai|trichy|tiruchirappalli|coimbatore|salem|dindigul|virudhunagar|aruppukottai|tirumangalam|manapparai|batlagundu)\b/i);
  if(pm && !out.pickupLocation) out.pickupLocation=(pm[0].match(/\b(?:madurai|chennai|trichy|tiruchirappalli|coimbatore|salem|dindigul|virudhunagar|aruppukottai|tirumangalam|manapparai|batlagundu)\b/i)||[''])[0];
  const dropm=text.match(/drop\s*(?:point|location)?[^\n]*?\b(?:madurai|chennai|trichy|tiruchirappalli|coimbatore|salem|dindigul|virudhunagar|aruppukottai|tirumangalam|manapparai|batlagundu)\b/i);
  if(dropm && !out.dropLocation) out.dropLocation=(dropm[0].match(/\b(?:madurai|chennai|trichy|tiruchirappalli|coimbatore|salem|dindigul|virudhunagar|aruppukottai|tirumangalam|manapparai|batlagundu)\b/i)||[''])[0];
  const date=text.match(/\b(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})\b/); if(date) out.tripDate=`${date[3]}-${String(date[2]).padStart(2,'0')}-${String(date[1]).padStart(2,'0')}`;
  const times=[...text.matchAll(/\b(\d{1,2}(?::\d{2})?\s*(?:AM|PM))\b/ig)].map(m=>m[1]);
  if(times[0]) out.pickupTime=times[0].toUpperCase(); if(times[1]) out.dropTime=times[1].toUpperCase();
  const amount=text.match(/(?:amount|total)\s*[:=-]?\s*(?:₹|rs\.?|rs)?\s*([0-9,]+)/i); if(amount) out.totalAmount=money(amount[1]);
  if(/gst\s*(?:not\s*)?(?:add|included)?|no\s*gst/i.test(joined)) out.gst='Not Added';
  if(/paid/i.test(joined)) out.paymentStatus='Paid';
  if(/pending/i.test(joined)) out.paymentStatus='Pending';
  return out;
}

function applyParsed(out){
  Object.entries(out).forEach(([k,v])=>{ if($(k) && v) setVal(k,v); });
  generateBill();
}

function generateBill(){
  const rows=[];
  fields.forEach(([label,src])=>{
    let value=src==='tripDate'?formatDate(val(src)):val(src);
    if(label==='Total Amount' && value) value='₹ '+money(value);
    if(label==='Route / Locations Covered' && value){
      value=value.replace(/\s*(?:->|→|>)\s*/g,' → ');
      value=value.split(/\s*→\s*/).map((x,i)=>`${i+1}. ${x.trim()}`).join(' ');
    }
    if(label==='Remarks' && !value && val('tollParking')==='Extra') value='Toll & Parking Extra';
    if(value) rows.push(`<tr><td>${label}</td><td class="${label.startsWith('Route')?'small-route':''}">${escapeHtml(value)}</td></tr>`);
  });
  $('billRows').innerHTML=rows.join('');
}
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

function loadSample(){
  const sample=`Bhavani Travels\nTN 81 V 8942\nS.Karthik\n9585508613\n15 per km\nDriver Bata 400\nToll & parking extra\nWaiting charges 150 add hr\n+91 89433 65479 Customer number\nPickup: Madurai\nDrop: Trichy\nPickup: 9:30 AM\nDrop: 9:00 PM\nAmount: 7000\nPaid\nGST not added\nRoute: Madurai → Aruppukottai → Virudhunagar → Tirumangalam → Batlagundu → Dindigul → Manapparai → Trichy`;
  $('rawData').value=sample; applyParsed(parseRaw(sample));
  setVal('tripDate',todayISO()); setVal('package','Outstation Trip'); setVal('includedKm','365 KM'); setVal('vehicle','Swift Dzire'); setVal('paymentMode','Not Specified'); generateBill();
}

$('parseBtn').addEventListener('click',()=>applyParsed(parseRaw($('rawData').value)));
$('generateBtn').addEventListener('click',generateBill);
$('sampleBtn').addEventListener('click',loadSample);
$('clearBtn').addEventListener('click',()=>{ $('billForm').reset(); $('rawData').value=''; generateBill(); });
$('printBtn').addEventListener('click',()=>{generateBill();window.print();});
$('pdfBtn').addEventListener('click',async()=>{
  generateBill();
  const element=$('bill');
  const name=`OKOK-TAXI-Bill-${val('customerName')||'Customer'}-${val('tripDate')||todayISO()}.pdf`.replace(/\s+/g,'-');
  const opt={margin:0,filename:name,image:{type:'jpeg',quality:0.98},html2canvas:{scale:2,useCORS:true,backgroundColor:'#ffffff'},jsPDF:{unit:'mm',format:'a4',orientation:'portrait'}};
  await html2pdf().set(opt).from(element).save();
});
$('imageBtn').addEventListener('click',async()=>{
  generateBill();
  const canvas=await html2canvas($('bill'),{scale:2,useCORS:true,backgroundColor:'#fff'});
  const a=document.createElement('a'); a.download=`OKOK-TAXI-Bill-${val('customerName')||'Customer'}.png`.replace(/\s+/g,'-'); a.href=canvas.toDataURL('image/png'); a.click();
});

$('billForm').addEventListener('input',generateBill);
$('tripDate').value=todayISO();
generateBill();
