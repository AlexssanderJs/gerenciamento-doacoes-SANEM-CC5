# Segurança, perfis, privacidade e desempenho

## Autorização por perfil

O backend monta authorities a partir do perfil persistido do usuário a cada requisição autenticada. Não confia em papel enviado pelo navegador. Perfis desconhecidos recebem somente a autoridade de consentimento vigente e não acessam rotas funcionais.

| Recurso | Administrador | Atendente/colaborador | Avaliador |
|---|---|---|---|
| Usuários e perfis | Gerenciar | Sem acesso administrativo | Sem acesso administrativo |
| Doadores | Consultar/criar/editar/excluir | Consultar/criar/editar | Consultar |
| Itens/estoque | Consultar/criar/editar/excluir | Consultar/criar/editar | Consultar |
| Doações | Consultar/criar/excluir | Consultar/criar | Consultar |
| Retiradas | Consultar/criar/editar/excluir | Consultar/criar/editar | Consultar |
| Pontos de coleta | Consultar/criar/editar/excluir | Consultar/criar/editar | Consultar |
| Beneficiários | Gerenciar e avaliar | Consultar/criar/editar | Consultar e avaliar |
| Solicitações de privacidade | Consultar/responder | Abrir e consultar próprias | Abrir e consultar próprias |
| Relatórios/notificações | Consultar | Consultar conforme rota | Consultar conforme rota |

A política concreta fica em SecurityConfig. As verificações do frontend melhoram a experiência, mas não substituem as verificações do backend.

As ações de criação de doações e retiradas, assim como aprovação/rejeição/inativação/reativação de beneficiários, identificam o operador a partir do usuário autenticado. IDs legados enviados pelo cliente não são usados como fonte de identidade.

## Consentimento e trilha de auditoria

- A versão vigente é configurada por PRIVACY_POLICY_VERSION (padrão SANEM-PRIVACY-1.1).
- O backend só concede authorities de negócio quando o aceite corresponde exatamente à versão vigente.
- Aceites e revogações são armazenados em privacy_consent_event com horário, versão, IP observado pelo servidor e user-agent.
- GET /user/me/privacy-data exporta dados básicos da conta autenticada e histórico de consentimento.
- POST /privacy-request/me e GET /privacy-request/me permitem abrir e acompanhar solicitações.
- Administradores consultam e atualizam solicitações em /privacy-request.

Limites: a exportação não abrange todas as informações de doadores/beneficiários. Solicitações de eliminação são registradas para análise; o sistema não exclui automaticamente registros que possam precisar ser preservados. O controlador deve validar a identidade do titular, avaliar a base legal, os prazos e responder ao pedido.

## Política antes do uso real

Preencher em frontend/src/app/politica-privacidade/page.js o nome/identificação do controlador, canal oficial de privacidade, bases legais por finalidade, operadores/destinatários, compartilhamentos, critérios de retenção e procedimentos de atendimento. Não usar os placeholders da política em produção. O aceite não substitui o mapeamento dos tratamentos.

## CORS em desenvolvimento

Configurar APP_CORS_ALLOWED_ORIGINS com origens explícitas separadas por vírgula. Padrão: http://localhost:3000,http://127.0.0.1:3000. Não usar curingas combinados com credenciais.

## Desempenho

Os endpoints de doações e pontos de coleta são paginados. A migration V18 cria índices para catálogo, mapa e consultas de doações. O requisito p95 inferior a 2.000 ms deve ser medido pelo script tests/performance/sanem-load-test.js conforme docs/performance-test.md, com volume e hardware representativos.

## HTTPS

Fora do escopo atual. O ambiente de desenvolvimento continua em HTTP local. HTTPS, certificados e proxy reverso devem ser configurados na implantação de produção.