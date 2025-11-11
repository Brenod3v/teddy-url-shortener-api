## Teddy URL Shortener

## Descrição

Uma API encurtadora de URLs construída com o framework [NestJS](https://github.com/nestjs/nest). Esta aplicação permite que usuários criem URLs encurtadas e as gerenciem através de uma API RESTful com suporte a autenticação.

## Funcionalidades

- **Encurtamento de URLs**: Crie URLs encurtadas com códigos personalizados ou gerados automaticamente
- **Autenticação de Usuários**: Sistema de autenticação seguro baseado em JWT
- **Gerenciamento de Usuários**: Funcionalidades de registro e login
- **Gerenciamento de URLs**: Liste, crie e delete suas URLs encurtadas
- **Análises**: Rastreie a contagem de cliques para cada URL encurtada
- **Persistência de Dados**: PostgreSQL para armazenamento confiável de dados
- **Suporte Docker**: Implantação fácil com Docker e Docker Compose
- **Documentação Swagger**: Documentação interativa da API
- **Testes**: Testes unitários e e2e com alta cobertura

## Pré-requisitos

- Node.js (v18 ou superior)
- PostgreSQL (v15 ou superior)
- Docker e Docker Compose (opcional, para configuração containerizada)

## Instalação

### Clone o repositório

```bash
git clone <repository-url>
cd teddy-url-shortener-api
```

### Instale as dependências

```bash
npm install
```

## Configuração

### 1. Configure o arquivo .env

Renomeie `.env.example` pra `.env` ou adicione um arquivo `.env` a raíz do projeto com suas configurações ou copie:

```env
PORT=3000

# JWT
JWT_SECRET=your-secret-key-here

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=url_shortener
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

## Executando a Aplicação

### Opção 1: Usando Docker (Recomendado)

**Linux/macOS/Windows:**
```bash
docker-compose up
```

A API estará disponível em `http://localhost:3000`

A documentação Swagger estará disponível em `http://localhost:3000/api`

### Opção 2: Desenvolvimento Local

#### Linux/macOS

1. Inicie o PostgreSQL:
```bash
sudo service postgresql start
# ou
brew services start postgresql
```

2. Execute a aplicação:
```bash
# modo desenvolvimento
npm run start

# modo watch (reinicia automaticamente)
npm run start:dev
```

A documentação Swagger estará disponível em `http://localhost:3000/api`

#### Windows

1. Inicie o serviço PostgreSQL:
```cmd
# Usando Serviços do Windows ou
net start postgresql-x64-15
```

2. Execute a aplicação:
```cmd
# modo desenvolvimento
npm run start

# modo watch (reinicia automaticamente)
npm run start:dev

```


## Testes

```bash
# testes unitários
npm run test:unit

# testes e2e
npm run test:e2e

```

### Arquitetura
<p align="center">
  <img src="./Teddy URL Shortener.jpg" alt="Teddy URL Shortener" width="300"/>
</p>


## Escalabilidade

### Elementos que favorecem a escalabilidade presentes na aplicação:

A aplicação tem elementos que favorecem a escalabilidade. Sua arquitetura stateless, baseada em autenticação JWT, elimina a necessidade de sessões no servidor, permitindo replicar instâncias horizontalmente sem dependência de estado compartilhado.

O uso de Docker e Docker Compose facilita a containerização e a orquestração de múltiplas instâncias, garantindo consistência e portabilidade entre ambientes.

O pool de conexões do PostgreSQL, gerenciado pelo TypeORM, otimiza o uso de recursos do banco de dados, evitando sobrecarga em cenários de alto volume de requisições.

A estrutura modular do NestJS, combinada com o mecanismo de injeção de dependências, permite substituir ou escalar componentes de forma simples conforme a demanda cresce.

A separação clara entre camadas controllers, services e repositories: contribui para uma manutenção mais eficiente e evolução segura do código, características essenciais em ambientes distribuídos e de alta carga.

### Possíveis futuras implementações para favorecer a escalabilidade:

Uma camada de cache com Redis pode armazenar os mapeamentos entre short codes e URLs originais, evitando consultas repetidas ao banco de dados e reduzindo a latência nas operações de redirecionamento, que geralmente são as mais frequentes.

Usar um sistema de filas, como RabbitMQ ou AWS SQS, permite que tarefas não críticas, como por exemplo, a contagem de cliques e a geração de relatórios analíticos, sejam processadas de forma assíncrona, sem impactar a resposta imediata ao usuário.

Em cenários de grande volume de leitura, a adoção de read replicas do PostgreSQL ajuda a distribuir a carga entre múltiplos servidores, preservando o desempenho da instância principal destinada às operações de escrita.

Um balanceador de carga pode ser posicionado à frente das instâncias da aplicação para distribuir uniformemente as requisições e garantir alta disponibilidade, direcionando o tráfego apenas para instâncias saudáveis.

Integração com ferramentas de observabilidade como Prometheus e Grafana, combinada ao uso de auto scaling em plataformas como Kubernetes ou AWS ECS, permite acompanhar métricas em tempo real e ajustar automaticamente o número de instâncias de acordo com o tráfego.