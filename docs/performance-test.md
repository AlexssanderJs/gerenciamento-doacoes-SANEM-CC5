# Teste de desempenho do SANEM

O requisito de desempenho só pode ser validado após executar o teste com uma base representativa e registrar o ambiente de referência. O script k6 mede o percentil 95 individualmente para catálogo de itens, pontos de coleta e histórico de doações.

## Execução local

1. Inicie o ambiente de desenvolvimento com docker compose up -d --build.
2. Gere um JWT por login com um usuário ativo que tenha aceitado a versão atual da política de privacidade.
3. Instale o k6: https://grafana.com/docs/k6/latest/set-up/install-k6/
4. Na raiz do repositório, execute no PowerShell (substitua o marcador pelo token, sem publicá-lo):

    $env:TOKEN = "COLE_AQUI_UM_JWT_DE_DESENVOLVIMENTO"
    $env:BASE_URL = "http://localhost:8080/api"
    $env:VUS = "10"
    $env:DURATION = "1m"
    k6 run tests/performance/sanem-load-test.js

No Bash:

    TOKEN="COLE_AQUI_UM_JWT_DE_DESENVOLVIMENTO" BASE_URL="http://localhost:8080/api" VUS=10 DURATION=1m k6 run tests/performance/sanem-load-test.js

## Critérios

- 10 usuários virtuais simultâneos por 1 minuto, configuráveis por ambiente.
- p95 inferior a 2.000 ms em cada uma das três consultas.
- Taxa de requisições com falha inferior a 1%.
- Todas as respostas precisam ser HTTP 200.

## Interpretação

O teste deve ser executado com volume de dados próximo do esperado em uso normal, usando o mesmo hardware/recursos de CPU, memória e banco de dados que serão considerados para a avaliação. Registre a data, hardware, quantidade de registros e resultado do k6. Os dados seed de desenvolvimento, sozinhos, não são suficientes para representar uma carga de produção.

Os índices da migration V18, a paginação e as buscas por prefixo reduzem trabalho desnecessário, mas não constituem prova de que a meta de 2 segundos foi atingida. Ajuste VUS, DURATION e o conjunto de dados conforme o cenário operacional acordado.
