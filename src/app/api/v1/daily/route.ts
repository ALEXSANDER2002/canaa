import { db } from "@/lib/db";
import { resolveApiUser, unauthorized, badRequest } from "@/lib/api-auth";
import { getDailyLogs } from "@/server/queries";
import { dailyLogSchema } from "@/lib/validations";

export const runtime = "nodejs";

/** GET /api/v1/daily?take=14 → check-ins diários (energia, sono, dor). */
export async function GET(req: Request) {
  const userId = await resolveApiUser(req);
  if (!userId) return unauthorized();

  const take = Number(new URL(req.url).searchParams.get("take")) || 14;
  return Response.json({ logs: await getDailyLogs(userId, Math.min(take, 180)) });
}

/**
 * POST /api/v1/daily
 * Body: { date?, energy?, sleepHours?, pain?, symptoms?, note? }
 */
export async function POST(req: Request) {
  const userId = await resolveApiUser(req);
  if (!userId) return unauthorized();

  const parsed = dailyLogSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return badRequest(
      parsed.error.issues[0]?.message ?? "Requisição inválida.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const log = await db.dailyLog.create({
    data: {
      userId,
      date: parsed.data.date ?? new Date(),
      energy: parsed.data.energy ?? null,
      sleepHours: parsed.data.sleepHours ?? null,
      pain: parsed.data.pain ?? null,
      symptoms: parsed.data.symptoms ?? null,
      note: parsed.data.note ?? null,
    },
  });

  return Response.json({ log }, { status: 201 });
}

export { corsPreflight as OPTIONS } from "@/lib/api-auth";
