import { db } from "@/lib/db";
import { corsPreflight } from "@/lib/api-auth";
import { VALIDADE_VERIFICACAO_DIAS } from "@core/protecao";

export const runtime = "nodejs";

/**
 * GET /api/v1/apoio/servicos → rede de apoio local, com contatos verificados.
 *
 * Sem autenticação e sem registro de acesso, pelo mesmo motivo: quem procura
 * este endereço pode estar em risco e pode não ter conta. Nenhuma linha desta
 * rota grava quem consultou — e essa ausência é uma funcionalidade, não um
 * esquecimento. A tela do app promete que não fica rastro; aqui é onde essa
 * promessa se cumpre ou se quebra.
 *
 * `?kind=violencia` filtra por tipo de serviço.
 *
 * Contato com verificação vencida NÃO sai daqui. Telefone de delegacia e de
 * casa-abrigo muda e ninguém avisa; passados 90 dias sem alguém confirmar que
 * o número atende, é melhor a tela mostrar só 180 e 190 — que valem em
 * qualquer município do país — do que mandar alguém em risco para uma linha
 * que toca no vazio. O corte acontece aqui, e não na interface, para que valha
 * igual na web e no app.
 */
export async function GET(req: Request) {
  const kind = new URL(req.url).searchParams.get("kind");

  const limite = new Date(
    Date.now() - VALIDADE_VERIFICACAO_DIAS * 24 * 60 * 60 * 1000,
  );

  const servicos = await db.supportService.findMany({
    where: {
      active: true,
      verifiedAt: { gte: limite },
      ...(kind ? { kind } : {}),
    },
    orderBy: [{ ordem: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      kind: true,
      address: true,
      phone: true,
      hours: true,
      notes: true,
    },
  });

  return Response.json({ servicos });
}

export { corsPreflight as OPTIONS };
