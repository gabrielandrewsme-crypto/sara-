import { env } from "@/lib/config/env";
import type {
  AgendaItem,
  AuthSession,
  DashboardAlert,
  IdeaCluster,
  LoginUser,
  NoteItem,
  PanelData,
  ReminderItem,
  RoutineItem,
  WhatsAppState
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

type MockState = {
  users: LoginUser[];
  subscriptions: Array<{ id: string; userId: string; email: string; status: "active" | "pending" | "canceled" }>;
  loginCodes: LoginCodeRecord[];
  sessions: SessionRecord[];
  panelByUserId: Record<string, PanelData>;
};

const demoUserId = "user_demo_01";

export function createPanelSeed(): PanelData {
  const alerts: DashboardAlert[] = [
    { title: "Sara lembrou do aluguel", detail: "Vence em 3 dias. O lembrete ja esta ativo para amanha as 09:00.", tone: "gold" },
    { title: "Rotina da manha ajustada", detail: "Cafe, remedio e revisao do dia foram mantidos para as 07:15.", tone: "blue" },
    { title: "Nova ideia capturada", detail: "A ideia sobre conteudo de TDAH foi salva pelo WhatsApp.", tone: "violet" }
  ];

  const routines: RoutineItem[] = [
    { id: "rt1", period: "manha", title: "Tomar agua", details: "logo ao acordar" },
    { id: "rt2", period: "manha", title: "Remedio", details: "apos cafe leve" },
    { id: "rt3", period: "manha", title: "Revisar agenda", details: "olhar compromissos e lembretes" },
    { id: "rt4", period: "tarde", title: "Bloco de foco", details: "50 minutos sem interrupcao" },
    { id: "rt5", period: "tarde", title: "Checar mensagens", details: "so apos o bloco principal" },
    { id: "rt6", period: "noite", title: "Registrar gastos", details: "do que saiu hoje" },
    { id: "rt7", period: "noite", title: "Descarregar ideias", details: "antes de dormir" }
  ];

  const remindersFuture: ReminderItem[] = [
    { id: "re1", title: "Levar exame impresso", when: "Hoje, 08:20", urgent: true },
    { id: "re2", title: "Beber agua e fazer pausa", when: "Hoje, 15:00", urgent: false },
    { id: "re3", title: "Separar documentos do aluguel", when: "Amanha, 10:00", urgent: false }
  ];

  const remindersDone: ReminderItem[] = [
    { id: "rd1", title: "Tomar remedio da manha", when: "Hoje, 07:20", urgent: false, completed: true },
    { id: "rd2", title: "Pagar internet", when: "Hoje, 07:50", urgent: false, completed: true }
  ];

  const agendaToday: AgendaItem[] = [
    { id: "ag1", time: "09:00", title: "Terapia", detail: "Consulta online", tone: "gold" },
    { id: "ag2", time: "13:30", title: "Reuniao com cliente", detail: "Projeto Sara", tone: "slate" },
    { id: "ag3", time: "18:00", title: "Pilates", detail: "Studio central", tone: "blue" }
  ];

  const agendaNext: AgendaItem[] = [
    { id: "agn1", time: "Sabado 10:00", title: "Almoco com a familia", detail: "Casa da mae", tone: "gold" },
    { id: "agn2", time: "Segunda 09:00", title: "Reuniao de alinhamento", detail: "Videochamada", tone: "slate" },
    { id: "agn3", time: "Terca 14:00", title: "Consulta medica", detail: "Retorno", tone: "blue" }
  ];

  const notes: NoteItem[] = [
    { id: "n1", content: "Checklist da consulta salvo com perguntas importantes.", pinned: true },
    { id: "n2", content: "Nota sobre sinais de sobrecarga na ultima semana." },
    { id: "n3", content: "Lista curta do que precisa sair da cabeca hoje." },
    { id: "n4", content: "Resumo da rotina que funcionou melhor nas ultimas manhas." }
  ];

  const ideas: IdeaCluster[] = [
    { id: "i1", title: "Casa", notes: ["lista de compras", "rotina de limpeza leve", "contas do mes"] },
    { id: "i2", title: "Trabalho", notes: ["conteudo sobre TDAH", "responder cliente", "proxima entrega"] },
    { id: "i3", title: "Pessoal", notes: ["ritual de noite", "perguntas para terapia", "fim de semana"] }
  ];

  const whatsapp: WhatsAppState = {
    phoneNumber: "",
    connected: false,
    connectUrl: env.SARA_WHATSAPP_URL
  };

  return {
    user: {
      name: "Sara Demo",
      email: "demo@sara.app"
    },
    alerts,
    routines,
    remindersFuture,
    remindersDone,
    agendaToday,
    agendaNext,
    finance: {
      income: "R$ 7.450,00",
      expense: "R$ 3.280,00",
      recent: [
        { id: "f1", label: "Farmacia", value: "- R$ 48,90", meta: "ontem" },
        { id: "f2", label: "Mercado", value: "- R$ 182,40", meta: "ontem" },
        { id: "f3", label: "Freelance recebido", value: "+ R$ 850,00", meta: "hoje" }
      ],
      alerts: [
        { id: "fa1", title: "Cartao fecha na proxima semana", detail: "vale revisar gastos variaveis", urgent: true },
        { id: "fa2", title: "Reserva do mes em 74%", detail: "progresso consistente", urgent: false }
      ]
    },
    notes,
    ideas,
    whatsapp,
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

function createInitialState(): MockState {
  return {
    users: [{ id: demoUserId, email: "demo@sara.app", fullName: "Sara Demo", isActive: true }],
    subscriptions: [{ id: "sub_demo_01", userId: demoUserId, email: "demo@sara.app", status: "active" }],
    loginCodes: [],
    sessions: [],
    panelByUserId: {
      [demoUserId]: createPanelSeed()
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
