import { z } from "zod";

import { resolveApiUser } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { streamChat, OpenAIError, type ChatMsg } from "@/lib/openai";
import { buildSystemPrompt, learnFromExchange } from "@/lib/chat-context";

// Node runtime: usa Prisma e variáveis de ambiente do servidor.
export const runtime = "nodejs";

const bodySchema = z.object({
  conversationId: z.string().min(1),
  message: z.string().trim().min(1, "Escreva uma mensagem.").max(4000),
});

/** Quantas mensagens do histórico enviar como contexto da conversa. */
const HISTORY_LIMIT = 20;

export async function POST(req: Request) {
  // Aceita cookie de sessão (web) ou Bearer token (app Expo) — mesma rota,
  // mesmo streaming, mesma memória de longo prazo nos dois clientes.
  const userId = await resolveApiUser(req);
  if (!userId) {
    return Response.json({ error: "Não autorizado." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Requisição inválida." },
      { status: 400 },
    );
  }
  const { conversationId, message } = parsed.data;

  // Garante que a conversa pertence à usuária.
  const conversation = await db.conversation.findFirst({
    where: { id: conversationId, userId },
    select: { id: true, title: true },
  });
  if (!conversation) {
    return Response.json({ error: "Conversa não encontrada." }, { status: 404 });
  }

  // Histórico desta conversa (contexto isolado por conversa).
  const history = await db.chatMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
    take: HISTORY_LIMIT,
    select: { role: true, content: true },
  });
  history.reverse();

  const systemPrompt = await buildSystemPrompt(userId);

  const messages: ChatMsg[] = [
    { role: "system", content: systemPrompt },
    ...history.map((m) => ({
      role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
      content: m.content,
    })),
    { role: "user", content: message },
  ];

  // Salva a mensagem da usuária antes de chamar o modelo.
  await db.chatMessage.create({
    data: { conversationId, role: "user", content: message },
  });

  // Primeira mensagem? Usa um trecho dela como título da conversa.
  if (history.length === 0) {
    await db.conversation.update({
      where: { id: conversationId },
      data: {
        title: message.length > 48 ? `${message.slice(0, 48)}…` : message,
      },
    });
  }

  try {
    const stream = await streamChat(messages, async (fullText) => {
      if (!fullText.trim()) return;
      await db.chatMessage.create({
        data: { conversationId, role: "assistant", content: fullText },
      });
      await db.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });
      // Aprende com a troca (não bloqueia a resposta já entregue).
      await learnFromExchange(userId, message, fullText);
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    const isKnown = error instanceof OpenAIError;
    const status = isKnown ? error.status : 500;
    const detail = isKnown
      ? error.message
      : "Não foi possível falar com a assistente agora. Tente novamente.";
    console.error("[/api/chat]", error);
    return Response.json({ error: detail }, { status });
  }
}

export { corsPreflight as OPTIONS } from "@/lib/api-auth";
