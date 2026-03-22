# Arquitetura Sara

## Objetivo

Sara e um sistema proprio de organizacao mental. O painel mostra o estado da vida pratica e o chat nativo e a interface conversacional que cria, consulta e reorganiza esse estado.

## Modulos principais

- Site marketing: landing, assinatura, login e pos-compra
- Auth: codigo por email + sessao por cookie httpOnly
- Billing: webhook Cakto ativa ou desativa conta
- Chat nativo: conversa persistida em banco com mensagens e logs
- Motor de intencao: interpreta pedidos em linguagem natural
- Painel: resumo do dia, tarefas, listas, rotina, lembretes, agenda, financas, notas e ideias

## Rotas

### UI

- `/`
- `/assinatura`
- `/login`
- `/pos-compra`
- `/painel`
- `/painel/chat`
- `/painel/tarefas`
- `/painel/listas`
- `/painel/rotina`
- `/painel/lembretes`
- `/painel/agenda`
- `/painel/financas`
- `/painel/notas`
- `/painel/ideias`

### API

- `POST /api/auth/request-code`
- `POST /api/auth/verify-code`
- `POST /api/auth/logout`
- `POST /api/webhooks/cakto`
- `GET /api/chat/state`
- `POST /api/chat/messages`
- `GET /api/dashboard/summary`

## Banco de dados

Modelado em `lib/db/schema.ts`.

Entidades de produto em uso:

- `users`
- `subscriptions`
- `conversations`
- `messages`
- `action_logs`
- `tasks`
- `lists`
- `list_items`
- `reminders`
- `calendar_events`
- `routines`
- `routine_blocks`
- `finance_entries`
- `notes`
- `ideas`

Entidades de suporte operacional:

- `email_login_codes`
- `auth_sessions`

## Pipeline do chat

1. O usuario envia uma mensagem no chat nativo.
2. O sistema persiste a mensagem na conversa ativa.
3. A camada de intencao identifica o objetivo e extrai contexto.
4. O motor decide entre criar, editar, concluir, consultar ou reorganizar.
5. A acao e executada nas entidades reais do banco.
6. A Sara responde no chat confirmando o que fez.
7. Um `action_log` registra a operacao.
8. O painel reflete a mudanca via `router.refresh()` e leitura direta do banco.

## Decisoes de custo

- `MOCK_BACKEND=true` permite desenvolver sem Neon configurado
- auth por codigo evita provedor mais pesado de login
- dashboard usa `router.refresh()` por intervalo e apos acoes do chat
- motor inicial do chat usa heuristica para reduzir custo e acelerar a entrega
- a camada de IA externa pode evoluir depois sem reescrever a base

## Integracoes externas

- Cakto: webhook de ativacao de conta
- Neon: persistencia principal
- Provedor HTTP de email: envio do codigo de acesso
- IA externa: opcional, futura, desacoplada da operacao central
