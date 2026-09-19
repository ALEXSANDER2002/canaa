import { db } from "@/lib/db";
import { resolveApiUser, unauthorized } from "@/lib/api-auth";

export const runtime = "nodejs";

/** GET /api/v1/conversations/:id → conversa com o histórico de mensagens. */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await resolveApiUser(req);
  if (!userId) return unauthorized();

  const { id } = await params;

  // O filtro por userId garante que uma usuária não leia a conversa de outra.
  const conversation = await db.conversation.findFirst({
    where: { id, userId },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      messages: {
        orderBy: { createdAt: "asc" },
        select: { id: true, role: true, content: true, createdAt: true },
      },
    },
  });

  if (!conversation) {
    return Response.json({ error: "Conversa não encontrada." }, { status: 404 });
  }

  return Response.json({ conversation });
}

/** DELETE /api/v1/conversations/:id — apaga a conversa e suas mensagens. */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await resolveApiUser(req);
  if (!userId) return unauthorized();

  const { id } = await params;
  const { count } = await db.conversation.deleteMany({ where: { id, userId } });

  if (count === 0) {
    return Response.json({ error: "Conversa não encontrada." }, { status: 404 });
  }

  return Response.json({ ok: true });
}

export { corsPreflight as OPTIONS } from "@/lib/api-auth";
