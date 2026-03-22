# Neon Setup

Este projeto esta preparado para usar Neon com Drizzle. O modo mock continua disponivel para desenvolvimento visual, mas o fluxo real do painel, auth, chat e webhooks passa a usar Postgres quando `MOCK_BACKEND=false`.

## 1. Criar banco na Neon

Crie um projeto na Neon e copie a connection string Postgres com SSL.

Exemplo:

```env
DATABASE_URL=postgresql://USER:PASSWORD@ep-example-sa-east-1.aws.neon.tech/neondb?sslmode=require
MOCK_BACKEND=false
```

## 2. Configurar ambiente

Copie `.env.example` para `.env.local` e preencha pelo menos:

```env
APP_URL=http://localhost:3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
MOCK_BACKEND=false
AUTH_COOKIE_NAME=sara_session
```

## 3. Instalar dependencias

```bash
npm.cmd install
```

## 4. Gerar e aplicar schema

```bash
npm.cmd run db:generate
npm.cmd run db:migrate
```

Isso cria a pasta `drizzle/` com os artefatos de migracao e aplica o schema no banco da Neon.

## 5. Validar conexao

Com o servidor rodando, acesse:

```text
/api/health/db
```

Resposta esperada:

```json
{
  "ok": true,
  "mode": "neon",
  "database": "neondb"
}
```

## 6. Validar o fluxo da Sara

Depois da conexao:

1. Dispare o webhook da Cakto para criar ou ativar o usuario.
2. Faca login com o email da compra.
3. Abra o painel e use o chat da Sara.
4. Crie tarefas, lembretes e listas pelo chat.
5. Confirme a atualizacao imediata no painel.

## Observacoes

- Enquanto `MOCK_BACKEND=true`, o projeto nao usa Neon mesmo com `DATABASE_URL` preenchida.
- O client atual usa `@neondatabase/serverless`, que combina bem com rotas serverless e App Router.
- A camada de chat grava conversas e logs no banco, o que facilita rastreabilidade e evolucao futura do motor de IA.
