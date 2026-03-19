"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

export function EmailLoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("demo@sara.app");
  const [code, setCode] = useState("");
  const [debugCode, setDebugCode] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function requestCode() {
    setPending(true);
    setMessage(null);

    const response = await fetch("/api/auth/request-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    const payload = (await response.json()) as { ok: boolean; message?: string; debugCode?: string };
    setPending(false);

    if (!payload.ok) {
      setMessage(payload.message ?? "Nao foi possivel enviar o codigo.");
      return;
    }

    setDebugCode(payload.debugCode ?? null);
    setStep("code");
    setMessage("Codigo enviado para o email informado.");
  }

  async function verifyCode() {
    setPending(true);
    setMessage(null);

    const response = await fetch("/api/auth/verify-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, code })
    });

    const payload = (await response.json()) as { ok: boolean; message?: string };
    setPending(false);

    if (!payload.ok) {
      setMessage(payload.message ?? "Codigo invalido.");
      return;
    }

    startTransition(() => {
      router.push("/painel");
      router.refresh();
    });
  }

  return (
    <div className="auth-card">
      <label className="input-group">
        <span>Email</span>
        <input
          type="email"
          placeholder="voce@exemplo.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      {step === "code" ? (
        <label className="input-group">
          <span>Codigo</span>
          <input
            type="text"
            placeholder="000000"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
        </label>
      ) : null}
      <button
        className="button button--primary button--full"
        type="button"
        onClick={step === "email" ? requestCode : verifyCode}
        disabled={pending}
      >
        {step === "email" ? "Enviar codigo por email" : "Entrar no painel"}
      </button>
      {step === "code" ? (
        <button className="button button--secondary button--full" type="button" onClick={() => setStep("email")}>
          Trocar email
        </button>
      ) : null}
      {message ? <p>{message}</p> : null}
      {debugCode ? <p>Codigo de desenvolvimento: {debugCode}</p> : null}
    </div>
  );
}
