import { redirect } from "next/navigation";
import { LoginPage } from "@/components/marketing/login-page";
import { getCurrentSession } from "@/lib/sara/auth";

export default async function LoginRoute() {
  const session = await getCurrentSession();

  if (session) {
    redirect("/painel");
  }

  return <LoginPage />;
}
