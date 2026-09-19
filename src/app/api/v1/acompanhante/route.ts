import { db } from "@/lib/db";
import {
  resolveApiUser,
  unauthorized,
  badRequest,
  corsPreflight,
} from "@/lib/api-auth";
import { partnerInviteSchema } from "@/lib/validations";
import { predictCycle, cyclePhase, pregnancyProgress } from "@/lib/utils";
import {
  gerarCodigoConvite,
  ESCOPOS_ACOMPANHANTE,
  temEscopo,
  dicaDoDia,
} from "@core/acompanhante";

export const runtime = "nodejs";

const VALORES = ESCOPOS_ACOMPANHANTE.map((e) => e.value) as string[];

function diaDoAno(d: Date): number {
  const inicio = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - inicio.getTime()) / 86_400_000);
}

/**
 * GET /api/v1/acompanhante
 *
 * Devolve os dois lados de uma vez: o vínculo que ela criou (`meuVinculo`) e,
 * se a pessoa autenticada acompanha alguém, o que ela tem direito de ver
 * (`visao`). Um app que precisa de duas chamadas para montar uma tela pisca.
 */
export async function GET(req: Request) {
  const userId = await resolveApiUser(req);
  if (!userId) return unauthorized();

  const [meu, acompanha] = await Promise.all([
    db.partnerLink.findFirst({
      where: { ownerId: userId, status: { in: ["pendente", "ativo"] } },
      select: {
        id: true,
        codigo: true,
        escopos: true,
        status: true,
        apelido: true,
        partner: { select: { name: true } },
      },
    }),
    db.partnerLink.findFirst({
      where: { partnerId: userId, status: "ativo" },
      select: {
        id: true,
        escopos: true,
        owner: { select: { id: true, name: true } },
      },
    }),
  ]);

  return Response.json({
    meuVinculo: meu
      ? {
          id: meu.id,
          codigo: meu.status === "pendente" ? meu.codigo : null,
          escopos: meu.escopos,
          status: meu.status,
          nome: meu.apelido ?? meu.partner?.name ?? null,
        }
      : null,
    visao: acompanha ? await montarVisao(acompanha) : null,
  });
}

/**
 * O que ELE vê.
 *
 * Cada consulta é feita só se o escopo correspondente estiver liberado — não
 * existe "busca tudo e esconde depois". E a dica fala com ele sobre o que
 * fazer, nunca sobre o corpo dela.
 */
async function montarVisao(vinculo: {
  escopos: string;
  owner: { id: string; name: string };
}) {
  const { escopos, owner } = vinculo;
  const querCiclo = temEscopo(escopos, "fase") || temEscopo(escopos, "previsao");

  const [ciclos, humor, gestacao] = await Promise.all([
    querCiclo
      ? db.cycleEntry.findMany({
          where: { userId: owner.id },
          orderBy: { startDate: "desc" },
          take: 12,
          select: { startDate: true },
        })
      : Promise.resolve([]),
    temEscopo(escopos, "humor")
      ? db.moodEntry.findFirst({
          where: { userId: owner.id },
          orderBy: { date: "desc" },
          // Sem `note`: ela liberou "como me sinto", não o que escreveu sobre.
          select: { mood: true },
        })
      : Promise.resolve(null),
    temEscopo(escopos, "gestacao")
      ? db.pregnancy.findFirst({
          where: { userId: owner.id, active: true },
          select: { lastPeriodDate: true },
        })
      : Promise.resolve(null),
  ]);

  const previsao = predictCycle(ciclos.map((c) => c.startDate));
  const fase =
    previsao && temEscopo(escopos, "fase")
      ? cyclePhase(
          previsao.currentCycleDay,
          previsao.cycleLength,
          previsao.periodLength,
        )
      : null;
  const progresso = gestacao ? pregnancyProgress(gestacao.lastPeriodDate) : null;

  return {
    nome: owner.name.split(" ")[0],
    escopos,
    fase: fase ? { chave: fase.key, label: fase.label } : null,
    proximaMenstruacao:
      temEscopo(escopos, "previsao") && previsao
        ? previsao.nextPeriodDate
        : null,
    humor: humor?.mood ?? null,
    gestacao: progresso
      ? { semanas: progresso.weeks, trimestre: progresso.trimester }
      : null,
    dica: fase ? dicaDoDia(fase.key, diaDoAno(new Date())) : null,
  };
}

/** POST /api/v1/acompanhante — cria (ou refaz) o convite. */
export async function POST(req: Request) {
  const userId = await resolveApiUser(req);
  if (!userId) return unauthorized();

  const corpo = (await req.json().catch(() => null)) as {
    escopos?: string[];
    apelido?: string | null;
  } | null;

  const escolhidos = (corpo?.escopos ?? []).filter((e) => VALORES.includes(e));

  const parsed = partnerInviteSchema.safeParse({
    escopos: escolhidos.join(","),
    apelido: corpo?.apelido ?? null,
  });
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Requisição inválida.");
  }

  await db.partnerLink.deleteMany({
    where: { ownerId: userId, status: { in: ["pendente", "revogado"] } },
  });

  let codigo = gerarCodigoConvite();
  for (let i = 0; i < 3; i++) {
    if (!(await db.partnerLink.findUnique({ where: { codigo } }))) break;
    codigo = gerarCodigoConvite();
  }

  const vinculo = await db.partnerLink.create({
    data: {
      ownerId: userId,
      codigo,
      escopos: parsed.data.escopos,
      apelido: parsed.data.apelido ?? null,
      status: "pendente",
    },
    select: { id: true, codigo: true, escopos: true, status: true },
  });

  return Response.json({ vinculo }, { status: 201 });
}

/**
 * DELETE /api/v1/acompanhante — encerra.
 *
 * Apaga em vez de arquivar, e não notifica ninguém. A tela dele simplesmente
 * para de mostrar.
 */
export async function DELETE(req: Request) {
  const userId = await resolveApiUser(req);
  if (!userId) return unauthorized();

  await db.partnerLink.deleteMany({ where: { ownerId: userId } });
  return Response.json({ ok: true });
}

export { corsPreflight as OPTIONS };
