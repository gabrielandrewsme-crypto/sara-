import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
};

export const userStatusEnum = pgEnum("user_status", ["pending", "active", "suspended"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "pending",
  "active",
  "past_due",
  "canceled",
  "expired"
]);
export const providerEnum = pgEnum("provider_name", ["cakto", "evolution", "meta", "manual"]);
export const conversationStatusEnum = pgEnum("conversation_status", ["active", "archived"]);
export const conversationRoleEnum = pgEnum("conversation_role", ["user", "assistant", "system"]);
export const listItemStatusEnum = pgEnum("list_item_status", ["open", "done"]);
export const whatsappStatusEnum = pgEnum("whatsapp_status", ["pending", "linked", "error", "disconnected"]);
export const inboundMessageTypeEnum = pgEnum("inbound_message_type", [
  "text",
  "audio",
  "image",
  "document",
  "system"
]);
export const classificationEnum = pgEnum("message_classification", [
  "task",
  "reminder",
  "agenda",
  "finance",
  "note",
  "idea",
  "unknown"
]);
export const taskStatusEnum = pgEnum("task_status", ["open", "done", "archived"]);
export const reminderStatusEnum = pgEnum("reminder_status", ["active", "done", "archived"]);
export const calendarStatusEnum = pgEnum("calendar_status", ["scheduled", "done", "archived"]);
export const financeTypeEnum = pgEnum("finance_type", ["income", "expense"]);
export const audioStatusEnum = pgEnum("audio_status", ["stored", "expired", "rejected"]);
export const transcriptionStatusEnum = pgEnum("transcription_status", [
  "pending",
  "completed",
  "failed"
]);
export const scheduleStatusEnum = pgEnum("schedule_status", ["queued", "sent", "failed", "canceled"]);
export const deliveryDirectionEnum = pgEnum("delivery_direction", ["inbound", "outbound", "internal"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    fullName: varchar("full_name", { length: 160 }),
    status: userStatusEnum("status").default("pending").notNull(),
    timezone: varchar("timezone", { length: 80 }).default("America/Sao_Paulo").notNull(),
    lastDashboardSyncAt: timestamp("last_dashboard_sync_at", { withTimezone: true }),
    ...timestamps
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)]
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: providerEnum("provider").default("cakto").notNull(),
    providerCustomerId: varchar("provider_customer_id", { length: 160 }),
    providerSubscriptionId: varchar("provider_subscription_id", { length: 160 }),
    planCode: varchar("plan_code", { length: 80 }).default("sara-monthly").notNull(),
    status: subscriptionStatusEnum("status").default("pending").notNull(),
    priceCents: integer("price_cents").default(4990).notNull(),
    currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    activatedAt: timestamp("activated_at", { withTimezone: true }),
    canceledAt: timestamp("canceled_at", { withTimezone: true }),
    rawPayload: jsonb("raw_payload"),
    ...timestamps
  },
  (table) => [
    uniqueIndex("subscriptions_provider_subscription_unique").on(table.providerSubscriptionId),
    index("subscriptions_user_idx").on(table.userId)
  ]
);

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 160 }).default("Conversa principal").notNull(),
    status: conversationStatusEnum("status").default("active").notNull(),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }).defaultNow().notNull(),
    ...timestamps
  },
  (table) => [index("conversations_user_idx").on(table.userId)]
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: conversationRoleEnum("role").notNull(),
    content: text("content").notNull(),
    metadata: jsonb("metadata"),
    ...timestamps
  },
  (table) => [index("messages_conversation_idx").on(table.conversationId)]
);

export const userLists = pgTable(
  "lists",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 220 }).notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    ...timestamps
  },
  (table) => [index("lists_user_idx").on(table.userId)]
);

export const listItems = pgTable(
  "list_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    listId: uuid("list_id")
      .notNull()
      .references(() => userLists.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 220 }).notNull(),
    status: listItemStatusEnum("status").default("open").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    ...timestamps
  },
  (table) => [index("list_items_list_idx").on(table.listId)]
);

export const actionLogs = pgTable(
  "action_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    conversationId: uuid("conversation_id").references(() => conversations.id, {
      onDelete: "set null"
    }),
    messageId: uuid("message_id").references(() => messages.id, {
      onDelete: "set null"
    }),
    actionType: varchar("action_type", { length: 40 }).notNull(),
    entityType: varchar("entity_type", { length: 80 }).notNull(),
    entityId: varchar("entity_id", { length: 80 }),
    summary: text("summary").notNull(),
    payload: jsonb("payload"),
    ...timestamps
  },
  (table) => [index("action_logs_user_idx").on(table.userId)]
);

export const whatsappAccounts = pgTable(
  "whatsapp_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: providerEnum("provider").default("evolution").notNull(),
    phoneNumber: varchar("phone_number", { length: 30 }).notNull(),
    normalizedPhone: varchar("normalized_phone", { length: 30 }).notNull(),
    providerAccountId: varchar("provider_account_id", { length: 160 }),
    status: whatsappStatusEnum("status").default("pending").notNull(),
    linkedAt: timestamp("linked_at", { withTimezone: true }),
    lastInboundAt: timestamp("last_inbound_at", { withTimezone: true }),
    metadata: jsonb("metadata"),
    ...timestamps
  },
  (table) => [
    uniqueIndex("whatsapp_accounts_normalized_phone_unique").on(table.normalizedPhone),
    index("whatsapp_accounts_user_idx").on(table.userId)
  ]
);

export const inboundMessages = pgTable(
  "inbound_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    whatsappAccountId: uuid("whatsapp_account_id").references(() => whatsappAccounts.id, {
      onDelete: "set null"
    }),
    provider: providerEnum("provider").default("evolution").notNull(),
    providerMessageId: varchar("provider_message_id", { length: 160 }),
    messageType: inboundMessageTypeEnum("message_type").default("text").notNull(),
    classification: classificationEnum("classification").default("unknown").notNull(),
    body: text("body"),
    rawPayload: jsonb("raw_payload"),
    receivedAt: timestamp("received_at", { withTimezone: true }).defaultNow().notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true })
  },
  (table) => [
    uniqueIndex("inbound_messages_provider_unique").on(table.providerMessageId),
    index("inbound_messages_user_idx").on(table.userId)
  ]
);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    inboundMessageId: uuid("inbound_message_id").references(() => inboundMessages.id, {
      onDelete: "set null"
    }),
    title: varchar("title", { length: 220 }).notNull(),
    details: text("details"),
    priority: varchar("priority", { length: 20 }).default("normal").notNull(),
    dueAt: timestamp("due_at", { withTimezone: true }),
    status: taskStatusEnum("status").default("open").notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    ...timestamps
  },
  (table) => [index("tasks_user_idx").on(table.userId)]
);

export const reminders = pgTable(
  "reminders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    inboundMessageId: uuid("inbound_message_id").references(() => inboundMessages.id, {
      onDelete: "set null"
    }),
    title: varchar("title", { length: 220 }).notNull(),
    remindAt: timestamp("remind_at", { withTimezone: true }).notNull(),
    isUrgent: boolean("is_urgent").default(false).notNull(),
    status: reminderStatusEnum("status").default("active").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    ...timestamps
  },
  (table) => [index("reminders_user_idx").on(table.userId)]
);

export const calendarEvents = pgTable(
  "calendar_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    inboundMessageId: uuid("inbound_message_id").references(() => inboundMessages.id, {
      onDelete: "set null"
    }),
    title: varchar("title", { length: 220 }).notNull(),
    description: text("description"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    location: varchar("location", { length: 180 }),
    status: calendarStatusEnum("status").default("scheduled").notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    ...timestamps
  },
  (table) => [index("calendar_events_user_idx").on(table.userId)]
);

export const routines = pgTable(
  "routines",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).default("Minha rotina").notNull(),
    isDefault: boolean("is_default").default(true).notNull(),
    ...timestamps
  },
  (table) => [index("routines_user_idx").on(table.userId)]
);

export const routineBlocks = pgTable(
  "routine_blocks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    routineId: uuid("routine_id")
      .notNull()
      .references(() => routines.id, { onDelete: "cascade" }),
    period: varchar("period", { length: 20 }).notNull(),
    title: varchar("title", { length: 160 }).notNull(),
    details: text("details"),
    sortOrder: integer("sort_order").default(0).notNull(),
    ...timestamps
  },
  (table) => [index("routine_blocks_routine_idx").on(table.routineId)]
);

export const financeEntries = pgTable(
  "finance_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    inboundMessageId: uuid("inbound_message_id").references(() => inboundMessages.id, {
      onDelete: "set null"
    }),
    entryType: financeTypeEnum("entry_type").notNull(),
    label: varchar("label", { length: 220 }).notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
    category: varchar("category", { length: 80 }),
    notes: text("notes"),
    ...timestamps
  },
  (table) => [index("finance_entries_user_idx").on(table.userId)]
);

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    inboundMessageId: uuid("inbound_message_id").references(() => inboundMessages.id, {
      onDelete: "set null"
    }),
    title: varchar("title", { length: 180 }),
    content: text("content").notNull(),
    pinned: boolean("pinned").default(false).notNull(),
    ...timestamps
  },
  (table) => [index("notes_user_idx").on(table.userId)]
);

export const ideas = pgTable(
  "ideas",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    inboundMessageId: uuid("inbound_message_id").references(() => inboundMessages.id, {
      onDelete: "set null"
    }),
    title: varchar("title", { length: 180 }).notNull(),
    content: text("content"),
    cluster: varchar("cluster", { length: 60 }).default("geral").notNull(),
    ...timestamps
  },
  (table) => [index("ideas_user_idx").on(table.userId)]
);

export const audioFiles = pgTable(
  "audio_files",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    inboundMessageId: uuid("inbound_message_id").references(() => inboundMessages.id, {
      onDelete: "cascade"
    }),
    objectKey: varchar("object_key", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 120 }),
    durationSeconds: integer("duration_seconds").notNull(),
    sizeBytes: integer("size_bytes"),
    status: audioStatusEnum("status").default("stored").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    ...timestamps
  },
  (table) => [index("audio_files_user_idx").on(table.userId)]
);

export const transcriptions = pgTable(
  "transcriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    audioFileId: uuid("audio_file_id")
      .notNull()
      .references(() => audioFiles.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 80 }).default("external-api").notNull(),
    status: transcriptionStatusEnum("status").default("pending").notNull(),
    text: text("text"),
    confidence: numeric("confidence", { precision: 5, scale: 2 }),
    rawPayload: jsonb("raw_payload"),
    ...timestamps
  },
  (table) => [index("transcriptions_audio_idx").on(table.audioFileId)]
);

export const scheduledMessages = pgTable(
  "scheduled_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    channel: providerEnum("channel").default("evolution").notNull(),
    kind: varchar("kind", { length: 60 }).notNull(),
    payload: jsonb("payload").notNull(),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    status: scheduleStatusEnum("status").default("queued").notNull(),
    ...timestamps
  },
  (table) => [index("scheduled_messages_user_idx").on(table.userId)]
);

export const deliveryLogs = pgTable(
  "delivery_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    scheduledMessageId: uuid("scheduled_message_id").references(() => scheduledMessages.id, {
      onDelete: "set null"
    }),
    direction: deliveryDirectionEnum("direction").default("internal").notNull(),
    provider: providerEnum("provider").default("manual").notNull(),
    status: varchar("status", { length: 40 }).notNull(),
    payload: jsonb("payload"),
    ...timestamps
  },
  (table) => [index("delivery_logs_user_idx").on(table.userId)]
);

export const emailLoginCodes = pgTable(
  "email_login_codes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 255 }).notNull(),
    codeHash: varchar("code_hash", { length: 128 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    ...timestamps
  },
  (table) => [index("email_login_codes_email_idx").on(table.email)]
);

export const authSessions = pgTable(
  "auth_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 128 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).defaultNow().notNull(),
    ...timestamps
  },
  (table) => [uniqueIndex("auth_sessions_token_hash_unique").on(table.tokenHash)]
);
