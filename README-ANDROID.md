# Atlas Voos para Android

Projeto **Android nativo de apresentação com WebView**, com a interface do Atlas Voos instalada em `app/src/main/assets/webapp/` e a API nativa em `AtlasApi.java`.

Não precisa publicar um servidor para abrir o app. **Não há APK compilado neste ZIP.** Use Android Studio (SDK 35, AGP 8.7.3, Gradle 8.9 e Java 17) ou execute a Action `Gerar APK Android` após enviar a raiz do projeto ao GitHub. O APK de debug gerado fica em `app/build/outputs/apk/debug/app-debug.apk`.

### Capacidades

- Mapa interativo, busca de destinos, aeroportos e meteorologia: precisam de Internet e serviços externos, inclusive Leaflet CDN e mapas CARTO.
- Localização GPS: somente quando autorizada pelo usuário.
- Radar aéreo: consulta provedores públicos ADS-B e pode apresentar dados ausentes ou atraso. A API Android usa três fontes alternativas e cache curto.
- Aeroportos: catálogo básico incluído e tentativa de baixar/armazenar catálogo OurAirports completo quando conectado.
- Rotas de callsigns: ADSBDB quando disponíveis. Uma rota conhecida não confirma o destino real de toda aeronave.
- Busca de passagens: botão para consultar site externo; **o APK não tem token Duffel e não mostra preços inventados**.
- Links de sites externos: abertos fora da WebView no navegador do celular.
- UI: mesmo HTML/CSS/JS do projeto, com interface mobile e ícone Android.

### Arquitetura

A página é carregada a partir de `https://atlasvoos.local/index.html`, uma origem virtual segura **interceptada dentro do WebView**. Essa origem não é um servidor público e não faz consulta DNS para os recursos interceptados. `WebViewClient.shouldInterceptRequest` atende a interface e as consultas GET `/api/*` por meio de `AtlasApi.java`. Isso evita servidor Node.js e porta HTTP aberta no telefone. O restante dos recursos web públicos segue exigindo conectividade.

### Restrições e testes

O ambiente que preparou esta versão não tinha SDK, Gradle ou rede para instalá-los: **a compilação e os testes no dispositivo ainda são necessários**. Para testes após compilar: abrir o mapa, conceder/recusar GPS, pesquisar um destino, testar radar com conectividade, verificar catálogo e abrir busca de passagens no navegador. Não adicione tokens ou senhas ao código Android.

A versão original para web/Node.js está preservada em `webapp/`.
