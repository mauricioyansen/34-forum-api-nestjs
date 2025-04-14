# Forum API – NestJS

API RESTful desenvolvida com **NestJS** para gerenciamento de um fórum, permitindo a criação de perguntas, respostas, comentários e anexos. Este projeto segue boas práticas de arquitetura com **Domain-Driven Design (DDD)**, testes automatizados, autenticação com JWT e uso do Prisma como ORM.

## ✨ Funcionalidades

- ✅ Cadastro e autenticação de usuários (JWT)
- ✅ Publicação de perguntas
- ✅ Criação de respostas e comentários
- ✅ Voto positivo/negativo em respostas
- ✅ Anexos em perguntas e respostas
- ✅ Validações e regras de negócio robustas

## 🧱 Estrutura de Pastas

```bash
src/
├── domain/               # Entidades, casos de uso e repositórios
├── infra/                # Implementações de infraestrutura (HTTP, DB, etc.)
│   ├── http/
│   │   ├── controllers/  # Controllers HTTP (rotas da API)
│   │   └── auth/         # Estratégias de autenticação e guardas
│   ├── database/         # Prisma, repositórios e mapeamento
│   └── mail/             # (opcional) envio de emails, se implementado
├── core/                 # Serviços e utilitários internos
└── main.ts               # Ponto de entrada da aplicação
```

## ⚙️ Tecnologias

- [NestJS](https://nestjs.com/)
- [Prisma ORM](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [JWT](https://jwt.io/)
- [Vitest](https://vitest.dev/) + [Supertest](https://github.com/visionmedia/supertest)

## 🚀 Como executar o projeto

### Pré-requisitos

- Node.js 18+
- Docker + Docker Compose (para banco de dados PostgreSQL)

### Passos

```bash
# Instale as dependências
npm install

# Suba o banco com Docker
docker-compose up -d

# Rode as migrations
npx prisma migrate dev

# Inicie a aplicação
npm run start:dev
```

A API estará disponível em: `http://localhost:3333`

## ✅ Testes

O projeto possui **testes unitários** e **testes end-to-end (E2E)** organizados e executáveis via scripts:

```bash
# Testes unitários
npm run test

# Testes E2E (end-to-end)
npm run test:e2e

# Cobertura
npm run test:cov
```

Scripts definidos no `package.json`:

```json
"test": "vitest run",
"test:e2e": "vitest --config vitest.config.e2e.mts",
"test:cov": "vitest run --coverage"
```

## 🧪 Exemplos de Requisições

Use o arquivo `client.http` presente no projeto para testar as rotas com o [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) no VS Code.

## 📁 Banco de Dados

Utiliza **PostgreSQL** com **Prisma ORM**. As entidades e relacionamentos estão definidos no arquivo `prisma/schema.prisma`.

## 📚 Conceitos aplicados

- Clean Architecture / DDD
- Injeção de dependências
- Autenticação com JWT + Guards
- Validação com Pipes
- Upload e persistência de arquivos
- Testes automatizados com cobertura

## 👨‍💻 Autor

Desenvolvido por [Mauricio Yansen](https://github.com/mauricioyansen) 🚀

---

Este repositório é open-source e está disponível em:  
🔗 [github.com/mauricioyansen/34-forum-api-nestjs](https://github.com/mauricioyansen/34-forum-api-nestjs)
