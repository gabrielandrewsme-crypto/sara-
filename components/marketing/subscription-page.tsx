import { Button } from "@/components/ui/button";
import { PageShell } from "./page-shell";

const planBenefits = [
  "Organização de tarefas, lembretes, rotina, agenda, finanças, notas e ideias",
  "Acesso via WhatsApp com experiência desenhada para baixa fricção",
  "Painel visual para acompanhar o que foi capturado e estruturado",
  "Base pronta para evoluir com mais automações e camadas de inteligência"
];

export function SubscriptionPage() {
  return (
    <PageShell current="assinatura">
      <section className="split-layout">
        <div className="split-layout__intro">
          <span className="eyebrow">Assinatura Sara</span>
          <h1>Um plano simples para tirar o peso da sua cabeça</h1>
          <p>
            A assinatura inicial concentra tudo em um plano mensal claro, com foco em
            aderência, leveza e confiança na rotina.
          </p>
          <div className="benefits-list">
            {planBenefits.map((benefit) => (
              <div key={benefit} className="benefits-list__item">
                <span />
                <p>{benefit}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="pricing-card">
          <span className="pricing-card__label">Plano principal</span>
          <h2>Sara Mensal</h2>
          <div className="pricing-card__price">
            <small>R$</small>
            <strong>49,90</strong>
            <span>/mês</span>
          </div>
          <p>
            Sem complexidade. Uma assinatura para começar a organizar sua vida mental
            com constância.
          </p>
          <label className="input-group">
            <span>Cupom</span>
            <input type="text" placeholder="Digite seu cupom" />
          </label>
          <a
            href="https://cakto.com"
            target="_blank"
            rel="noreferrer"
            className="button button--primary button--full"
          >
            Ir para checkout da Cakto
          </a>
          <Button href="/pos-compra" variant="ghost">
            Ver fluxo pós-compra
          </Button>
        </aside>
      </section>
    </PageShell>
  );
}
