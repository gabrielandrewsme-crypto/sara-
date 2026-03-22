"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ChatState } from "@/lib/sara/types";

type ChatDockProps = {
  expanded?: boolean;
};

const emptyState: ChatState = {
  conversationId: "",
  messages: [],
  recentActions: [],
  suggestedPrompts: []
};

export function ChatDock({ expanded = false }: ChatDockProps) {
  const router = useRouter();
  const [chat, setChat] = useState<ChatState>(emptyState);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;

    async function loadState() {
      const response = await fetch("/api/chat/state", { cache: "no-store" });
      const payload = (await response.json()) as { ok: boolean; data?: ChatState; message?: string };
      if (!active) return;

      if (!payload.ok || !payload.data) {
        setError(payload.message ?? "Nao foi possivel carregar o chat.");
        setLoading(false);
        return;
      }

      setChat(payload.data);
      setLoading(false);
    }

    void loadState();
    return () => {
      active = false;
    };
  }, []);

  async function submit(content: string) {
    const trimmed = content.trim();
    if (!trimmed) return;

    setError(null);
    setMessage("");
    startTransition(() => {
      setChat((current) => ({
        ...current,
        messages: [
          ...current.messages,
          {
            id: `pending-${Date.now()}`,
            role: "user",
            content: trimmed,
            createdAt: new Date().toISOString()
          }
        ]
      }));
    });

    const response = await fetch("/api/chat/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ content: trimmed })
    });

    const payload = (await response.json()) as { ok: boolean; data?: ChatState; message?: string };
    if (!payload.ok || !payload.data) {
      setError(payload.message ?? "Nao foi possivel processar sua mensagem.");
      return;
    }

    setChat(payload.data);
    router.refresh();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit(message);
  }

  return (
    <aside className={`chat-dock ${expanded ? "chat-dock--expanded" : ""}`}>
      <div className="chat-dock__header">
        <div>
          <span className="eyebrow">Chat da Sara</span>
          <h2>{expanded ? "Conversa operacional" : "Organize pelo chat"}</h2>
        </div>
        <div className="chat-status">{isPending ? "Pensando..." : "Online"}</div>
      </div>

      <div className="chat-dock__body">
        {loading ? <p>Carregando conversa...</p> : null}
        {error ? <p className="chat-error">{error}</p> : null}
        {!loading ? (
          <div className="chat-thread">
            {chat.messages.map((entry) => (
              <div
                key={entry.id}
                className={`chat-bubble ${entry.role === "assistant" ? "chat-bubble--assistant" : "chat-bubble--user"}`}
              >
                <strong>{entry.role === "assistant" ? "Sara" : "Voce"}</strong>
                <p>{entry.content}</p>
              </div>
            ))}
          </div>
        ) : null}

        {chat.recentActions.length ? (
          <div className="chat-actions">
            <span className="eyebrow">Acoes recentes</span>
            {chat.recentActions.slice(0, expanded ? 6 : 3).map((action) => (
              <div key={action.id} className="chat-action-card">
                <strong>{action.actionType}</strong>
                <p>{action.summary}</p>
              </div>
            ))}
          </div>
        ) : null}

        {chat.suggestedPrompts.length ? (
          <div className="chat-prompts">
            {chat.suggestedPrompts.slice(0, expanded ? 4 : 2).map((prompt) => (
              <button key={prompt} type="button" className="chat-prompt" onClick={() => void submit(prompt)}>
                {prompt}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <form className="chat-dock__composer" onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Peça para criar, reorganizar, consultar ou concluir algo no painel."
          rows={expanded ? 4 : 3}
        />
        <button type="submit" className="button button--primary button--full" disabled={!message.trim() || isPending}>
          Enviar para a Sara
        </button>
      </form>
    </aside>
  );
}
