import { z } from "zod";

import { db } from "@/lib/db";
import { resolveApiUser, unauthorized, badRequest } from "@/lib/api-auth";

export const runtime = "nodejs";

const patchSchema = z.object({
  done: z.boolean(),
});

/**
 * PATCH /api/v1/reminders/:id — Body: { done }
 *
 * A web tem `toggleReminderAction` (inverte o estado). Aqui recebemos o valor
 * explícito: o app pode estar offline e enviar o estado final que a usuária
 * escolheu, sem depender do que estava no servidor no momento do toque.
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await resolveApiUser(req);
  if (!userId) return unauthorized();

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest("Informe o campo `done`.");

  const { id } = await params;
  const { count } = await db.reminder.updateMany({
    where: { id, userId },
    data: { done: parsed.data.done },
  });

  if (count === 0) {
    return Response.json({ error: "Lembrete não encontrado." }, { status: 404 });
  }

  const reminder = await db.reminder.findUnique({ where: { id } });
  return Response.json({ reminder });
}

/** DELETE /api/v1/reminders/:id */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await resolveApiUser(req);
  if (!userId) return unauthorized();

  const { id } = await params;
  const { count } = await db.reminder.deleteMany({ where: { id, userId } });

  if (count === 0) {
    return Response.json({ error: "Lembrete não encontrado." }, { status: 404 });
  }

  return Response.json({ ok: true });
}

export { corsPreflight as OPTIONS } from "@/lib/api-auth";
