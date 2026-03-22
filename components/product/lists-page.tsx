import type { PanelData } from "@/lib/sara/types";
import { ProductShell } from "./app-shell";

type ListsPageProps = {
  data: PanelData;
};

export function ListsPage({ data }: ListsPageProps) {
  return (
    <ProductShell
      current="listas"
      title="Listas"
      subtitle="Checklists vivos para compras, preparacoes e tudo o que precisa sair da memoria."
    >
      <div className="product-grid product-grid--two-up">
        {data.lists.map((list) => (
          <article key={list.id} className="glass-panel">
            <div className="panel-header">
              <div>
                <h2>{list.title}</h2>
                <p>{list.openCount} abertos de {list.itemCount}</p>
              </div>
            </div>
            <div className="stack-list">
              {list.items.map((item) => (
                <div key={item.id} className="list-row">
                  <div>
                    <strong>{item.title}</strong>
                  </div>
                  <span className="soft-badge">{item.done ? "feito" : "aberto"}</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </ProductShell>
  );
}
