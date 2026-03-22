import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ChatDock } from "./chat-dock";

type ProductShellProps = {
  current:
    | "dashboard"
    | "chat"
    | "tarefas"
    | "listas"
    | "minha-conta"
    | "rotina"
    | "lembretes"
    | "agenda"
    | "financas"
    | "notas"
    | "ideias";
  children: ReactNode;
  title: string;
  subtitle: string;
  showChatDock?: boolean;
};

const navItems = [
  { key: "dashboard", href: "/painel", label: "Dashboard", icon: "DG" },
  { key: "chat", href: "/painel/chat", label: "Chat", icon: "CH" },
  { key: "tarefas", href: "/painel/tarefas", label: "Tarefas", icon: "TF" },
  { key: "listas", href: "/painel/listas", label: "Listas", icon: "LS" },
  { key: "minha-conta", href: "/painel/minha-conta", label: "Minha Conta", icon: "MC" },
  { key: "rotina", href: "/painel/rotina", label: "Rotina", icon: "RT" },
  { key: "lembretes", href: "/painel/lembretes", label: "Lembretes", icon: "LE" },
  { key: "agenda", href: "/painel/agenda", label: "Agenda", icon: "AG" },
  { key: "financas", href: "/painel/financas", label: "Financas", icon: "FN" },
  { key: "notas", href: "/painel/notas", label: "Notas", icon: "NT" },
  { key: "ideias", href: "/painel/ideias", label: "Ideias", icon: "ID" }
] as const;

export function ProductShell({
  current,
  children,
  title,
  subtitle,
  showChatDock = true
}: ProductShellProps) {
  return (
    <div className="product-shell">
      <aside className="product-sidebar">
        <BrandLogo />
        <nav className="product-nav" aria-label="Navegação do app">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={current === item.key ? "is-active" : undefined}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="product-sidebar__footer">
          <p>Sara organiza sua mente em modulos simples e conectados.</p>
          <Link href="/" className="button button--ghost">
            Voltar ao site
          </Link>
        </div>
      </aside>

      <div className="product-main">
        <header className="product-topbar">
          <div>
            <span className="eyebrow">Painel Sara</span>
            <h1 className="product-title">{title}</h1>
            <p className="product-subtitle">{subtitle}</p>
          </div>
          <div className="product-topbar__actions">
            <div className="product-chip">Hoje 3 prioridades</div>
            <div className="product-chip">Chat nativo ativo</div>
            <button type="button" className="product-avatar">
              SO
            </button>
          </div>
        </header>
        <div className="product-workspace">
          <section className="product-content">{children}</section>
          {showChatDock ? <ChatDock /> : null}
        </div>
      </div>
    </div>
  );
}
