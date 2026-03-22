import "server-only";
import { randomUUID } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import { isMockBackend } from "@/lib/config/env";
import { getDb } from "@/lib/db/client";
import {
  actionLogs,
  conversations,
  listItems,
  messages,
  reminders,
  routineBlocks,
  routines,
  tasks,
  userLists
} from "@/lib/db/schema";
import { getMockChatState, getMockState } from "./mock-store";
import { getRepository } from "./repository";
import type {
  ActionLogItem,
  ChatExecutionResult,
  ChatRole,
  ChatState,
  ListSummary,
  PanelData,
  RoutinePeriod,
  TaskItem,
  TaskPriority
} from "./types";

const SUGGESTED_PROMPTS = [
  "Me lembra de pagar a conta amanhã às 9h",
  "Cria uma lista de compras",
  "O que eu tenho hoje?",
  "Prioriza minhas tarefas abertas"
];

function parseTime(text: string) {
  const match = text.match(/(\d{1,2})(?::|h)?(\d{2})?/i);
  if (!match) return null;
  const date = new Date();
  date.setHours(Number(match[1]), Number(match[2] ?? "0"), 0, 0);
  return date;
}

function parseNaturalDate(text: string) {
  const base = new Date();
  const lower = text.toLowerCase();

  if (lower.includes("amanhã") || lower.includes("amanha")) {
    base.setDate(base.getDate() + 1);
  }

  if (lower.includes("hoje")) {
    // Keep same date.
  }

  const withTime = parseTime(text);
  if (withTime) {
    base.setHours(withTime.getHours(), withTime.getMinutes(), 0, 0);
    return base;
  }

  if (lower.includes("amanhã") || lower.includes("amanha")) {
    base.setHours(9, 0, 0, 0);
    return base;
  }

  return null;
}

function extractListTitle(text: string) {
  const lower = text.toLowerCase();
  const match =
    text.match(/lista de ([^.,]+)/i) ||
    text.match(/cria (?:uma )?lista(?: chamada)? ([^.,]+)/i) ||
    text.match(/nova lista(?: chamada)? ([^.,]+)/i);

  if (match) {
    return `Lista de ${match[1].trim()}`.replace(/^Lista de lista de /i, "Lista de ");
  }

  if (lower.includes("compras")) {
    return "Lista de compras";
  }

  return "Nova lista";
}

function extractTitleForCreation(text: string) {
  return text
    .replace(/^(preciso|cria|criar|adiciona|adicionar|me lembra de|me lembra|lembra de|quero)\s+/i, "")
    .replace(/\s+(amanhã|amanha|hoje)(.*)$/i, "")
    .trim() || text.trim();
}

function extractRename(text: string) {
  const match = text.match(/(?:renomeia|muda|troca|edita)\s+(.+?)\s+para\s+(.+)/i);
  if (!match) return null;
  return {
    from: match[1].trim().replace(/^["']|["']$/g, ""),
    to: match[2].trim().replace(/^["']|["']$/g, "")
  };
}

function extractCompletionTarget(text: string) {
  const match = text.match(/(?:conclui|concluir|marca|marque)\s+(.+?)(?:\s+como concluíd[oa])?$/i);
  return match?.[1]?.trim().replace(/^["']|["']$/g, "") ?? null;
}

function pickRoutinePeriod(text: string): RoutinePeriod {
  const lower = text.toLowerCase();
  if (lower.includes("noite")) return "noite";
  if (lower.includes("tarde")) return "tarde";
  return "manha";
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function summarizeToday(panel: PanelData) {
  const tasksToday = panel.tasksOpen.slice(0, 3).map((task) => `- ${task.title}${task.dueAt ? ` (${task.dueAt})` : ""}`);
  const agendaToday = panel.agendaToday.map((item) => `- ${item.time} ${item.title}`);
  const remindersToday = panel.remindersFuture.slice(0, 3).map((item) => `- ${item.title} (${item.when})`);

  return [
    "Hoje na Sara:",
    agendaToday.length ? "Agenda:\n" + agendaToday.join("\n") : "Agenda: sem compromissos agendados.",
    remindersToday.length ? "Lembretes:\n" + remindersToday.join("\n") : "Lembretes: nenhum ativo para hoje.",
    tasksToday.length ? "Tarefas:\n" + tasksToday.join("\n") : "Tarefas: nada aberto com prioridade imediata."
  ].join("\n\n");
}

async function ensureConversationDb(userId: string) {
  const db = getDb();
  const [existing] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.userId, userId), eq(conversations.status, "active")))
    .orderBy(desc(conversations.updatedAt))
    .limit(1);

  if (existing) return existing;

  const [created] = await db
    .insert(conversations)
    .values({
      userId,
      title: "Conversa principal",
      status: "active",
      lastMessageAt: new Date()
    })
    .returning();

  await db.insert(messages).values({
    conversationId: created.id,
    userId,
    role: "assistant",
    content: "Estou pronta. Me peça para criar tarefas, lembretes, listas, rotinas ou consultar o seu dia."
  });

  return created;
}

async function getChatStateDb(userId: string): Promise<ChatState> {
  const db = getDb();
  const conversation = await ensureConversationDb(userId);
  const messageRows = await db
    .select({
      id: messages.id,
      role: messages.role,
      content: messages.content,
      createdAt: messages.createdAt
    })
    .from(messages)
    .where(eq(messages.conversationId, conversation.id))
    .orderBy(messages.createdAt);

  const actionRows = await db
    .select({
      id: actionLogs.id,
      actionType: actionLogs.actionType,
      entityType: actionLogs.entityType,
      summary: actionLogs.summary,
      createdAt: actionLogs.createdAt
    })
    .from(actionLogs)
    .where(eq(actionLogs.userId, userId))
    .orderBy(desc(actionLogs.createdAt))
    .limit(6);

  return {
    conversationId: conversation.id,
    messages: messageRows.map((message) => ({
      id: message.id,
      role: message.role as ChatRole,
      content: message.content,
      createdAt: message.createdAt.toISOString()
    })),
    recentActions: actionRows.map((item) => ({
      id: item.id,
      actionType: item.actionType as ActionLogItem["actionType"],
      entityType: item.entityType,
      summary: item.summary,
      createdAt: item.createdAt.toISOString()
    })),
    suggestedPrompts: SUGGESTED_PROMPTS
  };
}

async function logActionDb(userId: string, conversationId: string, messageId: string | null, result: ChatExecutionResult) {
  const db = getDb();
  await db.insert(actionLogs).values({
    userId,
    conversationId,
    messageId,
    actionType: result.actionType,
    entityType: result.entityType,
    entityId: result.entityId ?? null,
    summary: result.summary,
    payload: result
  });
}

function getMockConversationState(userId: string) {
  const state = getMockState();
  if (!state.conversationsByUserId[userId]) {
    const seeded = getMockChatState(userId);
    state.conversationsByUserId[userId] = {
      conversationId: seeded.conversationId,
      messages: seeded.messages,
      actions: seeded.recentActions
    };
  }
  return state.conversationsByUserId[userId];
}

function pushMockAction(userId: string, result: ChatExecutionResult) {
  const state = getMockState();
  const action: ActionLogItem = {
    id: randomUUID(),
    actionType: result.actionType,
    entityType: result.entityType,
    summary: result.summary,
    createdAt: new Date().toISOString()
  };
  getMockConversationState(userId).actions.unshift(action);
  state.panelByUserId[userId].recentActions.unshift(action);
  state.panelByUserId[userId].alerts.unshift({
    title: "Ação executada no chat",
    detail: result.summary,
    tone: "blue"
  });
}

function createTaskMock(userId: string, text: string): ChatExecutionResult {
  const state = getMockState();
  const panel = state.panelByUserId[userId];
  const dueAt = parseNaturalDate(text);
  const task: TaskItem = {
    id: randomUUID(),
    title: extractTitleForCreation(text),
    details: "Criada no chat da Sara",
    priority: text.toLowerCase().includes("urgente") ? "high" : "normal",
    status: "open",
    dueAt: dueAt ? dueAt.toLocaleString("pt-BR") : null
  };
  panel.tasksOpen.unshift(task);
  return {
    reply: `Criei a tarefa "${task.title}" e já deixei no painel${task.dueAt ? ` para ${task.dueAt}` : ""}.`,
    actionType: "create",
    entityType: "task",
    entityId: task.id,
    summary: `Tarefa criada: ${task.title}`
  };
}

function createReminderMock(userId: string, text: string): ChatExecutionResult {
  const state = getMockState();
  const panel = state.panelByUserId[userId];
  const remindAt = parseNaturalDate(text) ?? new Date(Date.now() + 60 * 60 * 1000);
  const reminder = {
    id: randomUUID(),
    title: extractTitleForCreation(text),
    when: remindAt.toLocaleString("pt-BR"),
    urgent: text.toLowerCase().includes("urgente") || text.toLowerCase().includes("hoje")
  };
  panel.remindersFuture.unshift(reminder);
  return {
    reply: `Deixei o lembrete "${reminder.title}" programado para ${reminder.when}.`,
    actionType: "create",
    entityType: "reminder",
    entityId: reminder.id,
    summary: `Lembrete criado: ${reminder.title}`
  };
}

function createListMock(userId: string, text: string): ChatExecutionResult {
  const state = getMockState();
  const panel = state.panelByUserId[userId];
  const title = extractListTitle(text);
  const list: ListSummary = {
    id: randomUUID(),
    title,
    itemCount: 0,
    openCount: 0,
    items: []
  };
  panel.lists.unshift(list);
  return {
    reply: `Criei a lista "${title}". Você pode continuar adicionando itens pelo chat.`,
    actionType: "create",
    entityType: "list",
    entityId: list.id,
    summary: `Lista criada: ${title}`
  };
}

function queryTodayMock(userId: string): ChatExecutionResult {
  const panel = getMockState().panelByUserId[userId];
  return {
    reply: summarizeToday(panel),
    actionType: "query",
    entityType: "dashboard",
    summary: "Resumo de hoje consultado no chat."
  };
}

function completeItemMock(userId: string, text: string): ChatExecutionResult {
  const panel = getMockState().panelByUserId[userId];
  const target = normalizeText(extractCompletionTarget(text) ?? text);
  const task = panel.tasksOpen.find((item) => normalizeText(item.title).includes(target));

  if (task) {
    panel.tasksOpen = panel.tasksOpen.filter((item) => item.id !== task.id);
    panel.tasksDone.unshift({ ...task, status: "done" });
    return {
      reply: `Marquei "${task.title}" como concluída.`,
      actionType: "complete",
      entityType: "task",
      entityId: task.id,
      summary: `Tarefa concluída: ${task.title}`
    };
  }

  const reminder = panel.remindersFuture.find((item) => normalizeText(item.title).includes(target));
  if (reminder) {
    panel.remindersFuture = panel.remindersFuture.filter((item) => item.id !== reminder.id);
    panel.remindersDone.unshift({ ...reminder, completed: true });
    return {
      reply: `Marquei o lembrete "${reminder.title}" como concluído.`,
      actionType: "complete",
      entityType: "reminder",
      entityId: reminder.id,
      summary: `Lembrete concluído: ${reminder.title}`
    };
  }

  return {
    reply: "Não encontrei um item aberto com esse nome. Tente citar o título principal.",
    actionType: "query",
    entityType: "system",
    summary: "Tentativa de conclusão sem item correspondente."
  };
}

function renameItemMock(userId: string, text: string): ChatExecutionResult {
  const rename = extractRename(text);
  if (!rename) {
    return {
      reply: "Consigo editar itens quando você diz algo como: renomeia relatório semanal para revisão semanal.",
      actionType: "suggest",
      entityType: "system",
      summary: "Orientação de edição enviada."
    };
  }

  const panel = getMockState().panelByUserId[userId];
  const target = normalizeText(rename.from);

  for (const task of panel.tasksOpen) {
    if (normalizeText(task.title).includes(target)) {
      task.title = rename.to;
      return {
        reply: `Atualizei o item para "${rename.to}".`,
        actionType: "update",
        entityType: "task",
        entityId: task.id,
        summary: `Tarefa renomeada para ${rename.to}`
      };
    }
  }

  for (const reminder of panel.remindersFuture) {
    if (normalizeText(reminder.title).includes(target)) {
      reminder.title = rename.to;
      return {
        reply: `Atualizei o lembrete para "${rename.to}".`,
        actionType: "update",
        entityType: "reminder",
        entityId: reminder.id,
        summary: `Lembrete renomeado para ${rename.to}`
      };
    }
  }

  return {
    reply: "Não encontrei um item para editar com esse nome.",
    actionType: "query",
    entityType: "system",
    summary: "Tentativa de edição sem item correspondente."
  };
}

function prioritizeMock(userId: string): ChatExecutionResult {
  const panel = getMockState().panelByUserId[userId];
  panel.tasksOpen = panel.tasksOpen
    .map((task, index) => ({
      ...task,
      priority: (index === 0 ? "high" : index < 3 ? "normal" : "low") as TaskPriority
    }))
    .sort((a, b) => {
      const order = { high: 0, normal: 1, low: 2 } as const;
      return order[a.priority] - order[b.priority];
    });

  const topTitles = panel.tasksOpen.slice(0, 3).map((item) => item.title).join(", ");
  return {
    reply: `Reorganizei suas tarefas por prioridade. No topo agora: ${topTitles || "nenhuma tarefa aberta"}.`,
    actionType: "reorganize",
    entityType: "task",
    summary: "Tarefas reorganizadas por prioridade."
  };
}

function addRoutineMock(userId: string, text: string): ChatExecutionResult {
  const panel = getMockState().panelByUserId[userId];
  const period = pickRoutinePeriod(text);
  const item = {
    id: randomUUID(),
    period,
    title: extractTitleForCreation(text),
    details: "Adicionado pelo chat"
  };
  panel.routines.unshift(item);
  return {
    reply: `Adicionei "${item.title}" na sua rotina da ${period}.`,
    actionType: "create",
    entityType: "routine",
    entityId: item.id,
    summary: `Bloco de rotina criado: ${item.title}`
  };
}

async function executeMock(userId: string, content: string) {
  const lower = normalizeText(content);

  if (lower.includes("o que eu tenho hoje") || (lower.includes("tenho") && lower.includes("hoje"))) {
    return queryTodayMock(userId);
  }
  if (lower.includes("prioridade") || lower.includes("prioriza") || lower.includes("organiza")) {
    return prioritizeMock(userId);
  }
  if (lower.includes("conclu") || lower.includes("marca")) {
    return completeItemMock(userId, content);
  }
  if (lower.includes("renomeia") || lower.includes("edita") || lower.includes("troca") || lower.includes("muda")) {
    return renameItemMock(userId, content);
  }
  if (lower.includes("lista")) {
    return createListMock(userId, content);
  }
  if (lower.includes("rotina")) {
    return addRoutineMock(userId, content);
  }
  if (lower.includes("lembr") || lower.includes("nao esquecer")) {
    return createReminderMock(userId, content);
  }

  return createTaskMock(userId, content);
}

async function createTaskDb(userId: string, text: string): Promise<ChatExecutionResult> {
  const db = getDb();
  const dueAt = parseNaturalDate(text);
  const [created] = await db
    .insert(tasks)
    .values({
      userId,
      title: extractTitleForCreation(text),
      details: "Criada no chat da Sara",
      priority: text.toLowerCase().includes("urgente") ? "high" : "normal",
      dueAt
    })
    .returning({ id: tasks.id, title: tasks.title, dueAt: tasks.dueAt });

  return {
    reply: `Criei a tarefa "${created.title}" e ela já apareceu no painel${created.dueAt ? ` para ${created.dueAt.toLocaleString("pt-BR")}` : ""}.`,
    actionType: "create",
    entityType: "task",
    entityId: created.id,
    summary: `Tarefa criada: ${created.title}`
  };
}

async function createReminderDb(userId: string, text: string): Promise<ChatExecutionResult> {
  const db = getDb();
  const remindAt = parseNaturalDate(text) ?? new Date(Date.now() + 60 * 60 * 1000);
  const [created] = await db
    .insert(reminders)
    .values({
      userId,
      title: extractTitleForCreation(text),
      remindAt,
      isUrgent: text.toLowerCase().includes("urgente") || text.toLowerCase().includes("hoje")
    })
    .returning({ id: reminders.id, title: reminders.title, remindAt: reminders.remindAt });

  return {
    reply: `Deixei o lembrete "${created.title}" programado para ${created.remindAt.toLocaleString("pt-BR")}.`,
    actionType: "create",
    entityType: "reminder",
    entityId: created.id,
    summary: `Lembrete criado: ${created.title}`
  };
}

async function createListDb(userId: string, text: string): Promise<ChatExecutionResult> {
  const db = getDb();
  const title = extractListTitle(text);
  const [created] = await db
    .insert(userLists)
    .values({
      userId,
      title
    })
    .returning({ id: userLists.id, title: userLists.title });

  return {
    reply: `Criei a lista "${created.title}". Você pode continuar adicionando itens por aqui.`,
    actionType: "create",
    entityType: "list",
    entityId: created.id,
    summary: `Lista criada: ${created.title}`
  };
}

async function queryTodayDb(userId: string): Promise<ChatExecutionResult> {
  const panel = await getRepository().getPanelData(userId);
  return {
    reply: summarizeToday(panel),
    actionType: "query",
    entityType: "dashboard",
    summary: "Resumo de hoje consultado no chat."
  };
}

async function completeDb(userId: string, text: string): Promise<ChatExecutionResult> {
  const db = getDb();
  const target = normalizeText(extractCompletionTarget(text) ?? text);

  const taskRows = await db
    .select({ id: tasks.id, title: tasks.title })
    .from(tasks)
    .where(eq(tasks.userId, userId))
    .orderBy(desc(tasks.updatedAt))
    .limit(20);

  const matchedTask = taskRows.find((item) => normalizeText(item.title).includes(target));
  if (matchedTask) {
    await db.update(tasks).set({ status: "done", updatedAt: new Date() }).where(eq(tasks.id, matchedTask.id));
    return {
      reply: `Marquei "${matchedTask.title}" como concluída.`,
      actionType: "complete",
      entityType: "task",
      entityId: matchedTask.id,
      summary: `Tarefa concluída: ${matchedTask.title}`
    };
  }

  const reminderRows = await db
    .select({ id: reminders.id, title: reminders.title })
    .from(reminders)
    .where(eq(reminders.userId, userId))
    .orderBy(desc(reminders.updatedAt))
    .limit(20);
  const matchedReminder = reminderRows.find((item) => normalizeText(item.title).includes(target));
  if (matchedReminder) {
    await db
      .update(reminders)
      .set({ status: "done", completedAt: new Date(), updatedAt: new Date() })
      .where(eq(reminders.id, matchedReminder.id));
    return {
      reply: `Marquei o lembrete "${matchedReminder.title}" como concluído.`,
      actionType: "complete",
      entityType: "reminder",
      entityId: matchedReminder.id,
      summary: `Lembrete concluído: ${matchedReminder.title}`
    };
  }

  const listItemRows = await db
    .select({ id: listItems.id, title: listItems.title })
    .from(listItems)
    .where(eq(listItems.userId, userId))
    .orderBy(desc(listItems.updatedAt))
    .limit(20);
  const matchedListItem = listItemRows.find((item) => normalizeText(item.title).includes(target));
  if (matchedListItem) {
    await db.update(listItems).set({ status: "done", updatedAt: new Date() }).where(eq(listItems.id, matchedListItem.id));
    return {
      reply: `Marquei "${matchedListItem.title}" como concluído na lista.`,
      actionType: "complete",
      entityType: "list_item",
      entityId: matchedListItem.id,
      summary: `Item de lista concluído: ${matchedListItem.title}`
    };
  }

  return {
    reply: "Não encontrei um item aberto com esse nome. Tente citar o título principal.",
    actionType: "query",
    entityType: "system",
    summary: "Tentativa de conclusão sem item correspondente."
  };
}

async function renameDb(userId: string, text: string): Promise<ChatExecutionResult> {
  const rename = extractRename(text);
  if (!rename) {
    return {
      reply: "Consigo editar itens quando você diz algo como: renomeia relatório semanal para revisão semanal.",
      actionType: "suggest",
      entityType: "system",
      summary: "Orientação de edição enviada."
    };
  }

  const target = normalizeText(rename.from);
  const db = getDb();

  const taskRows = await db.select({ id: tasks.id, title: tasks.title }).from(tasks).where(eq(tasks.userId, userId)).limit(20);
  const matchedTask = taskRows.find((item) => normalizeText(item.title).includes(target));
  if (matchedTask) {
    await db.update(tasks).set({ title: rename.to, updatedAt: new Date() }).where(eq(tasks.id, matchedTask.id));
    return {
      reply: `Atualizei a tarefa para "${rename.to}".`,
      actionType: "update",
      entityType: "task",
      entityId: matchedTask.id,
      summary: `Tarefa renomeada para ${rename.to}`
    };
  }

  const reminderRows = await db
    .select({ id: reminders.id, title: reminders.title })
    .from(reminders)
    .where(eq(reminders.userId, userId))
    .limit(20);
  const matchedReminder = reminderRows.find((item) => normalizeText(item.title).includes(target));
  if (matchedReminder) {
    await db.update(reminders).set({ title: rename.to, updatedAt: new Date() }).where(eq(reminders.id, matchedReminder.id));
    return {
      reply: `Atualizei o lembrete para "${rename.to}".`,
      actionType: "update",
      entityType: "reminder",
      entityId: matchedReminder.id,
      summary: `Lembrete renomeado para ${rename.to}`
    };
  }

  const listRows = await db.select({ id: userLists.id, title: userLists.title }).from(userLists).where(eq(userLists.userId, userId)).limit(20);
  const matchedList = listRows.find((item) => normalizeText(item.title).includes(target));
  if (matchedList) {
    await db.update(userLists).set({ title: rename.to, updatedAt: new Date() }).where(eq(userLists.id, matchedList.id));
    return {
      reply: `Atualizei a lista para "${rename.to}".`,
      actionType: "update",
      entityType: "list",
      entityId: matchedList.id,
      summary: `Lista renomeada para ${rename.to}`
    };
  }

  return {
    reply: "Não encontrei um item para editar com esse nome.",
    actionType: "query",
    entityType: "system",
    summary: "Tentativa de edição sem item correspondente."
  };
}

async function prioritizeDb(userId: string): Promise<ChatExecutionResult> {
  const db = getDb();
  const taskRows = await db
    .select({ id: tasks.id, title: tasks.title, dueAt: tasks.dueAt })
    .from(tasks)
    .where(and(eq(tasks.userId, userId), eq(tasks.status, "open")))
    .orderBy(tasks.dueAt, desc(tasks.updatedAt))
    .limit(12);

  for (const [index, task] of taskRows.entries()) {
    const priority = index === 0 ? "high" : index < 3 ? "normal" : "low";
    await db.update(tasks).set({ priority, updatedAt: new Date() }).where(eq(tasks.id, task.id));
  }

  return {
    reply: `Reorganizei suas tarefas por prioridade. No topo agora: ${taskRows.slice(0, 3).map((item) => item.title).join(", ") || "nenhuma tarefa aberta"}.`,
    actionType: "reorganize",
    entityType: "task",
    summary: "Tarefas reorganizadas por prioridade."
  };
}

async function addRoutineDb(userId: string, text: string): Promise<ChatExecutionResult> {
  const db = getDb();
  const [existingRoutine] = await db
    .select({ id: routines.id })
    .from(routines)
    .where(eq(routines.userId, userId))
    .orderBy(desc(routines.createdAt))
    .limit(1);

  const routineId =
    existingRoutine?.id ??
    (
      await db
        .insert(routines)
        .values({
          userId,
          name: "Minha rotina",
          isDefault: true
        })
        .returning({ id: routines.id })
    )[0].id;

  const period = pickRoutinePeriod(text);
  const [created] = await db
    .insert(routineBlocks)
    .values({
      routineId,
      period,
      title: extractTitleForCreation(text),
      details: "Adicionado pelo chat"
    })
    .returning({ id: routineBlocks.id, title: routineBlocks.title });

  return {
    reply: `Adicionei "${created.title}" na sua rotina da ${period}.`,
    actionType: "create",
    entityType: "routine_block",
    entityId: created.id,
    summary: `Bloco de rotina criado: ${created.title}`
  };
}

async function executeDb(userId: string, content: string) {
  const lower = normalizeText(content);

  if (lower.includes("o que eu tenho hoje") || (lower.includes("tenho") && lower.includes("hoje"))) {
    return queryTodayDb(userId);
  }
  if (lower.includes("prioridade") || lower.includes("prioriza")) {
    return prioritizeDb(userId);
  }
  if (lower.includes("conclu") || lower.includes("marca")) {
    return completeDb(userId, content);
  }
  if (lower.includes("renomeia") || lower.includes("edita") || lower.includes("troca") || lower.includes("muda")) {
    return renameDb(userId, content);
  }
  if (lower.includes("lista")) {
    return createListDb(userId, content);
  }
  if (lower.includes("rotina")) {
    return addRoutineDb(userId, content);
  }
  if (lower.includes("lembr") || lower.includes("nao esquecer")) {
    return createReminderDb(userId, content);
  }

  return createTaskDb(userId, content);
}

export async function getCurrentChatState(userId: string): Promise<ChatState> {
  if (isMockBackend) {
    return getMockChatState(userId);
  }

  return getChatStateDb(userId);
}

export async function processChatMessage(userId: string, content: string): Promise<ChatState> {
  if (isMockBackend) {
    const conversation = getMockConversationState(userId);
    conversation.messages.push({
      id: randomUUID(),
      role: "user",
      content,
      createdAt: new Date().toISOString()
    });

    const result = await executeMock(userId, content);
    pushMockAction(userId, result);
    conversation.messages.push({
      id: randomUUID(),
      role: "assistant",
      content: result.reply,
      createdAt: new Date().toISOString()
    });
    return getMockChatState(userId);
  }

  const db = getDb();
  const conversation = await ensureConversationDb(userId);
  const [userMessage] = await db
    .insert(messages)
    .values({
      conversationId: conversation.id,
      userId,
      role: "user",
      content
    })
    .returning({ id: messages.id });

  const result = await executeDb(userId, content);

  await db.insert(messages).values({
    conversationId: conversation.id,
    userId,
    role: "assistant",
    content: result.reply,
    metadata: result
  });

  await db
    .update(conversations)
    .set({
      lastMessageAt: new Date(),
      updatedAt: new Date()
    })
    .where(eq(conversations.id, conversation.id));

  await logActionDb(userId, conversation.id, userMessage.id, result);

  return getChatStateDb(userId);
}
