import Link from "next/link";
import type { PanelData } from "@/lib/sara/types";
import { ProductShell } from "./app-shell";

type DashboardPageProps = {
  data: PanelData;
};

export function DashboardPage({ data }: DashboardPageProps) {
  return (
    <ProductShell
      current="dashboard"
      title="Visao geral do seu dia"
      subtitle="Tudo o que a Sara organizou para voce, com WhatsApp como centro da captura."
    >
      <div className="product-grid product-grid--dashboard-v2">
        <article className="glass-panel glass-panel--hero">
          <div className="dashboard-hero">
            <div>
              <span className="eyebrow">WhatsApp no centro</span>
              <h2 className="dashboard-hero__title">O painel mostra. O WhatsApp organiza.</h2>
              <p>
                Sua vida pratica chega por mensagem, a Sara estrutura e o dashboard
                devolve clareza sem excesso de informacao.
              </p>
              <div className="hero__actions">
                <Link href="/painel/whatsapp" className="button button--primary">
                  Vincular WhatsApp
                </Link>
                <Link href="/painel/agenda" className="button button--secondary">
                  Ver agenda de hoje
                </Link>
              </div>
            </div>
            <div className="dashboard-summary">
              <div className="metric-card">
                <span>Itens organizados hoje</span>
                <strong>{data.notes.length + data.remindersFuture.length + data.agendaToday.length}</strong>
              </div>
              <div className="metric-card">
                <span>Lembretes ativos</span>
                <strong>{data.remindersFuture.length}</strong>
              </div>
              <div className="metric-card">
                <span>Compromissos proximos</span>
                <strong>{data.agendaToday.length}</strong>
              </div>
            </div>
          </div>
        </article>

        <article className="glass-panel">
          <div className="panel-header">
            <div>
              <h2>Proximos avisos da Sara</h2>
              <p>Mensagens de orientacao, alerta e acompanhamento.</p>
            </div>
          </div>
          <div className="stack-list">
            {data.alerts.map((alert) => (
              <div key={alert.title} className={`notice-card notice-card--${alert.tone}`}>
                <strong>{alert.title}</strong>
                <p>{alert.detail}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-panel">
          <div className="panel-header">
            <div>
              <h2>Resumo da rotina</h2>
              <p>Manha, tarde e noite em blocos simples.</p>
            </div>
            <Link href="/painel/rotina" className="button button--ghost">
              Abrir rotina
            </Link>
          </div>
          <div className="period-grid">
            {["manha", "tarde", "noite"].map((period) => {
              const items = data.routines.filter((item) => item.period === period);
              const label = period === "manha" ? "Manha" : period === "tarde" ? "Tarde" : "Noite";

              return (
                <div key={period} className="period-card">
                  <span>{label}</span>
                  <p>{items.map((item) => item.title).join(", ") || "Sem itens"}</p>
                </div>
              );
            })}
          </div>
        </article>

        <article className="glass-panel">
          <div className="panel-header">
            <div>
              <h2>Proximos compromissos</h2>
              <p>Agenda do dia em leitura rapida.</p>
            </div>
            <Link href="/painel/agenda" className="button button--ghost">
              Ver agenda
            </Link>
          </div>
          <div className="stack-list">
            {data.agendaToday.map((item) => (
              <div key={item.id} className={`timeline-item timeline-item--${item.tone}`}>
                <small>{item.time}</small>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-panel">
          <div className="panel-header">
            <div>
              <h2>Lembretes ativos</h2>
              <p>Urgencia e previsao em um mesmo bloco.</p>
            </div>
            <Link href="/painel/lembretes" className="button button--ghost">
              Abrir lembretes
            </Link>
          </div>
          <div className="stack-list">
            {data.remindersFuture.map((item) => (
              <div key={item.id} className="list-row">
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.when}</p>
                </div>
                <span className={`soft-badge ${item.urgent ? "soft-badge--urgent" : ""}`}>
                  {item.urgent ? "urgente" : "ativo"}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-panel">
          <div className="panel-header">
            <div>
              <h2>Gastos recentes</h2>
              <p>Pequena leitura financeira para manter cuidado.</p>
            </div>
            <Link href="/painel/financas" className="button button--ghost">
              Ver financas
            </Link>
          </div>
          <div className="stack-list">
            {data.finance.recent.map((item) => (
              <div key={item.id} className="list-row">
                <div>
                  <strong>{item.label}</strong>
                  <p>{item.meta}</p>
                </div>
                <span className="amount-label">{item.value}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-panel">
          <div className="panel-header">
            <div>
              <h2>Notas recentes</h2>
              <p>Apoio mental limpo e facil de localizar.</p>
            </div>
            <Link href="/painel/notas" className="button button--ghost">
              Ver notas
            </Link>
          </div>
          <div className="notes-stack">
            {data.notes.slice(0, 3).map((note) => (
              <div key={note.id} className="note-card">
                <p>{note.content}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-panel">
          <div className="panel-header">
            <div>
              <h2>Ideias recentes</h2>
              <p>Pensamentos organizados sem perder a leveza.</p>
            </div>
            <Link href="/painel/ideias" className="button button--ghost">
              Ver ideias
            </Link>
          </div>
          <div className="idea-cluster">
            {data.ideas.slice(0, 3).map((idea, index) => (
              <div key={idea.id} className={`idea-node idea-node--${index + 1}`}>
                {idea.title}: {idea.notes[0] ?? "sem itens"}
              </div>
            ))}
          </div>
        </article>
      </div>
    </ProductShell>
  );
}
