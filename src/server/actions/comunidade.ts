"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { communityPostSchema, communityReplySchema } from "@/lib/validations";
import { DENUNCIAS_PARA_OCULTAR } from "@core/moderacao";
import type { ActionState } from "./auth";

/**
 * Silenciamento decidido na moderação.
 *
 * Checado na escrita, não na leitura: quem foi silenciada continua lendo a
 * comunidade. A punição é não poder publicar por 30 dias, não ser expulsa de
 * um espaço que pode ser o único que ela tem.
 */
async function silenciadaAte(userId: string): Promise<Date | null> {
  const u = await db.user.findUnique({
    where: { id: userId },
    select: { silencedUntil: true },
  });
  if (!u?.silencedUntil) return null;
  return u.silencedUntil > new Date() ? u.silencedUntil : null;
}

export async function publicarRelatoAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const ate = await silenciadaAte(user.id);
  if (ate) {
    return {
      error: `Você não pode publicar até ${ate.toLocaleDateString("pt-BR")}. Você continua podendo ler e responder.`,
    };
  }

  const parsed = communityPostSchema.safeParse({
    category: formData.get("category"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await db.communityPost.create({
    data: {
      userId: user.id,
      category: parsed.data.category,
      body: parsed.data.body,
    },
  });

  revalidatePath("/painel/comunidade");
  return { success: true };
}

export async function responderAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const postId = String(formData.get("postId"));

  const parsed = communityReplySchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  await db.communityReply.create({
    data: { postId, userId: user.id, body: parsed.data.body },
  });

  revalidatePath("/painel/comunidade");
  return { success: true };
}

/**
 * Denúncia.
 *
 * A ocultação automática continua existindo e é a rede de segurança para o
 * tempo em que ninguém está olhando — é melhor esconder um relato legítimo por
 * engano e revisar depois do que deixar desinformação sobre gravidez
 * circulando. A decisão humana vem em seguida, na fila de moderação.
 */
export async function denunciarAction(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id"));

  const post = await db.communityPost.update({
    where: { id },
    data: { reports: { increment: 1 } },
    select: { reports: true },
  });

  if (post.reports >= DENUNCIAS_PARA_OCULTAR) {
    await db.communityPost.update({ where: { id }, data: { hidden: true } });
  }

  revalidatePath("/painel/comunidade");
}

export async function apagarRelatoAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  await db.communityPost.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/painel/comunidade");
}
