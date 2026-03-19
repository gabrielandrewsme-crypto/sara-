# Neon Setup

Este projeto ja esta preparado para usar Neon com Drizzle. O modo mock continua disponivel para desenvolvimento visual, mas o fluxo real do painel, auth e webhooks passa a usar Postgres quando `MOCK_BACKEND=false`.

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
SARA_WHATSAPP_URL=https://wa.me/5500000000000
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

1. Dispare o webhook da Cakto para criar/ativar usuario e assinatura.
2. Faca login com o email da compra.
3. Vincule o WhatsApp em `/painel/whatsapp`.
4. Envie mensagens para a Sara e confirme a atualizacao no painel.

## Observacoes

- Enquanto `MOCK_BACKEND=true`, o projeto nao usa Neon mesmo com `DATABASE_URL` preenchida.
- O client atual usa `@neondatabase/serverless` via HTTP, que combina bem com rotas serverless e App Router.
- A adaptacao para Meta API no futuro continua isolada na camada de provider do WhatsApp, sem acoplar o dashboard ao Evolution.
