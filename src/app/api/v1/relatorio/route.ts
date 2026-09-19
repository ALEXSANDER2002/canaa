import { db } from "@/lib/db";
import { resolveApiUser, unauthorized, corsPreflight } from "@/lib/api-auth";
import { montarRelatorio, relatorioEmTexto } from "@core/relatorio";

export const runtime = "nodejs";

/** Janela de bem-estar do relatório. Fixa aqui e no núcleo — os dois falam "30 dias". */
const DIAS = 30;

/**
 * GET /api/v1/relatorio → o resumo para levar à consulta.
 *
 * O cálculo vive em `@core/relatorio` e é o MESMO que a página impressa da web
 * usa. Duplicar a soma aqui seria o pior tipo de bug possível neste projeto:
 * dois documentos com números diferentes, e alguém decidindo conduta clínica
 * com base num deles.
 */
export async function GET(req: Request) {
  const userId = await resolveApiUser(req);
  if (!userId) return unauthorized();

  const desde = new Date();
  desde.setDate(desde.getDate() - DIAS);

  const [conta, ciclos, humores, diarios, medidas, gestacao] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { name: true, birthDate: true, goal: true },
    }),
    db.cycleEntry.findMany({
      where: { userId },
      orderBy: { startDate: "desc" },
      select: { startDate: true },
    }),
    db.moodEntry.findMany({
      where: { userId, date: { gte: desde } },
      select: { mood: true, date: true },
    }),
    db.dailyLog.findMany({
      where: { userId, date: { gte: desde } },
      select: { date: true, pain: true, energy: true },
    }),
    db.healthMetric.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 100,
      select: { type: true, value: true, value2: true, date: true },
    }),
    db.pregnancy.findFirst({
      where: { userId },
      select: { lastPeriodDate: true },
    }),
  ]);

  if (!conta) return unauthorized();

  const relatorio = montarRelatorio({
    conta,
    ciclos,
    humores,
    diarios,
    medidas,
    gestacao,
  });

  // O texto vem pronto do servidor para o app não precisar remontar a
  // formatação — e para o que ela compartilha ser byte a byte o que ela viu.
  return Response.json({ relatorio, texto: relatorioEmTexto(relatorio) });
}

export { corsPreflight as OPTIONS };
