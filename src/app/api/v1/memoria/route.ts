import { db } from "@/lib/db";
import { resolveApiUser, unauthorized, corsPreflight } from "@/lib/api-auth";

export const runtime = "nodejs";

/**
 * Memória de longo prazo da assistente.
 *
 * O app promete, em texto, que ela vê tudo o que foi guardado e apaga o que
 * quiser. Enquanto esse controle só existia numa página web que o celular não
 * consegue abrir logado, a promessa não se cumpria — daí estas rotas.
 */

/** GET /api/v1/memoria → tudo o que a assistente guardou sobre a usuária. */
export async function GET(req: Request) {
  const userId = await resolveApiUser(req);
  if (!userId) return unauthorized();

  const memorias = await db.chatMemory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, fact: true, createdAt: true },
  });

  return Response.json({ memorias });
}

/** DELETE /api/v1/memoria → apaga TUDO de uma vez. */
export async function DELETE(req: Request) {
  const userId = await resolveApiUser(req);
  if (!userId) return unauthorized();

  // `deleteMany` filtrado por `userId` e não por id solto: é a garantia de que
  // uma requisição forjada nunca alcança a memória de outra pessoa.
  const { count } = await db.chatMemory.deleteMany({ where: { userId } });
  return Response.json({ apagadas: count });
}

export { corsPreflight as OPTIONS };
