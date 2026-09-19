import { db } from "@/lib/db";
import {
  resolveApiUser,
  unauthorized,
  badRequest,
  corsPreflight,
} from "@/lib/api-auth";
import { partnerAcceptSchema } from "@/lib/validations";

export const runtime = "nodejs";

/** POST /api/v1/acompanhante/aceitar — Body: { codigo } */
export async function POST(req: Request) {
  const userId = await resolveApiUser(req);
  if (!userId) return unauthorized();

  const parsed = partnerAcceptSchema.safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Código inválido.");
  }

  const vinculo = await db.partnerLink.findUnique({
    where: { codigo: parsed.data.codigo },
  });

  // Mesma mensagem para inexistente, já usado e próprio: distinguir ensinaria
  // a quem tenta códigos quais deles existem.
  if (!vinculo || vinculo.status !== "pendente" || vinculo.ownerId === userId) {
    return badRequest("Código inválido ou já usado.");
  }

  await db.partnerLink.update({
    where: { id: vinculo.id },
    data: { partnerId: userId, status: "ativo", acceptedAt: new Date() },
  });

  return Response.json({ ok: true });
}

export { corsPreflight as OPTIONS };
