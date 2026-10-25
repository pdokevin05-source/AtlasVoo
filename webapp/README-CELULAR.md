# Atlas Voos para Android · versão mobile PWA

Esta é uma versão dedicada a celulares, com navegação inferior de quatro abas **Mapa / Buscar / Viagem / Radar**, pesquisa de destinos, GPS mediante permissão, consultas ADS-B, aeroportos próximos e busca de passagens. É um **aplicativo web instalável (PWA), não um APK**.

## Opção 1 — usar na tela inicial (recomendado)

1. Publique o projeto em uma hospedagem Node.js com HTTPS e acesso à Internet. O arquivo `render.yaml` é uma configuração de exemplo para Render, após subir estes arquivos para um repositório Git. É necessário configurar variáveis de ambiente e verificar os limites dos serviços externos.
2. Abra o link **HTTPS** da hospedagem no Chrome do celular.
3. Toque no botão **Buscar > Instalar Atlas Voos** ou em **⋮ > Instalar app / Adicionar à tela inicial**.
4. Autorize localização só se desejar rastreamento do GPS. Quando instalado, o app abre sem a barra do navegador.

**Sem hospedagem HTTPS, não há link público pronto.** Baixar um ZIP no celular não instala automaticamente um PWA.

## Opção 2 — executar diretamente no próprio celular (sem hospedagem externa)

1. Instale **Termux** a partir de uma fonte confiável, como F-Droid, e abra o aplicativo.
2. Execute `pkg update && pkg install nodejs` no Termux.
3. Digite `termux-setup-storage` e autorize arquivos. Extraia o conteúdo da pasta `AtlasVoos` para `Downloads/AtlasVoos` usando um gerenciador de arquivos.
4. No Termux digite: `cd ~/storage/downloads/AtlasVoos && bash iniciar-android-termux.sh`
5. Abra `http://localhost:3000` no Chrome do **mesmo celular**. O `localhost` é considerado uma origem segura para GPS e instalação do PWA pelo navegador.
6. Mantenha o Termux em execução enquanto usa. O app **continua precisando de Internet** para dados atuais.

Se o Android bloquear o Termux em segundo plano, ajuste a restrição de bateria no dispositivo. A instalação da tela inicial pode variar com versão e configuração do Chrome.

## Dados reais e limitações

* A localização do GPS só é obtida com permissão expressa. Pode ser desativada no cabeçalho.
* Tráfego aéreo depende de fontes públicas ADS-B, com áreas de cobertura e atrasos. O radar atualiza ao abrir a aba, mover o mapa e periodicamente.
* Aviões sem destino público conhecido mostram **não identificado**.
* Passagens e assentos reais dentro da interface dependem de uma chave **live** de provedor (Duffel). Sem ela, há uma busca externa; não são exibidas tarifas fictícias.
* Sem Internet, o aplicativo instalado mostra apenas uma explicação de desconexão. Não mantém mapas, tráfego ou cotações offline.
* Este projeto **não é um APK Android**, não foi publicado na Play Store e não inclui hospedagem online pública.
