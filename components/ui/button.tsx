import Link from "next/link";
import type { ReactNode } from "react";

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  href,
  children,
  variant = "primary"
}: ButtonProps) {
  return (
    <Link href={href} className={`button button--${variant}`}>
      {children}
    </Link>
  );
}
