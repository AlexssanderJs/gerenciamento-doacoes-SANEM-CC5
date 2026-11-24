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

## LGPD para doadores e beneficiários (RNF04)

Doadores e beneficiários não têm conta de acesso, mas seus dados pessoais (CPF/CNPJ, contato, dados socioeconômicos) são tratados. A migration V19 acrescenta a ambos:

- base legal obrigatória (CONSENT, LEGAL_OBLIGATION, PUBLIC_POLICY ou LEGITIMATE_INTEREST), finalidade, data/versão do consentimento e data de anonimização;
- a tabela data_subject_privacy_event, que audita cada cadastro, alteração e anonimização (base legal, consentimento, versão da política, operador e horário).

Regras no backend (DataSubjectPrivacyService): sem base legal o cadastro é recusado; com base CONSENT o consentimento precisa estar marcado; registros anonimizados não podem mais ser alterados. Os formulários de doador e beneficiário exibem os campos e validam antes do envio.

Endpoints exclusivos do ADMINISTRATOR:

- GET /donor/{id}/privacy-export e GET /beneficiary/{id}/privacy-export: dados do titular e histórico de tratamento (atende pedidos de acesso/portabilidade).
- POST /donor/{id}/anonymize e POST /beneficiary/{id}/anonymize: removem nome, documento, contato e dados socioeconômicos, mantendo o registro e as doações/retiradas para preservar a integridade e a auditoria.

Registros anteriores à V19 ficam com base legal vazia. Eles precisam ser regularizados pela organização (editar o cadastro e informar a base legal).

Ainda não implementado: política de retenção automática (definir prazo por finalidade e agendar a anonimização), mascaramento/criptografia do CPF em repouso e HTTPS (ver abaixo). O controlador continua responsável por validar a identidade do titular e a base legal antes de atender solicitações.

## Política antes do uso real

Preencher em frontend/src/app/politica-privacidade/page.js o nome/identificação do controlador, canal oficial de privacidade, bases legais por finalidade, operadores/destinatários, compartilhamentos, critérios de retenção e procedimentos de atendimento. Não usar os placeholders da política em produção. O aceite não substitui o mapeamento dos tratamentos.

## CORS em desenvolvimento

Configurar APP_CORS_ALLOWED_ORIGINS com origens explícitas separadas por vírgula. Padrão: http://localhost:3000,http://127.0.0.1:3000. Não usar curingas combinados com credenciais.

## Desempenho

Os endpoints de doações e pontos de coleta são paginados. A migration V18 cria índices para catálogo, mapa e consultas de doações. A V21 acrescenta índices trigram (pg_trgm) para buscas "contém" em doadores, itens e pontos de coleta. A tela de registro de doação busca doadores no servidor, com debounce, em vez de carregar todos. O requisito p95 inferior a 2.000 ms deve ser medido pelo script tests/performance/sanem-load-test.js conforme docs/performance-test.md, com volume e hardware representativos (tests/performance/seed-load-data.sql gera o volume de teste). Nenhuma medição foi registrada até agora.

## HTTPS

Fora do escopo atual. O ambiente de desenvolvimento continua em HTTP local. HTTPS, certificados e proxy reverso devem ser configurados na implantação de produção.