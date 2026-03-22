import "server-only";
import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import {
  actionLogs,
  authSessions,
  calendarEvents,
  emailLoginCodes,
  financeEntries,
  ideas as ideasTable,
  listItems,
  notes as notesTable,
  reminders,
  routineBlocks,
  routines,
  subscriptions,
  tasks,
  userLists,
  users
} from "@/lib/db/schema";
import { isMockBackend } from "@/lib/config/env";
import { getMockState } from "./mock-store";
import type {
  AuthSession,
  LinkedSubscription,
  LoginUser,
  PanelData,
  TaskItem
} from "./types";
import { hashValue } from "./utils";

export type Repository = {
  findActiveUserByEmail(email: string): Promise<LoginUser | null>;
  saveLoginCode(input: { userId: string; email: string; codeHash: string; expiresAt: Date }): Promise<void>;
  consumeLoginCode(email: string, codeHash: string, now: Date): Promise<LoginUser | null>;
  createSession(input: { user: LoginUser; token: string; expiresAt: Date }): Promise<AuthSession>;
  getSession(token: string): Promise<AuthSession | null>;
  deleteSession(token: string): Promise<void>;
  upsertSubscription(input: {
    email: string;
    fullName?: string | null;
    status: LinkedSubscription["status"];
    providerCustomerId?: string | null;
    providerSubscriptionId?: string | null;
    rawPayload?: unknown;
  }): Promise<void>;
  getPanelData(userId: string): Promise<PanelData>;
};

function mapSubscriptionStatus(status?: string): "active" | "past_due" | "canceled" | "blocked" {
  if (status === "active" || status === "past_due" || status === "canceled") {
    return status;
  }
  return "blocked";
}

function sortTasks(items: TaskItem[]) {
  const order = { high: 0, normal: 1, low: 2 } as const;
  return [...items].sort((a, b) => {
    if (order[a.priority] !== order[b.priority]) {
      return order[a.priority] - order[b.priority];
    }

    return (a.dueAt ?? "").localeCompare(b.dueAt ?? "");
  });
}

const mockRepository: Repository = {
  async findActiveUserByEmail(email) {
    const state = getMockState();
    return state.users.find((user) => user.email.toLowerCase() === email.toLowerCase() && user.isActive) ?? null;
  },
  async saveLoginCode(input) {
    const state = getMockState();
    state.loginCodes = state.loginCodes.filter((item) => item.email !== input.email);
    state.loginCodes.push(input);
  },
  async consumeLoginCode(email, codeHash, now) {
    const state = getMockState();
    const match = state.loginCodes.find(
      (item) => item.email.toLowerCase() === email.toLowerCase() && item.codeHash === codeHash && item.expiresAt > now
    );
    if (!match) return null;
    state.loginCodes = state.loginCodes.filter((item) => item !== match);
    return state.users.find((user) => user.id === match.userId) ?? null;
  },
  async createSession(input) {
    const state = getMockState();
    const session: AuthSession = { token: input.token, user: input.user, expiresAt: input.expiresAt };
    state.sessions.push({ ...session, tokenHash: hashValue(input.token) });
    return session;
  },
  async getSession(token) {
    const state = getMockState();
    const tokenHash = hashValue(token);
    return state.sessions.find((session) => session.tokenHash === tokenHash && session.expiresAt > new Date()) ?? null;
  },
  async deleteSession(token) {
    const state = getMockState();
    const tokenHash = hashValue(token);
    state.sessions = state.sessions.filter((session) => session.tokenHash !== tokenHash);
  },
  async upsertSubscription(input) {
    const state = getMockState();
    const existingUser = state.users.find((user) => user.email.toLowerCase() === input.email.toLowerCase());
    if (existingUser) {
      existingUser.isActive = input.status === "active";
      existingUser.fullName = input.fullName ?? existingUser.fullName;
      const panel = state.panelByUserId[existingUser.id];
      if (panel) {
        panel.user = { name: input.fullName ?? panel.user.name, email: input.email };
        panel.account.status = mapSubscriptionStatus(input.status);
        panel.plan.status = mapSubscriptionStatus(input.status);
      }
      return;
    }

    const newUser: LoginUser = {
      id: `user_${Date.now()}`,
      email: input.email.toLowerCase(),
      fullName: input.fullName ?? null,
      isActive: input.status === "active"
    };

    state.users.push(newUser);
    state.subscriptions.push({
      id: `sub_${Date.now()}`,
      userId: newUser.id,
      email: newUser.email,
      status: input.status === "active" ? "active" : "pending"
    });
  },
  async getPanelData(userId) {
    const state = getMockState();
    return state.panelByUserId[userId];
  }
};

const dbRepository: Repository = {
  async findActiveUserByEmail(email) {
    const db = getDb();
    const [result] = await db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        status: subscriptions.status
      })
      .from(users)
      .innerJoin(subscriptions, eq(subscriptions.userId, users.id))
      .where(eq(users.email, email.toLowerCase()))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);

    if (!result || result.status !== "active") return null;
    return { id: result.id, email: result.email, fullName: result.fullName, isActive: true };
  },
  async saveLoginCode(input) {
    const db = getDb();
    await db.insert(emailLoginCodes).values(input);
  },
  async consumeLoginCode(email, codeHash, now) {
    const db = getDb();
    const [record] = await db
      .select({
        id: emailLoginCodes.id,
        userId: emailLoginCodes.userId,
        email: users.email,
        fullName: users.fullName
      })
      .from(emailLoginCodes)
      .innerJoin(users, eq(users.id, emailLoginCodes.userId))
      .where(
        and(
          eq(emailLoginCodes.email, email.toLowerCase()),
          eq(emailLoginCodes.codeHash, codeHash),
          isNull(emailLoginCodes.consumedAt),
          gt(emailLoginCodes.expiresAt, now)
        )
      )
      .orderBy(desc(emailLoginCodes.createdAt))
      .limit(1);

    if (!record) return null;

    await db.update(emailLoginCodes).set({ consumedAt: now }).where(eq(emailLoginCodes.id, record.id));
    return { id: record.userId, email: record.email, fullName: record.fullName, isActive: true };
  },
  async createSession(input) {
    const db = getDb();
    await db.insert(authSessions).values({
      userId: input.user.id,
      tokenHash: hashValue(input.token),
      expiresAt: input.expiresAt
    });
    return { token: input.token, user: input.user, expiresAt: input.expiresAt };
  },
  async getSession(token) {
    const db = getDb();
    const tokenHash = hashValue(token);
    const [result] = await db
      .select({
        userId: authSessions.userId,
        email: users.email,
        fullName: users.fullName,
        expiresAt: authSessions.expiresAt
      })
      .from(authSessions)
      .innerJoin(users, eq(users.id, authSessions.userId))
      .where(eq(authSessions.tokenHash, tokenHash))
      .orderBy(desc(authSessions.createdAt))
      .limit(1);

    if (!result || result.expiresAt <= new Date()) return null;

    return {
      token,
      expiresAt: result.expiresAt,
      user: { id: result.userId, email: result.email, fullName: result.fullName, isActive: true }
    };
  },
  async deleteSession(token) {
    const db = getDb();
    await db.delete(authSessions).where(eq(authSessions.tokenHash, hashValue(token)));
  },
  async upsertSubscription(input) {
    const db = getDb();
    const normalizedEmail = input.email.toLowerCase();
    const [existingUser] = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);

    const userId =
      existingUser?.id ??
      (
        await db
          .insert(users)
          .values({
            email: normalizedEmail,
            fullName: input.fullName ?? null,
            status: input.status === "active" ? "active" : "pending"
          })
          .returning({ id: users.id })
      )[0].id;

    if (existingUser) {
      await db
        .update(users)
        .set({
          fullName: input.fullName ?? existingUser.fullName,
          status: input.status === "active" ? "active" : "pending"
        })
        .where(eq(users.id, existingUser.id));
    }

    await db
      .insert(subscriptions)
      .values({
        userId,
        provider: "cakto",
        providerCustomerId: input.providerCustomerId ?? null,
        providerSubscriptionId: input.providerSubscriptionId ?? null,
        status: input.status,
        activatedAt: input.status === "active" ? new Date() : null,
        rawPayload: input.rawPayload ?? null
      })
      .onConflictDoUpdate({
        target: subscriptions.providerSubscriptionId,
        set: {
          status: input.status,
          rawPayload: input.rawPayload ?? null,
          updatedAt: new Date()
        }
      });
  },
  async getPanelData(userId) {
    const db = getDb();
    const [currentUser] = await db
      .select({
        fullName: users.fullName,
        email: users.email,
        createdAt: users.createdAt
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const [currentSubscription] = await db
      .select({
        status: subscriptions.status,
        planCode: subscriptions.planCode,
        priceCents: subscriptions.priceCents,
        currentPeriodEnd: subscriptions.currentPeriodEnd
      })
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);

    const routineRows = await db
      .select({
        id: routineBlocks.id,
        period: routineBlocks.period,
        title: routineBlocks.title,
        details: routineBlocks.details
      })
      .from(routineBlocks)
      .innerJoin(routines, eq(routines.id, routineBlocks.routineId))
      .where(eq(routines.userId, userId))
      .orderBy(routineBlocks.sortOrder);

    const reminderRows = await db
      .select({
        id: reminders.id,
        title: reminders.title,
        remindAt: reminders.remindAt,
        isUrgent: reminders.isUrgent,
        status: reminders.status
      })
      .from(reminders)
      .where(eq(reminders.userId, userId))
      .orderBy(reminders.remindAt);

    const agendaRows = await db
      .select({
        id: calendarEvents.id,
        title: calendarEvents.title,
        description: calendarEvents.description,
        startsAt: calendarEvents.startsAt
      })
      .from(calendarEvents)
      .where(eq(calendarEvents.userId, userId))
      .orderBy(calendarEvents.startsAt);

    const financeRows = await db
      .select({
        id: financeEntries.id,
        label: financeEntries.label,
        amount: financeEntries.amount,
        entryType: financeEntries.entryType,
        occurredAt: financeEntries.occurredAt
      })
      .from(financeEntries)
      .where(eq(financeEntries.userId, userId))
      .orderBy(desc(financeEntries.occurredAt))
      .limit(6);

    const noteRows = await db
      .select({
        id: notesTable.id,
        content: notesTable.content,
        pinned: notesTable.pinned
      })
      .from(notesTable)
      .where(eq(notesTable.userId, userId))
      .orderBy(desc(notesTable.updatedAt))
      .limit(6);

    const ideaRows = await db
      .select({
        id: ideasTable.id,
        title: ideasTable.title,
        cluster: ideasTable.cluster
      })
      .from(ideasTable)
      .where(eq(ideasTable.userId, userId))
      .orderBy(desc(ideasTable.updatedAt))
      .limit(12);

    const taskRows = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        details: tasks.details,
        priority: tasks.priority,
        status: tasks.status,
        dueAt: tasks.dueAt
      })
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.updatedAt))
      .limit(20);

    const listRows = await db
      .select({
        id: userLists.id,
        title: userLists.title,
        itemId: listItems.id,
        itemTitle: listItems.title,
        itemStatus: listItems.status
      })
      .from(userLists)
      .leftJoin(listItems, eq(listItems.listId, userLists.id))
      .where(eq(userLists.userId, userId))
      .orderBy(desc(userLists.updatedAt), listItems.sortOrder);

    const recentActionRows = await db
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

    const financeBalance = financeRows.reduce(
      (acc, item) => {
        const value = Number(item.amount);
        if (item.entryType === "income") acc.income += value;
        else acc.expense += value;
        return acc;
      },
      { income: 0, expense: 0 }
    );

    const groupedIdeas = ideaRows.reduce<Record<string, { id: string; title: string; notes: string[] }>>((acc, item) => {
      if (!acc[item.cluster]) {
        acc[item.cluster] = {
          id: item.cluster,
          title: item.cluster.charAt(0).toUpperCase() + item.cluster.slice(1),
          notes: []
        };
      }
      acc[item.cluster].notes.push(item.title);
      return acc;
    }, {});

    const groupedLists = listRows.reduce<Record<string, PanelData["lists"][number]>>((acc, row) => {
      if (!acc[row.id]) {
        acc[row.id] = {
          id: row.id,
          title: row.title,
          itemCount: 0,
          openCount: 0,
          items: []
        };
      }

      if (row.itemId) {
        const done = row.itemStatus === "done";
        acc[row.id].items.push({
          id: row.itemId,
          title: row.itemTitle ?? "",
          done
        });
        acc[row.id].itemCount += 1;
        if (!done) {
          acc[row.id].openCount += 1;
        }
      }

      return acc;
    }, {});

    const mappedTasks = taskRows.map((item) => ({
      id: item.id,
      title: item.title,
      details: item.details ?? undefined,
      priority: (item.priority as TaskItem["priority"]) ?? "normal",
      status: item.status,
      dueAt: item.dueAt ? item.dueAt.toLocaleString("pt-BR") : null
    }));

    const tasksOpen = sortTasks(mappedTasks.filter((item) => item.status === "open"));
    const tasksDone = mappedTasks.filter((item) => item.status === "done");
    const subscriptionStatus = mapSubscriptionStatus(currentSubscription?.status);

    const alerts: PanelData["alerts"] = recentActionRows.length
      ? recentActionRows.slice(0, 3).map((item, index) => ({
          title: index === 0 ? "Última ação executada" : "Mudança registrada",
          detail: item.summary,
          tone: index === 0 ? "blue" : "slate"
        }))
      : [
          {
            title: "Chat pronto para organizar",
            detail: "Use a conversa da Sara para criar tarefas, lembretes, listas e reorganizar o seu dia.",
            tone: "blue"
          }
        ];

    return {
      user: {
        name: currentUser?.fullName ?? "Usuário",
        email: currentUser?.email ?? "sem-email"
      },
      alerts,
      tasksOpen,
      tasksDone,
      routines: routineRows.map((item) => ({
        id: item.id,
        period: item.period as "manha" | "tarde" | "noite",
        title: item.title,
        details: item.details ?? ""
      })),
      remindersFuture: reminderRows
        .filter((item) => item.status === "active")
        .map((item) => ({
          id: item.id,
          title: item.title,
          when: item.remindAt.toLocaleString("pt-BR"),
          urgent: item.isUrgent
        })),
      remindersDone: reminderRows
        .filter((item) => item.status === "done")
        .map((item) => ({
          id: item.id,
          title: item.title,
          when: item.remindAt.toLocaleString("pt-BR"),
          urgent: item.isUrgent,
          completed: true
        })),
      agendaToday: agendaRows.slice(0, 3).map((item) => ({
        id: item.id,
        time: item.startsAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        title: item.title,
        detail: item.description ?? "",
        tone: "slate" as const
      })),
      agendaNext: agendaRows.slice(3, 6).map((item) => ({
        id: item.id,
        time: item.startsAt.toLocaleString("pt-BR"),
        title: item.title,
        detail: item.description ?? "",
        tone: "blue" as const
      })),
      finance: {
        income: `R$ ${financeBalance.income.toFixed(2).replace(".", ",")}`,
        expense: `R$ ${financeBalance.expense.toFixed(2).replace(".", ",")}`,
        recent: financeRows.map((item) => ({
          id: item.id,
          label: item.label,
          value: `${item.entryType === "income" ? "+" : "-"} R$ ${Number(item.amount).toFixed(2).replace(".", ",")}`,
          meta: item.occurredAt.toLocaleDateString("pt-BR")
        })),
        alerts: [
          {
            id: "finance-alert-1",
            title: "Leitura financeira simplificada",
            detail: "Custos recentes visíveis para evitar sustos.",
            urgent: false
          }
        ]
      },
      notes: noteRows,
      ideas: Object.values(groupedIdeas),
      lists: Object.values(groupedLists),
      recentActions: recentActionRows.map((item) => ({
        id: item.id,
        actionType: item.actionType as PanelData["recentActions"][number]["actionType"],
        entityType: item.entityType,
        summary: item.summary,
        createdAt: item.createdAt.toISOString()
      })),
      account: {
        status: subscriptionStatus,
        createdAt: currentUser?.createdAt ? currentUser.createdAt.toISOString().slice(0, 10) : "-"
      },
      plan: {
        name: currentSubscription?.planCode ?? "Plano Mensal Sara",
        price: `R$ ${((currentSubscription?.priceCents ?? 4990) / 100).toFixed(2).replace(".", ",")}`,
        status: subscriptionStatus,
        nextChargeDate: currentSubscription?.currentPeriodEnd
          ? currentSubscription.currentPeriodEnd.toISOString().slice(0, 10)
          : "-",
        renewal: subscriptionStatus === "active"
      },
      settings: {
        morningRoutineEnabled: routineRows.some((item) => item.period === "manha"),
        afternoonRoutineEnabled: routineRows.some((item) => item.period === "tarde"),
        nightRoutineEnabled: routineRows.some((item) => item.period === "noite"),
        quietHoursStart: "22:00",
        quietHoursEnd: "07:00"
      }
    };
  }
};

export function getRepository(): Repository {
  return isMockBackend ? mockRepository : dbRepository;
}
