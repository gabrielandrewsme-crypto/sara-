export type NoticeTone = "gold" | "blue" | "violet" | "slate" | "info";
export type MessageClassification = "task" | "reminder" | "agenda" | "finance" | "note" | "idea" | "unknown";
export type FinanceEntryType = "income" | "expense";

export type DashboardAlert = {
  title: string;
  detail: string;
  tone: NoticeTone;
};

export type RoutinePeriod = "manha" | "tarde" | "noite";

export type RoutineItem = {
  id: string;
  period: RoutinePeriod;
  title: string;
  details: string;
};

export type ReminderItem = {
  id: string;
  title: string;
  when: string;
  urgent: boolean;
  completed?: boolean;
};

export type AgendaItem = {
  id: string;
  time: string;
  title: string;
  detail: string;
  tone: NoticeTone;
};

export type FinanceSummary = {
  income?: string;
  expense?: string;
  recent: Array<{ id: string; label: string; value: string; meta: string }>;
  alerts: Array<{ id: string; title: string; detail: string; urgent: boolean }>;
};

export type NoteItem = {
  id: string;
  content: string;
  pinned?: boolean;
};

export type IdeaCluster = {
  id: string;
  title: string;
  notes: string[];
};

export type WhatsAppState = {
  phoneNumber: string;
  connected: boolean;
  connectUrl?: string | null;
};

export type AccountStatus = "active" | "past_due" | "canceled" | "blocked";

export type PanelData = {
  user: {
    name: string;
    email: string;
  };
  alerts: DashboardAlert[];
  routines: RoutineItem[];
  remindersFuture: ReminderItem[];
  remindersDone: ReminderItem[];
  agendaToday: AgendaItem[];
  agendaNext: AgendaItem[];
  finance: FinanceSummary;
  notes: NoteItem[];
  ideas: IdeaCluster[];
  whatsapp: WhatsAppState;
  account: {
    status: AccountStatus;
    createdAt: string;
  };
  plan: {
    name: string;
    price: string;
    status: AccountStatus;
    nextChargeDate: string;
    renewal: boolean;
  };
  settings: {
    morningRoutineEnabled: boolean;
    afternoonRoutineEnabled: boolean;
    nightRoutineEnabled: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;
  };
};

export type CurrentUserPanelPayload = {
  data: PanelData;
};

export type LoginUser = {
  id: string;
  email: string;
  fullName: string | null;
  isActive: boolean;
};

export type AuthSession = {
  token: string;
  user: LoginUser;
  expiresAt: Date;
};

export type LinkedSubscription = {
  email: string;
  status: "pending" | "active" | "past_due" | "canceled" | "expired";
};

export type InboundMessageInput = {
  userId: string;
  whatsappAccountId?: string | null;
  providerMessageId: string;
  messageType: "text" | "audio" | "image" | "document" | "system";
  body?: string | null;
  rawPayload?: unknown;
};

export type InterpretedMessage = {
  classification: MessageClassification;
  title: string;
  details?: string;
  remindAt?: Date;
  isUrgent?: boolean;
  startsAt?: Date;
  amount?: number;
  financeType?: FinanceEntryType;
  cluster?: string;
};
