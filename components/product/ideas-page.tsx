import type { PanelData } from "@/lib/sara/types";
import { ProductShell } from "./app-shell";

type IdeasPageProps = {
  data: PanelData;
};

export function IdeasPage({ data }: IdeasPageProps) {
  return (
    <ProductShell
      current="ideias"
      title="Ideias"
      subtitle="Um mapa mental leve para organizar pensamentos sem endurecer a criatividade."
    >
      <div className="product-grid">
        <article className="glass-panel">
          <div className="panel-header">
            <div>
              <h2>Mapa de pensamentos</h2>
              <p>Estrutura visual para ver grupos de ideias com leveza.</p>
            </div>
          </div>
          <div className="idea-map">
            {data.ideas.map((cluster, index) => (
              <div key={cluster.id} className={`idea-branch idea-branch--${index + 1}`}>
                <strong>{cluster.title}</strong>
                <div className="idea-branch__notes">
                  {cluster.notes.map((note) => (
                    <span key={note}>{note}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </ProductShell>
  );
}
