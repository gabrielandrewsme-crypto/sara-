import type { PanelData } from "@/lib/sara/types";
import { ProductShell } from "./app-shell";

type TasksPageProps = {
  data: PanelData;
};

export function TasksPage({ data }: TasksPageProps) {
  const columns = [
    { title: "Abertas", items: data.tasksOpen, fallback: "Sem prazo definido" },
    { title: "Concluidas", items: data.tasksDone, fallback: "Concluida" }
  ];

  return (
    <ProductShell
      current="tarefas"
      title="Tarefas"
      subtitle="Tudo o que o chat transformou em execucao clara, com prioridade e contexto."
    >
      <div className="product-grid product-grid--columns">
        {columns.map((column) => (
          <article key={column.title} className="glass-panel">
            <div className="panel-header">
              <div>
                <h2>{column.title}</h2>
                <p>{column.items.length} itens</p>
              </div>
            </div>
            <div className="kanban-stack">
              {column.items.map((item) => (
                <div key={item.id} className="task-card">
                  <strong>{item.title}</strong>
                  <span>{item.dueAt ?? column.fallback}</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </ProductShell>
  );
}
