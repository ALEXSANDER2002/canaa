import { z } from "zod";

import { db } from "@/lib/db";
import { badRequest, corsPreflight } from "@/lib/api-auth";

export const runtime = "nodejs";

const bodySchema = z.object({
  /** `patrulha` não é aceita: a camada não existe enquanto não houver plantão. */
  camada: z.enum(["ligacao", "rede"]),
  bairro: z.string().trim().max(80).optional().nullable(),
});

/**
 * POST /api/v1/protecao/sos — conta um acionamento.
 *
 * Três coisas que esta rota deliberadamente NÃO faz:
 *
 * 1. **Não autentica.** Não chama `resolveApiUser`, não lê o cabeçalho
 *    `Authorization`, e o registro não tem `userId`. É uma contagem para
 *    dimensionar a rede de apoio do município, não um chamado.
 * 2. **Não aciona ninguém.** Não manda e-mail, não abre ticket, não notifica
 *    painel. Quem chama a polícia é o app, discando 190 no aparelho dela;
 *    quem avisa a rede de confiança é o app, mandando SMS do aparelho dela.
 *    Se um dia isto virar um chamado com destinatário, tem que existir plantão
 *    humano 24h do outro lado — senão o botão promete resgate e não entrega.
 * 3. **Não guarda localização.** `bairro` é o recorte mais fino aceito, e
 *    mesmo ele é opcional.
 *
 * Falhar aqui não pode atrapalhar o SOS: o app dispara a chamada primeiro e
 * manda isto depois, sem esperar resposta.
 */
export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest("Requisição inválida.");

  await db.sosEvent.create({
    data: {
      camada: parsed.data.camada,
      bairro: parsed.data.bairro ?? null,
    },
  });

  return Response.json({ ok: true }, { status: 201 });
}

export { corsPreflight as OPTIONS };
