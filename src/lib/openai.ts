// Cliente mínimo da API da OpenAI usando fetch (sem SDK).
// Requer OPENAI_API_KEY no .env.

const API_URL = "https://api.openai.com/v1/chat/completions";

/** Modelo principal do chat (pode ser trocado via env). */
export const CHAT_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

export interface ChatMsg {
  role: "system" | "user" | "assistant";
  content: string;
}

export class OpenAIError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function requireKey(): string {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new OpenAIError(
      "A chave da OpenAI não está configurada. Adicione OPENAI_API_KEY ao arquivo .env e reinicie o servidor.",
      503,
    );
  }
  return key;
}

/**
 * Chama a API em modo streaming e devolve um ReadableStream de texto puro
 * (apenas os deltas de conteúdo), pronto para ser consumido no cliente.
 * `onDone` recebe o texto completo ao final.
 */
export async function streamChat(
  messages: ChatMsg[],
  onDone?: (fullText: string) => Promise<void> | void,
): Promise<ReadableStream<Uint8Array>> {
  const key = requireKey();

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 800,
    }),
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw new OpenAIError(
      `A OpenAI recusou a requisição (HTTP ${res.status}). ${detail.slice(0, 300)}`,
      res.status,
    );
  }

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  const reader = res.body.getReader();
  let full = "";
  let buffer = "";

  return new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();

      if (done) {
        if (onDone) await onDone(full);
        controller.close();
        return;
      }

      buffer += decoder.decode(value, { stream: true });

      // O protocolo SSE separa eventos por linha em branco dupla.
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") continue;
        try {
          const json = JSON.parse(data);
          const delta: string | undefined = json.choices?.[0]?.delta?.content;
          if (delta) {
            full += delta;
            controller.enqueue(encoder.encode(delta));
          }
        } catch {
          // Fragmento incompleto — ignora e espera o próximo chunk.
        }
      }
    },
    cancel() {
      void reader.cancel();
    },
  });
}

/** Chamada simples (sem streaming) — usada para tarefas curtas. */
export async function completeChat(
  messages: ChatMsg[],
  maxTokens = 200,
): Promise<string> {
  const key = requireKey();
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages,
      temperature: 0.3,
      max_tokens: maxTokens,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new OpenAIError(`HTTP ${res.status}. ${detail.slice(0, 300)}`, res.status);
  }
  const json = await res.json();
  return json.choices?.[0]?.message?.content?.trim() ?? "";
}

export function isOpenAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}
