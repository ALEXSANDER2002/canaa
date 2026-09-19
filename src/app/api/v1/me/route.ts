import { z } from "zod";

import { db } from "@/lib/db";
import { resolveApiUser, unauthorized, badRequest } from "@/lib/api-auth";
import { GOAL_OPTIONS } from "@core/constants";

export const runtime = "nodejs";

/**
 * Todos os campos são opcionais: o onboarding manda um por vez, conforme a
 * pessoa avança, para que abandonar no meio não perca o que já foi respondido.
 */
const patchSchema = z
  .object({
    name: z.string().trim().min(2, "Informe seu nome."),
    goal: z.enum(GOAL_OPTIONS.map((g) => g.value) as [string, ...string[]]),
    birthDate: z.coerce
      .date()
      // 13 anos é o piso legal de consentimento; acima de 120 é erro de
      // digitação, não uma pessoa.
      .refine((d) => {
        const anos = (Date.now() - d.getTime()) / 31_557_600_000;
        return anos >= 13 && anos <= 120;
      }, "Data de nascimento fora do intervalo esperado."),
    /** Só aceita `true` — o onboarding marca como concluído, nunca desfaz. */
    onboarded: z.literal(true),
  })
  .partial()
  .refine((d) => Object.keys(d).length > 0, "Nada para atualizar.");

/** GET /api/v1/me → dados da conta da usuária autenticada. */
export async function GET(req: Request) {
  const userId = await resolveApiUser(req);
  if (!userId) return unauthorized();

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      birthDate: true,
      goal: true,
      onboardedAt: true,
      pinHash: true,
      createdAt: true,
    },
  });

  if (!user) return unauthorized();

  // Nunca devolvemos o hash — só se existe ou não.
  const { pinHash, ...rest } = user;
  return Response.json({ ...rest, hasPin: Boolean(pinHash) });
}

/**
 * PATCH /api/v1/me → nome, objetivo, nascimento e conclusão do onboarding.
 *
 * O e-mail fica de fora: trocar identificador de login exige confirmação no
 * endereço novo, e isso é um fluxo próprio, não um campo de formulário.
 */
export async function PATCH(req: Request) {
  const userId = await resolveApiUser(req);
  if (!userId) return unauthorized();

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return badRequest(
      parsed.error.issues[0]?.message ?? "Requisição inválida.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const { name, goal, birthDate, onboarded } = parsed.data;

  const user = await db.user.update({
    where: { id: userId },
    data: {
      ...(name !== undefined && { name }),
      ...(goal !== undefined && { goal }),
      ...(birthDate !== undefined && { birthDate }),
      // Carimba a hora da conclusão; o cliente não escolhe a data.
      ...(onboarded && { onboardedAt: new Date() }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      birthDate: true,
      goal: true,
      onboardedAt: true,
    },
  });

  return Response.json(user);
}

export { corsPreflight as OPTIONS } from "@/lib/api-auth";
