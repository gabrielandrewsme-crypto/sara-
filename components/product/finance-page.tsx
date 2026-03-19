import type { PanelData } from "@/lib/sara/types";
import { ProductShell } from "./app-shell";

type FinancePageProps = {
  data: PanelData;
};

export function FinancePage({ data }: FinancePageProps) {
  return (
    <ProductShell
      current="financas"
      title="Financas"
      subtitle="Entradas, saidas, gastos recentes e alertas simples de cuidado financeiro."
    >
      <div className="product-grid product-grid--two-up">
        <article className="glass-panel">
          <div className="panel-header">
            <div>
              <h2>Panorama do mes</h2>
              <p>Leitura resumida para saber onde voce esta.</p>
            </div>
          </div>
          <div className="metric-row metric-row--finance">
            <div className="metric-card">
              <span>Entradas</span>
              <strong>{data.finance.income}</strong>
            </div>
            <div className="metric-card">
              <span>Saidas</span>
              <strong>{data.finance.expense}</strong>
            </div>
          </div>
          <div className="chart-card chart-card--finance">
            <div className="chart-bar chart-bar--one" />
            <div className="chart-bar chart-bar--two" />
            <div className="chart-bar chart-bar--three" />
            <div className="chart-bar chart-bar--four" />
          </div>
        </article>

        <article className="glass-panel">
          <div className="panel-header">
            <div>
              <h2>Gastos e alertas</h2>
              <p>Destaque do que merece cuidado agora.</p>
            </div>
          </div>
          <div className="stack-list">
            {data.finance.recent.map((item) => (
              <div key={item.id} className="list-row">
                <div>
                  <strong>{item.label}</strong>
                  <p>{item.meta}</p>
                </div>
                <span className="amount-label">{item.value}</span>
              </div>
            ))}
            {data.finance.alerts.map((item) => (
              <div key={item.id} className="list-row">
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
                <span className={`soft-badge ${item.urgent ? "soft-badge--urgent" : ""}`}>
                  {item.urgent ? "cuidado" : "ok"}
                </span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </ProductShell>
  );
}
