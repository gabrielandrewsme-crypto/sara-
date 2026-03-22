import "server-only";
import type { InterpretedMessage } from "./types";

function extractAmount(text: string) {
  const match = text.match(/(\d+[.,]?\d{0,2})/);
  if (!match) return undefined;
  return Number(match[1].replace(",", "."));
}

function extractTime(text: string) {
  const match = text.match(/(\d{1,2})[:h](\d{2})?/i);
  if (!match) return undefined;
  const date = new Date();
  date.setHours(Number(match[1]), Number(match[2] ?? "0"), 0, 0);
  return date;
}

export async function classifyMessage(body: string): Promise<InterpretedMessage> {
  const text = body.trim();
  const lower = text.toLowerCase();

  if (!text) {
    return {
      classification: "unknown",
      title: "Mensagem vazia"
    };
  }

  if (lower.includes("lembr") || lower.includes("me lembra") || lower.includes("nao esquecer")) {
    return {
      classification: "reminder",
      title: text,
      remindAt: extractTime(text) ?? new Date(Date.now() + 60 * 60 * 1000),
      isUrgent: lower.includes("urgente") || lower.includes("hoje")
    };
  }

  if (lower.includes("reuniao") || lower.includes("consulta") || lower.includes("compromisso")) {
    return {
      classification: "agenda",
      title: text,
      details: "Evento capturado pelo chat da Sara",
      startsAt: extractTime(text) ?? new Date(Date.now() + 2 * 60 * 60 * 1000)
    };
  }

  if (lower.includes("gastei") || lower.includes("paguei") || lower.includes("recebi") || lower.includes("pix")) {
    const isIncome = lower.includes("recebi");
    return {
      classification: "finance",
      title: text,
      amount: extractAmount(text) ?? 0,
      financeType: isIncome ? "income" : "expense"
    };
  }

  if (lower.includes("ideia") || lower.includes("insight") || lower.includes("pensando")) {
    return {
      classification: "idea",
      title: text,
      details: text,
      cluster: lower.includes("trabalho") ? "trabalho" : lower.includes("casa") ? "casa" : "pessoal"
    };
  }

  if (lower.includes("nota") || lower.includes("anota") || lower.includes("guardar")) {
    return {
      classification: "note",
      title: "Nota capturada",
      details: text
    };
  }

  if (lower.startsWith("preciso") || lower.startsWith("fazer") || lower.includes("tarefa")) {
    return {
      classification: "task",
      title: text,
      details: "Tarefa criada a partir de mensagem livre"
    };
  }

  return {
    classification: "note",
    title: "Registro livre",
    details: text
  };
}
