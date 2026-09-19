"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export interface ChatMessageView {
  id: string;
  role: string;
  content: string;
}

const SUGGESTIONS = [
  "Por que minha cólica vem tão forte?",
  "O que muda no corpo na fase lútea?",
  "Como sei se meu ciclo está irregular?",
  "Quais exames preventivos eu deveria fazer?",
];

export function ChatWindow({
  conversationId,
  initialMessages,
}: {
  conversationId: string;
  initialMessages: ChatMessageView[];
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessageView[]>(initialMessages);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mantém a visão no fim da conversa.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, streaming]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || pending) return;

    setError(null);
    setInput("");
    setPending(true);
    setMessages((prev) => [
      ...prev,
      { id: `local-${Date.now()}`, role: "user", content },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: content }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.error ?? "Não foi possível falar com a assistente agora.",
        );
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setStreaming(acc);
      }

      if (acc.trim()) {
        setMessages((prev) => [
          ...prev,
          { id: `local-a-${Date.now()}`, role: "assistant", content: acc },
        ]);
      }
      setStreaming("");
      // Atualiza a lista de conversas (título/ordem) no servidor.
      router.refresh();
    } catch (err) {
      setStreaming("");
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setPending(false);
      textareaRef.current?.focus();
    }
  }

  const isEmpty = messages.length === 0 && !streaming;

  return (
    <div className="flex h-[calc(100vh-13rem)] min-h-96 flex-col">
      {/* Mensagens */}
      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {isEmpty && (
          <div className="py-6">
            <p className="text-sm text-muted">
              Pergunte o que quiser sobre seu ciclo, gestação, bem-estar ou
              prevenção. A assistente conhece seus registros no app.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-line px-3.5 py-2 text-left text-sm text-ink transition-colors hover:border-plum-300 hover:bg-plum-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <Bubble key={m.id} role={m.role} content={m.content} />
        ))}

        {streaming && <Bubble role="assistant" content={streaming} />}

        {pending && !streaming && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <span className="flex gap-1">
              <Dot delay="0ms" />
              <Dot delay="150ms" />
              <Dot delay="300ms" />
            </span>
            escrevendo…
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Entrada */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="mt-4 border-t border-line pt-4"
      >
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
            }}
            rows={1}
            placeholder="Escreva sua pergunta…"
            className="max-h-40 min-h-12 flex-1 resize-y rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted/60 focus:border-plum-400 focus:outline-none focus:ring-2 focus:ring-plum-200"
          />
          <button
            type="submit"
            disabled={pending || !input.trim()}
            aria-label="Enviar"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-plum-700 text-white transition-transform active:scale-95 disabled:opacity-40"
          >
            <Icon name="arrow" className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
        <p className="mt-2 text-xs text-muted">
          Conteúdo educativo gerado por IA. Não substitui avaliação profissional.
          Em emergência, ligue 192.
        </p>
      </form>
    </div>
  );
}

function Bubble({ role, content }: { role: string; content: string }) {
  const isUser = role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] whitespace-pre-wrap rounded-[var(--radius-card)] px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-plum-700 text-white"
            : "border border-line bg-mist text-ink",
        )}
      >
        {content}
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="animate-typing-dot inline-block h-1.5 w-1.5 rounded-full bg-plum-400"
      style={{ animationDelay: delay }}
    />
  );
}
