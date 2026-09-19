import { db } from "@/lib/db";
import { resolveApiUser, unauthorized, badRequest } from "@/lib/api-auth";
import { getCycles } from "@/server/queries";
import { cycleSchema } from "@/lib/validations";

export const runtime = "nodejs";

/** GET /api/v1/cycles → ciclos da usuária, do mais recente ao mais antigo. */
export async function GET(req: Request) {
  const userId = await resolveApiUser(req);
  if (!userId) return unauthorized();

  return Response.json({ cycles: await getCycles(userId) });
}

/**
 * POST /api/v1/cycles
 * Body: { startDate, endDate?, flow?, symptoms?, notes? }
 *
 * Mesmo schema da Server Action `addCycleAction` — a diferença é só o
 * transporte (JSON em vez de FormData).
 */
export async function POST(req: Request) {
  const userId = await resolveApiUser(req);
  if (!userId) return unauthorized();

  const parsed = cycleSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return badRequest(
      parsed.error.issues[0]?.message ?? "Requisição inválida.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const cycle = await db.cycleEntry.create({
    data: {
      userId,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate ?? null,
      flow: parsed.data.flow ?? null,
      symptoms: parsed.data.symptoms ?? null,
      notes: parsed.data.notes ?? null,
    },
  });

  return Response.json({ cycle }, { status: 201 });
}

export { corsPreflight as OPTIONS } from "@/lib/api-auth";
