"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { partnerInviteSchema, partnerAcceptSchema } from "@/lib/validations";
import { gerarCodigoConvite, ESCOPOS_ACOMPANHANTE } from "@core/acompanhante";
import type { ActionState } from "./auth";

const VALORES = ESCOPOS_ACOMPANHANTE.map((e) => e.value) as string[];

/**
 * Cria o convite.
 *
 * O escopo é filtrado contra a lista conhecida antes de gravar. Sem isso, um
 * `escopos` forjado no formulário viraria uma chave que a tela do acompanhante
 * não sabe interpretar — e o comportamento de um escopo desconhecido não deve
 * ser "mostra tudo".
 */
export async function criarConviteAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const escolhidos = formData
    .getAll("escopos")
    .map(String)
    .filter((e) => VALORES.includes(e));

  const parsed = partnerInviteSchema.safeParse({
    escopos: escolhidos.join(","),
    apelido: formData.get("apelido") || null,
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  // Um vínculo ativo ou pendente por vez. Dois códigos circulando ao mesmo
  // tempo é um convite que ela não lembra ter feito.
  await db.partnerLink.deleteMany({
    where: { ownerId: user.id, status: { in: ["pendente", "revogado"] } },
  });

  let codigo = gerarCodigoConvite();
  // Colisão é improvável, mas o campo é único e falhar aqui seria um 500 na
  // cara dela. Três tentativas resolvem qualquer caso realista.
  for (let i = 0; i < 3; i++) {
    const existe = await db.partnerLink.findUnique({ where: { codigo } });
    if (!existe) break;
    codigo = gerarCodigoConvite();
  }

  await db.partnerLink.create({
    data: {
      ownerId: user.id,
      codigo,
      escopos: parsed.data.escopos,
      apelido: parsed.data.apelido ?? null,
      status: "pendente",
    },
  });

  revalidatePath("/painel/acompanhante");
  return { success: true };
}

/**
 * Revoga.
 *
 * Apaga o vínculo em vez de marcá-lo como revogado: um histórico de "ele
 * acompanhou de março a julho" não serve para nada que ela precise. E ele não
 * é notificado — a tela dele simplesmente para de mostrar.
 */
export async function revogarVinculoAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  await db.partnerLink.deleteMany({ where: { id, ownerId: user.id } });
  revalidatePath("/painel/acompanhante");
}

/** Ajusta o que ele vê, sem refazer o convite. */
export async function ajustarEscoposAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const id = String(formData.get("id"));

  const escolhidos = formData
    .getAll("escopos")
    .map(String)
    .filter((e) => VALORES.includes(e));

  if (escolhidos.length === 0) {
    return { error: "Escolha pelo menos uma coisa, ou encerre o acesso." };
  }

  await db.partnerLink.updateMany({
    where: { id, ownerId: user.id },
    data: { escopos: escolhidos.join(",") },
  });

  revalidatePath("/painel/acompanhante");
  return { success: true };
}

/** Do outro lado: ele digita o código que ela ditou. */
export async function aceitarConviteAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = partnerAcceptSchema.safeParse({
    codigo: formData.get("codigo"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const vinculo = await db.partnerLink.findUnique({
    where: { codigo: parsed.data.codigo },
  });

  // Mensagem única para código inexistente, já usado ou próprio: distinguir
  // ensinaria a alguém de fora quais códigos existem.
  if (!vinculo || vinculo.status !== "pendente" || vinculo.ownerId === user.id) {
    return { error: "Código inválido ou já usado." };
  }

  await db.partnerLink.update({
    where: { id: vinculo.id },
    data: { partnerId: user.id, status: "ativo", acceptedAt: new Date() },
  });

  revalidatePath("/painel/acompanhante");
  return { success: true };
}
