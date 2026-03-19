import { ProductShell } from "./app-shell";

const columns = [
  {
    title: "Capturado",
    items: ["Responder cliente no WhatsApp", "Comprar remédio", "Salvar insight do curso"]
  },
  {
    title: "Planejado",
    items: ["Revisar agenda da semana", "Separar boletos do mês", "Organizar rotina da manhã"]
  },
  {
    title: "Concluído",
    items: ["Enviar documentos", "Checar compromisso de sexta"]
  }
];

export function TasksPage() {
  return (
    <ProductShell
      current="tarefas"
      title="Tarefas"
      subtitle="Tudo capturado, priorizado e visível sem parecer uma planilha."
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
                <div key={item} className="task-card">
                  <strong>{item}</strong>
                  <span>Contexto Sara</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </ProductShell>
  );
}
