import { db } from "@/lib/db";
import { resolveApiUser, unauthorized, badRequest } from "@/lib/api-auth";
import { getReminders } from "@/server/queries";
import { reminderSchema } from "@/lib/validations";

export const runtime = "nodejs";

/**
 * GET /api/v1/reminders → lembretes da usuária, por data de vencimento.
 *
 * É a partir desta lista que o app agenda as notificações locais: para cada
 * lembrete com `done: false` e `dueDate` no futuro, um
 * `scheduleNotificationAsync`. Reagendar a cada sincronização mantém o
 * dispositivo em dia sem depender de push remoto.
 */
export async function GET(req: Request) {
  const userId = await resolveApiUser(req);
  if (!userId) return unauthorized();

  return Response.json({ reminders: await getReminders(userId) });
}

/** POST /api/v1/reminders — Body: { title, type, dueDate, notes? } */
export async function POST(req: Request) {
  const userId = await resolveApiUser(req);
  if (!userId) return unauthorized();

  const parsed = reminderSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return badRequest(
      parsed.error.issues[0]?.message ?? "Requisição inválida.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const reminder = await db.reminder.create({
    data: {
      userId,
      title: parsed.data.title,
      type: parsed.data.type,
      dueDate: parsed.data.dueDate,
      notes: parsed.data.notes ?? null,
    },
  });

  return Response.json({ reminder }, { status: 201 });
}

export { corsPreflight as OPTIONS } from "@/lib/api-auth";
