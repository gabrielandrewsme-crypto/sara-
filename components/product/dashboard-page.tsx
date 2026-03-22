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
      subtitle="Tudo o que a Sara organizou para voce, com o chat nativo como centro de captura e execucao."
    >
      <div className="product-grid product-grid--dashboard-v2">
        <article className="glass-panel glass-panel--hero">
          <div className="dashboard-hero">
            <div>
              <span className="eyebrow">Chat no centro</span>
              <h2 className="dashboard-hero__title">Voce conversa. A Sara executa.</h2>
              <p>
                Tudo entra pelo chat, vira estrutura real e reaparece no painel com menos atrito
                e mais clareza para o seu dia.
              </p>
              <div className="hero__actions">
                <Link href="/painel/chat" className="button button--primary">
                  Abrir chat
                </Link>
                <Link href="/painel/listas" className="button button--secondary">
                  Ver listas
                </Link>
              </div>
            </div>
            <div className="dashboard-summary">
              <div className="metric-card">
                <span>Itens organizados hoje</span>
                <strong>{data.tasksOpen.length + data.remindersFuture.length + data.agendaToday.length}</strong>
              </div>
              <div className="metric-card">
                <span>Tarefas abertas</span>
                <strong>{data.tasksOpen.length}</strong>
              </div>
              <div className="metric-card">
                <span>Listas ativas</span>
                <strong>{data.lists.length}</strong>
              </div>
            </div>
          </div>
        </article>

        <article className="glass-panel">
          <div className="panel-header">
            <div>
              <h2>Ultimas acoes da Sara</h2>
              <p>Execucoes reais do sistema a partir do chat.</p>
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
              <h2>Tarefas em foco</h2>
              <p>O que merece energia primeiro.</p>
            </div>
            <Link href="/painel/tarefas" className="button button--ghost">
              Abrir tarefas
            </Link>
          </div>
          <div className="stack-list">
            {data.tasksOpen.slice(0, 4).map((task) => (
              <div key={task.id} className="list-row">
                <div>
                  <strong>{task.title}</strong>
                  <p>{task.dueAt ?? "Sem prazo definido"}</p>
                </div>
                <span className={`soft-badge soft-badge--${task.priority}`}>{task.priority}</span>
              </div>
            ))}
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
              <h2>Listas vivas</h2>
              <p>Checagens e compras em estrutura simples.</p>
            </div>
            <Link href="/painel/listas" className="button button--ghost">
              Abrir listas
            </Link>
          </div>
          <div className="stack-list">
            {data.lists.slice(0, 3).map((item) => (
              <div key={item.id} className="list-row">
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.openCount} itens abertos de {item.itemCount}</p>
                </div>
                <span className="soft-badge">lista</span>
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
