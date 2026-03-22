import type {
  ActionLogItem,
  AgendaItem,
  AuthSession,
  ChatMessage,
  ChatState,
  DashboardAlert,
  IdeaCluster,
  ListSummary,
  LoginUser,
  NoteItem,
  PanelData,
  ReminderItem,
  RoutineItem,
  TaskItem
} from "./types";

type LoginCodeRecord = {
  email: string;
  userId: string;
  codeHash: string;
  expiresAt: Date;
};

type SessionRecord = AuthSession & {
  tokenHash: string;
};

type MockConversationState = {
  conversationId: string;
  messages: ChatMessage[];
  actions: ActionLogItem[];
};

type MockState = {
  users: LoginUser[];
  subscriptions: Array<{ id: string; userId: string; email: string; status: "active" | "pending" | "canceled" }>;
  loginCodes: LoginCodeRecord[];
  sessions: SessionRecord[];
  panelByUserId: Record<string, PanelData>;
  conversationsByUserId: Record<string, MockConversationState>;
};

const demoUserId = "user_demo_01";

function createActionLog(id: string, actionType: ActionLogItem["actionType"], summary: string): ActionLogItem {
  return {
    id,
    actionType,
    entityType: "system",
    summary,
    createdAt: new Date().toISOString()
  };
}

export function createPanelSeed(): PanelData {
  const recentActions: ActionLogItem[] = [
    createActionLog("al1", "create", "A Sara estruturou um lembrete para o aluguel de amanhã."),
    createActionLog("al2", "reorganize", "As tarefas abertas foram separadas por prioridade."),
    createActionLog("al3", "query", "O resumo de hoje foi revisado no chat.")
  ];

  const alerts: DashboardAlert[] = [
    { title: "Dia enxuto e acionável", detail: "As prioridades da manhã já estão ordenadas no painel.", tone: "gold" },
    { title: "Rotina ajustada", detail: "Cafe, remédio e revisão do dia seguem ativos para 07:15.", tone: "blue" },
    { title: "Nova ideia salva", detail: "A ideia sobre conteúdo de TDAH entrou na categoria trabalho.", tone: "violet" }
  ];

  const tasksOpen: TaskItem[] = [
    { id: "tk1", title: "Separar boletos do mês", details: "Reservar 20 minutos depois do almoço.", priority: "high", status: "open", dueAt: "Hoje, 14:00" },
    { id: "tk2", title: "Finalizar pauta da terapeuta", details: "Levar pontos de ansiedade da semana.", priority: "normal", status: "open", dueAt: "Hoje, 18:00" },
    { id: "tk3", title: "Revisar compras da semana", details: "Checar itens da despensa.", priority: "low", status: "open", dueAt: "Amanhã, 10:00" }
  ];

  const tasksDone: TaskItem[] = [
    { id: "tkd1", title: "Enviar documentos", priority: "normal", status: "done", dueAt: "Hoje, 08:10" }
  ];

  const routines: RoutineItem[] = [
    { id: "rt1", period: "manha", title: "Tomar água", details: "logo ao acordar" },
    { id: "rt2", period: "manha", title: "Remédio", details: "após café leve" },
    { id: "rt3", period: "manha", title: "Revisar agenda", details: "olhar compromissos e lembretes" },
    { id: "rt4", period: "tarde", title: "Bloco de foco", details: "50 minutos sem interrupção" },
    { id: "rt5", period: "tarde", title: "Checar mensagens", details: "só após o bloco principal" },
    { id: "rt6", period: "noite", title: "Registrar gastos", details: "do que saiu hoje" },
    { id: "rt7", period: "noite", title: "Descarregar ideias", details: "antes de dormir" }
  ];

  const remindersFuture: ReminderItem[] = [
    { id: "re1", title: "Levar exame impresso", when: "Hoje, 08:20", urgent: true },
    { id: "re2", title: "Beber água e fazer pausa", when: "Hoje, 15:00", urgent: false },
    { id: "re3", title: "Separar documentos do aluguel", when: "Amanhã, 10:00", urgent: false }
  ];

  const remindersDone: ReminderItem[] = [
    { id: "rd1", title: "Tomar remédio da manhã", when: "Hoje, 07:20", urgent: false, completed: true },
    { id: "rd2", title: "Pagar internet", when: "Hoje, 07:50", urgent: false, completed: true }
  ];

  const agendaToday: AgendaItem[] = [
    { id: "ag1", time: "09:00", title: "Terapia", detail: "Consulta online", tone: "gold" },
    { id: "ag2", time: "13:30", title: "Reunião com cliente", detail: "Projeto Sara", tone: "slate" },
    { id: "ag3", time: "18:00", title: "Pilates", detail: "Studio central", tone: "blue" }
  ];

  const agendaNext: AgendaItem[] = [
    { id: "agn1", time: "Sábado 10:00", title: "Almoço com a família", detail: "Casa da mãe", tone: "gold" },
    { id: "agn2", time: "Segunda 09:00", title: "Reunião de alinhamento", detail: "Videochamada", tone: "slate" },
    { id: "agn3", time: "Terça 14:00", title: "Consulta médica", detail: "Retorno", tone: "blue" }
  ];

  const notes: NoteItem[] = [
    { id: "n1", content: "Checklist da consulta salvo com perguntas importantes.", pinned: true },
    { id: "n2", content: "Nota sobre sinais de sobrecarga na última semana." },
    { id: "n3", content: "Lista curta do que precisa sair da cabeça hoje." },
    { id: "n4", content: "Resumo da rotina que funcionou melhor nas últimas manhãs." }
  ];

  const ideas: IdeaCluster[] = [
    { id: "i1", title: "Casa", notes: ["lista de compras", "rotina de limpeza leve", "contas do mês"] },
    { id: "i2", title: "Trabalho", notes: ["conteúdo sobre TDAH", "responder cliente", "próxima entrega"] },
    { id: "i3", title: "Pessoal", notes: ["ritual de noite", "perguntas para terapia", "fim de semana"] }
  ];

  const lists: ListSummary[] = [
    {
      id: "ls1",
      title: "Lista de compras",
      itemCount: 4,
      openCount: 2,
      items: [
        { id: "li1", title: "Aveia", done: false },
        { id: "li2", title: "Banana", done: false },
        { id: "li3", title: "Arroz", done: true }
      ]
    },
    {
      id: "ls2",
      title: "Bolsa da terapia",
      itemCount: 3,
      openCount: 1,
      items: [
        { id: "li4", title: "Convênio", done: true },
        { id: "li5", title: "Perguntas da semana", done: false }
      ]
    }
  ];

  return {
    user: {
      name: "Sara Demo",
      email: "demo@sara.app"
    },
    alerts,
    tasksOpen,
    tasksDone,
    routines,
    remindersFuture,
    remindersDone,
    agendaToday,
    agendaNext,
    finance: {
      income: "R$ 7.450,00",
      expense: "R$ 3.280,00",
      recent: [
        { id: "f1", label: "Farmácia", value: "- R$ 48,90", meta: "ontem" },
        { id: "f2", label: "Mercado", value: "- R$ 182,40", meta: "ontem" },
        { id: "f3", label: "Freelance recebido", value: "+ R$ 850,00", meta: "hoje" }
      ],
      alerts: [
        { id: "fa1", title: "Cartão fecha na próxima semana", detail: "vale revisar gastos variáveis", urgent: true },
        { id: "fa2", title: "Reserva do mês em 74%", detail: "progresso consistente", urgent: false }
      ]
    },
    notes,
    ideas,
    lists,
    recentActions,
    account: {
      status: "active",
      createdAt: "2025-01-01"
    },
    plan: {
      name: "Plano Mensal Sara",
      price: "R$ 49,90",
      status: "active",
      nextChargeDate: "2025-02-01",
      renewal: true
    },
    settings: {
      morningRoutineEnabled: true,
      afternoonRoutineEnabled: true,
      nightRoutineEnabled: true,
      quietHoursStart: "22:00",
      quietHoursEnd: "07:00"
    }
  };
}

function createChatSeed(): MockConversationState {
  return {
    conversationId: "conv_demo_01",
    messages: [
      {
        id: "msg1",
        role: "assistant",
        content: "Estou pronta. Me peça para criar tarefas, lembretes, listas, rotinas ou consultar seu dia.",
        createdAt: new Date().toISOString()
      }
    ],
    actions: [
      createActionLog("acl1", "suggest", "A Sara sugeriu os próximos passos para a manhã.")
    ]
  };
}

function createInitialState(): MockState {
  return {
    users: [{ id: demoUserId, email: "demo@sara.app", fullName: "Sara Demo", isActive: true }],
    subscriptions: [{ id: "sub_demo_01", userId: demoUserId, email: "demo@sara.app", status: "active" }],
    loginCodes: [],
    sessions: [],
    panelByUserId: {
      [demoUserId]: createPanelSeed()
    },
    conversationsByUserId: {
      [demoUserId]: createChatSeed()
    }
  };
}

declare global {
  var __saraMockState: MockState | undefined;
}

export function getMockState() {
  if (!global.__saraMockState) {
    global.__saraMockState = createInitialState();
  }

  return global.__saraMockState;
}

export function getMockChatState(userId: string): ChatState {
  const state = getMockState();
  if (!state.conversationsByUserId[userId]) {
    state.conversationsByUserId[userId] = createChatSeed();
  }

  const conversation = state.conversationsByUserId[userId];
  return {
    conversationId: conversation.conversationId,
    messages: conversation.messages,
    recentActions: conversation.actions,
    suggestedPrompts: [
      "Me lembra de pagar a conta amanhã às 9h",
      "Cria uma lista de compras",
      "O que eu tenho hoje?",
      "Prioriza minhas tarefas abertas"
    ]
  };
}
