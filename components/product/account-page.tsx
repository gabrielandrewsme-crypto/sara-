import type { PanelData } from "@/lib/sara/types";
import { ProductShell } from "./app-shell";

type AccountPageProps = {
  data: PanelData;
};

export function AccountPage({ data }: AccountPageProps) {
  const user = data.user ?? { name: "Usuario", email: "sem-email" };
  const account = data.account ?? { status: "blocked", createdAt: "-" };
  const plan = data.plan ?? {
    name: "Plano indisponivel",
    price: "-",
    status: "blocked",
    nextChargeDate: "-",
    renewal: false
  };
  const settings = data.settings ?? {
    morningRoutineEnabled: false,
    afternoonRoutineEnabled: false,
    nightRoutineEnabled: false,
    quietHoursStart: "--:--",
    quietHoursEnd: "--:--"
  };

  return (
    <ProductShell
      current="minha-conta"
      title="Minha Conta"
      subtitle="Conta, plano e configuracoes em uma tela simples e confiavel."
    >
      <div className="product-grid product-grid--three-up">
        <article className="glass-panel">
          <div className="panel-header">
            <div>
              <h2>Conta</h2>
              <p>Informacoes principais de acesso.</p>
            </div>
          </div>
          <div className="stack-list">
            <div className="list-row">
              <div>
                <strong>Nome</strong>
                <p>{user.name || "Nao informado"}</p>
              </div>
            </div>
            <div className="list-row">
              <div>
                <strong>Email</strong>
                <p>{user.email || "Nao informado"}</p>
              </div>
            </div>
            <div className="list-row">
              <div>
                <strong>Status da conta</strong>
                <p>{account.status || "indisponivel"}</p>
              </div>
            </div>
            <div className="list-row">
              <div>
                <strong>Conta criada em</strong>
                <p>{account.createdAt || "-"}</p>
              </div>
            </div>
          </div>
        </article>

        <article className="glass-panel">
          <div className="panel-header">
            <div>
              <h2>Plano</h2>
              <p>Status da assinatura e renovacao.</p>
            </div>
          </div>
          <div className="stack-list">
            <div className="list-row">
              <div>
                <strong>Plano atual</strong>
                <p>{plan.name || "Nao informado"}</p>
              </div>
            </div>
            <div className="list-row">
              <div>
                <strong>Preco</strong>
                <p>{plan.price || "-"}</p>
              </div>
            </div>
            <div className="list-row">
              <div>
                <strong>Status</strong>
                <p>{plan.status || "indisponivel"}</p>
              </div>
            </div>
            <div className="list-row">
              <div>
                <strong>Proxima cobranca</strong>
                <p>{plan.nextChargeDate || "-"}</p>
              </div>
            </div>
            <div className="list-row">
              <div>
                <strong>Renovacao automatica</strong>
                <p>{plan.renewal ? "Ativada" : "Desativada"}</p>
              </div>
            </div>
          </div>
        </article>

        <article className="glass-panel">
          <div className="panel-header">
            <div>
              <h2>Configuracoes</h2>
              <p>Preferencias gerais da experiencia.</p>
            </div>
          </div>
          <div className="stack-list">
            <div className="list-row">
              <div>
                <strong>Rotina da manha</strong>
                <p>{settings.morningRoutineEnabled ? "Ativada" : "Desativada"}</p>
              </div>
            </div>
            <div className="list-row">
              <div>
                <strong>Rotina da tarde</strong>
                <p>{settings.afternoonRoutineEnabled ? "Ativada" : "Desativada"}</p>
              </div>
            </div>
            <div className="list-row">
              <div>
                <strong>Rotina da noite</strong>
                <p>{settings.nightRoutineEnabled ? "Ativada" : "Desativada"}</p>
              </div>
            </div>
            <div className="list-row">
              <div>
                <strong>Horario de silencio</strong>
                <p>
                  {settings.quietHoursStart || "--:--"} ate {settings.quietHoursEnd || "--:--"}
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </ProductShell>
  );
}
