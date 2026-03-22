import { Button } from "@/components/ui/button";
import { env } from "@/lib/config/env";
import { PageShell } from "./page-shell";

const planBenefits = [
  "Organizacao de tarefas, lembretes, rotina, agenda, financas, notas e ideias",
  "Chat nativo com experiencia desenhada para baixa friccao",
  "Painel visual para acompanhar o que foi capturado e estruturado",
  "Base pronta para evoluir com mais automacoes e camadas de inteligencia"
];

export function SubscriptionPage() {
  const checkoutUrl = env.CAKTO_CHECKOUT_URL || env.APP_URL;
  const hasCheckoutUrl = Boolean(env.CAKTO_CHECKOUT_URL);

  return (
    <PageShell current="assinatura">
      <section className="split-layout">
        <div className="split-layout__intro">
          <span className="eyebrow">Assinatura Sara</span>
          <h1>Um plano simples para tirar o peso da sua cabeca</h1>
          <p>
            A assinatura inicial concentra tudo em um plano mensal claro, com foco em
            aderencia, leveza e confianca na rotina.
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
            <span>/mes</span>
          </div>
          <p>
            Sem complexidade. Uma assinatura para comecar a organizar sua vida mental
            com constancia.
          </p>
          <label className="input-group">
            <span>Cupom</span>
            <input type="text" placeholder="Digite seu cupom" />
          </label>
          <a
            href={checkoutUrl}
            target="_blank"
            rel={hasCheckoutUrl ? "noreferrer" : undefined}
            className="button button--primary button--full"
          >
            {hasCheckoutUrl ? "Ir para checkout da Cakto" : "Configurar checkout da Cakto"}
          </a>
          {!hasCheckoutUrl ? (
            <p>
              Defina <code>CAKTO_CHECKOUT_URL</code> no ambiente para apontar para o checkout real.
            </p>
          ) : null}
          <Button href="/pos-compra" variant="ghost">
            Ver fluxo pos-compra
          </Button>
        </aside>
      </section>
    </PageShell>
  );
}
