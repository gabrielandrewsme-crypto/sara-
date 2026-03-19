import "server-only";
import { eq } from "drizzle-orm";
import { createPanelSeed } from "@/lib/sara/mock-store";
import { getDb } from "@/lib/db/client";
import {
  calendarEvents,
  financeEntries,
  ideas,
  notes,
  reminders,
  routineBlocks,
  routines,
  subscriptions,
  users
} from "@/lib/db/schema";

type BootstrapInput = {
  email: string;
  name?: string;
};

function parseAgendaTime(input: string) {
  const [hours, minutes] = input.split(":").map((value) => Number(value));
  const date = new Date();
  date.setHours(hours || 9, minutes || 0, 0, 0);
  return date;
}

function parseRelativeWhen(input: string) {
  const lower = input.toLowerCase();
  const timeMatch = lower.match(/(\d{1,2}):(\d{2})/);
  const date = new Date();

  if (lower.includes("amanha")) {
    date.setDate(date.getDate() + 1);
  }

  if (timeMatch) {
    date.setHours(Number(timeMatch[1]), Number(timeMatch[2]), 0, 0);
  }

  return date;
}

function parseCurrency(value: string) {
  return value
    .replace(/[^\d,.-]/g, "")
    .replace(/\s/g, "")
    .replace(".", "")
    .replace(",", ".");
}

export async function bootstrapLocalUser(input: BootstrapInput) {
  const db = getDb();
  const email = input.email.trim().toLowerCase();
  const name = input.name?.trim() || "Sara Demo";
  const seed = createPanelSeed();

  const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  const userId =
    existingUser?.id ??
    (
      await db
        .insert(users)
        .values({
          email,
          fullName: name,
          status: "active"
        })
        .returning({ id: users.id })
    )[0].id;

  if (existingUser) {
    await db
      .update(users)
      .set({
        fullName: name,
        status: "active"
      })
      .where(eq(users.id, userId));
  }

  await db
    .insert(subscriptions)
    .values({
      userId,
      provider: "manual",
      providerSubscriptionId: `manual:${email}`,
      planCode: "sara-monthly",
      status: "active",
      priceCents: 4990,
      activatedAt: new Date(),
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      rawPayload: { source: "bootstrap-local-user" }
    })
    .onConflictDoUpdate({
      target: subscriptions.providerSubscriptionId,
      set: {
        status: "active",
        priceCents: 4990,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

  const [existingRoutine] = await db.select({ id: routines.id }).from(routines).where(eq(routines.userId, userId)).limit(1);

  if (!existingRoutine) {
    const [routine] = await db
      .insert(routines)
      .values({
        userId,
        name: "Minha rotina",
        isDefault: true
      })
      .returning({ id: routines.id });

    await db.insert(routineBlocks).values(
      seed.routines.map((item, index) => ({
        routineId: routine.id,
        period: item.period,
        title: item.title,
        details: item.details,
        sortOrder: index
      }))
    );
  }

  const [existingReminder] = await db.select({ id: reminders.id }).from(reminders).where(eq(reminders.userId, userId)).limit(1);
  if (!existingReminder) {
    await db.insert(reminders).values([
      ...seed.remindersFuture.map((item) => ({
        userId,
        title: item.title,
        remindAt: parseRelativeWhen(item.when),
        isUrgent: item.urgent,
        status: "active" as const
      })),
      ...seed.remindersDone.map((item) => ({
        userId,
        title: item.title,
        remindAt: parseRelativeWhen(item.when),
        isUrgent: item.urgent,
        status: "done" as const,
        completedAt: new Date()
      }))
    ]);
  }

  const [existingEvent] = await db.select({ id: calendarEvents.id }).from(calendarEvents).where(eq(calendarEvents.userId, userId)).limit(1);
  if (!existingEvent) {
    await db.insert(calendarEvents).values(
      [...seed.agendaToday, ...seed.agendaNext].map((item) => ({
        userId,
        title: item.title,
        description: item.detail,
        startsAt: parseAgendaTime(item.time),
        status: "scheduled" as const
      }))
    );
  }

  const [existingFinance] = await db.select({ id: financeEntries.id }).from(financeEntries).where(eq(financeEntries.userId, userId)).limit(1);
  if (!existingFinance) {
    await db.insert(financeEntries).values(
      seed.finance.recent.map((item) => ({
        userId,
        label: item.label,
        amount: parseCurrency(item.value),
        entryType: item.value.trim().startsWith("+") ? "income" as const : "expense" as const,
        occurredAt: new Date(),
        notes: item.meta
      }))
    );
  }

  const [existingNote] = await db.select({ id: notes.id }).from(notes).where(eq(notes.userId, userId)).limit(1);
  if (!existingNote) {
    await db.insert(notes).values(
      seed.notes.map((item) => ({
        userId,
        content: item.content,
        pinned: Boolean(item.pinned)
      }))
    );
  }

  const [existingIdea] = await db.select({ id: ideas.id }).from(ideas).where(eq(ideas.userId, userId)).limit(1);
  if (!existingIdea) {
    await db.insert(ideas).values(
      seed.ideas.flatMap((cluster) =>
        cluster.notes.map((note) => ({
          userId,
          title: note,
          content: note,
          cluster: cluster.title.toLowerCase()
        }))
      )
    );
  }

  return {
    ok: true as const,
    email,
    name,
    userId
  };
}
