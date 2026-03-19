import type { PanelData } from "@/lib/sara/types";
import { ProductShell } from "./app-shell";

type NotesPageProps = {
  data: PanelData;
};

export function NotesPage({ data }: NotesPageProps) {
  const highlighted = data.notes.find((note) => note.pinned) ?? data.notes[0];

  return (
    <ProductShell
      current="notas"
      title="Notas"
      subtitle="Lista limpa, com busca visual simples e apoio mental para localizar rapido."
    >
      <div className="product-grid product-grid--two-up">
        <article className="glass-panel">
          <div className="panel-header">
            <div>
              <h2>Notas recentes</h2>
              <p>Organizadas com leveza para aliviar a memoria.</p>
            </div>
          </div>
          <div className="search-field">Buscar notas por palavra, contexto ou tema</div>
          <div className="notes-stack">
            {data.notes.map((note) => (
              <div key={note.id} className="note-card">
                <p>{note.content}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-panel">
          <div className="panel-header">
            <div>
              <h2>Apoio mental</h2>
              <p>Uma estrutura calma para ver notas importantes sem sobrecarga.</p>
            </div>
          </div>
          <div className="editor-surface">
            <span>Nota destacada</span>
            <p>{highlighted?.content ?? "Nenhuma nota destacada ainda."}</p>
          </div>
        </article>
      </div>
    </ProductShell>
  );
}
