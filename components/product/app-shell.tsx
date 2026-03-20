import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";

type ProductShellProps = {
  current:
    | "dashboard"
    | "tarefas"
    | "minha-conta"
    | "rotina"
    | "lembretes"
    | "agenda"
    | "financas"
    | "notas"
    | "ideias"
    | "whatsapp";
  children: ReactNode;
  title: string;
  subtitle: string;
};

const navItems = [
  { key: "dashboard", href: "/painel", label: "Dashboard", icon: "DG" },
  { key: "tarefas", href: "/painel/tarefas", label: "Tarefas", icon: "TF" },
  { key: "minha-conta", href: "/painel/minha-conta", label: "Minha Conta", icon: "MC" },
  { key: "rotina", href: "/painel/rotina", label: "Rotina", icon: "RT" },
  { key: "lembretes", href: "/painel/lembretes", label: "Lembretes", icon: "LE" },
  { key: "agenda", href: "/painel/agenda", label: "Agenda", icon: "AG" },
  { key: "financas", href: "/painel/financas", label: "Financas", icon: "FN" },
  { key: "notas", href: "/painel/notas", label: "Notas", icon: "NT" },
  { key: "ideias", href: "/painel/ideias", label: "Ideias", icon: "ID" },
  { key: "whatsapp", href: "/painel/whatsapp", label: "WhatsApp", icon: "WA" }
] as const;

export function ProductShell({
  current,
  children,
  title,
  subtitle
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
            <div className="product-chip">WhatsApp central</div>
            <button type="button" className="product-avatar">
              SO
            </button>
          </div>
        </header>
        <section className="product-content">{children}</section>
      </div>
    </div>
  );
}
