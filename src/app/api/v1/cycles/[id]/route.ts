import { db } from "@/lib/db";
import { resolveApiUser, unauthorized } from "@/lib/api-auth";

export const runtime = "nodejs";

/**
 * DELETE /api/v1/cycles/:id
 *
 * Usa `deleteMany` com `userId` no filtro — mesmo padrão de isolamento das
 * Server Actions: uma usuária nunca consegue apagar o registro de outra,
 * mesmo passando um id válido de terceiros.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await resolveApiUser(req);
  if (!userId) return unauthorized();

  const { id } = await params;
  const { count } = await db.cycleEntry.deleteMany({ where: { id, userId } });

  if (count === 0) {
    return Response.json({ error: "Registro não encontrado." }, { status: 404 });
  }

  return Response.json({ ok: true });
}

export { corsPreflight as OPTIONS } from "@/lib/api-auth";
