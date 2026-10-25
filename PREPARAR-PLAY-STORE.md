# Atlas Voos — preparação para Google Play

Versão de desempenho: 1.2.0; código Android disponível neste repositório.

## Otimização para Android Go
- O Modo Leve é ativado automaticamente em dispositivos com pouca memória (via ActivityManager no Android e pistas do navegador).
- No Modo Leve, no máximo 75 aviões e 65 aeroportos ficam desenhados de uma vez; a quantidade total da resposta ADS-B continua correta.
- Marcadores visíveis são reaproveitados entre atualizações; o mapa evita camadas extras e animações pesadas.
- Atualização automática do radar: mínimo de 60 segundos no Modo Leve; não atualiza com a tela em segundo plano. O botão atualizar ainda funciona manualmente.
- GPS sem alta precisão no Modo Leve; para automaticamente em segundo plano e retoma apenas se já estava ativado.
- Modo Leve pode ser ligado ou desligado com botão ⚡ no cabeçalho.

## Checklist antes de publicar
1. Testar em dispositivo real de 2 GB de RAM (Moto E13), inclusive navegação no mapa por 10 minutos, voltar após bloquear tela, alternar de apps e usar 4G. Nenhuma medição de FPS foi realizada aqui.
2. O app tem `targetSdk 36` e `minSdk 23`. Confirmar políticas de target API vigentes quando publicar.
3. Para enviar à Google Play, construir **Android App Bundle (.aab)** de **release assinado** com sua chave de upload; o APK **debug** do GitHub é apenas para teste. Não colocar chaves no repositório.
4. Criar declaração de privacidade e preencher Data Safety com base nos dados efetivamente coletados, compartilhados e enviados a provedores (GPS, chamadas de rede e busca).
5. Preparar ícone, descrição, screenshots, classificação indicativa, canal de suporte, testes fechados/abertos e eventuais formulários exigidos no seu tipo de conta Play Console.
6. Verificar condições e limites de uso de serviços externos (OpenStreetMap tiles, ADS-B, Open-Meteo, OurAirports, Nominatim) antes de distribuir em escala. Usar um provedor de tiles com capacidade adequada se o app ganhar muitos usuários.
7. Testar compatibilidade, permissões e política de localização, bem como acessibilidade em telas pequenas.

A presença deste checklist não equivale a certificação ou aprovação da Play Store.
