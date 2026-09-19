import { db } from "@/lib/db";
import {
  resolveApiUser,
  unauthorized,
  badRequest,
  corsPreflight,
} from "@/lib/api-auth";
import { trustedContactSchema } from "@/lib/validations";
import { LIMITE_CONTATOS_CONFIANCA } from "@core/protecao";

export const runtime = "nodejs";

/**
 * Rede de confiança do botão SOS.
 *
 * Autenticada, ao contrário de `/api/v1/apoio/servicos`: aqui os dados são
 * dela, não do município. Mas vale a mesma regra do pilar — nenhuma linha
 * registra que a lista foi CONSULTADA. Só a escrita, que ela pediu, existe.
 */
export async function GET(req: Request) {
  const userId = await resolveApiUser(req);
  if (!userId) return unauthorized();

  const contatos = await db.trustedContact.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      phone: true,
      relation: true,
      status: true,
    },
  });

  return Response.json({ contatos, limite: LIMITE_CONTATOS_CONFIANCA });
}

export async function POST(req: Request) {
  const userId = await resolveApiUser(req);
  if (!userId) return unauthorized();

  const quantos = await db.trustedContact.count({ where: { userId } });
  if (quantos >= LIMITE_CONTATOS_CONFIANCA) {
    return badRequest(
      `Você já tem ${LIMITE_CONTATOS_CONFIANCA} pessoas na rede.`,
    );
  }

  const parsed = trustedContactSchema.safeParse(
    await req.json().catch(() => null),
  );
  if (!parsed.success) {
    return badRequest(
      parsed.error.issues[0]?.message ?? "Requisição inválida.",
      parsed.error.flatten().fieldErrors,
    );
  }

  const contato = await db.trustedContact.create({
    data: {
      userId,
      name: parsed.data.name,
      phone: parsed.data.phone,
      relation: parsed.data.relation ?? null,
      status: "pendente",
    },
    select: { id: true, name: true, phone: true, relation: true, status: true },
  });

  return Response.json({ contato }, { status: 201 });
}

export { corsPreflight as OPTIONS };
