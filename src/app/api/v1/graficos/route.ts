import { db } from "@/lib/db";
import { resolveApiUser, unauthorized, corsPreflight } from "@/lib/api-auth";

export const runtime = "nodejs";

const DIAS = 90;

/**
 * GET /api/v1/graficos → séries prontas para desenhar.
 *
 * O servidor já entrega ORDENADO e no formato final. O celular não deve
 * reordenar nem reagregar centenas de registros: em aparelho fraco — a regra
 * em Canaã — esse trabalho aparece como travamento na rolagem.
 */
export async function GET(req: Request) {
  const userId = await resolveApiUser(req);
  if (!userId) return unauthorized();

  const desde = new Date();
  desde.setDate(desde.getDate() - DIAS);

  const [ciclos, diarios, humores, medidas] = await Promise.all([
    db.cycleEntry.findMany({
      where: { userId },
      orderBy: { startDate: "asc" },
      select: { startDate: true },
    }),
    db.dailyLog.findMany({
      where: { userId, date: { gte: desde } },
      orderBy: { date: "asc" },
      select: { date: true, pain: true, energy: true, sleepHours: true },
    }),
    db.moodEntry.findMany({
      where: { userId, date: { gte: desde } },
      select: { mood: true },
    }),
    db.healthMetric.findMany({
      where: { userId, date: { gte: desde } },
      orderBy: { date: "asc" },
      select: { type: true, value: true, date: true },
    }),
  ]);

  /**
   * Duração de cada ciclo = distância até o início do SEGUINTE.
   *
   * Por isso o último início registrado não vira barra: o ciclo dele ainda não
   * terminou, e desenhar "8 dias" para um ciclo em andamento faria o gráfico
   * mentir sobre uma queda que não existe.
   */
  const duracoes: { inicio: string; dias: number }[] = [];
  for (let i = 0; i < ciclos.length - 1; i++) {
    const a = ciclos[i].startDate;
    const b = ciclos[i + 1].startDate;
    const dias = Math.round((b.getTime() - a.getTime()) / 86_400_000);
    if (dias > 0 && dias < 90) {
      duracoes.push({ inicio: a.toISOString(), dias });
    }
  }

  const humorContagem: Record<string, number> = {};
  for (const h of humores) {
    humorContagem[h.mood] = (humorContagem[h.mood] ?? 0) + 1;
  }

  return Response.json({
    duracoes,
    diarios: diarios.map((d) => ({
      data: d.date.toISOString(),
      dor: d.pain,
      energia: d.energy,
      sono: d.sleepHours,
    })),
    humorContagem,
    medidas: medidas.map((m) => ({
      tipo: m.type,
      valor: m.value,
      data: m.date.toISOString(),
    })),
  });
}

export { corsPreflight as OPTIONS };
