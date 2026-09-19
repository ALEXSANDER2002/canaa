import { db } from "@/lib/db";
import { corsPreflight } from "@/lib/api-auth";
import { oferece, type ServicoUnidade } from "@core/unidades";

export const runtime = "nodejs";

/**
 * GET /api/v1/saude/unidades?servico=preventivo
 *
 * Conteúdo público do município, como `/api/v1/cidade/acoes`: sem
 * autenticação, porque saber onde fazer um preventivo não deveria exigir
 * conta em lugar nenhum.
 */
export async function GET(req: Request) {
  const servico = new URL(req.url).searchParams.get("servico");

  const todas = await db.healthUnit.findMany({
    where: { ativa: true },
    orderBy: [{ bairro: "asc" }, { nome: "asc" }],
    select: {
      id: true,
      nome: true,
      tipo: true,
      endereco: true,
      bairro: true,
      telefone: true,
      horario: true,
      servicos: true,
      observacao: true,
      latitude: true,
      longitude: true,
    },
  });

  // Filtro em memória: `servicos` é uma lista em coluna de texto, e o SQLite
  // não sabe procurar dentro dela sem um LIKE que casaria "prenatal" com
  // "prenatal_alto_risco". Com a ordem de grandeza de unidades de um
  // município, filtrar aqui é mais barato do que a gambiarra de SQL.
  const unidades = servico
    ? todas.filter((u) => oferece(u, servico as ServicoUnidade))
    : todas;

  return Response.json({ unidades });
}

export { corsPreflight as OPTIONS };
