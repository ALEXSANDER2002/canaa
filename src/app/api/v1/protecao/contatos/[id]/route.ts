import { db } from "@/lib/db";
import { resolveApiUser, unauthorized, corsPreflight } from "@/lib/api-auth";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/** Confirma que a pessoa aceitou fazer parte da rede. */
export async function PATCH(req: Request, { params }: Ctx) {
  const userId = await resolveApiUser(req);
  if (!userId) return unauthorized();
  const { id } = await params;

  const { count } = await db.trustedContact.updateMany({
    where: { id, userId },
    data: { status: "aceito", acceptedAt: new Date() },
  });
  if (count === 0) {
    return Response.json({ error: "Contato não encontrado." }, { status: 404 });
  }

  return Response.json({ ok: true });
}

export async function DELETE(req: Request, { params }: Ctx) {
  const userId = await resolveApiUser(req);
  if (!userId) return unauthorized();
  const { id } = await params;

  // `deleteMany` com userId no filtro: impede apagar o contato de outra conta
  // mesmo conhecendo o id.
  await db.trustedContact.deleteMany({ where: { id, userId } });
  return Response.json({ ok: true });
}

export { corsPreflight as OPTIONS };
