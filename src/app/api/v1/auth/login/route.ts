import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validations";
import { signApiToken, badRequest } from "@/lib/api-auth";
import { ehAdministrativo } from "@core/papeis";

// Usa Prisma e bcrypt — precisa do runtime Node.
export const runtime = "nodejs";

/**
 * POST /api/v1/auth/login
 * Body: { email, password }
 * → { token, user }
 *
 * Mesma verificação do provider de credenciais do Auth.js (bcrypt sobre
 * `passwordHash`), só que devolvendo um token em vez de setar cookie.
 */
export async function POST(req: Request) {
  const parsed = loginSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return badRequest(
      parsed.error.issues[0]?.message ?? "Requisição inválida.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const { email, password } = parsed.data;
  const user = await db.user.findUnique({ where: { email } });

  // Mensagem genérica: não revela se o e-mail existe.
  const invalid = () =>
    Response.json({ error: "E-mail ou senha incorretos." }, { status: 401 });

  if (!user) return invalid();
  if (!(await bcrypt.compare(password, user.passwordHash))) return invalid();

  // Conta administrativa não entra no aplicativo. O app é o espaço pessoal —
  // ciclo, humor, cofre de evidências — e uma conta institucional costuma ser
  // usada por mais de uma pessoa. A recusa vem depois da senha conferida, de
  // propósito: dita antes, diria a qualquer um quais e-mails são da Prefeitura.
  if (ehAdministrativo(user.role)) {
    return Response.json(
      {
        error:
          "Esta conta é de uso administrativo e não entra no aplicativo. Acesse a área de administração pelo site.",
      },
      { status: 403 },
    );
  }

  return Response.json({
    token: signApiToken(user.id),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      // `birthDate` faltava aqui, e o app declara o campo desde sempre: logo
      // depois do login ele ficava `undefined` até alguma tela chamar
      // `/api/v1/me`. A tela de exames escolhe a faixa etária por este campo e
      // não mostrava faixa nenhuma na primeira sessão.
      birthDate: user.birthDate,
      goal: user.goal,
      onboardedAt: user.onboardedAt,
      hasPin: Boolean(user.pinHash),
    },
  });
}

export { corsPreflight as OPTIONS } from "@/lib/api-auth";
