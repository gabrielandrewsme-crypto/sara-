"use client";

import { useState } from "react";
import type { PanelData } from "@/lib/sara/types";
import { ProductShell } from "./app-shell";

type WhatsAppLinkPageProps = {
  data: PanelData;
};

export function WhatsAppLinkPage({ data }: WhatsAppLinkPageProps) {
  const [phone, setPhone] = useState(data.whatsapp.phoneNumber || "");
  const [savedPhone, setSavedPhone] = useState(data.whatsapp.phoneNumber || "");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const hasSavedPhone = savedPhone.length > 0;

  async function saveNumber() {
    setPending(true);
    setMessage(null);

    const response = await fetch("/api/whatsapp/link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ phoneNumber: phone })
    });

    const payload = (await response.json()) as { ok: boolean; message?: string; data?: { phoneNumber?: string | null } };
    setPending(false);

    if (!payload.ok) {
      setMessage(payload.message ?? "Nao foi possivel salvar o numero.");
      return;
    }

    setSavedPhone(payload.data?.phoneNumber ?? phone);
    setMessage("Numero salvo com sucesso.");
  }

  return (
    <ProductShell
      current="whatsapp"
      title="Vinculo com WhatsApp"
      subtitle="Esse e o canal principal de organizacao da Sara. O painel serve para visualizar e acompanhar."
    >
      <div className="product-grid product-grid--two-up">
        <article className="glass-panel">
          <div className="panel-header">
            <div>
              <h2>Conectar numero</h2>
              <p>Informe o numero que sera usado como centro da sua organizacao.</p>
            </div>
          </div>
          <div className="connection-form">
            <label className="input-group">
              <span>Numero de WhatsApp</span>
              <input
                type="tel"
                placeholder="+55 11 99999-9999"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </label>
            <button
              type="button"
              className="button button--primary button--full"
              onClick={saveNumber}
              disabled={!phone.trim() || pending}
            >
              Salvar numero
            </button>
            <a
              href={data.whatsapp.connectUrl ?? "#"}
              target="_blank"
              rel="noreferrer"
              className={`button button--secondary button--full ${!hasSavedPhone ? "button--disabled" : ""}`}
              aria-disabled={!hasSavedPhone}
              onClick={(event) => {
                if (!hasSavedPhone) {
                  event.preventDefault();
                }
              }}
            >
              Ir para o WhatsApp da Sara
            </a>
            <div className="connection-status">
              <strong>{hasSavedPhone ? "Numero salvo" : "Aguardando numero"}</strong>
              <p>
                {hasSavedPhone
                  ? `A Sara vai usar ${savedPhone} como canal principal de entrada.`
                  : "Depois de salvar, o acesso ao WhatsApp da Sara fica liberado neste fluxo visual."}
              </p>
            </div>
            {message ? <p>{message}</p> : null}
          </div>
        </article>

        <article className="glass-panel">
          <div className="panel-header">
            <div>
              <h2>Como a Sara funciona</h2>
              <p>Deixe o uso principal muito claro desde o primeiro contato.</p>
            </div>
          </div>
          <div className="stack-list">
            <div className="list-row">
              <div>
                <strong>1. Voce envia pelo WhatsApp</strong>
                <p>Tarefas, compromissos, lembretes, gastos, notas e ideias chegam por mensagem.</p>
              </div>
            </div>
            <div className="list-row">
              <div>
                <strong>2. A Sara organiza</strong>
                <p>Ela distribui isso em rotina, agenda, lembretes, financas, notas e ideias.</p>
              </div>
            </div>
            <div className="list-row">
              <div>
                <strong>3. O painel acompanha</strong>
                <p>O dashboard mostra o que esta ativo agora, sem ser o canal principal de criacao.</p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </ProductShell>
  );
}
