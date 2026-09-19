import { db } from "@/lib/db";
import { corsPreflight } from "@/lib/api-auth";

export const runtime = "nodejs";

/**
 * GET /api/v1/cidade/acoes → ações sociais divulgadas pela Prefeitura.
 *
 * SEM autenticação, de propósito. É conteúdo público do município: mutirão de
 * preventivo, campanha de vacinação, atendimento do CRAS. Exigir conta para
 * ver o que a Prefeitura está oferecendo inverteria a lógica — a informação
 * existe justamente para alcançar quem ainda não está dentro.
 */
export async function GET() {
  const acoes = await db.cityAction.findMany({
    where: { active: true },
    orderBy: [
      // Fixadas primeiro, depois as que começam mais cedo. `startsAt` nulo é
      // ação contínua: fica no fim da fila de datas, mas continua visível.
      { pinned: "desc" },
      { startsAt: "asc" },
      { createdAt: "desc" },
    ],
    select: {
      id: true,
      title: true,
      summary: true,
      category: true,
      location: true,
      startsAt: true,
      endsAt: true,
      contact: true,
      url: true,
      pinned: true,
    },
  });

  return Response.json({ acoes });
}

export { corsPreflight as OPTIONS };
