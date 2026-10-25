# 100 expansões propostas para o Atlas Voos

**Status: propostas para próximas versões, NÃO implementadas nesta versão 1.0.** O núcleo já funcional está descrito em README.md. As funções que dependem de fonte licenciada, autenticação, geodados ou contrato comercial precisarão de integração real antes de serem oferecidas.

## 1 — Busca de voos e tarifas (1–10)
1. Calendário interativo com menor tarifa por dia (provedor comercial).
2. Gráfico de preços de 12 meses (histórico/licenciamento).
3. Alertas de queda de preços com verificação recorrente consentida.
4. Notificações sobre últimas vagas disponíveis em uma tarifa.
5. Histórico comparativo de tarifas por aeroporto.
6. Busca de datas flexíveis ±3, ±7 ou ±14 dias.
7. Busca multidestinos em uma única viagem.
8. Comparador de tarifas com bagagens inclusas.
9. Comparação de tarifas por política de cancelamento.
10. Identificação transparente de taxas extras e impostos.

## 2 — Aeroportos e terminais (11–20)
11. Mapa interno de terminais licenciado.
12. Portões de embarque em tempo real via provedor de status.
13. Tempo estimado de fila na inspeção de segurança.
14. Estimativa de lotação por terminal.
15. Alertas de mudanças de portão.
16. Serviços de alimentação abertos no terminal.
17. Horários de lounges e elegibilidade de acesso.
18. Mapa de esteiras de bagagem.
19. Acompanhamento de estacionamento do aeroporto.
20. Tempo estimado de conexão entre terminais.

## 3 — Aviação ao vivo (21–30)
21. Interpolação visual explicitamente estimada entre sinais ADS-B.
22. Trilha recente real do avião onde a fonte licenciar histórico.
23. Identificação de helicópteros, cargueiros e voos comerciais.
24. Filtro de tráfego por fabricante e modelo.
25. Filtro por altitude mínima e máxima.
26. Filtro por velocidade mínima e máxima.
27. Busca por callsign exato em todo o feed contratado.
28. Sinalização de transponders sem identidade conhecida.
29. Histograma de altitude dos aviões visíveis.
30. Linha do tempo de pousos e decolagens observados.

## 4 — Mapas e geografia (31–40)
31. Fronteiras detalhadas de estados e províncias.
32. Mapas com relevo 3D e altitude.
33. Troca entre basemap escuro, claro e satélite licenciado.
34. Comparação visual da área territorial de dois países.
35. Mapas de fusos horários e linha internacional de data.
36. Camada de áreas de turbulência com fonte meteorológica adequada.
37. Camada de nuvens e tempestades via tiles meteorológicos.
38. Camada de correntes de vento em altitude.
39. Área de cobertura dos radares ADS-B exibida no mapa.
40. Camada de aeroportos desativados e aeródromos privados.

## 5 — Planejamento de viagem (41–50)
41. Calculadora de tempo porta a porta.
42. Orçamento completo por categoria de despesas.
43. Simulação de custo por pessoa em grupo.
44. Itinerário de múltiplas cidades com mapa de rota.
45. Lista de bagagem editável por país e estação.
46. Calendário pessoal da viagem exportado em ICS.
47. Planilha de gastos compartilhada entre viajantes.
48. Prazos e lembretes de check-in.
49. Checklist de documentos sem armazenar números sensíveis.
50. Diário de viagem com fotografias locais.

## 6 — Documentos e burocracia (51–60)
51. Regras atuais de visto por nacionalidade com fonte oficial.
52. Validade mínima do passaporte por destino.
53. Requisitos de autorização eletrônica de entrada.
54. Informações oficiais de imigração e alfândega.
55. Regras de trânsito aeroportuário sem visto.
56. Documentos para viajantes menores de idade.
57. Restrições oficiais para transporte de medicamentos.
58. Vacinação exigida pelo destino via fontes oficiais.
59. Segurança consular e contatos de emergência.
60. Avisos de viagem com data e país emissor.

## 7 — Cidade e deslocamento (61–70)
61. Comparação de táxi, ônibus, trem e traslado.
62. Rotas de metrô do aeroporto para o centro.
63. Calculadora de custos de transporte local.
64. Horário local de nascer e pôr do sol.
65. Eventos públicos com datas verificadas.
66. Museus com horários e feriados atualizados.
67. Guia de bairros a pé com segurança contextualizada.
68. Estimativa de acessibilidade em destinos selecionados.
69. Tradução rápida de frases úteis para viajantes.
70. Conversão de medidas de bagagem por companhia aérea.

## 8 — Informação econômica e climática (71–80)
71. Taxas cambiais consultadas ao vivo.
72. Conversão de moedas no orçamento da viagem.
73. Comparação do custo de alimentação estimado.
74. Previsão de 14 dias em calendário.
75. Climatologia histórica do mês de viagem.
76. Índice UV e recomendação de proteção.
77. Alertas de temperatura extrema.
78. Estimativa de diferença de fuso e jet lag.
79. Simulação de duração do dia durante a estadia.
80. Qualidade do ar consultada em fontes ambientais.

## 9 — Organização e personalização (81–90)
81. Login opcional com sincronização criptografada.
82. Favoritos compartilhados por link temporário.
83. Pastas temáticas de destinos.
84. Comparação lado a lado de dois roteiros.
85. Importação de arquivos GPX/KML/GeoJSON do usuário.
86. Exportação de lista de aeroportos para CSV.
87. Filtros persistentes no navegador.
88. Modo de alto contraste e tipografia ampliada.
89. Navegação integral por teclado e leitor de tela.
90. Internacionalização de interface em vários idiomas.

## 10 — Operação avançada (91–100)
91. Painel de qualidade dos feeds e latência de cada serviço.
92. Cache Redis para múltiplas instâncias do backend.
93. Proxy regional com limites separados por organização.
94. Chave de API comercial guardada em secrets manager.
95. Testes ponta a ponta automatizados para navegação no mapa.
96. Testes sintéticos regulares de fornecedores ADS-B.
97. Métricas de saúde sem identificação de usuários.
98. Suporte a streaming websocket de posições contratadas.
99. Autenticação multifator para a futura área de reservas.
100. Implantação com HTTPS, domínio próprio e CI/CD automatizado.

