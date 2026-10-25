'use strict';
const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const net=require('node:net');
const path=require('node:path');
let worker,root;
before(async()=>{
 const port=await new Promise((resolve,reject)=>{const s=net.createServer();s.once('error',reject);s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p))})});
 root='http://127.0.0.1:'+port;
 worker=spawn(process.execPath,['server.js'],{cwd:path.join(__dirname,'..'),env:{...process.env,HOST:'127.0.0.1',PORT:String(port),ATLAS_SKIP_AIRPORTS_UPDATE:'1',DUFFEL_ACCESS_TOKEN:''},stdio:'ignore'});
 for(let i=0;i<55;i++){try{const r=await fetch(root+'/api/health');if(r.ok)return}catch{}await new Promise(r=>setTimeout(r,100))}
 throw Error('Servidor nao inicializou');
});
after(()=>worker?.kill());
test('health relata tarifas desativadas com seguranca',async()=>{const r=await fetch(root+'/api/health'),j=await r.json();assert.equal(r.status,200);assert.equal(j.faresConfigured,false);assert.equal(j.faresMode,'unconfigured')});
test('rejeita coordenadas invalidas sem consultar ADS-B',async()=>{const r=await fetch(root+'/api/aircraft?lat=500&lon=0');assert.equal(r.status,400)});
test('rejeita corpo de tarifas invalido',async()=>{const r=await fetch(root+'/api/fares',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({origin:'INVALID'})});assert.equal(r.status,400)});
test('token ausente nao devolve ofertas inventadas',async()=>{const date=new Date(Date.now()+10*86400000).toISOString().slice(0,10);const r=await fetch(root+'/api/fares',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({origin:'GRU',destination:'LIS',departure:date,returnDate:null,adults:1,cabin:'economy',stops:2})});assert.equal(r.status,503);const j=await r.json();assert.match(j.error,/Provedor/)});
test('habilita CORS apenas na origem local do Android',async()=>{const yes=await fetch(root+'/api/fares',{method:'OPTIONS',headers:{Origin:'https://atlasvoos.local','Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'Content-Type'}});assert.equal(yes.status,204);assert.equal(yes.headers.get('access-control-allow-origin'),'https://atlasvoos.local');const no=await fetch(root+'/api/health',{headers:{Origin:'https://outro.example'}});assert.equal(no.headers.get('access-control-allow-origin'),null)});
test('pagina de politica de privacidade disponivel',async()=>{const r=await fetch(root+'/privacidade.html');assert.equal(r.status,200);assert.match(await r.text(),/Política de privacidade/)});
