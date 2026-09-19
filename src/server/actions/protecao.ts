"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { trustedContactSchema } from "@/lib/validations";
import { LIMITE_CONTATOS_CONFIANCA } from "@core/protecao";
import type { ActionState } from "./auth";

/**
 * Rede de confiança.
 *
 * Nada aqui registra ACESSO — só a escrita explícita dela. Cadastrar um
 * contato é uma ação que ela pediu; abrir a tela não é, e não deixa rastro.
 */
export async function adicionarContatoAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const quantos = await db.trustedContact.count({ where: { userId: user.id } });
  if (quantos >= LIMITE_CONTATOS_CONFIANCA) {
    return {
      error: `Você já tem ${LIMITE_CONTATOS_CONFIANCA} pessoas na rede. Remova uma antes de adicionar outra.`,
    };
  }

  const parsed = trustedContactSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    relation: formData.get("relation") || null,
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await db.trustedContact.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      phone: parsed.data.phone,
      relation: parsed.data.relation ?? null,
      // Nasce pendente: a pessoa precisa aceitar antes de valer. Uma rede
      // montada com gente que não sabe que faz parte dela não é uma rede.
      status: "pendente",
    },
  });

  revalidatePath("/painel/confianca");
  return { success: true };
}

export async function removerContatoAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  await db.trustedContact.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/painel/confianca");
}

/**
 * Marca o contato como aceito.
 *
 * Hoje quem confirma é ela, depois de falar com a pessoa — não há envio de SMS
 * de confirmação porque não há provedor contratado. É uma confirmação mais
 * fraca do que um aceite de verdade, e a tela diz isso com essas palavras em
 * vez de fingir que a pessoa clicou em algum lugar.
 */
export async function confirmarContatoAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  await db.trustedContact.updateMany({
    where: { id, userId: user.id },
    data: { status: "aceito", acceptedAt: new Date() },
  });
  revalidatePath("/painel/confianca");
}
