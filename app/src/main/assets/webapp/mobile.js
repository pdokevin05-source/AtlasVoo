/* Atlas Voos: mobile navigation / Android installable PWA. Online-only by design. */
(()=>{'use strict';
 const nativeAndroid=location.hostname==='atlasvoos.local';
 if(nativeAndroid){
   document.querySelector('.mobile-install')?.remove();
   // External travel links must open in the phone's browser, not replace the local app.
   document.addEventListener('click',e=>{
     const link=e.target.closest('a[href]');
     if(link && /^https?:$/.test(link.protocol) && link.hostname!==location.hostname){
       e.preventDefault(); location.href=link.href;
     }
   },true);
   const originalOpen=window.open;
   window.open=function(url,target,features){
     if(typeof url==='string' && /^https?:\/\//.test(url)){
       location.href=url;
       return null;
     }
     return originalOpen.call(window,url,target,features);
   };
 }
 const narrow=()=>window.matchMedia('(max-width: 700px)').matches;
 const tabs=[...document.querySelectorAll('[data-mobile-tab]')];
 const view=v=>{
   if(!['mapa','buscar','viagem','radar'].includes(v))return;
   document.body.dataset.mobileView=v;
   document.querySelector('#sidebar')?.classList.remove('is-open');
   for(const b of tabs){const active=b.dataset.mobileTab===v;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')}
   if(v==='mapa'||v==='radar')setTimeout(()=>window.dispatchEvent(new Event('resize')),100);
   if(v==='buscar')setTimeout(()=>document.querySelector('#placeInput')?.focus({preventScroll:true}),150);
 };
 tabs.forEach(b=>b.addEventListener('click',()=>view(b.dataset.mobileTab)));
 document.querySelector('#mobileSearchClose')?.addEventListener('click',()=>view('mapa'));
 document.querySelector('#closeDetail')?.addEventListener('click',()=>view('mapa'));
 // If the user chooses a place in the search sheet, show its planning details.
 const title=document.querySelector('#destinationTitle');
 if(title)new MutationObserver(()=>{if(narrow()&&document.body.dataset.mobileView==='buscar')view('viagem')}).observe(title,{childList:true,characterData:true,subtree:true});
 document.querySelector('#openMenu')?.addEventListener('click',()=>{if(narrow())view('buscar')});
 let promptEvent=null;
 const installBtn=document.querySelector('#installApp');
 const help=document.querySelector('#installHelp');
 const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 const showHelp=()=>{
   if(standalone()){help.textContent='O app já está instalado na tela inicial.';installBtn.textContent='✓ Já instalado';installBtn.disabled=true;return}
   help.textContent='Para instalar no Chrome: abra o endereço HTTPS, toque no menu ⋮ e escolha “Instalar app” ou “Adicionar à tela inicial”.';
 };
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();promptEvent=e;help.textContent='Pronto para instalar! Toque no botão acima.'});
 window.addEventListener('appinstalled',()=>{promptEvent=null;showHelp()});
 installBtn?.addEventListener('click',async()=>{
   if(standalone())return;
   if(promptEvent){const e=promptEvent;promptEvent=null;try{await e.prompt();await e.userChoice}catch{}showHelp()}
   else{showHelp();window.alert('No Chrome Android, use o menu ⋮ → Instalar app / Adicionar à tela inicial. É necessário um site HTTPS ou localhost.')}
 });
 if(standalone())showHelp();
 if(!nativeAndroid && 'serviceWorker'in navigator && (location.protocol==='https:' || location.hostname==='localhost'||location.hostname==='127.0.0.1')){
   window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(err=>console.warn('Instalação PWA indisponível:',err)));
 }
 if(narrow())view('mapa');
})();
