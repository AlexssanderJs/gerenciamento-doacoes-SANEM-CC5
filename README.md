# Gerenciamento de Doações SANEM

## 📖 Descrição

O sistema tem como objetivo o gerenciamento de um brechó beneficente que distribui roupas, calçados e utensílios a pessoas necessitadas, tanto por meio de controle de estoque, beneficiários e funcionários, quanto por meio da geração de relatórios pertinentes ao sistema.

## 🎯 Sobre o Sistema

### Principais Funcionalidades

#### 👥 Gestão de Beneficiários

- Cadastrar, aprovar e consultar o histórico de pessoas e famílias atendidas
- Emitir cartões de identificação para agilizar o atendimento
- Controle completo do perfil dos beneficiários
- Inativar (bloquear) e reativar beneficiários já aprovados sem remover o cadastro (status `INACTIVE`)

#### 📍 Pontos de Coleta e Sedes

- Cadastrar, consultar, editar e inativar pontos de coleta parceiros e sedes de entidades assistenciais em Medianeira
- Registrar endereço e horário de funcionamento de cada local
- Visualizar todas as localizações em um mapa interativo (Leaflet + OpenStreetMap)

#### 📣 Demandas Prioritárias (RF20)

- Cadastrar, consultar, atualizar e inativar demandas prioritárias por itens do estoque
- Acompanhar o progresso "recebido X de Y", calculado automaticamente a partir das doações
- Destaque das demandas ativas na Home e na tela de registro de doação

#### 📦 Controle de Doações e Estoque

- Registrar os itens recebidos em doação
- Catalogar produtos com códigos únicos
- Gerenciar a quantidade de produtos disponíveis no estoque
- Controle de entrada e saída de itens
- Estoque mínimo por item, com notificação (sino no menu) para administradores e atendentes quando o saldo atinge ou fica abaixo do mínimo (RF19)

#### 🎁 Distribuição de Itens

- Registrar a retirada de itens por um beneficiário
- Baixa automática no estoque
- Aplicação de regras como limite mensal de retiradas
- Controle de distribuição por período

#### 👨‍💼 Administração e Relatórios

- Gerenciar usuários com diferentes permissões (Atendente e Administrador)
- Gerar relatórios detalhados sobre doações
- Relatórios de distribuições e posição do estoque
- Análise completa da operação

## 🚀 Tecnologias Utilizadas

### Backend

- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Security** - Autenticação e autorização
- **Spring Data JPA** - Persistência de dados
- **PostgreSQL (NeonDB)** - Banco de dados (hospedado na nuvem)
- **JWT** - Tokens de autenticação
- **Maven** - Gerenciamento de dependências

### Frontend

- **Next.js 15** (App Router) + **React 19**
- **CSS Modules** - Estilização
- **Axios** - Cliente HTTP
- **React Icons** - Ícones
- **Leaflet / React-Leaflet** - Mapa interativo dos pontos de coleta (OpenStreetMap)
- **driver.js** - Tour guiado / onboarding (RF11)

### DevOps

- **Docker** - Containerização
- **Docker Compose** - Orquestração de containers

## 📁 Estrutura do Projeto

O backend segue **organização por camadas** (_package-by-layer_): cada camada técnica
fica em seu próprio pacote sob `com.sanem`.

```
gerenciamento-doacoes-SANEM/
├── backend/                    # Backend Java Spring Boot
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/sanem/
│   │   │   │   ├── SanemApplication.java
│   │   │   │   ├── config/                 # SecurityConfig, WebConfig
│   │   │   │   ├── controller/             # Endpoints REST
│   │   │   │   ├── service/                # Regras de negócio
│   │   │   │   ├── repository/             # Spring Data JPA (+ SoftDeleteRepository)
│   │   │   │   ├── mapper/                 # Conversão entity <-> DTO
│   │   │   │   ├── model/
│   │   │   │   │   ├── entity/             # Entidades JPA
│   │   │   │   │   ├── dto/                # Requests e responses
│   │   │   │   │   └── enums/              # Enumerações
│   │   │   │   ├── exception/              # GlobalExceptionHandler e erros
│   │   │   │   ├── security/               # JwtFilter, JwtService
│   │   │   │   ├── specification/          # Filtros dinâmicos (JPA Specifications)
│   │   │   │   ├── util/                   # Utilitários (HTTP, QR Code, relatórios)
│   │   │   │   └── validation/             # Validações customizadas (CPF/CNPJ, senha)
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       └── db/migration/           # Migrations Flyway
│   │   └── test/
│   ├── pom.xml
│   └── Dockerfile
├── frontend/                   # Frontend Next.js (App Router)
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   │   ├── cadastrobeneficiario/       # Beneficiários
│   │   │   ├── pontoscoleta/               # Pontos de coleta + mapa (NOVO)
│   │   │   │   ├── lista/                   # Mapa interativo + tabela
│   │   │   │   ├── editar/[id]/
│   │   │   │   └── PontoColetaForm.js
│   │   │   └── components/
│   │   │       ├── map/CollectionPointsMap.js  # Mapa Leaflet (NOVO)
│   │   │       └── navegation/
│   │   ├── services/api.js
│   │   └── hooks/
│   ├── package.json
│   └── Dockerfile
├── db/                        # Scripts e diagrama do banco de dados
│   ├── Diagrama MER.pdf
│   ├── script-create-tables.sql
│   └── script-insert-values.sql
├── docker-compose.yml         # Orquestração dos containers
├── .gitignore
└── README.md
```

## 🛠️ Configuração e Execução

### Pré-requisitos

- Java 17 ou superior
- Node.js 18 ou superior
- Uma conta/banco PostgreSQL no [NeonDB](https://neon.tech) (connection string)
- Docker e Docker Compose (opcional)

### Execução com Docker (Recomendado)

1. **Clone o repositório**

    ```bash
    git clone <url-do-repositorio>
    cd gerenciamento-doacoes-SANEM-CC5
    ```

2. **Configure as credenciais do banco (NeonDB)**
    - Copie `.env.example` para `.env` e preencha com a connection string do Neon
      (`SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`).
    - O `.env` não é versionado (está no `.gitignore`).

3. **Execute com Docker Compose**

    ```bash
    docker-compose up -d --build
    ```

    A Flyway cria o esquema e aplica o seed no banco Neon automaticamente no startup do backend.

4. **Acesse a aplicação**
    - Frontend: http://localhost:3000
    - Backend API: http://localhost:8080/api
    - Banco: PostgreSQL hospedado no NeonDB (nuvem)

### Execução Manual

#### Backend

1. **Navegue para a pasta do backend**

    ```bash
    cd backend
    ```

2. **Configure o banco de dados (NeonDB)**
    - Crie um projeto/banco PostgreSQL no NeonDB e copie a connection string.
    - Defina as variáveis de ambiente (ou use o `.env` na raiz):
      `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`.
    - A Flyway cria o esquema e aplica o seed automaticamente na primeira execução.

3. **Execute a aplicação**

    ```bash
    export SPRING_DATASOURCE_URL="jdbc:postgresql://<host-neon>/<db>?sslmode=require"
    export SPRING_DATASOURCE_USERNAME="<usuario>"
    export SPRING_DATASOURCE_PASSWORD="<senha>"

    mvn clean package
    java -jar target/sanem-backend-1.0.0.jar
    ```

#### Frontend

1. **Navegue para a pasta do frontend**

    ```bash
    cd frontend
    ```

2. **Instale as dependências**

    ```bash
    npm install
    ```

3. **Execute a aplicação**
    ```bash
    npm start
    ```

## 🔧 Configuração do Banco de Dados

O banco é **PostgreSQL hospedado no NeonDB**. Não há banco local: o backend conecta direto no
Neon, e o esquema + seed são aplicados pela **Flyway** no startup
(`backend/src/main/resources/db/migration/V1__init_schema.sql` e `V2__seed_data.sql`).

### Configuração das Credenciais

As credenciais vêm de variáveis de ambiente (nunca commitadas). Copie `.env.example` para `.env`
e preencha com os dados do Neon:

```bash
SPRING_DATASOURCE_URL=jdbc:postgresql://<host-neon>/<database>?sslmode=require
SPRING_DATASOURCE_USERNAME=<usuario-neon>
SPRING_DATASOURCE_PASSWORD=<senha-neon>
```

> O Neon **exige SSL** — mantenha `?sslmode=require` na URL.
> O `application.yml` já lê essas variáveis (com fallback para um Postgres local em dev).

### Dados de exemplo (dev) x produção

O comportamento do seed é controlado pelo profile do Spring (`SPRING_PROFILES_ACTIVE`):

- **`dev`** — a Flyway aplica o schema (`db/migration`) **e** o seed de exemplo (`db/seed`:
  usuários, doadores, beneficiários, pontos de coleta). Use no banco de desenvolvimento do Neon.
- **`prod`** (ou qualquer valor diferente de `dev`) — a Flyway aplica **somente o schema**;
  nenhum dado é inserido na primeira subida. Os usuários/dados são cadastrados manualmente.

Assim, o banco de **produção** do Neon sobe limpo, e o de **desenvolvimento** já vem populado
para testes. (A configuração de limite de retirada é criada automaticamente pela aplicação quando
necessária, então produção funciona sem seed.)

## 📚 Funcionalidades

### Implementadas

#### 👥 Gestão de Beneficiários

- ✅ CRUD completo de beneficiários
- ✅ Sistema de aprovação de cadastros (aprovar/rejeitar)
- ✅ Inativação/reativação de beneficiários aprovados (status `INACTIVE`)
- ✅ Geração de cartões de identificação (PDF)

#### 📍 Pontos de Coleta e Sedes

- ✅ CRUD de pontos de coleta parceiros e sedes de entidades assistenciais
- ✅ Endereço e horário de funcionamento por local
- ✅ Mapa interativo (Leaflet + OpenStreetMap) com as localizações

#### 📦 Controle de Estoque

- ✅ Cadastro e triagem de itens doados
- ✅ Categorias e estado de conservação (RF16)
- ✅ Controle de entrada e saída (ledger de transações de inventário)
- ✅ Estoque mínimo com notificações de estoque baixo (RF19)

#### 🎁 Distribuição

- ✅ Registro de retiradas com baixa automática no estoque
- ✅ Controle de limites mensais (configuração + reset)
- ✅ Validação das regras de distribuição

#### 📣 Demandas Prioritárias (RF20)

- ✅ Cadastrar, consultar, atualizar e inativar demandas por itens do estoque

#### 👨‍💼 Administração e Relatórios

- ✅ Sistema de permissões (Atendente/Administrador)
- ✅ Gestão de usuários e perfis
- ✅ Relatórios de doações, distribuições e posição de estoque (CSV/PDF)

#### 🔐 Autenticação e Segurança

- ✅ Autenticação JWT
- ✅ Recuperação e alteração de senha (com política de senha forte)
- ✅ Validação de CPF/CNPJ e de formulários

#### 🧭 Experiência do Usuário

- ✅ Interface React (Next.js App Router) responsiva
- ✅ Tour guiado nas telas (onboarding, RF11)
- ✅ Containerização com Docker e CORS configurado

### Em evolução

- 🔄 Ampliação da cobertura de testes automatizados
- 🔄 Dashboard administrativo com indicadores

## 🧪 Testes

### Backend

```bash
cd backend
mvn test
```

### Frontend

```bash
cd frontend
npm test
```

## 📦 Build para Produção

### Backend

```bash
cd backend
mvn clean package
```

### Frontend

```bash
cd frontend
npm run build
```


## Consentimento e chave JWT

O backend exige um segredo JWT configurado na variável de ambiente `JWT_SECRET`, com pelo menos 32 bytes. Gere um valor aleatório forte e configure-o no ambiente do backend; não reutilize o valor de exemplo nem versione o arquivo `.env`.

Após aplicar as migrations V14 e V15, usuários que ainda não registraram o aceite da política de privacidade serão direcionados à tela de consentimento. O aceite fica associado à versão `SANEM-PRIVACY-1.1` e é necessário para acessar as demais rotas protegidas da API.

## Segurança, perfis, privacidade e desempenho

O backend monta as permissões a partir do perfil persistido do usuário em cada requisição autenticada. Perfis desconhecidos não recebem acesso às rotas funcionais. A matriz de permissões está em backend/src/main/java/com/sanem/config/SecurityConfig.java.

Perfis: Administrator/Administrador gerencia usuários, perfis e operações administrativas; Attendant/Atendente/Collaborator/Colaborador executa operações operacionais permitidas; Evaluator/Avaliador consulta e avalia beneficiários, além das consultas permitidas. O frontend oculta telas e ações, mas o controle real permanece no backend.

As ações de doações, retiradas e avaliação de beneficiários identificam o operador pelo usuário autenticado. IDs de atendente/avaliador enviados pelo navegador não são usados como fonte de identidade.

A versão da política é configurada por PRIVACY_POLICY_VERSION (padrão SANEM-PRIVACY-1.1). O backend só concede permissões de negócio quando o aceite corresponde à versão vigente. O histórico de aceite e revogação é auditado. Usuários podem exportar os dados básicos da própria conta e registrar solicitações de acesso, correção, portabilidade, oposição ou eliminação; administradores acompanham e respondem.

Antes de utilizar dados pessoais reais, a organização responsável deve preencher a identificação do controlador e o canal de privacidade na política, definir as bases legais por finalidade e detalhar compartilhamentos, operadores e retenção. Solicitações de eliminação são registradas para análise e não geram exclusão automática; o controlador precisa validar identidade, obrigações de retenção e resposta. O export atual não é uma exportação completa dos dados de doadores e beneficiários.

O CORS de desenvolvimento é controlado por APP_CORS_ALLOWED_ORIGINS. O padrão permite somente http://localhost:3000 e http://127.0.0.1:3000.

Doações e pontos de coleta usam endpoints paginados, e a migration V18 cria índices para as consultas frequentes. Para comprovar o requisito de 2 segundos, execute tests/performance/sanem-load-test.js conforme docs/performance-test.md com volume de dados representativo. Índices e paginação, por si só, não comprovam o SLA.

### HTTPS

HTTPS não faz parte deste ajuste: o ambiente de desenvolvimento continua em HTTP local. Configure HTTPS, certificados e proxy reverso na implantação de produção antes de disponibilizar o sistema publicamente.