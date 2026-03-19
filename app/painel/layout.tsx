import type { ReactNode } from "react";
import { requireSession } from "@/lib/sara/auth";

export default async function PainelLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  await requireSession();
  return children;
}
