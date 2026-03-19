# Arquitetura Sara

## Objetivo

Sara usa o WhatsApp como canal principal de entrada e o dashboard como camada de visualizacao e acompanhamento.

## Modulos principais

- Site marketing: landing, assinatura, login e pos-compra
- Auth: codigo por email + sessao por cookie httpOnly
- Billing: webhook Cakto ativa ou desativa conta
- WhatsApp: adapter atual via Evolution
- Ingestao: classifica mensagens em tarefa, lembrete, agenda, gasto, nota ou ideia
- Painel: resumo do dia, rotina, lembretes, agenda, financas, notas e ideias

## Rotas

### UI

- `/`
- `/assinatura`
- `/login`
- `/pos-compra`
- `/painel`
- `/painel/rotina`
- `/painel/lembretes`
- `/painel/agenda`
- `/painel/financas`
- `/painel/notas`
- `/painel/ideias`
- `/painel/whatsapp`

### API

- `POST /api/auth/request-code`
- `POST /api/auth/verify-code`
- `POST /api/auth/logout`
- `POST /api/webhooks/cakto`
- `POST /api/whatsapp/link`
- `POST /api/whatsapp/inbound`
- `GET /api/dashboard/summary`

## Banco de dados

Modelado em `lib/db/schema.ts`.

Entidades de produto:

- `users`
- `subscriptions`
- `whatsapp_accounts`
- `inbound_messages`
- `tasks`
- `reminders`
- `calendar_events`
- `routines`
- `routine_blocks`
- `finance_entries`
- `notes`
- `ideas`
- `audio_files`
- `transcriptions`
- `scheduled_messages`
- `delivery_logs`

Entidades de suporte operacional:

- `email_login_codes`
- `auth_sessions`

## Pipeline de mensagem

1. Evolution envia webhook para `POST /api/whatsapp/inbound`.
2. O provider atual normaliza o payload.
3. O sistema encontra o usuario pelo numero vinculado.
4. Mensagem bruta e salva em `inbound_messages`.
5. Audio com mais de 60s e recusado.
6. Audio valido passa por storage + transcricao.
7. A classificacao decide entre tarefa, lembrete, agenda, gasto, nota ou ideia.
8. O registro estruturado e salvo na tabela correta.
9. O dashboard e revalidado e atualizado por polling leve no frontend.

## Decisoes de custo

- `MOCK_BACKEND=true` permite desenvolver sem Neon configurado
- auth por codigo evita provedor mais pesado de login
- dashboard usa `router.refresh()` por intervalo em vez de websocket
- classificador usa heuristica primeiro, deixando IA externa como etapa futura ou fallback
- audio limitado a 1 minuto
- foco em texto como padrao

## Migracao futura para Meta

O contrato de provedor esta em `lib/sara/providers.ts`.

Hoje:

- `evolutionProvider.normalizeInbound(...)`

Pronto para proxima etapa:

- `metaProvider.normalizeInbound(...)`

A aplicacao conversa com o provider por interface, nao por payload cru espalhado pelo sistema. Isso reduz acoplamento e torna a migracao para a API oficial da Meta uma troca de adapter, nao uma reescrita da regra de negocio.

## Integracoes externas

- Cakto: webhook de ativacao de conta
- Evolution: entrada inicial de mensagens
- Object storage: adapter em `lib/sara/storage.ts`
- Transcricao: adapter em `lib/sara/transcription.ts`
- IA: classificacao inicial em `lib/sara/classifier.ts`, pronta para evoluir para provider externo
