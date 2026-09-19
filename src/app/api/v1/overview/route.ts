import { db } from "@/lib/db";
import { resolveApiUser, unauthorized } from "@/lib/api-auth";
import {
  getCycles,
  getPregnancy,
  getUpcomingReminders,
  getDailyLogs,
} from "@/server/queries";
import {
  predictCycle,
  cyclePhase,
  cycleStats,
  pregnancyProgress,
  currentStreak,
  startOfDay,
} from "@core/cycle";

export const runtime = "nodejs";

/**
 * GET /api/v1/overview
 *
 * Tudo o que a tela "Hoje" precisa, em uma requisição só — evita a cascata de
 * chamadas que deixaria a abertura do app lenta em rede fraca.
 *
 * Usa exatamente as mesmas funções de previsão que o painel web
 * (`packages/core`), então os dois nunca divergem.
 */
export async function GET(req: Request) {
  const userId = await resolveApiUser(req);
  if (!userId) return unauthorized();

  const [user, cycles, pregnancy, reminders, dailyLogs] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, goal: true, onboardedAt: true },
    }),
    getCycles(userId),
    getPregnancy(userId),
    getUpcomingReminders(userId, 5),
    getDailyLogs(userId, 60),
  ]);

  if (!user) return unauthorized();

  const startDates = cycles.map((c) => c.startDate);
  const prediction = predictCycle(startDates);
  const stats = cycleStats(startDates);

  const phase = prediction
    ? cyclePhase(
        prediction.currentCycleDay,
        prediction.cycleLength,
        prediction.periodLength,
      )
    : null;

  // Humor de hoje, se já registrado (a tela mostra o estado do check-in).
  const today = startOfDay();
  const todayMood = await db.moodEntry.findFirst({
    where: { userId, date: { gte: today } },
    orderBy: { date: "desc" },
    select: { id: true, mood: true, intensity: true, date: true },
  });

  return Response.json({
    user,
    prediction,
    phase,
    stats,
    pregnancy: pregnancy?.active
      ? {
          ...pregnancy,
          progress: pregnancyProgress(pregnancy.lastPeriodDate),
        }
      : null,
    upcomingReminders: reminders,
    todayMood,
    streak: currentStreak(dailyLogs.map((l) => l.date)),
    lastCycle: cycles[0] ?? null,
  });
}

export { corsPreflight as OPTIONS } from "@/lib/api-auth";
