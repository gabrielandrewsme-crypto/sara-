import "server-only";
import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { env, isMockBackend } from "@/lib/config/env";
import { getDb } from "@/lib/db/client";
import {
  audioFiles,
  authSessions,
  calendarEvents,
  emailLoginCodes,
  financeEntries,
  ideas as ideasTable,
  inboundMessages,
  notes as notesTable,
  reminders,
  routineBlocks,
  routines,
  subscriptions,
  tasks,
  transcriptions,
  users,
  whatsappAccounts
} from "@/lib/db/schema";
import { createPanelSeed, getMockState } from "./mock-store";
import type {
  AuthSession,
  InboundMessageInput,
  InterpretedMessage,
  LinkedSubscription,
  LoginUser,
  PanelData
} from "./types";
import { hashValue, normalizePhone } from "./utils";

type Repository = {
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
  linkWhatsApp(input: { userId: string; phoneNumber: string; providerAccountId?: string | null }): Promise<PanelData["whatsapp"]>;
  getPanelData(userId: string): Promise<PanelData>;
  findUserByWhatsAppPhone(phoneNumber: string): Promise<{ userId: string; whatsappAccountId: string | null } | null>;
  storeInboundMessage(input: InboundMessageInput): Promise<string>;
  storeAudioFile(input: {
    userId: string;
    inboundMessageId: string;
    objectKey: string;
    durationSeconds: number;
    mimeType?: string | null;
  }): Promise<string>;
  storeTranscription(input: { audioFileId: string; text: string; rawPayload?: unknown }): Promise<void>;
  applyMessageInterpretation(input: { userId: string; inboundMessageId: string; interpreted: InterpretedMessage }): Promise<void>;
};

function mapSubscriptionStatus(status?: string): "active" | "past_due" | "canceled" | "blocked" {
  if (status === "active" || status === "past_due" || status === "canceled") {
    return status;
  }
  return "blocked";
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

    const panel = createPanelSeed();
    panel.user = { name: input.fullName ?? "Usuario Sara", email: newUser.email };
    panel.account.status = mapSubscriptionStatus(input.status);
    panel.plan.status = mapSubscriptionStatus(input.status);
    state.panelByUserId[newUser.id] = panel;
  },
  async linkWhatsApp(input) {
    const state = getMockState();
    const panel = state.panelByUserId[input.userId];
    if (!panel) throw new Error("Panel data not found");
    panel.whatsapp = {
      phoneNumber: input.phoneNumber,
      connected: true,
      connectUrl: env.SARA_WHATSAPP_URL
    };
    return panel.whatsapp;
  },
  async getPanelData(userId) {
    const state = getMockState();
    if (!state.panelByUserId[userId]) {
      state.panelByUserId[userId] = createPanelSeed();
    }
    return state.panelByUserId[userId];
  },
  async findUserByWhatsAppPhone(phoneNumber) {
    const state = getMockState();
    const normalized = normalizePhone(phoneNumber);
    const entry = Object.entries(state.panelByUserId).find(([, panel]) => normalizePhone(panel.whatsapp.phoneNumber) === normalized);
    return entry ? { userId: entry[0], whatsappAccountId: null } : null;
  },
  async storeInboundMessage(input) {
    return input.providerMessageId;
  },
  async storeAudioFile(input) {
    return `audio_${input.inboundMessageId}`;
  },
  async storeTranscription() {},
  async applyMessageInterpretation(input) {
    const state = getMockState();
    const panel = state.panelByUserId[input.userId];
    if (!panel) return;

    switch (input.interpreted.classification) {
      case "reminder":
        panel.remindersFuture.unshift({
          id: input.inboundMessageId,
          title: input.interpreted.title,
          when: input.interpreted.remindAt?.toLocaleString("pt-BR") ?? "em breve",
          urgent: Boolean(input.interpreted.isUrgent)
        });
        break;
      case "agenda":
        panel.agendaToday.unshift({
          id: input.inboundMessageId,
          time: input.interpreted.startsAt?.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) ?? "00:00",
          title: input.interpreted.title,
          detail: input.interpreted.details ?? "novo compromisso",
          tone: "slate"
        });
        break;
      case "finance":
        panel.finance.recent.unshift({
          id: input.inboundMessageId,
          label: input.interpreted.title,
          value: `${input.interpreted.financeType === "income" ? "+" : "-"} R$ ${(input.interpreted.amount ?? 0).toFixed(2).replace(".", ",")}`,
          meta: "agora"
        });
        break;
      case "note":
      case "task":
        panel.notes.unshift({
          id: input.inboundMessageId,
          content: input.interpreted.details ?? input.interpreted.title
        });
        break;
      case "idea":
        panel.ideas[0]?.notes.unshift(input.interpreted.title);
        break;
      default:
        break;
    }

    panel.alerts.unshift({
      title: "Mensagem processada",
      detail: input.interpreted.title,
      tone: "blue"
    });
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
      .where(and(eq(users.email, email.toLowerCase()), eq(subscriptions.status, "active")))
      .limit(1);

    if (!result) return null;
    return { id: result.id, email: result.email, fullName: result.fullName, isActive: result.status === "active" };
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
      .where(and(eq(emailLoginCodes.email, email.toLowerCase()), eq(emailLoginCodes.codeHash, codeHash), isNull(emailLoginCodes.consumedAt), gt(emailLoginCodes.expiresAt, now)))
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
      .where(and(eq(authSessions.tokenHash, tokenHash), gt(authSessions.expiresAt, new Date())))
      .limit(1);

    if (!result) return null;
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
    const [existingUser] = await db.select().from(users).where(eq(users.email, input.email.toLowerCase())).limit(1);
    const userId =
      existingUser?.id ??
      (
        await db
          .insert(users)
          .values({
            email: input.email.toLowerCase(),
            fullName: input.fullName ?? null,
            status: input.status === "active" ? "active" : "pending"
          })
          .returning({ id: users.id })
      )[0].id;

    if (existingUser) {
      await db.update(users).set({
        fullName: input.fullName ?? existingUser.fullName,
        status: input.status === "active" ? "active" : "pending"
      }).where(eq(users.id, existingUser.id));
    }

    await db.insert(subscriptions).values({
      userId,
      provider: "cakto",
      providerCustomerId: input.providerCustomerId ?? null,
      providerSubscriptionId: input.providerSubscriptionId ?? null,
      status: input.status,
      activatedAt: input.status === "active" ? new Date() : null,
      rawPayload: input.rawPayload ?? null
    }).onConflictDoUpdate({
      target: subscriptions.providerSubscriptionId,
      set: { status: input.status, rawPayload: input.rawPayload ?? null }
    });
  },
  async linkWhatsApp(input) {
    const db = getDb();
    const normalizedPhone = normalizePhone(input.phoneNumber);
    await db.insert(whatsappAccounts).values({
      userId: input.userId,
      phoneNumber: input.phoneNumber,
      normalizedPhone,
      provider: "evolution",
      providerAccountId: input.providerAccountId ?? null,
      status: "linked",
      linkedAt: new Date()
    }).onConflictDoUpdate({
      target: whatsappAccounts.normalizedPhone,
      set: { userId: input.userId, phoneNumber: input.phoneNumber, status: "linked", linkedAt: new Date() }
    });

    return { phoneNumber: input.phoneNumber, connected: true, connectUrl: env.SARA_WHATSAPP_URL };
  },
  async getPanelData(userId) {
    const db = getDb();
    const [currentUser] = await db.select({
      fullName: users.fullName,
      email: users.email,
      createdAt: users.createdAt
    }).from(users).where(eq(users.id, userId)).limit(1);

    const [currentSubscription] = await db.select({
      status: subscriptions.status,
      planCode: subscriptions.planCode,
      priceCents: subscriptions.priceCents,
      currentPeriodEnd: subscriptions.currentPeriodEnd
    }).from(subscriptions).where(eq(subscriptions.userId, userId)).orderBy(desc(subscriptions.createdAt)).limit(1);

    const [linkedWhatsApp] = await db.select({
      phoneNumber: whatsappAccounts.phoneNumber,
      status: whatsappAccounts.status
    }).from(whatsappAccounts).where(eq(whatsappAccounts.userId, userId)).orderBy(desc(whatsappAccounts.createdAt)).limit(1);

    const routineRows = await db.select({
      id: routineBlocks.id,
      period: routineBlocks.period,
      title: routineBlocks.title,
      details: routineBlocks.details
    }).from(routineBlocks).innerJoin(routines, eq(routines.id, routineBlocks.routineId)).where(eq(routines.userId, userId)).orderBy(routineBlocks.sortOrder);

    const reminderRows = await db.select({
      id: reminders.id,
      title: reminders.title,
      remindAt: reminders.remindAt,
      isUrgent: reminders.isUrgent,
      status: reminders.status
    }).from(reminders).where(eq(reminders.userId, userId)).orderBy(reminders.remindAt);

    const agendaRows = await db.select({
      id: calendarEvents.id,
      title: calendarEvents.title,
      description: calendarEvents.description,
      startsAt: calendarEvents.startsAt
    }).from(calendarEvents).where(eq(calendarEvents.userId, userId)).orderBy(calendarEvents.startsAt);

    const financeRows = await db.select({
      id: financeEntries.id,
      label: financeEntries.label,
      amount: financeEntries.amount,
      entryType: financeEntries.entryType,
      occurredAt: financeEntries.occurredAt
    }).from(financeEntries).where(eq(financeEntries.userId, userId)).orderBy(desc(financeEntries.occurredAt)).limit(6);

    const noteRows = await db.select({
      id: notesTable.id,
      content: notesTable.content,
      pinned: notesTable.pinned
    }).from(notesTable).where(eq(notesTable.userId, userId)).orderBy(desc(notesTable.updatedAt)).limit(6);

    const ideaRows = await db.select({
      id: ideasTable.id,
      title: ideasTable.title,
      cluster: ideasTable.cluster
    }).from(ideasTable).where(eq(ideasTable.userId, userId)).orderBy(desc(ideasTable.updatedAt)).limit(12);

    const financeBalance = financeRows.reduce((acc, item) => {
      const value = Number(item.amount);
      if (item.entryType === "income") acc.income += value;
      else acc.expense += value;
      return acc;
    }, { income: 0, expense: 0 });

    const groupedIdeas = ideaRows.reduce<Record<string, { id: string; title: string; notes: string[] }>>((acc, item) => {
      if (!acc[item.cluster]) {
        acc[item.cluster] = { id: item.cluster, title: item.cluster.charAt(0).toUpperCase() + item.cluster.slice(1), notes: [] };
      }
      acc[item.cluster].notes.push(item.title);
      return acc;
    }, {});

    const subscriptionStatus = mapSubscriptionStatus(currentSubscription?.status);

    return {
      user: {
        name: currentUser?.fullName ?? "Usuario",
        email: currentUser?.email ?? "sem-email"
      },
      alerts: [
        {
          title: "WhatsApp e o centro de uso",
          detail: linkedWhatsApp ? "Sua conta esta vinculada e pronta para entrada de dados." : "Vincule seu numero para iniciar a captura principal.",
          tone: linkedWhatsApp ? "blue" : "gold"
        }
      ],
      routines: routineRows.map((item) => ({ id: item.id, period: item.period as "manha" | "tarde" | "noite", title: item.title, details: item.details ?? "" })),
      remindersFuture: reminderRows.filter((item) => item.status === "active").map((item) => ({ id: item.id, title: item.title, when: item.remindAt.toLocaleString("pt-BR"), urgent: item.isUrgent })),
      remindersDone: reminderRows.filter((item) => item.status === "done").map((item) => ({ id: item.id, title: item.title, when: item.remindAt.toLocaleString("pt-BR"), urgent: item.isUrgent, completed: true })),
      agendaToday: agendaRows.slice(0, 3).map((item) => ({ id: item.id, time: item.startsAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }), title: item.title, detail: item.description ?? "", tone: "slate" as const })),
      agendaNext: agendaRows.slice(3, 6).map((item) => ({ id: item.id, time: item.startsAt.toLocaleString("pt-BR"), title: item.title, detail: item.description ?? "", tone: "blue" as const })),
      finance: {
        income: `R$ ${financeBalance.income.toFixed(2).replace(".", ",")}`,
        expense: `R$ ${financeBalance.expense.toFixed(2).replace(".", ",")}`,
        recent: financeRows.map((item) => ({ id: item.id, label: item.label, value: `${item.entryType === "income" ? "+" : "-"} R$ ${Number(item.amount).toFixed(2).replace(".", ",")}`, meta: item.occurredAt.toLocaleDateString("pt-BR") })),
        alerts: [{ id: "finance-alert-1", title: "Leitura financeira simplificada", detail: "Custos recentes visiveis para evitar sustos.", urgent: false }]
      },
      notes: noteRows,
      ideas: Object.values(groupedIdeas),
      whatsapp: {
        phoneNumber: linkedWhatsApp?.phoneNumber ?? "",
        connected: linkedWhatsApp?.status === "linked",
        connectUrl: env.SARA_WHATSAPP_URL
      },
      account: {
        status: subscriptionStatus,
        createdAt: currentUser?.createdAt ? currentUser.createdAt.toISOString().slice(0, 10) : "-"
      },
      plan: {
        name: currentSubscription?.planCode ?? "Plano Mensal Sara",
        price: `R$ ${((currentSubscription?.priceCents ?? 4990) / 100).toFixed(2).replace(".", ",")}`,
        status: subscriptionStatus,
        nextChargeDate: currentSubscription?.currentPeriodEnd ? currentSubscription.currentPeriodEnd.toISOString().slice(0, 10) : "-",
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
  },
  async findUserByWhatsAppPhone(phoneNumber) {
    const db = getDb();
    const [result] = await db.select({
      userId: whatsappAccounts.userId,
      whatsappAccountId: whatsappAccounts.id
    }).from(whatsappAccounts).where(eq(whatsappAccounts.normalizedPhone, normalizePhone(phoneNumber))).limit(1);
    return result ?? null;
  },
  async storeInboundMessage(input) {
    const db = getDb();
    const [result] = await db.insert(inboundMessages).values({
      userId: input.userId,
      whatsappAccountId: input.whatsappAccountId ?? null,
      provider: "evolution",
      providerMessageId: input.providerMessageId,
      messageType: input.messageType,
      body: input.body,
      rawPayload: input.rawPayload,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }).returning({ id: inboundMessages.id });
    return result.id;
  },
  async storeAudioFile(input) {
    const db = getDb();
    const [result] = await db.insert(audioFiles).values({
      userId: input.userId,
      inboundMessageId: input.inboundMessageId,
      objectKey: input.objectKey,
      durationSeconds: input.durationSeconds,
      mimeType: input.mimeType ?? null,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }).returning({ id: audioFiles.id });
    return result.id;
  },
  async storeTranscription(input) {
    const db = getDb();
    await db.insert(transcriptions).values({
      audioFileId: input.audioFileId,
      status: "completed",
      text: input.text,
      rawPayload: input.rawPayload ?? null
    });
  },
  async applyMessageInterpretation(input) {
    const db = getDb();
    await db.update(inboundMessages).set({
      classification: input.interpreted.classification,
      processedAt: new Date()
    }).where(eq(inboundMessages.id, input.inboundMessageId));

    switch (input.interpreted.classification) {
      case "task":
        await db.insert(tasks).values({ userId: input.userId, inboundMessageId: input.inboundMessageId, title: input.interpreted.title, details: input.interpreted.details ?? null });
        break;
      case "reminder":
        await db.insert(reminders).values({ userId: input.userId, inboundMessageId: input.inboundMessageId, title: input.interpreted.title, remindAt: input.interpreted.remindAt ?? new Date(), isUrgent: Boolean(input.interpreted.isUrgent) });
        break;
      case "agenda":
        await db.insert(calendarEvents).values({ userId: input.userId, inboundMessageId: input.inboundMessageId, title: input.interpreted.title, description: input.interpreted.details ?? null, startsAt: input.interpreted.startsAt ?? new Date() });
        break;
      case "finance":
        await db.insert(financeEntries).values({ userId: input.userId, inboundMessageId: input.inboundMessageId, label: input.interpreted.title, amount: String(input.interpreted.amount ?? 0), entryType: input.interpreted.financeType ?? "expense" });
        break;
      case "note":
        await db.insert(notesTable).values({ userId: input.userId, inboundMessageId: input.inboundMessageId, title: input.interpreted.title, content: input.interpreted.details ?? input.interpreted.title });
        break;
      case "idea":
        await db.insert(ideasTable).values({ userId: input.userId, inboundMessageId: input.inboundMessageId, title: input.interpreted.title, content: input.interpreted.details ?? null, cluster: input.interpreted.cluster ?? "geral" });
        break;
      default:
        break;
    }
  }
};

export function getRepository(): Repository {
  return isMockBackend ? mockRepository : dbRepository;
}
