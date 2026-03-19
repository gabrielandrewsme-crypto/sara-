import { Button } from "@/components/ui/button";
import { PageShell } from "./page-shell";

const steps = [
  "Sua assinatura foi concluída com sucesso.",
  "Acesse a Sara usando o mesmo email informado na compra.",
  "Dentro do painel, você fará a vinculação do seu número de WhatsApp."
];

export function PostPurchasePage() {
  return (
    <PageShell current="pos-compra">
      <section className="confirmation-card">
        <div className="confirmation-card__badge">Assinatura confirmada</div>
        <h1>Seu acesso à Sara está liberado.</h1>
        <p>
          O próximo passo é simples: entrar com o email da compra e concluir a conexão
          com seu WhatsApp dentro do painel.
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
