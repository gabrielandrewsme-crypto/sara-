import type { PanelData } from "@/lib/sara/types";
import { ProductShell } from "./app-shell";

type RemindersPageProps = {
  data: PanelData;
};

export function RemindersPage({ data }: RemindersPageProps) {
  return (
    <ProductShell
      current="lembretes"
      title="Lembretes"
      subtitle="Futuros, urgentes e concluidos recentes em uma leitura direta."
    >
      <div className="product-grid product-grid--two-up">
        <article className="glass-panel">
          <div className="panel-header">
            <div>
              <h2>Futuros</h2>
              <p>O que ainda vai acontecer e ja esta protegido.</p>
            </div>
          </div>
          <div className="stack-list">
            {data.remindersFuture.map((item) => (
              <div key={item.id} className="list-row">
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.when}</p>
                </div>
                <span className={`soft-badge ${item.urgent ? "soft-badge--urgent" : ""}`}>
                  {item.urgent ? "urgente" : "programado"}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-panel">
          <div className="panel-header">
            <div>
              <h2>Concluidos recentes</h2>
              <p>Pequena prova visual de que o sistema esta funcionando.</p>
            </div>
          </div>
          <div className="stack-list">
            {data.remindersDone.map((item) => (
              <div key={item.id} className="list-row">
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.when}</p>
                </div>
                <span className="soft-badge">feito</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </ProductShell>
  );
}
