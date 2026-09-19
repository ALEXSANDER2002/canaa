import { z } from "zod";

import { streamChat, OpenAIError, type ChatMsg } from "@/lib/openai";
import { PROMPT_ACOLHIMENTO } from "@core/protecao";
import { corsPreflight } from "@/lib/api-auth";

export const runtime = "nodejs";

/**
 * POST /api/acolhimento — modo acolhimento da assistente.
 *
 * É uma rota separada de `/api/chat` por uma razão que não é organizacional:
 * `/api/chat` grava. Ela persiste cada mensagem em `ChatMessage`, atualiza a
 * conversa e ainda extrai fatos duráveis para `ChatMemory` — que é justamente
 * o que faz a assistente parecer conhecer a usuária.
 *
 * Aqui nada disso pode acontecer. Um registro de "ela relatou agressão em
 * março" num banco de dados é prova contra ela se o aparelho, a conta ou o
 * servidor forem acessados por quem não devia. Então esta rota:
 *
 * - não recebe `conversationId` e não cria nenhum;
 * - não escreve uma linha no banco, em tabela nenhuma;
 * - não injeta contexto da usuária no prompt (nem ciclo, nem humor, nem nome);
 * - não exige autenticação, porque exigir login seria vincular a conversa a
 *   uma conta — e porque quem procura esta tela pode não ter conta.
 *
 * O histórico vem do cliente a cada chamada e vive só na memória da tela.
 * Fechou, acabou.
 *
 * Reescrever isto para "só guardar um resumo" ou "só contar as mensagens"
 * quebra a promessa que a tela faz por escrito em `AVISO_ACOLHIMENTO_SEM_MEMORIA`.
 */
const bodySchema = z.object({
  mensagens: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(4000),
      }),
    )
    .min(1)
    .max(30),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Requisição inválida." },
      { status: 400 },
    );
  }

  const messages: ChatMsg[] = [
    { role: "system", content: PROMPT_ACOLHIMENTO },
    ...parsed.data.mensagens,
  ];

  try {
    // Sem callback de conclusão: não há o que salvar quando o texto termina.
    const stream = await streamChat(messages);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    const conhecido = error instanceof OpenAIError;
    const status = conhecido ? error.status : 500;
    const detalhe = conhecido
      ? error.message
      : "Não foi possível conversar agora. Se o perigo é agora, ligue 190. Para orientação, 180.";
    // Sem `console.error` com o conteúdo: log de servidor é rastro.
    console.error("[/api/acolhimento] falha ao responder");
    return Response.json({ error: detalhe }, { status });
  }
}

export { corsPreflight as OPTIONS };
