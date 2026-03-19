import type { PanelData } from "@/lib/sara/types";
import { ProductShell } from "./app-shell";

type AgendaPageProps = {
  data: PanelData;
};

export function AgendaPage({ data }: AgendaPageProps) {
  return (
    <ProductShell
      current="agenda"
      title="Agenda"
      subtitle="Compromissos do dia e proximos eventos em uma visao simples e limpa."
    >
      <div className="product-grid product-grid--two-up">
        <article className="glass-panel">
          <div className="panel-header">
            <div>
              <h2>Hoje</h2>
              <p>Compromissos organizados pela Sara</p>
            </div>
          </div>
          <div className="agenda-track">
            {data.agendaToday.map((event) => (
              <div key={event.id} className={`agenda-event agenda-event--${event.tone}`}>
                <small>{event.time}</small>
                <strong>{event.title}</strong>
                <p>{event.detail}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-panel">
          <div className="panel-header">
            <div>
              <h2>Proximos eventos</h2>
              <p>O que vem depois do dia de hoje, sem poluicao visual.</p>
            </div>
          </div>
          <div className="stack-list">
            {data.agendaNext.map((event) => (
              <div key={event.id} className="list-row">
                <div>
                  <strong>{event.time}</strong>
                  <p>{event.title}</p>
                </div>
                <span className="soft-badge">agenda</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </ProductShell>
  );
}
