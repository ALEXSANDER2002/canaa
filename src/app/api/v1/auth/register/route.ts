import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validations";
import { signApiToken, badRequest } from "@/lib/api-auth";

export const runtime = "nodejs";

/**
 * POST /api/v1/auth/register
 * Body: { name, email, password, confirmPassword }
 * → { token, user }
 *
 * Espelha o cadastro da web: mesmo schema, mesmo custo de bcrypt.
 * A usuária já sai autenticada, sem precisar de um login extra.
 */
export async function POST(req: Request) {
  const parsed = registerSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return badRequest(
      parsed.error.issues[0]?.message ?? "Requisição inválida.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const { name, email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return badRequest("Já existe uma conta com este e-mail.", {
      email: ["Já existe uma conta com este e-mail."],
    });
  }

  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
    },
  });

  return Response.json(
    {
      token: signApiToken(user.id),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        // Nulo numa conta recém-criada, mas o campo precisa existir: o app o
        // declara em `AuthUser`, e omiti-lo faz `undefined` viajar até telas
        // que decidem por ele. Ver o mesmo ajuste em `login/route.ts`.
        birthDate: user.birthDate,
        goal: user.goal,
        onboardedAt: user.onboardedAt,
        hasPin: false,
      },
    },
    { status: 201 },
  );
}

export { corsPreflight as OPTIONS } from "@/lib/api-auth";
