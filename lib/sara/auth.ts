import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/lib/config/env";
import { getRepository } from "./repository";
import { addDays, addMinutes, generateLoginCode, generateSessionToken, hashValue } from "./utils";
import { sendLoginCodeEmail } from "./email";

export async function requestEmailLoginCode(email: string) {
  const repository = getRepository();
  const normalizedEmail = email.trim().toLowerCase();
  const user = await repository.findActiveUserByEmail(normalizedEmail);

  if (!user) {
    return { ok: false as const, message: "Conta nao encontrada ou assinatura inativa." };
  }

  const code = generateLoginCode();
  const expiresAt = addMinutes(new Date(), env.AUTH_CODE_TTL_MINUTES);

  await repository.saveLoginCode({
    userId: user.id,
    email: normalizedEmail,
    codeHash: hashValue(code),
    expiresAt
  });

  await sendLoginCodeEmail({ email: normalizedEmail, code });

  return {
    ok: true as const,
    debugCode: env.NODE_ENV !== "production" ? code : undefined
  };
}

export async function verifyEmailLoginCode(email: string, code: string) {
  const repository = getRepository();
  const user = await repository.consumeLoginCode(email.trim().toLowerCase(), hashValue(code.trim()), new Date());

  if (!user) {
    return { ok: false as const, message: "Codigo invalido ou expirado." };
  }

  const token = generateSessionToken();
  const expiresAt = addDays(new Date(), env.AUTH_SESSION_DAYS);
  const session = await repository.createSession({ user, token, expiresAt });
  const cookieStore = await cookies();

  cookieStore.set(env.AUTH_COOKIE_NAME, session.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    expires: session.expiresAt
  });

  return { ok: true as const, user: session.user };
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(env.AUTH_COOKIE_NAME)?.value;

  if (!token) return null;

  const repository = getRepository();
  return repository.getSession(token);
}

export async function requireSession() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function logoutCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(env.AUTH_COOKIE_NAME)?.value;

  if (token) {
    const repository = getRepository();
    await repository.deleteSession(token);
  }

  cookieStore.delete(env.AUTH_COOKIE_NAME);
}
