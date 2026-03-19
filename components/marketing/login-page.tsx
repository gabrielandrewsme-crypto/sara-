import { EmailLoginForm } from "@/components/auth/email-login-form";
import { Button } from "@/components/ui/button";
import { PageShell } from "./page-shell";

export function LoginPage() {
  return (
    <PageShell current="login">
      <section className="auth-layout">
        <div className="auth-layout__copy">
          <span className="eyebrow">Acesso</span>
          <h1>Entre com o email da sua assinatura</h1>
          <p>Uma entrada simples, acolhedora e coerente com a identidade visual da Sara.</p>
          <div className="quote-card">
            <p>"Memoria nao e lugar de tarefa."</p>
            <span>Use seu email para acessar o painel e concluir a vinculacao do WhatsApp.</span>
          </div>
        </div>

        <div>
          <EmailLoginForm />
          <div className="auth-card auth-card--secondary">
            <Button href="/assinatura" variant="secondary">
              Ainda nao assinei
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
