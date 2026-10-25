# ATLAS VOOS 1.3 · explorador de viagens conectado 🌍✈️

Projeto HTML5/CSS3/JavaScript + um servidor Node.js sem dependências externas (Node 20 ou superior). Idioma: português do Brasil. Funciona em PCs e celulares através de navegador atualizado. Não contém tráfego artificial, preços fabricados ou indicação de destinos inventados.

> **Quer usar no Android?** Leia primeiro [README-CELULAR.md](README-CELULAR.md). Há interface especial para touch, PWA instalável pelo Chrome e inicialização local via Termux. Não é APK.

## Como abrir no Windows

1. Instale Node.js 20+ de https://nodejs.org/ se ainda não tiver.
2. Extraia o ZIP inteiro. **Não abra `index.html` diretamente**, porque o mapa usa APIs no servidor.
3. Dê dois cliques em **start.bat**, ou abra o terminal dentro da pasta e execute `node server.js`.
4. Acesse **http://localhost:3000** no navegador.
5. Deixe o terminal aberto enquanto usa o app.

**No celular:** para usar pela Internet, hospede a pasta com o servidor Node num serviço que suporte Node e HTTPS (por exemplo um serviço de deploy de Node). Abra o endereço **https://...** no Chrome/Android. O GPS contínuo exige sua permissão e um contexto seguro (`https` ou `localhost`). `localhost` no celular não é o mesmo PC da rede doméstica; por isso `start.bat` é um jeito de testar no PC, não um link público no Android.

## O que já funciona no código

- Mapa-múndi com zoom, deslocamento, países vetoriais (quando carregados) e camada de aeroportos.
- Seleção de país no mapa no modo **Países**; localização por clique com identificação geográfica reversa para estados/cidades quando a fonte responde; busca digitada por países, estados, municípios e regiões.
- GPS do dispositivo em **acompanhamento contínuo** (com opção de parar), precisão estimada e aeroporto de partida mais próximo.
- Distância ortodrômica (great circle), linha curva da rota no mapa, estimativa *teórica* de tempo de voo e relógio do destino (fuso horário obtido pelo clima quando disponível).
- Consulta online de meteorologia: temperatura, sensação térmica, umidade, vento, descrição, precipitação prevista para amanhã.
- Fonte de aeroportos OurAirports, com atualização diária no servidor; catálogo de resgate de 72 aeroportos internacionais caso a atualização falhe.
- Radar ADS-B centrado na área do mapa, 250 milhas náuticas de raio (máximo por consulta); atualização automática limitada a ~30 segundos; fontes alternativas e nenhuma aeronave fictícia.
- Identificação por callsign, modelo e matrícula quando presentes nos dados; altitude (pés), velocidade no solo (km/h), rumo, código ICAO24, squawk, idade do sinal.
- Clique num avião para consulta de **rota conhecida do indicativo** via ADSBDB; caso não exista, mostra destino não identificado. A posição ADS-B isolada não garante destino exato.
- Painel de tráfego ordenável por proximidade, altitude, velocidade e callsign.
- Planejamento de passagem: ida, volta, origem, destino, nº de adultos, classe, escalas e ordenação de ofertas.
- Integração opcional de cotações da Duffel no servidor (não expõe token de produção no navegador). Ofertas incluem preço, moeda, horários, empresa aérea operadora, duração, escalas, expiração e lugares disponíveis quando retornados.
- **Sem token:** informa indisponibilidade e abre consulta externa de passagens com trecho e datas preenchidos; nunca cria tarifa falsa.
- Favoritos locais, compartilhamento da localização selecionada, coordenadas copiáveis, integração com Google Maps e exportação JSON do plano da viagem.
- Camadas selecionáveis, modo celular com menu lateral, tela cheia, informação de conexão e mensagens de erro.

## Ativando preços e horários comerciais dentro do app

1. Crie uma conta na [Duffel](https://duffel.com/), ative o ambiente apropriado e obtenha uma chave de acesso.
2. Copie `.env.example` para `.env`.
3. Preencha `DUFFEL_ACCESS_TOKEN=...` no `.env`, **sem publicar o arquivo ou subir a chave no GitHub**.
4. Reinicie `node server.js` e pesquise um par de aeroportos e datas futuras.

**Atenção:** `duffel_test_...` retorna **dados de teste, que não representam ofertas, preços ou horários reais**. Apenas credenciais live com acesso adequado podem retornar ofertas reais. Mesmo assim, preços e assentos mudam e devem ser confirmados antes de reservar. O projeto é visualizador/buscador e **não vende nem compra bilhetes**.

Horários livres e assentos disponíveis só são mostrados se constarem nas ofertas retornadas pelo provedor. O rastreamento ADS-B de aeronaves em voo não fornece preço de passagens nem grade comercial de próximos meses.

## Dados, limites e privacidade

| Sistema | Origem | Limitação |
|---|---|---|
| Mapa | OSM + CARTO | Tiles externos e Internet obrigatórios |
| Fronteiras | Natural Earth | Camada generalizada, não geocadastro legal |
| Busca de cidades/estados | Open-Meteo Geocoding / GeoNames; fallback Nominatim | Sujeita a disponibilidade e política de uso |
| Reverso geográfico | OpenStreetMap Nominatim (acionado pelo usuário) | Teto de 1 req/s do serviço; sem autocomplete Nominatim |
| Aeroportos | OurAirports CSV | Catálogo aberto; não indica horários comerciais de partidas |
| Aeroespacial | adsb.lol / Airplanes.live / adsb.one | Cobertura, latência e limites variáveis; nunca garante aviões de todo o planeta de uma só vez |
| Rotas de indicativos | ADSBDB | Nem todo callsign possui rota pública; rota conhecida não significa destino confirmado naquele instante |
| Previsão | Open-Meteo | Condições/previsão aproximadas do destino |
| Passagens | Duffel (opcional) | É necessário token e acesso live; test mode é explícito |

O GPS é opt-in e atualizado pela API do navegador. As coordenadas do **centro do mapa** são transmitidas ao serviço ADS-B para consultar aeronaves daquela área, inclusive se o mapa estiver centrado no GPS. O servidor não armazena histórico de localização e o navegador não faz upload de uma trilha persistente. Os **favoritos** ficam no armazenamento local do navegador. Serviços externos têm políticas próprias de privacidade.

**Não há modo offline de consulta**. O arquivo de interface e o catálogo de aeroportos de resgate podem continuar no dispositivo, mas rastreamento, mapa, clima, geocodificação e tarifas dependem de conexão.

## Testes

Execute `npm test` para a suíte local (saúde da API, validação de dados, CORS e política de privacidade). Para Android 1.3, veja `../PREPARAR-PLAY-STORE.md`. As tarifas internas no APK dependem de backend HTTPS e credencial do provedor no servidor, nunca dentro do APK.


- `node --check app.js`
- `node --check server.js`
- `npm run check` (opcional)
- `curl http://localhost:3000/api/health`
- `curl 'http://localhost:3000/api/airports'`

A validade de APIs públicas e tarifas live depende de Internet e credenciais. Sem esses requisitos não é possível executar testes de integração reais.

## Créditos

OurAirports: dados de domínio público. Natural Earth: domínio público. OpenStreetMap contributors / CARTO: termos e atribuição no mapa. ADSB.lol: ODbL. Verifique licenças, regras de rate limiting e requisitos dos provedores antes de publicar em escala.

## Estrutura

- `index.html`: interface sem frameworks pesados
- `style.css`: layout responsivo
- `app.js`: mapa, controles e integração de dados
- `server.js`: API e arquivos estáticos, proxy seguro e Duffel opcional
- `airports-seed.json`: catálogo básico de resgate
- `.env.example`: configuração opcional
- `start.bat`: inicialização simples no Windows
- `ROADMAP-100.md`: 100 melhorias adicionais mapeadas, ainda não implementadas
- `Dockerfile` / `render.yaml`: opções de implantação online com HTTPS em plataformas compatíveis

