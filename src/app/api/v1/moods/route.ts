import { db } from "@/lib/db";
import { resolveApiUser, unauthorized, badRequest } from "@/lib/api-auth";
import { getMoods } from "@/server/queries";
import { moodSchema } from "@/lib/validations";

export const runtime = "nodejs";

/** GET /api/v1/moods?take=30 → registros de humor, mais recentes primeiro. */
export async function GET(req: Request) {
  const userId = await resolveApiUser(req);
  if (!userId) return unauthorized();

  const take = Number(new URL(req.url).searchParams.get("take")) || 30;
  return Response.json({ moods: await getMoods(userId, Math.min(take, 180)) });
}

/** POST /api/v1/moods — Body: { mood, intensity?, date?, note? } */
export async function POST(req: Request) {
  const userId = await resolveApiUser(req);
  if (!userId) return unauthorized();

  const parsed = moodSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return badRequest(
      parsed.error.issues[0]?.message ?? "Requisição inválida.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const mood = await db.moodEntry.create({
    data: {
      userId,
      mood: parsed.data.mood,
      intensity: parsed.data.intensity,
      date: parsed.data.date ?? new Date(),
      note: parsed.data.note ?? null,
    },
  });

  return Response.json({ mood }, { status: 201 });
}

export { corsPreflight as OPTIONS } from "@/lib/api-auth";
