import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { PageShell } from "./page-shell";

const howItWorks = [
  "Você manda uma tarefa, compromisso, lembrete ou ideia no WhatsApp.",
  "A Sara transforma isso em estrutura: prioridade, contexto, data, lista e acompanhamento.",
  "Tudo fica organizado para você enxergar o que importa sem sobrecarga."
];

const audiences = [
  "Pessoas com TDAH que vivem no improviso e sentem que estão sempre apagando incêndio.",
  "Quem esquece tarefas simples porque a cabeça já está ocupada demais.",
  "Profissionais e estudantes que precisam de clareza sem virar reféns de aplicativos complexos."
];

const organizationAreas = [
  "tarefas",
  "lembretes",
  "agenda",
  "rotina",
  "finanças",
  "notas",
  "ideias"
];

const benefits = [
  {
    title: "Menos ruído mental",
    description:
      "Você para de usar a memória como caixa de entrada e ganha espaço para pensar."
  },
  {
    title: "Clareza de prioridade",
    description:
      "A Sara ajuda a separar urgência, rotina e pendência antes que tudo vire peso."
  },
  {
    title: "Sistema simples de manter",
    description:
      "A experiência acontece no WhatsApp, no fluxo em que a vida real já acontece."
  },
  {
    title: "Confiança para seguir",
    description:
      "Em vez de tentar lembrar de tudo, você sabe onde tudo está e o que fazer agora."
  }
];

const faqs = [
  {
    question: "A Sara é um app de produtividade comum?",
    answer:
      "Não. A proposta é reduzir fricção mental usando conversa via WhatsApp e uma estrutura visual clara, sem excesso de telas ou complexidade."
  },
  {
    question: "Preciso aprender um sistema novo?",
    answer:
      "Não. A interface foi pensada para ser intuitiva e a operação principal acontece por mensagens, com um painel complementar."
  },
  {
    question: "A Sara serve só para tarefas?",
    answer:
      "Não. Ela começa pelas tarefas, mas também organiza agenda, lembretes, rotina, finanças, notas e ideias."
  }
];

export function LandingPage() {
  return (
    <PageShell current="home">
      <section className="hero">
        <div className="hero__copy">
          <span className="eyebrow">Organização mental via WhatsApp</span>
          <h1>TDAH não é bagunça. É falta de sistema.</h1>
          <p className="hero__lead">
            Sara organiza tarefas, lembretes, agenda, rotina, finanças, notas e ideias
            via WhatsApp para transformar sobrecarga em clareza prática.
          </p>
          <div className="hero__actions">
            <Button href="/assinatura">Assinar agora</Button>
            <Button href="/login" variant="secondary">
              Entrar com email
            </Button>
          </div>
          <div className="hero__anchors">
            <p>“Memória não é lugar de tarefa.”</p>
            <span>Sistema pensado para leveza, consistência e confiança.</span>
          </div>
        </div>
        <div className="hero__visual">
          <div className="showcase-card">
            <div className="showcase-card__top">
              <span>Fluxo mental organizado</span>
              <small>WhatsApp + painel Sara</small>
            </div>
            <div className="showcase-card__center">
              <div className="signal signal--soft" />
              <div className="signal signal--primary" />
              <div className="signal signal--glow" />
              <div className="showcase-card__ring" />
            </div>
            <div className="showcase-card__bottom">
              <div>
                <strong>Hoje</strong>
                <span>3 prioridades, 2 lembretes, 1 ideia salva</span>
              </div>
              <div className="status-pill">mente mais leve</div>
            </div>
          </div>
        </div>
      </section>

      <section className="content-section">
        <SectionHeading
          eyebrow="Como funciona"
          title="Uma camada de organização entre sua mente e o caos do dia"
          description="Você fala com a Sara no WhatsApp e ela transforma o que estava solto em estrutura utilizável."
        />
        <div className="grid grid--three">
          {howItWorks.map((item, index) => (
            <article key={item} className="panel">
              <span className="panel__index">0{index + 1}</span>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section">
        <SectionHeading
          eyebrow="Para quem é"
          title="Feita para quem está cansada de depender da própria memória"
          description="A Sara foi desenhada para rotinas intensas, mentes sobrecarregadas e pessoas que precisam de um sistema simples para funcionar."
        />
        <div className="grid grid--three">
          {audiences.map((item) => (
            <article key={item} className="panel panel--soft">
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section">
        <SectionHeading
          eyebrow="O que a Sara organiza"
          title="Tudo o que costuma competir pela sua atenção"
          description="A marca nasce com uma visão completa da vida prática, não apenas como uma lista de tarefas."
        />
        <div className="tag-cloud">
          {organizationAreas.map((item) => (
            <span key={item} className="tag-chip">
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="content-section">
        <SectionHeading
          eyebrow="Benefícios"
          title="Ganhos emocionais e práticos em uma experiência calma"
          description="O objetivo não é produzir mais a qualquer custo. É reduzir atrito, culpa e esquecimento."
        />
        <div className="grid grid--two">
          {benefits.map((item) => (
            <article key={item.title} className="panel panel--feature">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="value-block">
        <div>
          <span className="eyebrow">Confiança</span>
          <h2>Um sistema que respeita a forma como sua mente funciona</h2>
        </div>
        <div className="value-block__stats">
          <article className="panel">
            <strong>WhatsApp-first</strong>
            <p>Menos fricção de entrada. Mais aderência na vida real.</p>
          </article>
          <article className="panel">
            <strong>Clareza visual</strong>
            <p>Design calmo, rotas objetivas e comunicação sem ruído.</p>
          </article>
          <article className="panel">
            <strong>Marca com propósito</strong>
            <p>Não trata sobre desorganização moral. Trata sobre sistema.</p>
          </article>
        </div>
      </section>

      <section className="content-section">
        <SectionHeading
          eyebrow="FAQ"
          title="Perguntas frequentes"
          description="As respostas abaixo reforçam o posicionamento e reduzem objeções logo no primeiro contato."
        />
        <div className="faq-list">
          {faqs.map((item) => (
            <article key={item.question} className="panel panel--faq">
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-banner">
        <div>
          <span className="eyebrow">Comece agora</span>
          <h2>Sua mente não precisa carregar tudo sozinha.</h2>
          <p>Assine a Sara e transforme memória solta em sistema confiável.</p>
        </div>
        <Button href="/assinatura">Ir para assinatura</Button>
      </section>
    </PageShell>
  );
}
