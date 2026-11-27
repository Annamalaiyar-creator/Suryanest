import {env} from 'cloudflare:workers';
import {formatWhatsAppNumber,siteConfig} from '@/lib/site-config';
const requiredCommon=['name','email','phone','state','district'];
function buildEnquiryWhatsApp(kind:string,fields:Record<string,string>,reference:string,hasPhoto:boolean):{url:string;message:string}{
 const rawNumber=env.SURYANEST_WHATSAPP_NUMBER||env.WHATSAPP_NUMBER||process.env.SURYANEST_WHATSAPP_NUMBER||process.env.WHATSAPP_NUMBER||process.env.NEXT_PUBLIC_WHATSAPP_NUMBER||siteConfig.whatsapp||'';
 const phone=formatWhatsAppNumber(rawNumber);
 const location=[fields.district,fields.state].filter(Boolean).join(', ');
 const heading=kind==='distributor'?'NEW DISTRIBUTOR APPLICATION':kind==='demo'?'NEW PRODUCT DEMO REQUEST':kind==='support'?'NEW PRODUCT SUPPORT REQUEST':'NEW QUOTE ENQUIRY';
 const specificLines=kind==='distributor'?[
  `SERVICE AREA - ${fields.area}`,
  `BUSINESS - ${fields.business}`,
  `EXPERIENCE - ${fields.experience}`,
  `INSTALLER NETWORK - ${fields.network}`,
  `OFFICE - ${fields.office}`,
  `WAREHOUSE - ${fields.warehouse}`,
  `INVESTMENT - ${fields.investment}`,
  `EPC PROJECTS - ${fields.epc}`,
  `MESSAGE - ${fields.message||'N/A'}`,
 ]:kind==='support'?[
  `MODEL - ${fields.model}`,
  `SERIAL NO - ${fields.serial}`,
  `SITE LOCATION - ${fields.site}`,
  `FAULT CODE - ${fields.fault||'None'}`,
  `PHOTO UPLOADED - ${hasPhoto?'Yes':'No'}`,
  `ISSUE - ${fields.message}`,
 ]:[
  `CAPACITY - ${fields.capacity}`,
  `QUANTITY - ${fields.quantity}`,
  `TIMELINE - ${fields.timeline}`,
  `MESSAGE - ${fields.message||'N/A'}`,
 ];
 const rawLines=[
  heading,
  `NAME - ${fields.name}`,
  ...(fields.company?[`COMPANY - ${fields.company}`]:[]),
  `PHONE - ${fields.phone}`,
  `EMAIL - ${fields.email}`,
  ...(fields.role?[`ROLE - ${fields.role}`]:[]),
  `LOCATION - ${location}`,
  ...specificLines,
  `REFERENCE - ${reference}`,
 ];
 const whatsappLines=rawLines.map(line=>{
  const nonBreaking=line.replace(/ /g,'\u00A0').replace(/-/g,'\u2011');
  return nonBreaking.padEnd(46,'\u00A0');
 });
 const message=rawLines.join('\n');
 const whatsappText=whatsappLines.join('\n');
 return {url:`https://wa.me/${phone}?text=${encodeURIComponent(whatsappText)}`,message};
}
export async function POST(request:Request){
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'Please submit the form from this website.'},{status:403});
 if(Number(request.headers.get('content-length')||0)>6*1024*1024)return Response.json({error:'Please keep the request under 6 MB.'},{status:413});
 try{
 if(!env.DB)return Response.json({error:'Enquiry storage is temporarily unavailable. Please try again later.'},{status:503});
 const form=await request.formData();const kind=String(form.get('kind')||'');if(!['quote','demo','distributor','support'].includes(kind))return Response.json({error:'Select a valid enquiry type.'},{status:400});
 const started=Number(form.get('started'));if(form.get('website')||!Number.isFinite(started)||started<=0||Date.now()-started<1500||Date.now()-started>86400000)return Response.json({error:'Please review your details and try again.'},{status:400});
 const fields:Record<string,string>={};const allowed=['name','email','phone','company','state','district','role','area','business','experience','network','office','warehouse','investment','epc','model','serial','site','fault','capacity','quantity','timeline','message','source'];
 for(const k of allowed){const v=String(form.get(k)||'').trim();if(v.length>(k==='message'?2500:k==='source'?1000:200))return Response.json({error:'One of the fields is too long.'},{status:400});fields[k]=v;}
 const required=[...requiredCommon,...(kind==='distributor'?['company','role','area','business','experience','network','office','warehouse','investment','epc']:kind==='support'?['model','serial','site','message']:['role','capacity','quantity','timeline'])];
 if(required.some(k=>!fields[k])||form.get('consent')!=='on')return Response.json({error:'Please complete all required fields and consent.'},{status:400});
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)||!/^\+?[\d() -]{8,20}$/.test(fields.phone)||fields.phone.replace(/\D/g,'').length<8)return Response.json({error:'Please enter a valid email and mobile number.'},{status:400});
 if((kind==='quote'||kind==='demo')&&(!Number.isInteger(Number(fields.quantity))||Number(fields.quantity)<1||Number(fields.quantity)>100000))return Response.json({error:'Enter a valid quantity.'},{status:400});
 const address=request.headers.get('cf-connecting-ip')||'preview';const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(address+new URL(request.url).hostname));const ipHash=Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');
 const duplicate=await env.DB.prepare('SELECT id FROM enquiries WHERE kind = ? AND LOWER(email) = LOWER(?) AND phone = ? AND created_at > ? LIMIT 1').bind(kind,fields.email,fields.phone,Date.now()-15000).first<{id:string}>();
 if(duplicate)return Response.json({error:'This application has already been submitted. Please avoid duplicate submissions.'},{status:409});
 const recent=await env.DB.prepare('SELECT COUNT(*) AS total FROM enquiries WHERE ip_hash = ? AND created_at > ?').bind(ipHash,Date.now()-3600000).first<{total:number}>();if((recent?.total||0)>=10)return Response.json({error:'Too many enquiries in a short time. Please try again later.'},{status:429});
 const id='SN-'+crypto.randomUUID().slice(0,8).toUpperCase();let attachment:string|null=null;const photo=form.get('photo');
 if(photo instanceof File&&photo.size){if(kind!=='support'||photo.size>5*1024*1024||!['image/jpeg','image/png','image/webp'].includes(photo.type))return Response.json({error:'Use one JPG, PNG or WebP photograph up to 5 MB.'},{status:400});if(!env.BUCKET)return Response.json({error:'Photo storage is unavailable. Please retry without a photograph.'},{status:503});const bytes=new Uint8Array(await photo.arrayBuffer());const valid=(photo.type==='image/jpeg'&&bytes[0]===255&&bytes[1]===216)||(photo.type==='image/png'&&bytes[0]===137&&bytes[1]===80&&bytes[2]===78)||(photo.type==='image/webp'&&String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP');if(!valid)return Response.json({error:'The photograph is not a supported image.'},{status:400});attachment=`support/${id}/${crypto.randomUUID()}`;await env.BUCKET.put(attachment,bytes,{httpMetadata:{contentType:photo.type}});}
 try{await env.DB.prepare('INSERT INTO enquiries (id,kind,name,email,phone,payload,attachment,ip_hash,created_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(id,kind,fields.name,fields.email,fields.phone,JSON.stringify({...fields,consent:true}),attachment,ipHash,Date.now()).run()}catch(e){if(attachment)await env.BUCKET?.delete(attachment);throw e;}
 const whatsapp=buildEnquiryWhatsApp(kind,fields,id,Boolean(attachment));
 return Response.json({reference:id,whatsappUrl:whatsapp.url,whatsappMessage:whatsapp.message},{status:201,headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Your enquiry could not be saved. Please try again.'},{status:500});}
}
