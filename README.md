# Sara

Base Next.js para o sistema Sara, com site, login por email, painel protegido, banco relacional e chat nativo integrado ao painel.

## Stack

- Next.js App Router
- Neon/Postgres via Drizzle
- Auth por codigo de email
- Webhook de assinatura Cakto
- Chat nativo persistido em banco
- Painel com refresh automatico leve

## Fluxo principal

1. Usuario chega pelo site.
2. Compra na Cakto.
3. Webhook ativa conta e assinatura.
4. Usuario pede codigo de acesso por email.
5. Painel abre e ja oferece o chat da Sara.
6. O usuario conversa no chat para criar, editar, consultar e reorganizar itens reais do sistema.
7. O painel reflete tudo em tarefas, lembretes, listas, agenda, rotina, notas e ideias.

## Rodando localmente

1. Copie `.env.example` para `.env.local`.
2. Para trabalhar sem Neon, mantenha `MOCK_BACKEND=true`.
3. Instale dependencias com `npm.cmd install`.
4. Rode `npm.cmd run dev`.

## Usando Neon

1. Configure `DATABASE_URL` da Neon em `.env.local`.
2. Defina `MOCK_BACKEND=false`.
3. Rode `npm.cmd run db:generate`.
4. Rode `npm.cmd run db:migrate`.
5. Valide a conexao em `/api/health/db`.

Guia rapido: [docs/neon.md](docs/neon.md)

## Scripts

- `npm.cmd run dev`
- `npm.cmd run build`
- `npm.cmd run db:generate`
- `npm.cmd run db:migrate`

## Demo local

Com `MOCK_BACKEND=true`, use `demo@sara.app` na tela de login. O codigo de acesso aparece na resposta de desenvolvimento e no console.

## Bootstrap local com Neon

Para criar rapidamente um usuario ativo no banco local de desenvolvimento, envie um `POST` para `/api/dev/bootstrap-user` com `email` e `name`.

Exemplo:

```bash
curl -X POST http://localhost:3000/api/dev/bootstrap-user ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"voce@exemplo.com\",\"name\":\"Seu Nome\"}"
```

## Documentacao adicional

- [docs/architecture.md](docs/architecture.md)
- [docs/neon.md](docs/neon.md)
