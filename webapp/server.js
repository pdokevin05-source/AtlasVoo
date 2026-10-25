/**
 * Atlas Voos API server · Node 20+; no npm packages.
 * Serves this folder; proxies public ADS-B/route data; optionally Duffel flight search.
 * No location database, authentication cookies, analytics, simulated traffic or fake fares.
 */
'use strict';
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {URL}=require('node:url');
const ROOT=__dirname;
for(const line of (fs.existsSync(path.join(ROOT,'.env'))?fs.readFileSync(path.join(ROOT,'.env'),'utf8'):'').split(/\r?\n/)){
 const m=line.match(/^\s*([A-Z_][A-Z_0-9]*)\s*=\s*(.*?)\s*$/);if(m&&!line.trimStart().startsWith('#')&&!process.env[m[1]])process.env[m[1]]=m[2].replace(/^("|')|("|')$/g,'');
}
const HOST=process.env.HOST||'127.0.0.1';
const PORT=Number(process.env.PORT)||3000;
const TOKEN=process.env.DUFFEL_ACCESS_TOKEN||'';
const FARES_MODE=TOKEN.startsWith('duffel_live_')?'live':TOKEN?'test':'unconfigured';
const fareLimits=new Map();
function checkFareRate(req){
 const now=Date.now(),ip=String(req.headers['x-forwarded-for']||req.socket.remoteAddress||'unknown').split(',')[0].slice(0,80);
 const key=ip||'unknown',record=fareLimits.get(key);
 if(fareLimits.size>4000){for(const [k,v] of fareLimits)if(now-v.start>3600000)fareLimits.delete(k);if(fareLimits.size>4000)fareLimits.clear()}
 if(!record||now-record.start>3600000){fareLimits.set(key,{start:now,count:1});return true}
 if(record.count>=12)return false;
 record.count++;return true;
}
const seed=JSON.parse(fs.readFileSync(path.join(ROOT,'airports-seed.json'),'utf8'));
const cache=new Map();let airports=seed, airportsFromSource=false, airportsUpdated=0, refreshingAirports=null;
function send(res,status,value,extra={}){const body=JSON.stringify(value);res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra});res.end(body)}
const replyError=(res,status,message)=>send(res,status,{error:message});
function csvCells(line){const r=[];let value='',quoted=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(quoted&&line[i+1]==='"'){value+='"';i++}else quoted=!quoted}else if(c===','&&!quoted){r.push(value);value=''}else value+=c}r.push(value);return r}
async function timedFetch(url,init={},timeout=14000){const c=new AbortController();const t=setTimeout(()=>c.abort(),timeout);try{const r=await fetch(url,{...init,signal:c.signal,headers:{'User-Agent':'AtlasVoos/1.0 (educational travel explorer)',...init.headers}});if(!r.ok)throw Error(`Upstream HTTP ${r.status}`);return r}finally{clearTimeout(t)}}
async function fetchJson(url,init={},timeout=14000){return (await timedFetch(url,init,timeout)).json()}
async function refreshAirportCatalog(force=false){if(!force&&airportsFromSource&&Date.now()-airportsUpdated<86400000)return;if(refreshingAirports)return refreshingAirports;
 refreshingAirports=(async()=>{try{const res=await timedFetch('https://davidmegginson.github.io/ourairports-data/airports.csv',{},18000);const text=await res.text();const lines=text.split(/\r?\n/);const header=csvCells(lines[0].replace(/^\ufeff/,'')).map(s=>s.trim());const at=k=>header.indexOf(k);const col={type:at('type'),name:at('name'),lat:at('latitude_deg'),lon:at('longitude_deg'),iso:at('iso_country'),service:at('scheduled_service'),iata:at('iata_code'),ident:at('ident')};const arr=[];
 for(let i=1;i<lines.length;i++){const cells=csvCells(lines[i]);const type=cells[col.type];const iata=cells[col.iata]?.trim().toUpperCase();if(!iata||!/^[A-Z0-9]{3}$/.test(iata))continue;if(!['large_airport','medium_airport'].includes(type)&&cells[col.service]!=='yes')continue;const lat=Number(cells[col.lat]),lon=Number(cells[col.lon]);if(!Number.isFinite(lat)||!Number.isFinite(lon))continue;arr.push({iata,icao:(cells[col.ident]||'').trim(),name:cells[col.name]||'',lat,lon,country:cells[col.iso]||'',scheduled:cells[col.service]==='yes',type})}
 if(arr.length<1500)throw Error('Unexpectedly short airport feed');const existing=new Map(arr.map(a=>[a.iata,a]));for(const item of seed)if(!existing.has(item.iata))arr.push(item);airports=arr;airportsFromSource=true;airportsUpdated=Date.now();console.log(`[Airport data] ${arr.length} airports from OurAirports`)}catch(err){console.warn('[Airport data] live source unavailable:',err.message)}finally{refreshingAirports=null}})();return refreshingAirports;
}
function cached(key,ttl,fetcher){const o=cache.get(key);if(o&&o.valid>Date.now())return Promise.resolve(o.result);return Promise.resolve().then(fetcher).then(v=>{cache.set(key,{result:v,valid:Date.now()+ttl});if(cache.size>1000){for(const [k,v]of cache){if(v.valid<Date.now())cache.delete(k)}if(cache.size>1000)cache.clear()}return v})}
async function getAircraft(lat,lon,radius){const key=`${lat.toFixed(2)}/${lon.toFixed(2)}/${radius}`;return cached(`air:${key}`,16000,async()=>{
 const providers=[['adsb.lol',`https://api.adsb.lol/v2/point/${lat}/${lon}/${radius}`],['airplanes.live',`https://api.airplanes.live/v2/point/${lat}/${lon}/${radius}`],['adsb.one',`https://api.adsb.one/v2/point/${lat}/${lon}/${radius}`]];
 const errors=[];for(const [name,url]of providers){try{const d=await fetchJson(url,{},9500);if(!Array.isArray(d.ac))throw Error('Payload sem ac[]');return {provider:name,updatedAt:new Date().toISOString(),aircraft:d.ac,total:d.ac.length,radiusNm:radius}}catch(err){errors.push(`${name}: ${err.message}`)}}throw Error('Fontes ADS-B indisponíveis: '+errors.join('; '))})}
async function getRoute(callsign){return cached(`route:${callsign}`,6*3600000,async()=>{const d=await fetchJson(`https://api.adsbdb.com/v0/callsign/${encodeURIComponent(callsign)}`,{},11000);const root=d?.response||{};const fl=root.flightroute||root.route||root;return {route:fl?.destination?{origin:fl.origin||null,destination:fl.destination,airline:fl.airline||null,midpoint:fl.midpoint||null}:null,provider:'ADSBDB'}})}
function durationMinutes(iso){const m=String(iso||'').match(/^P(?:([0-9]+)D)?T?(?:([0-9]+)H)?(?:([0-9]+)M)?/);return m?Number(m[1]||0)*1440+Number(m[2]||0)*60+Number(m[3]||0):null}
const iataOK=x=>typeof x==='string'&&/^[A-Z]{3}$/.test(x);
const dateOK=x=>typeof x==='string'&&/^20\d{2}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x));
async function searchFares(p){const {origin,destination,departure,returnDate,adults,cabin,stops}=p;
 if(!iataOK(origin)||!iataOK(destination)||origin===destination||!dateOK(departure)||returnDate&&!dateOK(returnDate))throw Object.assign(Error('Aeroportos ou datas inválidos'),{status:400});
 if(departure<new Date().toISOString().slice(0,10)||returnDate&&returnDate<departure)throw Object.assign(Error('Datas de viagem inválidas'),{status:400});
 if(!Number.isInteger(adults)||adults<1||adults>6||!['economy','premium_economy','business','first'].includes(cabin)||![0,1,2].includes(stops))throw Object.assign(Error('Opções de passageiros inválidas'),{status:400});
 if(!TOKEN)throw Object.assign(Error('Provedor de preços não configurado; forneça DUFFEL_ACCESS_TOKEN'),{status:503});
 const slices=[{origin,destination,departure_date:departure}];if(returnDate)slices.push({origin:destination,destination:origin,departure_date:returnDate});const data={data:{slices,passengers:Array.from({length:adults},()=>({type:'adult'})),cabin_class:cabin,max_connections:stops}};
 const r=await fetchJson('https://api.duffel.com/air/offer_requests?return_offers=true&supplier_timeout=18000',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json','Duffel-Version':'v2','Authorization':`Bearer ${TOKEN}`},body:JSON.stringify(data)},49000);
 const offers=r?.data?.offers||[];return {test:FARES_MODE!=='live',provider:'Duffel',searchAt:new Date().toISOString(),offers:offers.slice(0,150).map(o=>({id:o.id,total_amount:o.total_amount,total_currency:o.total_currency,expires_at:o.expires_at,available_seats:o.available_seats,airline:o.owner?.name||'',slices:(o.slices||[]).map(s=>({depart:s.segments?.[0]?.departing_at||null,arrive:s.segments?.at(-1)?.arriving_at||null,minutes:durationMinutes(s.duration),stops:Math.max(0,(s.segments?.length||1)-1),segments:(s.segments||[]).map(x=>({operating_carrier:x.operating_carrier?.name||x.marketing_carrier?.name||'',code:`${x.marketing_carrier?.iata_code||''}${x.marketing_carrier_flight_number||''}`}))}))}))};
}
function sendFile(res,p){const file=path.join(ROOT,p);const fileAllowed=['index.html','privacidade.html','app.js','style.css','airports-seed.json','favicon.ico','mobile.css','mobile.js','manifest.webmanifest','sw.js','icons/icon-192.png','icons/icon-512.png'];if(!fileAllowed.includes(p)){replyError(res,404,'Não encontrado');return}fs.readFile(file,(err,bytes)=>{if(err){replyError(res,404,'Não encontrado');return}const types={html:'text/html; charset=utf-8',js:'application/javascript; charset=utf-8',css:'text/css; charset=utf-8',json:'application/json; charset=utf-8',ico:'image/x-icon',webmanifest:'application/manifest+json',png:'image/png'};res.writeHead(200,{'Content-Type':types[path.extname(p).slice(1)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Permissions-Policy':'geolocation=(self)'});res.end(bytes)})}
async function parseBody(req){let data='',bytes=0;for await(const chunk of req){bytes+=chunk.length;if(bytes>16000)throw Object.assign(Error('Requisição muito grande'),{status:413});data+=chunk}try{return JSON.parse(data)}catch{throw Object.assign(Error('JSON inválido'),{status:400})}}
const server=http.createServer(async(req,res)=>{
 try{const u=new URL(req.url,`http://${req.headers.host||'localhost'}`);const p=u.pathname;
  if(req.headers.origin==='https://atlasvoos.local' && (p==='/api/health'||p==='/api/fares')){
   res.setHeader('Access-Control-Allow-Origin','https://atlasvoos.local');res.setHeader('Vary','Origin');
   res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type');
   if(req.method==='OPTIONS'){res.writeHead(204);return res.end()}
  }
 if(req.method==='GET'&&p==='/api/health')return send(res,200,{ok:true,online:true,sources:['OpenStreetMap','OurAirports','Open-Meteo','adsb.lol','airplanes.live','ADSBDB'],faresConfigured:!!TOKEN,faresMode:FARES_MODE,airportsCount:airports.length,airportsLive:airportsFromSource});
 if(req.method==='GET'&&p==='/api/airports'){if(!airportsFromSource&&airports===seed)await Promise.race([refreshAirportCatalog(),new Promise(ok=>setTimeout(ok,10000))]);return send(res,200,{airports,fallback:!airportsFromSource,updatedAt:airportsUpdated||null})}
 if(req.method==='GET'&&p==='/api/aircraft'){const lat=Number(u.searchParams.get('lat')),lon=Number(u.searchParams.get('lon')),radius=Number(u.searchParams.get('radius')||250);if(!Number.isFinite(lat)||lat< -90||lat>90||!Number.isFinite(lon)||lon< -180||lon>180||radius<1||radius>250)return replyError(res,400,'Coordenadas ou raio inválidos');return send(res,200,await getAircraft(lat,lon,radius))}
 if(req.method==='GET'&&p==='/api/route'){const callsign=(u.searchParams.get('callsign')||'').trim().toUpperCase();if(!/^[A-Z0-9]{2,12}$/.test(callsign))return replyError(res,400,'Indicativo de voo inválido');return send(res,200,await getRoute(callsign))}
 if(req.method==='POST'&&p==='/api/fares'){if(!checkFareRate(req))return replyError(res,429,'Limite de consultas atingido; tente novamente mais tarde.');const payload=await parseBody(req);return send(res,200,await searchFares(payload))}
 if(req.method==='GET'&&(p==='/'||p==='/index.html'||p==='/privacidade.html'||p==='/style.css'||p==='/app.js'||p==='/airports-seed.json'||p==='/mobile.css'||p==='/mobile.js'||p==='/sw.js'||p==='/manifest.webmanifest'||p==='/icons/icon-192.png'||p==='/icons/icon-512.png'))return sendFile(res,p==='/'?'index.html':p.slice(1));
 return replyError(res,404,'Endpoint não encontrado');
 }catch(err){console.error('[API]',err.message);replyError(res,err.status||(/Upstream|abort|fetch failed|unavailable|indisponíveis/i.test(err.message)?503:502),err.status?err.message:'Não foi possível consultar a fonte externa neste momento')}
});
server.listen(PORT,HOST,()=>{console.log(`Atlas Voos no ar: http://${HOST}:${PORT}`);console.log('Preços:',FARES_MODE==='unconfigured'?'não configurados':FARES_MODE==='live'?'produção':'teste');if(process.env.ATLAS_SKIP_AIRPORTS_UPDATE!=='1')refreshAirportCatalog()});
