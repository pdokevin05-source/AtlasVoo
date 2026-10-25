# Política de privacidade — Atlas Voos (rascunho para revisão)

**Última atualização:** 25/10/2026  
**Responsável / controlador:** [PREENCHER NOME OU IDENTIFICAÇÃO DO RESPONSÁVEL]  
**Contato sobre dados pessoais:** [PREENCHER EMAIL DE CONTATO]  
**Endereço público desta política:** [PREENCHER URL HTTPS ANTES DA PUBLICAÇÃO]

## O que o aplicativo faz

O Atlas Voos permite explorar localidades, aeroportos, meteorologia e sinais públicos de aeronaves. O uso principal não exige criar uma conta. A versão Android carrega a interface instalada no aparelho e se comunica com serviços externos para dados atualizados.

## Dados que podem ser processados

- **Localização:** somente se você autorizar o GPS. O app usa as coordenadas para indicar sua posição, achar aeroportos próximos e centrar consultas do radar. As coordenadas da região visualizada no mapa (inclusive se centrada no GPS) podem ser enviadas a provedores de dados de aeronaves. Outras consultas geográficas podem transmitir o destino escolhido.
- **Busca de destinos e viagens:** termos pesquisados, aeroportos, datas, classe e quantidade de passageiros podem ser enviados aos provedores necessários. Na versão com cotações ativas, essas informações são enviadas ao backend do Atlas Voos e ao parceiro de tarifas; não inclua dados de documentos ou pagamento.
- **Rede e dados técnicos:** provedores externos podem receber o IP de conexão, horário e informações técnicas inerentes às requisições, conforme suas próprias políticas.
- **Favoritos e preferências:** destinos favoritos e Modo Leve ficam salvos localmente no aparelho. O código atual não implementa sincronização de conta nem uma plataforma própria de análises comportamentais.

## Finalidades e permissões

A localização é opcional e serve às funções de navegação e descoberta. Você pode negar ou revogar a permissão nas Configurações do Android e desativar o acompanhamento no próprio app. O app solicita acesso à Internet para mapa, clima, pesquisa e radar.

## Serviços de terceiros

Dependendo da função usada e da disponibilidade, o app pode consultar OpenStreetMap (mapas), Open-Meteo (meteorologia e busca), OurAirports (catálogo de aeroportos), Nominatim (identificação de localidades), provedores comunitários ADS-B (aviões), ADSBDB (rotas conhecidas) e, quando configurado, Duffel por meio do servidor de tarifas do Atlas Voos. A busca externa de passagens abre páginas de terceiros em navegador separado, com políticas próprias.

## Armazenamento, compartilhamento e retenção

O código Android atual não implementa conta, envio de favoritos para servidores do Atlas Voos ou histórico persistente de trajetos GPS. Informações armazenadas localmente podem ser apagadas ao limpar os dados do app. As consultas externas necessárias ao funcionamento podem ser registradas por seus respectivos operadores de acordo com as políticas próprias deles. **Antes da distribuição pública, o responsável deve verificar logs do backend, retenção e eventuais serviços adicionados.**

## Segurança

O aplicativo utiliza HTTPS para APIs externas. Nenhum token de acesso comercial de tarifas deve ser colocado no aplicativo ou no repositório. Serviços online e Internet não são garantidos sem interrupção.

## Direitos do titular

Para perguntas sobre tratamento de dados e solicitações relacionadas à LGPD, utilize o contato informado no início desta política. Para informações armazenadas por provedores externos, consulte também as políticas deles.

## Alterações

A política poderá ser atualizada para refletir mudanças de funcionalidades ou fornecedores. A data de atualização ficará visível nesta página.

**ATENÇÃO:** este texto é um rascunho fundamentado no código revisado, não um parecer jurídico. Antes de publicar, preencher responsável, contato e URL pública, revisar os fluxos de dados reais (inclusive terceiros e hospedagem) e concluir a declaração Data Safety da Google Play.
