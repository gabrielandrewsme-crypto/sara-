import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";

type PageShellProps = {
  children: ReactNode;
  current?: "home" | "assinatura" | "login" | "pos-compra";
};

const navItems = [
  { href: "/", label: "Visão geral", key: "home" },
  { href: "/assinatura", label: "Assinatura", key: "assinatura" },
  { href: "/login", label: "Login", key: "login" }
] as const;

export function PageShell({ children, current }: PageShellProps) {
  return (
    <div className="site-frame">
      <div className="ambient ambient--top" />
      <div className="ambient ambient--side" />
      <header className="site-header">
        <BrandLogo />
        <nav className="site-nav" aria-label="Navegação principal">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={current === item.key ? "is-active" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <p>Sara organiza sua mente fora da memória e dentro de um sistema confiável.</p>
        <span>Frontend visual inicial pronto para evoluir em Next.js.</span>
      </footer>
    </div>
  );
}
