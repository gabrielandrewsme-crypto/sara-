import type { PanelData } from "@/lib/sara/types";
import { ProductShell } from "./app-shell";

type RoutinePageProps = {
  data: PanelData;
};

export function RoutinePage({ data }: RoutinePageProps) {
  const blocks = [
    { period: "manha", label: "Manha", tone: "gold" },
    { period: "tarde", label: "Tarde", tone: "blue" },
    { period: "noite", label: "Noite", tone: "violet" }
  ] as const;

  return (
    <ProductShell
      current="rotina"
      title="Rotina"
      subtitle="Blocos claros para ver o que pertence a cada periodo do dia."
    >
      <div className="product-grid product-grid--three-up">
        {blocks.map((block) => (
          <article key={block.period} className={`glass-panel period-panel period-panel--${block.tone}`}>
            <div className="panel-header">
              <div>
                <h2>{block.label}</h2>
                <p>Itens organizados pela Sara para esse periodo.</p>
              </div>
            </div>
            <div className="stack-list">
              {data.routines
                .filter((item) => item.period === block.period)
                .map((item) => (
                  <div key={item.id} className="list-row list-row--compact">
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.details}</p>
                    </div>
                  </div>
                ))}
            </div>
          </article>
        ))}
      </div>
    </ProductShell>
  );
}
