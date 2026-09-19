import { z } from "zod";

import { db } from "@/lib/db";
import { resolveApiUser, unauthorized, badRequest } from "@/lib/api-auth";

export const runtime = "nodejs";

const schema = z.object({
  tipo: z.enum(["post", "reply"]),
  id: z.string().min(1),
});

/** A partir de quantas denúncias o conteúdo some do feed automaticamente. */
const LIMITE_OCULTAR = 3;

/**
 * POST /api/v1/community/report — Body: { tipo, id }
 *
 * Denúncia. Ao chegar a três, o conteúdo é ocultado automaticamente até
 * revisão humana.
 *
 * O corte automático existe porque um app de saúde não pode depender de
 * alguém estar acordado para moderar: é melhor esconder um relato legítimo
 * por engano e revisar depois do que deixar desinformação sobre gravidez ou
 * sangramento circulando a noite toda.
 */
export async function POST(req: Request) {
  const userId = await resolveApiUser(req);
  if (!userId) return unauthorized();

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest("Requisição inválida.");

  const { tipo, id } = parsed.data;

  if (tipo === "post") {
    const post = await db.communityPost.findUnique({
      where: { id },
      select: { reports: true },
    });
    if (!post) {
      return Response.json({ error: "Não encontrado." }, { status: 404 });
    }
    const reports = post.reports + 1;
    await db.communityPost.update({
      where: { id },
      data: { reports, hidden: reports >= LIMITE_OCULTAR },
    });
    return Response.json({ ok: true, ocultado: reports >= LIMITE_OCULTAR });
  }

  const reply = await db.communityReply.findUnique({
    where: { id },
    select: { reports: true },
  });
  if (!reply) {
    return Response.json({ error: "Não encontrado." }, { status: 404 });
  }
  const reports = reply.reports + 1;
  await db.communityReply.update({
    where: { id },
    data: { reports, hidden: reports >= LIMITE_OCULTAR },
  });

  return Response.json({ ok: true, ocultado: reports >= LIMITE_OCULTAR });
}

export { corsPreflight as OPTIONS } from "@/lib/api-auth";
