import { ProductShell } from "./app-shell";
import { ChatDock } from "./chat-dock";

export function ChatPage() {
  return (
    <ProductShell
      current="chat"
      title="Chat nativo"
      subtitle="Converse com a Sara para criar, editar, consultar e reorganizar o painel em linguagem natural."
      showChatDock={false}
    >
      <div className="glass-panel">
        <div className="panel-header">
          <div>
            <h2>Operacao conversacional</h2>
            <p>O chat executa no sistema, confirma no texto e atualiza o painel imediatamente.</p>
          </div>
        </div>
        <ChatDock expanded />
      </div>
    </ProductShell>
  );
}
