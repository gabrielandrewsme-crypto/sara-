import { Button } from "@/components/ui/button";
import { PageShell } from "./page-shell";

const steps = [
  "Sua assinatura foi concluida com sucesso.",
  "Acesse a Sara usando o mesmo email informado na compra.",
  "Dentro do painel, use o chat da Sara para criar suas primeiras organizacoes."
];

export function PostPurchasePage() {
  return (
    <PageShell current="pos-compra">
      <section className="confirmation-card">
        <div className="confirmation-card__badge">Assinatura confirmada</div>
        <h1>Seu acesso a Sara esta liberado.</h1>
        <p>
          O proximo passo e simples: entrar com o email da compra e usar o chat nativo
          para transformar sua rotina em estrutura real dentro do painel.
        </p>
        <div className="grid grid--three">
          {steps.map((step, index) => (
            <article key={step} className="panel">
              <span className="panel__index">0{index + 1}</span>
              <p>{step}</p>
            </article>
          ))}
        </div>
        <div className="confirmation-card__actions">
          <Button href="/login">Acessar com meu email</Button>
          <Button href="/" variant="secondary">
            Voltar para a landing
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
