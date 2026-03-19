import { ProductShell } from "./app-shell";

export function WhatsAppPage() {
  return (
    <ProductShell
      current="whatsapp"
      title="Conexão com WhatsApp"
      subtitle="A ponte entre sua vida real e o sistema da Sara."
    >
      <div className="product-grid product-grid--two-up">
        <article className="glass-panel">
          <div className="panel-header">
            <div>
              <h2>Status da conexão</h2>
              <p>Configuração clara, sem jargão técnico.</p>
            </div>
          </div>
          <div className="connection-card">
            <div className="connection-orb" />
            <strong>Número pronto para vincular</strong>
            <p>Depois do login, a pessoa conecta o WhatsApp e começa a capturar tudo dali.</p>
            <button type="button" className="button button--primary">
              Vincular número
            </button>
          </div>
        </article>

        <article className="glass-panel">
          <div className="panel-header">
            <div>
              <h2>O que acontece aqui</h2>
              <p>Fluxo pensado para adesão real.</p>
            </div>
          </div>
          <div className="stack-list">
            <div className="list-row">
              <div>
                <strong>Captura</strong>
                <p>tarefas, lembretes, ideias e compromissos chegam por mensagem</p>
              </div>
            </div>
            <div className="list-row">
              <div>
                <strong>Estrutura</strong>
                <p>a Sara organiza prioridade, contexto e momento ideal</p>
              </div>
            </div>
            <div className="list-row">
              <div>
                <strong>Retorno</strong>
                <p>o painel mostra o que está ativo, pendente e concluído</p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </ProductShell>
  );
}
