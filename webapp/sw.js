/* Network-only service worker. Do not cache maps, flights, GPS, fares, or UI. */
self.addEventListener('install', event => {self.skipWaiting()});
self.addEventListener('activate', event => {event.waitUntil(self.clients.claim())});
self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request,{cache:'no-store'}).catch(() => {
    if(event.request.mode === 'navigate')return new Response(`<!doctype html><html lang="pt-BR"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0a1427"><body style="background:#0a1427;color:white;font:16px system-ui;padding:24px"><h1>✈ Atlas Voos</h1><h2>Conexão necessária</h2><p>Conecte o celular à Internet para carregar o mapa, radar, clima e passagens atualizados.</p><button onclick="location.reload()" style="font:inherit;padding:12px 18px">Tentar novamente</button></body></html>`,{headers:{'Content-Type':'text/html;charset=utf-8'}});
    return Response.error();
  }));
});
