# Atlas Voos 1.3 — preparação de produção

## Teste do dispositivo (25/10/2026)
O desenvolvedor relatou funcionamento normal do **Modo Leve no Motorola Moto E13**, em dispositivo real. Resultado observado pelo usuário, sem relatório automatizado de FPS, RAM, bateria ou cobertura de rede. Não tratar isso como certificação de todos os modelos.

## Arquivos e publicação
- O GitHub Actions valida JavaScript, testes de API e compila o **APK debug**, sempre para testes.
- Quando as quatro credenciais de assinatura estiverem disponíveis, o mesmo workflow compila um **AAB release assinado**.
- O AAB deve ser enviado à Play Console; não compartilhar a chave de upload no repositório.

## Configurar assinatura (GitHub → Settings → Secrets and variables → Actions → Secrets)
Gerar uma **chave de upload** do proprietário, fora do repositório. Fazer backup seguro da chave e das senhas. Adicionar:
- `ATLAS_UPLOAD_KEYSTORE_BASE64`: conteúdo do arquivo JKS codificado em Base64 sem quebras de linha
- `ATLAS_STORE_PASSWORD`: senha do arquivo
- `ATLAS_KEY_ALIAS`: alias da chave
- `ATLAS_KEY_PASSWORD`: senha da chave

O workflow não tentará publicar um AAB **não assinado** se faltar uma dessas quatro configurações. No primeiro envio à Play Console, habilitar Play App Signing. Não confundir certificado de upload com a chave final de assinatura mantida pelo Google.

## Cotações reais no Android
A versão Android nunca deve conter `DUFFEL_ACCESS_TOKEN`. O servidor web `webapp/server.js` é o intermediário de tarifas. A conta comercial com o provedor e o deploy HTTPS são responsabilidade do proprietário.

1. Hospedar `webapp/` em backend Node HTTPS (ex.: Render) e definir `DUFFEL_ACCESS_TOKEN` **somente** nas variáveis secretas do servidor.
2. Configurar **variable** (não secret) do GitHub Actions `ATLAS_FARES_API_BASE` com a raiz pública HTTPS do backend (sem barra final), por exemplo `https://seu-backend.example`.
3. Recompilar o Android pela Action. O app consulta a saúde desse servidor e permite cotações reais **somente quando** ele responde como ambiente de produção configurado.
4. Credenciais `duffel_test_...` mostram dados de **TESTE**, não tarifas comerciais reais.
5. Ter atenção a orçamento, termos, abuso do endpoint, bloqueios de provedores e precificação comercial antes de habilitar um token live. O servidor aplica limites básicos, mas isso não substitui proteção na borda / WAF.

## Privacidade e Google Play
- `PRIVACIDADE.md` e `webapp/privacidade.html` são **rascunhos**, não publicação final.
- Preencher identidade, contato e hospedar política em **URL HTTPS pública** acessível também fora do aplicativo. A versão em `webapp/privacidade.html` pode ser disponibilizada pelo backend hospedado.
- Preencher Data Safety conforme o comportamento real, conferir serviços terceiros, endereços IP, coordenadas, logs e retenção.
- Preparar ícones, capturas de tela, descrição, classificação, canal de suporte e teste fechado se a modalidade de conta exigir.
- Revisar os limites de serviços gratuitos OpenStreetMap, ADS-B e Open-Meteo antes de escalar.

## Pendências que não podem ser resolvidas só com código
1. Chave privada de upload e credenciais do proprietário para a Play Console.
2. Conta ativa de provedor comercial + backend HTTPS configurado para tarifas.
3. Endereço de contato real e confirmação legal da política de privacidade.
4. Testes de integração com provedores ao vivo, e bateria/4G/rede instável com mais de um aparelho.
