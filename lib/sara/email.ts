import "server-only";
import { env } from "@/lib/config/env";

type SendLoginCodeInput = {
  email: string;
  code: string;
};

export async function sendLoginCodeEmail(input: SendLoginCodeInput) {
  if (env.EMAIL_PROVIDER === "console" || !env.EMAIL_PROVIDER_URL) {
    console.info(`[sara] login code for ${input.email}: ${input.code}`);
    return;
  }

  await fetch(env.EMAIL_PROVIDER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: env.EMAIL_PROVIDER_API_KEY ? `Bearer ${env.EMAIL_PROVIDER_API_KEY}` : ""
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: input.email,
      subject: "Seu codigo de acesso Sara",
      html: `<p>Seu codigo de acesso e <strong>${input.code}</strong>.</p>`
    })
  });
}
