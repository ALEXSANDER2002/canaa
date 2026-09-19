import { db } from "@/lib/db";

// Funções de leitura reutilizadas pelos Server Components do painel.
// Mantê-las separadas das Server Actions (mutações) facilita testes e reuso.

export function getCycles(userId: string) {
  return db.cycleEntry.findMany({
    where: { userId },
    orderBy: { startDate: "desc" },
  });
}

export function getPregnancy(userId: string) {
  return db.pregnancy.findUnique({ where: { userId } });
}

export function getMoods(userId: string, take = 30) {
  return db.moodEntry.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take,
  });
}

export function getDailyLogs(userId: string, take = 14) {
  return db.dailyLog.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take,
  });
}

export function getReminders(userId: string) {
  return db.reminder.findMany({
    where: { userId },
    orderBy: { dueDate: "asc" },
  });
}

export function getUpcomingReminders(userId: string, take = 3) {
  return db.reminder.findMany({
    where: { userId, done: false, dueDate: { gte: startOfToday() } },
    orderBy: { dueDate: "asc" },
    take,
  });
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getMetrics(userId: string, type?: string, take = 60) {
  return db.healthMetric.findMany({
    where: { userId, ...(type ? { type } : {}) },
    orderBy: { date: "desc" },
    take,
  });
}

export function getPillLogs(userId: string, take = 60) {
  return db.pillLog.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take,
  });
}

export function getSelfExams(userId: string, take = 24) {
  return db.selfExamLog.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take,
  });
}
