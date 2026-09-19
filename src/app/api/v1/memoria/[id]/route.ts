import { db } from "@/lib/db";
import { resolveApiUser, unauthorized, corsPreflight } from "@/lib/api-auth";

export const runtime = "nodejs";

/** DELETE /api/v1/memoria/[id] → apaga um fato específico. */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await resolveApiUser(req);
  if (!userId) return unauthorized();

  const { id } = await params;

  // Filtra por `id` E `userId` na mesma cláusula. Buscar por id e conferir o
  // dono depois deixaria uma janela para apagar memória alheia com um id
  // adivinhado; assim o registro de outra pessoa simplesmente não é
  // encontrado, e a resposta é idêntica à de um id inexistente.
  const { count } = await db.chatMemory.deleteMany({ where: { id, userId } });

  if (count === 0) {
    return Response.json({ error: "Registro não encontrado." }, { status: 404 });
  }
  return Response.json({ ok: true });
}

export { corsPreflight as OPTIONS };
