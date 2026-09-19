"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";

/** Cria uma conversa nova (contexto limpo) e abre. */
export async function createConversationAction() {
  const user = await requireUser();
  const conversation = await db.conversation.create({
    data: { userId: user.id },
    select: { id: true },
  });
  revalidatePath("/painel/assistente");
  redirect(`/painel/assistente/${conversation.id}`);
}

export async function deleteConversationAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  await db.conversation.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/painel/assistente");
  redirect("/painel/assistente");
}

/** Apaga tudo o que a assistente aprendeu sobre a usuária. */
export async function clearMemoriesAction() {
  const user = await requireUser();
  await db.chatMemory.deleteMany({ where: { userId: user.id } });
  revalidatePath("/painel/assistente");
  revalidatePath("/painel/configuracoes");
}
