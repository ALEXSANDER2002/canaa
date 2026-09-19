import { db } from "@/lib/db";
import { resolveApiUser, unauthorized } from "@/lib/api-auth";

export const runtime = "nodejs";

/** GET /api/v1/conversations → conversas da usuária, mais recentes primeiro. */
export async function GET(req: Request) {
  const userId = await resolveApiUser(req);
  if (!userId) return unauthorized();

  const conversations = await db.conversation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, createdAt: true, updatedAt: true },
  });

  return Response.json({ conversations });
}

/**
 * POST /api/v1/conversations → cria uma conversa vazia.
 *
 * O fluxo do app é: criar aqui, depois enviar mensagens para `/api/chat`
 * com o `conversationId` retornado. O título é preenchido automaticamente
 * pela primeira mensagem, igual à web.
 */
export async function POST(req: Request) {
  const userId = await resolveApiUser(req);
  if (!userId) return unauthorized();

  const conversation = await db.conversation.create({
    data: { userId },
    select: { id: true, title: true, createdAt: true, updatedAt: true },
  });

  return Response.json({ conversation }, { status: 201 });
}

export { corsPreflight as OPTIONS } from "@/lib/api-auth";
