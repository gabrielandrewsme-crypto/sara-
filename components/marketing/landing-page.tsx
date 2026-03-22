import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { PageShell } from "./page-shell";

const howItWorks = [
  "Voce escreve no chat da Sara o que precisa organizar.",
  "A Sara interpreta a intencao, transforma em estrutura e executa no sistema.",
  "Tudo reaparece no painel com prioridade, contexto, lista, rotina ou agenda."
];

const audiences = [
  "Pessoas com TDAH que vivem no improviso e sentem que estao sempre apagando incendio.",
  "Quem esquece tarefas simples porque a cabeca ja esta ocupada demais.",
  "Profissionais e estudantes que precisam de clareza sem virar refens de ferramentas pesadas."
];

const organizationAreas = [
  "tarefas",
  "lembretes",
  "agenda",
  "rotina",
  "listas",
  "financas",
  "notas",
  "ideias"
];

const benefits = [
  {
    title: "Menos ruido mental",
    description:
      "Voce para de usar a memoria como caixa de entrada e ganha espaco para pensar."
  },
  {
    title: "Clareza de prioridade",
    description:
      "A Sara separa urgencia, rotina e pendencia antes que tudo vire peso."
  },
  {
    title: "Sistema simples de manter",
    description:
      "A experiencia acontece dentro do painel, com um chat nativo que executa sem friccao."
  },
  {
    title: "Confianca para seguir",
    description:
      "Em vez de tentar lembrar de tudo, voce sabe onde tudo esta e o que fazer agora."
  }
];

const faqs = [
  {
    question: "A Sara e um app de produtividade comum?",
    answer:
      "Nao. A proposta e reduzir friccao mental com um painel claro e um chat que opera diretamente sobre o sistema."
  },
  {
    question: "Preciso aprender um sistema novo?",
    answer:
      "Nao. A interface foi desenhada para ser intuitiva e a operacao principal acontece em linguagem natural."
  },
  {
    question: "A Sara serve so para tarefas?",
    answer:
      "Nao. Ela organiza tarefas, agenda, lembretes, rotina, listas, financas, notas e ideias."
  }
];

export function LandingPage() {
  return (
    <PageShell current="home">
      <section className="hero">
        <div className="hero__copy">
          <span className="eyebrow">Organizacao mental com chat nativo</span>
          <h1>TDAH nao e bagunca. E falta de sistema.</h1>
          <p className="hero__lead">
            Sara organiza tarefas, lembretes, agenda, rotina, financas, notas e ideias
            dentro de um painel proprio, com um chat nativo para transformar linguagem natural em acao real.
          </p>
          <div className="hero__actions">
            <Button href="/assinatura">Assinar agora</Button>
            <Button href="/login" variant="secondary">
              Entrar com email
            </Button>
          </div>
          <div className="hero__anchors">
            <p>"Memoria nao e lugar de tarefa."</p>
            <span>Sistema pensado para leveza, consistencia e confianca.</span>
          </div>
        </div>
        <div className="hero__visual">
          <div className="showcase-card">
            <div className="showcase-card__top">
              <span>Layout premium</span>
              <small>Sara em painel nativo</small>
            </div>
            <div className="showcase-card__devices">
              <article className="device-card device-card--left">
                <div className="device-card__status">
                  <span>Welcome back</span>
                  <small>Leonor D</small>
                </div>
                <div className="device-card__balance">
                  <small>Painel do dia</small>
                  <strong>12 tarefas</strong>
                  <span>4 prioridades e 2 listas atualizadas</span>
                </div>
                <div className="device-card__chips">
                  <span>Chat</span>
                  <span>Agenda</span>
                  <span>Listas</span>
                  <span>Rotina</span>
                </div>
              </article>

              <article className="device-card device-card--center">
                <div className="device-card__header">
                  <strong>Nova captura</strong>
                  <small>chat da Sara</small>
                </div>
                <div className="device-card__amount">
                  <span>&quot;me lembra de pagar a conta amanha&quot;</span>
                  <strong>1 lembrete</strong>
                </div>
                <div className="device-card__dial">
                  <span>tarefas</span>
                  <span>rotina</span>
                  <span>agenda</span>
                  <span>listas</span>
                </div>
                <div className="device-card__cta">Executado no painel</div>
              </article>

              <article className="device-card device-card--right">
                <div className="device-card__header">
                  <strong>Estatisticas</strong>
                  <small>Agosto</small>
                </div>
                <div className="device-card__amount">
                  <span>Itens concluidos</span>
                  <strong>5.522</strong>
                </div>
                <div className="device-card__chart">
                  <span />
                </div>
                <div className="device-card__list">
                  <div>
                    <strong>Agenda</strong>
                    <small>3 blocos organizados</small>
                  </div>
                  <div>
                    <strong>Compras</strong>
                    <small>lista atualizada</small>
                  </div>
                  <div>
                    <strong>Rotina</strong>
                    <small>manha e noite</small>
                  </div>
                </div>
              </article>
            </div>
            <div className="showcase-card__bottom">
              <div>
                <strong>Estetica premium</strong>
                <span>Branco luminoso, laranja principal e interacao limpa em todo o app</span>
              </div>
              <div className="status-pill">premium flow</div>
            </div>
          </div>
        </div>
      </section>

      <section className="content-section">
        <SectionHeading
          eyebrow="Como funciona"
          title="Uma camada de organizacao entre sua mente e o caos do dia"
          description="Voce conversa com a Sara dentro do proprio sistema e ela transforma o que estava solto em estrutura utilizavel."
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
          eyebrow="Para quem e"
          title="Feita para quem esta cansada de depender da propria memoria"
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
          title="Tudo o que costuma competir pela sua atencao"
          description="A marca nasce com uma visao completa da vida pratica, nao apenas como uma lista de tarefas."
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
          eyebrow="Beneficios"
          title="Ganhos emocionais e praticos em uma experiencia calma"
          description="O objetivo nao e produzir mais a qualquer custo. E reduzir atrito, culpa e esquecimento."
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
          <span className="eyebrow">Confianca</span>
          <h2>Um sistema que respeita a forma como sua mente funciona</h2>
        </div>
        <div className="value-block__stats">
          <article className="panel">
            <strong>Chat-first</strong>
            <p>Menos friccao de entrada. Mais aderencia na vida real.</p>
          </article>
          <article className="panel">
            <strong>Clareza visual</strong>
            <p>Design calmo, rotas objetivas e comunicacao sem ruido.</p>
          </article>
          <article className="panel">
            <strong>Marca com proposito</strong>
            <p>Nao trata sobre desorganizacao moral. Trata sobre sistema.</p>
          </article>
        </div>
      </section>

      <section className="content-section">
        <SectionHeading
          eyebrow="FAQ"
          title="Perguntas frequentes"
          description="As respostas abaixo reforcam o posicionamento e reduzem objecoes logo no primeiro contato."
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
          <h2>Sua mente nao precisa carregar tudo sozinha.</h2>
          <p>Assine a Sara e transforme memoria solta em sistema confiavel.</p>
        </div>
        <Button href="/assinatura">Ir para assinatura</Button>
      </section>
    </PageShell>
  );
}
